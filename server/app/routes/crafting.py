"""
Crafting API routes with profit calculation.
"""

import json
from pathlib import Path
from fastapi import APIRouter, Query, HTTPException
import httpx
from time import time

from app.utils.cache import get_cached, set_cached
from app.utils.throttle import universalis_limiter

router = APIRouter(prefix="/api", tags=["crafting"])

UNIVERSALIS_BASE = "https://universalis.app/api/v2"

# Load recipes data
DATA_PATH = Path(__file__).parent.parent / "data" / "recipes.json"
with open(DATA_PATH, "r", encoding="utf-8") as f:
    RECIPES = json.load(f)

# Load craftable items data for bulk refining
CRAFTABLE_PATH = Path(__file__).parent.parent / "data" / "craftableItems.json"
with open(CRAFTABLE_PATH, "r", encoding="utf-8") as f:
    CRAFTABLE_ITEMS = json.load(f)

# Material category patterns for filtering
MATERIAL_PATTERNS = {
    "Ingot": ["Ingot", "Nugget", "Plate"],
    "Lumber": ["Lumber", "Plank", "Log", "Branch"],
    "Cloth": ["Cloth", "Serge", "Velvet", "Twine", "Felt", "Canvas"],
    "Leather": ["Leather", "Hide", "Skin"],
    "Reagent": ["Oil", "Alkahest", "Alumen", "Natron", "Putty"],
    "Consumable": ["Potion", "Ether", "Elixir", "Tincture", "Draught", "Medicine"],
    "Food": ["Soup", "Stew", "Bread", "Pie", "Steak", "Grilled", "Roasted", "Risotto", "Pasta", "Salad"]
}

# Crystal item IDs (to exclude from ingredient cost calculations)
CRYSTAL_IDS = {2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19}

# Crystal names for display
CRYSTAL_NAMES = {
    2: "Fire Shard", 3: "Ice Shard", 4: "Wind Shard", 5: "Earth Shard", 6: "Lightning Shard", 7: "Water Shard",
    8: "Fire Crystal", 9: "Ice Crystal", 10: "Wind Crystal", 11: "Earth Crystal", 12: "Lightning Crystal", 13: "Water Crystal",
    14: "Fire Cluster", 15: "Ice Cluster", 16: "Wind Cluster", 17: "Earth Cluster", 18: "Lightning Cluster", 19: "Water Cluster"
}



@router.get("/recipes")
async def get_recipes(
    crafting_class: str = Query(default="All", alias="craftingClass"),
    category: str = Query(default="All"),
    level: int = Query(default=0),
):
    """Get all recipes, optionally filtered."""
    recipes = []
    
    for recipe in RECIPES:
        # Apply filters
        if crafting_class != "All" and recipe["craftingClass"] != crafting_class:
            continue
        if category != "All" and recipe["category"] != category:
            continue
        if level > 0 and recipe["level"] != level:
            continue
        
        recipes.append(recipe)
    
    return {
        "count": len(recipes),
        "recipes": recipes
    }


@router.get("/recipes/{world}/profit")
async def get_recipe_profit(
    world: str,
    crafting_class: str = Query(default="All", alias="craftingClass"),
    category: str = Query(default="All"),
):
    """
    Calculate profit for recipes based on current market prices.
    Uses caching and request batching to minimize API calls.
    """
    # Filter recipes first
    filtered_recipes = []
    for recipe in RECIPES:
        if crafting_class != "All" and recipe["craftingClass"] != crafting_class:
            continue
        if category != "All" and recipe["category"] != category:
            continue
        filtered_recipes.append(recipe)
    
    if not filtered_recipes:
        return {
            "world": world,
            "count": 0,
            "recipes": []
        }
    
    # Collect all unique item IDs needed (outputs + all materials)
    all_item_ids = set()
    for recipe in filtered_recipes:
        all_item_ids.add(recipe["outputItemId"])
        for mat in recipe["materials"]:
            all_item_ids.add(mat["itemId"])
    
    # Fetch prices (batched - Universalis supports up to 100 items per request)
    prices = await fetch_prices_batched(world, list(all_item_ids))
    
    # Calculate profit for each recipe
    results = []
    for recipe in filtered_recipes:
        output_price = prices.get(str(recipe["outputItemId"]), {})
        output_sell_price = output_price.get("hqPrice", 0) or output_price.get("nqPrice", 0)
        
        # Total sell value for all output items
        total_output_value = output_sell_price * recipe["outputQuantity"]
        
        # Calculate material costs
        total_material_cost = 0
        materials_breakdown = []
        
        for mat in recipe["materials"]:
            mat_price = prices.get(str(mat["itemId"]), {})
            mat_unit_price = mat_price.get("nqPrice", 0) or mat_price.get("hqPrice", 0)
            mat_total_cost = mat_unit_price * mat["quantity"]
            total_material_cost += mat_total_cost
            
            materials_breakdown.append({
                "name": mat["name"],
                "quantity": mat["quantity"],
                "unitPrice": mat_unit_price,
                "totalCost": mat_total_cost
            })
        
        # Calculate profit
        profit = total_output_value - total_material_cost
        profit_per_item = profit / recipe["outputQuantity"] if recipe["outputQuantity"] > 0 else 0
        profit_margin = (profit / total_material_cost * 100) if total_material_cost > 0 else 0
        
        results.append({
            **recipe,
            "outputSellPrice": output_sell_price,
            "totalOutputValue": total_output_value,
            "totalMaterialCost": total_material_cost,
            "profit": profit,
            "profitPerItem": round(profit_per_item),
            "profitMargin": round(profit_margin, 1),
            "isProfitable": profit > 0,
            "materials": materials_breakdown
        })
    
    # Sort by profit (highest first)
    results.sort(key=lambda x: x["profit"], reverse=True)
    
    return {
        "world": world,
        "count": len(results),
        "fetchedAt": int(time() * 1000),
        "recipes": results
    }


