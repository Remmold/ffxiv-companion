"""
Crafting Collectables API routes with recursive material cost calculation.
Compares "craft vs buy" for each material to find cheapest option.
"""

import json
from pathlib import Path
from fastapi import APIRouter, Query
import httpx
from time import time

from app.utils.cache import get_cached, set_cached
from app.utils.throttle import universalis_limiter

router = APIRouter(prefix="/api", tags=["collectables"])

UNIVERSALIS_BASE = "https://universalis.app/api/v2"

# Load crafting collectables data
DATA_PATH = Path(__file__).parent.parent / "data" / "craftingCollectables.json"
with open(DATA_PATH, "r", encoding="utf-8") as f:
    CRAFTING_COLLECTABLES = json.load(f)

# Load materials data
MATERIALS_PATH = Path(__file__).parent.parent / "data" / "craftingMaterials.json"
try:
    with open(MATERIALS_PATH, "r", encoding="utf-8") as f:
        CRAFTING_MATERIALS = json.load(f)
except FileNotFoundError:
    CRAFTING_MATERIALS = []

# Load craftable items for recursive calculation
CRAFTABLE_PATH = Path(__file__).parent.parent / "data" / "craftableItems.json"
try:
    with open(CRAFTABLE_PATH, "r", encoding="utf-8") as f:
        CRAFTABLE_ITEMS = json.load(f)
except FileNotFoundError:
    CRAFTABLE_ITEMS = {}


@router.get("/crafting/collectables")
async def get_crafting_collectables(
    crafting_class: str = Query(default="All", alias="craftingClass"),
    scrip: str = Query(default="All"),
    expansion: str = Query(default="All"),
    min_level: int = Query(default=0, alias="minLevel"),
    max_level: int = Query(default=100, alias="maxLevel"),
):
    """Get all crafting collectables, optionally filtered."""
    collectables = []
    
    for item in CRAFTING_COLLECTABLES:
        if crafting_class != "All" and item["craftingClass"] != crafting_class:
            continue
        if scrip != "All" and item["scrip"] != scrip:
            continue
        if expansion != "All" and item.get("expansion") != expansion:
            continue
        if item["level"] < min_level or item["level"] > max_level:
            continue
        
        collectables.append(item)
    
    return {
        "count": len(collectables),
        "collectables": collectables
    }


