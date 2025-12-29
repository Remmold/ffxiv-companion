"""
Retainer Ventures API routes with market price lookup.
"""

from fastapi import APIRouter, Query
import httpx
from time import time

from app.utils.cache import get_cached, set_cached
from app.utils.throttle import universalis_limiter

router = APIRouter(prefix="/api", tags=["retainers"])

UNIVERSALIS_BASE = "https://universalis.app/api/v2"

# Hunting venture items - combat retainer drops
# Format: (itemId, name, level, category, base_qty)
HUNTING_VENTURES = [
    # Level 1-10
    (5057, "Sheepskin", 1, "Hide", 10),
    (5058, "Dodo Skin", 5, "Hide", 10),
    (5101, "Animal Fat", 5, "Reagent", 10),
    (5056, "Marmot Pelt", 5, "Hide", 10),
    (5116, "Bone Chip", 8, "Bone", 15),
    
    # Level 11-20
    (5059, "Toad Skin", 12, "Hide", 10),
    (5117, "Bat Fang", 12, "Fang", 15),
    (5060, "Wolf Pelt", 15, "Hide", 10),
    (5119, "Bat Wing", 15, "Wing", 15),
    (5102, "Raptor Sinew", 17, "Sinew", 10),
    (5061, "Aldgoat Skin", 20, "Hide", 10),
    
    # Level 21-30
    (5062, "Buffalo Hide", 22, "Hide", 10),
    (5103, "Hippogryph Sinew", 25, "Sinew", 10),
    (5063, "Boar Hide", 27, "Hide", 10),
    (5118, "Coeurl Whisker", 29, "Whisker", 10),
    (5064, "Peiste Skin", 30, "Hide", 10),
    
    # Level 31-40
    (5065, "Basilisk Skin", 32, "Hide", 10),
    (5104, "Bomb Ash", 35, "Reagent", 10),
    (5066, "Raptor Skin", 35, "Hide", 10),
    (5067, "Karakul Skin", 38, "Hide", 10),
    (5068, "Hippogryph Skin", 40, "Hide", 10),
    
    # Level 41-50
    (5069, "Gagana Skin", 43, "Hide", 10),
    (5120, "Gigant Clam", 45, "Shell", 10),
    (5070, "Apkallu Skin", 46, "Hide", 10),
    (5071, "Goobbue Skin", 48, "Hide", 10),
    (5072, "Behemoth Horn", 50, "Horn", 5),
    
    # Level 51-60 (Heavensward)
    (12561, "Archaeornis Skin", 51, "Hide", 10),
    (12562, "Yak Skin", 53, "Hide", 10),
    (12563, "Wyvern Skin", 55, "Hide", 10),
    (12566, "Griffin Skin", 57, "Hide", 10),
    (12568, "Amphiptere Skin", 59, "Hide", 10),
    (12934, "Manticore Hair", 60, "Fur", 10),
    
    # Level 61-70 (Stormblood)
    (19935, "Gyuki Skin", 61, "Hide", 10),
    (19936, "True Griffin Skin", 63, "Hide", 10),
    (19937, "Gazelle Skin", 65, "Hide", 10),
    (19938, "Marid Skin", 67, "Hide", 10),
    (19939, "Tiger Skin", 69, "Hide", 10),
    (19940, "Gyr Abanian Alumen", 70, "Reagent", 10),
    
    # Level 71-80 (Shadowbringers)
    (27720, "Ovibos Skin", 71, "Hide", 10),
    (27721, "Saigaskin", 73, "Hide", 10),
    (27722, "Zonureskin", 75, "Hide", 10),
    (27723, "Hoptrap Leaf", 77, "Leaf", 10),
    (27724, "Sea Swallow Skin", 79, "Hide", 10),
    (27725, "Ovim Fleece", 80, "Fleece", 10),
    
    # Level 81-90 (Endwalker)
    (36150, "Almasty Fur", 81, "Fur", 10),
    (36151, "Ophiotaurus Skin", 83, "Hide", 10),
    (36152, "Kumbhira Skin", 85, "Hide", 10),
    (36153, "Mousse Flesh", 87, "Flesh", 10),
    (36154, "Dynamis Crystal", 89, "Crystal", 5),
    (36155, "Rroneek Hide", 90, "Hide", 10),
    
    # Level 91-100 (Dawntrail)
    (43879, "Rroneek Skin", 91, "Hide", 10),
    (43880, "Valigarmanda Scale", 93, "Scale", 10),
    (43881, "Yok Huy Skin", 95, "Hide", 10),
    (43882, "Gargantua Hide", 97, "Hide", 10),
    (43883, "Goldclaw Leather", 99, "Leather", 10),
    (43884, "Br'aaxskin", 100, "Hide", 10),
]