async def fetch_prices_batched(world: str, item_ids: list[int]) -> dict:
    """
    Fetch prices for multiple items, using cache and batching.
    Universalis supports up to 100 items per request.
    """
    prices = {}
    items_to_fetch = []
    
    # Check cache first
    for item_id in item_ids:
        cache_key = f"price:{world}:{item_id}"
        cached = get_cached(cache_key)
        if cached:
            prices[str(item_id)] = cached
        else:
            items_to_fetch.append(item_id)
    
    if not items_to_fetch:
        return prices
    
    # Batch items (max 100 per request)
    batch_size = 100
    for i in range(0, len(items_to_fetch), batch_size):
        batch = items_to_fetch[i:i + batch_size]
        batch_ids = ",".join(str(id) for id in batch)
        
        # Rate limit the request
        await universalis_limiter.acquire()
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{UNIVERSALIS_BASE}/{world}/{batch_ids}",
                    headers={"User-Agent": "GatheringGold/1.0 (FFXIV Profit Calculator)"},
                    timeout=15.0
                )
                response.raise_for_status()
                data = response.json()
        except Exception as e:
            print(f"Price fetch error: {e}")
            continue
        
        # Parse response
        if "itemID" in data:
            # Single item response
            item_data = {
                "nqPrice": data.get("minPriceNQ", 0),
                "hqPrice": data.get("minPriceHQ", 0),
                "nqListings": data.get("nqSaleVelocity", 0),
                "hqListings": data.get("hqSaleVelocity", 0)
            }
            prices[str(data["itemID"])] = item_data
            set_cached(f"price:{world}:{data['itemID']}", item_data)
        elif "items" in data:
            # Multi-item response
            for item_id, item_data in data["items"].items():
                price_data = {
                    "nqPrice": item_data.get("minPriceNQ", 0),
                    "hqPrice": item_data.get("minPriceHQ", 0),
                    "nqListings": item_data.get("nqSaleVelocity", 0),
                    "hqListings": item_data.get("hqSaleVelocity", 0)
                }
                prices[item_id] = price_data
                set_cached(f"price:{world}:{item_id}", price_data)
    
    return prices


@router.get("/crafting/categories")
async def get_categories():
    """Get unique crafting categories."""
    categories = list(set(r["category"] for r in RECIPES))
    return {"categories": sorted(categories)}


def get_material_category(name: str) -> str:
    """Determine the material category based on item name patterns."""
    for category, patterns in MATERIAL_PATTERNS.items():
        for pattern in patterns:
            if pattern.lower() in name.lower():
                return category
    return "Other"


def is_simple_recipe(item: dict) -> bool:
    """Check if a recipe is simple (few non-crystal ingredients)."""
    non_crystal_ingredients = [
        ing for ing in item.get("ingredients", [])
        if ing.get("itemId") not in CRYSTAL_IDS
    ]
    return len(non_crystal_ingredients) <= 3