@router.get("/crafting/collectables/{world}/prices")
async def get_crafting_collectables_with_material_costs(
    world: str,
    crafting_class: str = Query(default="All", alias="craftingClass"),
    scrip: str = Query(default="All"),
    expansion: str = Query(default="All"),
):
    """
    Get crafting collectables with recursive material costs.
    For each material, compares market price vs crafting cost.
    """
    # Filter collectables first
    filtered = []
    for item in CRAFTING_COLLECTABLES:
        if crafting_class != "All" and item["craftingClass"] != crafting_class:
            continue
        if scrip != "All" and item["scrip"] != scrip:
            continue
        if expansion != "All" and item.get("expansion") != expansion:
            continue
        filtered.append(item)
    
    if not filtered:
        return {
            "world": world,
            "count": 0,
            "collectables": []
        }
    
    # Collect ALL item IDs we need prices for (materials + sub-materials)
    all_item_ids = set()
    
    for item in filtered:
        for mat in item.get("materials", []):
            mat_id = mat["itemId"]
            if mat_id >= 20:  # Skip crystals
                all_item_ids.add(mat_id)
                # Check if this material is craftable
                if str(mat_id) in CRAFTABLE_ITEMS:
                    recipe = CRAFTABLE_ITEMS[str(mat_id)]
                    for sub_mat in recipe.get("ingredients", []):
                        sub_id = sub_mat["itemId"]
                        if sub_id >= 20:
                            all_item_ids.add(sub_id)
    
    # Fetch all prices in one batch
    prices = await fetch_prices_batched(world, list(all_item_ids))
    
    # Calculate costs for each collectable
    results = []
    for item in filtered:
        materials_with_costs = []
        total_optimal_cost = 0
        has_all_prices = True
        
        for mat in item.get("materials", []):
            mat_id = mat["itemId"]
            mat_qty = mat["quantity"]
            mat_name = mat["name"]
            
            # Skip crystals
            if mat_id < 20:
                materials_with_costs.append({
                    **mat,
                    "buyPrice": 0,
                    "craftCost": None,
                    "optimalCost": 0,
                    "cheapestOption": "free",
                    "isCrystal": True,
                    "subMaterials": None
                })
                continue
            
            # Get market price
            price_data = prices.get(str(mat_id), {})
            buy_price = price_data.get("nqPrice", 0) or price_data.get("hqPrice", 0)
            
            # Check if craftable
            craft_cost = None
            sub_materials = None
            cheapest_option = "buy"
            
            if str(mat_id) in CRAFTABLE_ITEMS:
                recipe = CRAFTABLE_ITEMS[str(mat_id)]
                yields = recipe.get("yields", 1)
                
                # Calculate crafting cost from sub-materials
                sub_materials = []
                craft_total = 0
                can_calculate = True
                
                for sub_mat in recipe.get("ingredients", []):
                    sub_id = sub_mat["itemId"]
                    sub_qty = sub_mat["quantity"]
                    sub_name = sub_mat["name"]
                    
                    if sub_id < 20:  # Crystal
                        sub_materials.append({
                            "itemId": sub_id,
                            "name": sub_name,
                            "quantity": sub_qty,
                            "unitPrice": 0,
                            "isCrystal": True
                        })
                        continue
                    
                    sub_price_data = prices.get(str(sub_id), {})
                    sub_price = sub_price_data.get("nqPrice", 0) or sub_price_data.get("hqPrice", 0)
                    
                    if sub_price == 0:
                        can_calculate = False
                    
                    sub_materials.append({
                        "itemId": sub_id,
                        "name": sub_name,
                        "quantity": sub_qty,
                        "unitPrice": sub_price,
                        "isCrystal": False
                    })
                    craft_total += sub_price * sub_qty
                
                if can_calculate and yields > 0:
                    craft_cost = round(craft_total / yields)
                    
                    # Determine cheapest option
                    if buy_price == 0:
                        cheapest_option = "craft" if craft_cost > 0 else "unknown"
                    elif craft_cost < buy_price:
                        cheapest_option = "craft"
                    else:
                        cheapest_option = "buy"
            
            # Calculate optimal cost for this material
            if cheapest_option == "craft" and craft_cost is not None:
                optimal_unit_cost = craft_cost
            elif buy_price > 0:
                optimal_unit_cost = buy_price
            else:
                optimal_unit_cost = 0
                has_all_prices = False
            
            optimal_total = optimal_unit_cost * mat_qty
            total_optimal_cost += optimal_total
            
            materials_with_costs.append({
                **mat,
                "buyPrice": buy_price,
                "craftCost": craft_cost,
                "optimalCost": optimal_total,
                "cheapestOption": cheapest_option,
                "isCrystal": False,
                "subMaterials": sub_materials
            })
        
        # Calculate gil per scrip
        scrip_value = item["value"]
        gil_per_scrip = round(total_optimal_cost / scrip_value, 1) if scrip_value > 0 else 0
        
        results.append({
            **item,
            "materials": materials_with_costs,
            "totalOptimalCost": total_optimal_cost,
            "gilPerScrip": gil_per_scrip,
            "hasAllPrices": has_all_prices
        })
    
    # Sort by gil per scrip (lowest first)
    results.sort(key=lambda x: (not x["hasAllPrices"], x["gilPerScrip"]))
    
    return {
        "world": world,
        "count": len(results),
        "fetchedAt": int(time() * 1000),
        "collectables": results
    }