@router.get("/retainers/{world}/ventures")
async def get_retainer_ventures(
    world: str,
    min_level: int = Query(default=1, alias="minLevel"),
    max_level: int = Query(default=100, alias="maxLevel"),
    category: str = Query(default="All"),
):
    """
    Get retainer hunting ventures with market prices, sorted by value.
    """
    # Filter ventures by level
    filtered = [
        v for v in HUNTING_VENTURES
        if min_level <= v[2] <= max_level
        and (category == "All" or v[3] == category)
    ]
    
    if not filtered:
        return {
            "world": world,
            "count": 0,
            "ventures": []
        }
    
    # Get all item IDs for price lookup
    item_ids = [v[0] for v in filtered]
    
    # Fetch prices
    prices = await fetch_prices_batched(world, item_ids)
    
    # Build results with prices
    results = []
    for item_id, name, level, cat, qty in filtered:
        price_data = prices.get(str(item_id), {})
        unit_price = price_data.get("nqPrice", 0) or price_data.get("hqPrice", 0)
        total_value = unit_price * qty
        
        results.append({
            "itemId": item_id,
            "name": name,
            "level": level,
            "category": cat,
            "quantity": qty,
            "unitPrice": unit_price,
            "totalValue": total_value,
            "valuePerHour": total_value,  # 1 hour venture
            "hasPrice": unit_price > 0
        })
    
    # Sort by total value (highest first)
    results.sort(key=lambda x: x["totalValue"], reverse=True)
    
    return {
        "world": world,
        "count": len(results),
        "fetchedAt": int(time() * 1000),
        "ventures": results
    }


@router.get("/retainers/categories")
async def get_venture_categories():
    """Get unique venture categories."""
    categories = list(set(v[3] for v in HUNTING_VENTURES))
    return {"categories": sorted(categories)}


async def fetch_prices_batched(world: str, item_ids: list[int]) -> dict:
    """
    Fetch prices for multiple items with caching and batching.
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
        
        await universalis_limiter.acquire()
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{UNIVERSALIS_BASE}/{world}/{batch_ids}",
                    headers={"User-Agent": "FFXIVCompanion/1.0"},
                    timeout=15.0
                )
                response.raise_for_status()
                data = response.json()
        except Exception as e:
            print(f"Price fetch error: {e}")
            continue
        
        # Parse response
        if "itemID" in data:
            # Single item
            item_data = {
                "nqPrice": data.get("minPriceNQ", 0),
                "hqPrice": data.get("minPriceHQ", 0),
            }
            prices[str(data["itemID"])] = item_data
            set_cached(f"price:{world}:{data['itemID']}", item_data)
        elif "items" in data:
            # Multi-item
            for item_id, item_data in data["items"].items():
                price_data = {
                    "nqPrice": item_data.get("minPriceNQ", 0),
                    "hqPrice": item_data.get("minPriceHQ", 0),
                }
                prices[item_id] = price_data
                set_cached(f"price:{world}:{item_id}", price_data)
    
    return prices