@router.get("/crafting/materials/{world}/profit")
async def get_bulk_material_profit(
    world: str,
    category: str = Query(default="All"),
    crafting_class: str = Query(default="All", alias="craftingClass"),
    min_level: int = Query(default=1, alias="minLevel"),
    max_level: int = Query(default=100, alias="maxLevel"),
    limit: int = Query(default=100)
):
    """
    Calculate profit for bulk material crafting (ingots, lumber, cloth, etc.).
    Returns simple recipes sorted by profit.
    """
    # Filter craftable items
    filtered_items = []
    
    for item_id, item in CRAFTABLE_ITEMS.items():
        name = item.get("name", "")
        item_category = get_material_category(name)
        
        # Skip items that aren't in any material category (armor, weapons, etc.)
        if item_category == "Other":
            continue
        
        # Skip if category doesn't match
        if category != "All" and item_category != category:
            continue
        
        # Skip if crafting class doesn't match
        if crafting_class != "All" and item.get("craftingClass") != crafting_class:
            continue
        
        # Skip if level doesn't match
        level = item.get("level", 0)
        if level < min_level or level > max_level:
            continue
        
        # Only include simple recipes
        if not is_simple_recipe(item):
            continue
        
        # Skip items with no ingredients
        if not item.get("ingredients"):
            continue
        
        filtered_items.append({
            "itemId": int(item_id),
            "name": name,
            "craftingClass": item.get("craftingClass"),
            "level": level,
            "yields": item.get("yields", 1),
            "category": item_category,
            "ingredients": item.get("ingredients", [])
        })
    
    if not filtered_items:
        return {
            "world": world,
            "count": 0,
            "materials": []
        }
    
    # Sort by level descending to prioritize high-level items, then limit
    filtered_items.sort(key=lambda x: x["level"], reverse=True)
    filtered_items = filtered_items[:min(limit * 2, 500)]

    
    # Collect all unique item IDs needed (including crystals for pricing)
    all_item_ids = set()
    for item in filtered_items:
        all_item_ids.add(item["itemId"])
        for ing in item["ingredients"]:
            all_item_ids.add(ing["itemId"])
    
    # Fetch prices
    prices = await fetch_prices_batched(world, list(all_item_ids))
    
    # Calculate profit for each item
    results = []
    for item in filtered_items:
        output_price = prices.get(str(item["itemId"]), {})
        output_sell_price = output_price.get("nqPrice", 0) or output_price.get("hqPrice", 0)
        
        # Skip if no sell price
        if output_sell_price == 0:
            continue
        
        # Total sell value for all output items
        total_output_value = output_sell_price * item["yields"]
        
        # Calculate material costs (non-crystals)
        total_material_cost = 0
        ingredients_breakdown = []
        
        # Calculate crystal costs
        total_crystal_cost = 0
        crystals_breakdown = []
        
        for ing in item["ingredients"]:
            ing_id = ing.get("itemId")
            ing_price = prices.get(str(ing_id), {})
            ing_unit_price = ing_price.get("nqPrice", 0) or ing_price.get("hqPrice", 0)
            ing_quantity = ing.get("quantity", 1)
            ing_total_cost = ing_unit_price * ing_quantity
            
            if ing_id in CRYSTAL_IDS:
                total_crystal_cost += ing_total_cost
                crystals_breakdown.append({
                    "itemId": ing_id,
                    "name": CRYSTAL_NAMES.get(ing_id, ing.get("name", "Unknown")),
                    "quantity": ing_quantity,
                    "unitPrice": ing_unit_price,
                    "totalCost": ing_total_cost
                })
            else:
                total_material_cost += ing_total_cost
                ingredients_breakdown.append({
                    "itemId": ing_id,
                    "name": ing.get("name", "Unknown"),
                    "quantity": ing_quantity,
                    "unitPrice": ing_unit_price,
                    "totalCost": ing_total_cost
                })
        
        # Skip if no material cost (can't calculate profit)
        if total_material_cost == 0:
            continue
        
        # Total cost includes both materials and crystals
        total_cost = total_material_cost + total_crystal_cost
        
        # Calculate profit (including crystal costs)
        profit = total_output_value - total_cost
        profit_per_item = profit / item["yields"] if item["yields"] > 0 else 0
        profit_margin = (profit / total_cost * 100) if total_cost > 0 else 0
        
        results.append({
            "itemId": item["itemId"],
            "name": item["name"],
            "craftingClass": item["craftingClass"],
            "level": item["level"],
            "yields": item["yields"],
            "category": item["category"],
            "sellPrice": output_sell_price,
            "totalOutputValue": total_output_value,
            "totalMaterialCost": round(total_material_cost),
            "totalCrystalCost": round(total_crystal_cost),
            "totalCost": round(total_cost),
            "profit": round(profit),
            "profitPerCraft": round(profit),
            "profitMargin": round(profit_margin, 1),
            "isProfitable": profit > 0,
            "ingredients": ingredients_breakdown,
            "crystals": crystals_breakdown
        })
    
    # Sort by profit (highest first)
    results.sort(key=lambda x: x["profit"], reverse=True)
    
    # Apply final limit
    results = results[:limit]
    
    return {
        "world": world,
        "count": len(results),
        "fetchedAt": int(time() * 1000),
        "materials": results
    }


@router.get("/crafting/materials/categories")
async def get_material_categories():
    """Get available material categories for bulk refining."""
    return {"categories": list(MATERIAL_PATTERNS.keys())}