@router.get("/materials")
async def get_materials(
    expansion: str = Query(default="All"),
):
    """Get all crafting materials, optionally filtered by expansion."""
    materials = []
    
    for mat in CRAFTING_MATERIALS:
        if expansion != "All" and mat.get("expansion") != expansion:
            continue
        materials.append(mat)
    
    return {
        "count": len(materials),
        "materials": materials
    }


@router.get("/materials/{world}/prices")
async def get_materials_with_prices(
    world: str,
    expansion: str = Query(default="All"),
    sort: str = Query(default="price"),
):
    """Get materials with market prices."""
    filtered = []
    for mat in CRAFTING_MATERIALS:
        if expansion != "All" and mat.get("expansion") != expansion:
            continue
        filtered.append(mat)
    
    if not filtered:
        return {
            "world": world,
            "count": 0,
            "materials": []
        }
    
    material_ids = [mat["itemId"] for mat in filtered]
    prices = await fetch_prices_batched(world, material_ids)
    
    results = []
    for mat in filtered:
        price_data = prices.get(str(mat["itemId"]), {})
        nq_price = price_data.get("nqPrice", 0)
        hq_price = price_data.get("hqPrice", 0)
        
        results.append({
            **mat,
            "nqPrice": nq_price,
            "hqPrice": hq_price,
            "minPrice": nq_price or hq_price or 0,
            "hasPrice": nq_price > 0 or hq_price > 0
        })
    
    if sort == "price":
        results.sort(key=lambda x: (not x["hasPrice"], x["minPrice"]))
    elif sort == "name":
        results.sort(key=lambda x: x["name"])
    elif sort == "usage":
        results.sort(key=lambda x: -x.get("usageCount", 0))
    
    return {
        "world": world,
        "count": len(results),
        "fetchedAt": int(time() * 1000),
        "materials": results
    }


async def fetch_prices_batched(world: str, item_ids: list[int]) -> dict:
    """Fetch prices for multiple items with caching and batching."""
    prices = {}
    items_to_fetch = []
    
    for item_id in item_ids:
        cache_key = f"price:{world}:{item_id}"
        cached = get_cached(cache_key)
        if cached:
            prices[str(item_id)] = cached
        else:
            items_to_fetch.append(item_id)
    
    if not items_to_fetch:
        return prices
    
    batch_size = 100
    for i in range(0, len(items_to_fetch), batch_size):
        batch = items_to_fetch[i:i + batch_size]
        batch_ids = ",".join(str(id) for id in batch)
        
        await universalis_limiter.acquire()
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{UNIVERSALIS_BASE}/{world}/{batch_ids}",
                    headers={"User-Agent": "GatheringGold/1.0"},
                    timeout=15.0
                )
                response.raise_for_status()
                data = response.json()
        except Exception as e:
            print(f"Price fetch error: {e}")
            continue
        
        if "itemID" in data:
            item_data = {
                "nqPrice": data.get("minPriceNQ", 0),
                "hqPrice": data.get("minPriceHQ", 0),
            }
            prices[str(data["itemID"])] = item_data
            set_cached(f"price:{world}:{data['itemID']}", item_data)
        elif "items" in data:
            for item_id, item_data in data["items"].items():
                price_data = {
                    "nqPrice": item_data.get("minPriceNQ", 0),
                    "hqPrice": item_data.get("minPriceHQ", 0),
                }
                prices[item_id] = price_data
                set_cached(f"price:{world}:{item_id}", price_data)
    
    return prices


@router.get("/crafting/collectables/classes")
async def get_crafting_classes():
    """Get unique crafting classes."""
    classes = list(set(item["craftingClass"] for item in CRAFTING_COLLECTABLES))
    return {"classes": sorted(classes)}


@router.get("/crafting/collectables/scrips")
async def get_scrip_types():
    """Get unique scrip types."""
    scrips = list(set(item["scrip"] for item in CRAFTING_COLLECTABLES))
    return {"scrips": sorted(scrips)}
