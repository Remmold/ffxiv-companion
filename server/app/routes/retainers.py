"""
Retainer Ventures API routes with market price lookup.
Includes both server prices and cross-DC lowest prices.
"""

from fastapi import APIRouter, Query
import httpx
from time import time

from app.utils.cache import get_cached, set_cached
from app.utils.throttle import universalis_limiter

router = APIRouter(prefix="/api", tags=["retainers"])

UNIVERSALIS_BASE = "https://universalis.app/api/v2"

# Map worlds to their data centers
WORLD_TO_DC = {}
DATA_CENTERS = {
    "Aether": ["Adamantoise", "Cactuar", "Faerie", "Gilgamesh", "Jenova", "Midgardsormr", "Sargatanas", "Siren"],
    "Primal": ["Behemoth", "Excalibur", "Exodus", "Famfrit", "Hyperion", "Lamia", "Leviathan", "Ultros"],
    "Crystal": ["Balmung", "Brynhildr", "Coeurl", "Diabolos", "Goblin", "Malboro", "Mateus", "Zalera"],
    "Dynamis": ["Halicarnassus", "Maduin", "Marilith", "Seraph"],
    "Chaos": ["Cerberus", "Louisoix", "Moogle", "Omega", "Phantom", "Ragnarok", "Sagittarius", "Spriggan"],
    "Light": ["Alpha", "Lich", "Odin", "Phoenix", "Raiden", "Shiva", "Twintania", "Zodiark"],
    "Elemental": ["Aegis", "Atomos", "Carbuncle", "Garuda", "Gungnir", "Kujata", "Tonberry", "Typhon"],
    "Gaia": ["Alexander", "Bahamut", "Durandal", "Fenrir", "Ifrit", "Ridill", "Tiamat", "Ultima"],
    "Mana": ["Anima", "Asura", "Chocobo", "Hades", "Ixion", "Masamune", "Pandaemonium", "Titan"],
    "Meteor": ["Belias", "Mandragora", "Ramuh", "Shinryu", "Unicorn", "Valefor", "Yojimbo", "Zeromus"],
    "Materia": ["Bismarck", "Ravana", "Sephirot", "Sophia", "Zurvan"],
}
# Build reverse lookup
for dc, worlds in DATA_CENTERS.items():
    for world in worlds:
        WORLD_TO_DC[world] = dc

# Comprehensive Hunting venture items - combat retainer drops
# Format: (itemId, name, level, category, base_qty)
HUNTING_VENTURES = [
    # ARR Level 1-20
    (5057, "Sheepskin", 1, "Hide", 10),
    (5056, "Marmot Pelt", 5, "Hide", 10),
    (5058, "Dodo Skin", 5, "Hide", 10),
    (5101, "Animal Fat", 5, "Reagent", 10),
    (5116, "Bone Chip", 8, "Bone", 15),
    (5059, "Toad Skin", 12, "Hide", 10),
    (5117, "Bat Fang", 12, "Fang", 15),
    (5060, "Wolf Pelt", 15, "Hide", 10),
    (5119, "Bat Wing", 15, "Wing", 15),
    (4888, "Night Milk", 17, "Reagent", 10),
    (5102, "Raptor Sinew", 17, "Sinew", 10),
    (5061, "Aldgoat Skin", 20, "Hide", 10),
    
    # ARR Level 21-35
    (4816, "Puk Egg", 22, "Egg", 10),
    (5063, "Boar Hide", 25, "Hide", 10),
    (5103, "Hippogryph Sinew", 25, "Sinew", 10),
    (5118, "Coeurl Whisker", 29, "Whisker", 10),
    (5064, "Peiste Skin", 30, "Hide", 10),
    (4807, "Orobon Liver", 30, "Reagent", 10),
    (5067, "Fleece", 31, "Fleece", 10),
    (5065, "Basilisk Skin", 32, "Hide", 10),
    (4831, "Cactuar Needle", 32, "Reagent", 10),
    (5104, "Bomb Ash", 35, "Reagent", 10),
    (5120, "Blue Yarzon Leg", 35, "Reagent", 10),
    (5066, "Raptor Skin", 35, "Hide", 10),
    
    # ARR Level 36-50
    (5068, "Karakul Skin", 38, "Hide", 10),
    (4839, "Blue Landtrap Leaf", 38, "Leaf", 10),
    (5128, "Morbol Vine", 40, "Vine", 10),
    (5069, "Hippogryph Skin", 40, "Hide", 10),
    (4794, "Raptor Shank", 40, "Meat", 10),
    (5071, "Gagana Skin", 43, "Hide", 10),
    (4829, "Pudding Flesh", 43, "Flesh", 10),
    (4820, "Basilisk Egg", 45, "Egg", 10),
    (5072, "Apkallu Skin", 46, "Hide", 10),
    (4853, "Apkallu Egg", 46, "Egg", 10),
    (4852, "Apkallu Down", 46, "Feather", 10),
    (5073, "Goobbue Skin", 48, "Hide", 10),
    (4782, "Buffalo Sirloin", 48, "Meat", 10),
    (5122, "Ahriman Wing", 50, "Wing", 10),
    (5123, "Eft Tail", 50, "Tail", 10),
    (4858, "Ogre Horn", 50, "Horn", 5),
    (4844, "Spoken Blood", 50, "Reagent", 10),
    (5074, "Snurble Tufts", 50, "Fur", 10),
    
    # Heavensward Level 51-60
    (12601, "Yak Milk", 51, "Reagent", 10),
    (12561, "Archaeornis Skin", 51, "Hide", 10),
    (12573, "Gastornis Egg", 51, "Egg", 10),
    (12578, "Icetrap Leaf", 53, "Leaf", 10),
    (12562, "Gelato Flesh", 53, "Flesh", 10),
    (12586, "Loaghtan Chump", 53, "Meat", 10),
    (12563, "Wyvern Skin", 55, "Hide", 10),
    (12580, "Wyvern Wing", 55, "Wing", 10),
    (12567, "Yeti Fang", 55, "Fang", 10),
    (12576, "Deepeye Tears", 55, "Reagent", 10),
    (12568, "Bear Fat", 57, "Reagent", 10),
    (12564, "Dhalmel Hide", 57, "Hide", 10),
    (12590, "Dhalmel Meat", 57, "Meat", 10),
    (12582, "Dhalmel Saliva", 57, "Reagent", 10),
    (12575, "Biast Scales", 57, "Scale", 10),
    (12577, "Drake Scales", 57, "Scale", 10),
    (12566, "Amphiptere Skin", 59, "Hide", 10),
    (12565, "Dragon Skin", 59, "Hide", 10),
    (12581, "Dragon Fang", 59, "Fang", 10),
    (12583, "Dragon Blood", 59, "Reagent", 10),
    (12934, "Griffin Hide", 60, "Hide", 10),
    (12935, "Griffin Talon", 60, "Reagent", 10),
    (12579, "Chimera Mane", 60, "Fur", 10),
    (12574, "Okeanis Egg", 60, "Egg", 10),
    
    # Stormblood Level 61-70
    (19935, "Gyuki Hide", 61, "Hide", 10),
    (19964, "Dzo Horn", 61, "Horn", 10),
    (19965, "Steppe Milk", 61, "Reagent", 10),
    (19966, "Dzo Chuck", 61, "Meat", 10),
    (19936, "True Griffin Hide", 63, "Hide", 10),
    (19969, "Halgai Mane", 63, "Fur", 10),
    (19937, "Gazelle Hide", 65, "Hide", 10),
    (19970, "Gazelle Horn", 65, "Horn", 10),
    (19971, "Manzasiri Hair", 65, "Fur", 10),
    (19938, "Marid Hide", 67, "Hide", 10),
    (19973, "Jhammel Haunch", 67, "Meat", 10),
    (19974, "Twincoon", 67, "Reagent", 10),
    (19939, "Tiger Skin", 69, "Hide", 10),
    (19975, "Island Wolf Fang", 69, "Fang", 10),
    (19940, "Smilodon Skin", 70, "Hide", 10),
    (19976, "Rail Tenderloin", 70, "Meat", 10),
    (19977, "Gagana Egg", 70, "Egg", 10),
    (19978, "Hornbill Tenderloin", 70, "Meat", 10),
    
    # Shadowbringers Level 71-80
    (27720, "Hoptrap Leaf", 71, "Leaf", 10),
    (27756, "Silkmoth Scales", 71, "Scale", 10),
    (27721, "Green Glider Skin", 73, "Hide", 10),
    (27757, "Lorikeet Egg", 73, "Egg", 10),
    (27758, "Lorikeet Down", 73, "Feather", 10),
    (27722, "Atrociraptor Skin", 75, "Hide", 10),
    (27759, "Vampire Vine Sap", 75, "Reagent", 10),
    (27760, "Vampire Cup Vine", 75, "Vine", 10),
    (27723, "Zonure Skin", 77, "Hide", 10),
    (27761, "Ovim Meat", 77, "Meat", 10),
    (27762, "Ovim Fleece", 77, "Fleece", 10),
    (27724, "Sea Swallow Skin", 79, "Hide", 10),
    (27763, "Cubus Flesh", 79, "Flesh", 10),
    (27764, "Hydrozoan Umbrella", 79, "Reagent", 10),
    (27725, "Hamsa Tenderloin", 80, "Meat", 10),
    (27765, "Amra", 80, "Fruit", 10),
    (27766, "Gaja Hide", 80, "Hide", 10),
    (27767, "Yakow Chuck", 80, "Meat", 10),
    (27768, "Ovibos Milk", 80, "Reagent", 10),
    
    # Endwalker Level 81-90
    (36150, "Almasty Fur", 81, "Fur", 10),
    (36181, "Luncheon Toad Skin", 81, "Hide", 10),
    (36182, "Lunatender Blossom", 81, "Flower", 10),
    (36151, "Saiga Hide", 83, "Hide", 10),
    (36183, "Dynamite Ash", 83, "Reagent", 10),
    (36152, "Ophiotauros Hide", 85, "Hide", 10),
    (36184, "Bird of Elpis Breast", 85, "Meat", 10),
    (36185, "Egg of Elpis", 85, "Egg", 10),
    (36153, "Kumbhira Skin", 87, "Hide", 10),
    (36186, "Petalouda Scales", 87, "Scale", 10),
    (36187, "Mousse Flesh", 87, "Flesh", 10),
    (36188, "Berkanan Sap", 89, "Reagent", 10),
    (36154, "Dynamis Crystal", 89, "Crystal", 5),
    (36189, "Alpaca Fillet", 90, "Meat", 10),
    (36190, "Silver Lobo Hide", 90, "Hide", 10),
    
    # Dawntrail Level 91-100 (verified from craftableItems.json)
    (44054, "Hammerhead Crocodile Skin", 91, "Hide", 10),
    (44068, "Poison Frog Secretions", 91, "Reagent", 10),
    (44055, "Br'aax Hide", 93, "Hide", 10),
    (44069, "Lesser Apollyon Shell", 93, "Shell", 10),
    (44027, "Rroneek Fleece", 95, "Fleece", 10),
    (44071, "Tumbleclaw Weeds", 95, "Reagent", 10),
    (44056, "Gomphotherium Skin", 97, "Hide", 10),
    (44070, "Ty'aitya Wingblade", 97, "Reagent", 10),
    (44057, "Gargantua Hide", 99, "Hide", 10),
    (44072, "Alexandrian Axe Beak Wing", 100, "Wing", 10),
    (44053, "Silver Lobo Hide", 91, "Hide", 10),
]


@router.get("/retainers/{world}/ventures")
async def get_retainer_ventures(
    world: str,
    min_level: int = Query(default=1, alias="minLevel"),
    max_level: int = Query(default=100, alias="maxLevel"),
    category: str = Query(default="All"),
):
    """
    Get retainer hunting ventures with market prices.
    Returns both server price and lowest DC-wide price.
    """
    # Get the data center for this world
    dc = WORLD_TO_DC.get(world)
    
    # Filter ventures by level
    filtered = [
        v for v in HUNTING_VENTURES
        if min_level <= v[2] <= max_level
        and (category == "All" or v[3] == category)
    ]
    
    if not filtered:
        return {
            "world": world,
            "dataCenter": dc,
            "count": 0,
            "ventures": []
        }
    
    # Get all item IDs for price lookup
    item_ids = [v[0] for v in filtered]
    
    # Fetch server prices
    server_prices = await fetch_prices_batched(world, item_ids)
    
    # Fetch DC-wide prices (for cross-world comparison)
    dc_prices = {}
    if dc:
        dc_prices = await fetch_dc_prices(dc, item_ids)
    
    # Build results with prices
    results = []
    for item_id, name, level, cat, qty in filtered:
        # Server price - get both NQ and HQ
        server_data = server_prices.get(str(item_id), {})
        nq_price = server_data.get("nqPrice", 0)
        hq_price = server_data.get("hqPrice", 0)
        # Fallback: use whichever is available
        best_price = nq_price or hq_price
        
        # DC-wide lowest price
        dc_data = dc_prices.get(str(item_id), {})
        dc_min = dc_data.get("minPrice", 0)
        dc_world = dc_data.get("minWorld", "")
        
        results.append({
            "itemId": item_id,
            "name": name,
            "level": level,
            "category": cat,
            "quantity": qty,
            # Server prices - separate NQ and HQ
            "nqPrice": nq_price,
            "hqPrice": hq_price,
            "nqTotal": nq_price * qty,
            "hqTotal": hq_price * qty,
            # Legacy fields for compatibility (use best available)
            "unitPrice": best_price,
            "totalValue": best_price * qty,
            "hasPrice": best_price > 0,
            # DC-wide prices
            "dcLowestPrice": dc_min,
            "dcLowestWorld": dc_world,
            "dcTotalValue": dc_min * qty,
            "hasDcPrice": dc_min > 0,
            # Comparison
            "priceDiff": best_price - dc_min if best_price > 0 and dc_min > 0 else 0,
            "isCheapest": dc_world == world if dc_world else False
        })
    
    # Sort by total value (highest first)
    results.sort(key=lambda x: x["totalValue"], reverse=True)
    
    return {
        "world": world,
        "dataCenter": dc,
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
                    headers={"User-Agent": "FFXIVCompanion/1.0"},
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


async def fetch_dc_prices(dc: str, item_ids: list[int]) -> dict:
    """Fetch DC-wide prices and find the lowest price per item."""
    if not item_ids:
        return {}
    
    await universalis_limiter.acquire()
    
    batch_ids = ",".join(str(id) for id in item_ids)
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{UNIVERSALIS_BASE}/{dc}/{batch_ids}",
                params={"listings": 10, "entries": 0},
                headers={"User-Agent": "FFXIVCompanion/1.0"},
                timeout=30.0
            )
            response.raise_for_status()
            data = response.json()
    except Exception as e:
        print(f"DC price fetch error: {e}")
        return {}
    
    results = {}
    
    # Handle single item response
    if "itemID" in data:
        min_price, min_world = find_min_listing(data.get("listings", []))
        results[str(data["itemID"])] = {"minPrice": min_price, "minWorld": min_world}
    # Handle multi-item response
    elif "items" in data:
        for item_id, item_data in data["items"].items():
            min_price, min_world = find_min_listing(item_data.get("listings", []))
            results[item_id] = {"minPrice": min_price, "minWorld": min_world}
    
    return results


def find_min_listing(listings: list) -> tuple:
    """Find the lowest price listing and its world."""
    min_price = 0
    min_world = ""
    
    for listing in listings:
        price = listing.get("pricePerUnit", 0)
        if price > 0 and (min_price == 0 or price < min_price):
            min_price = price
            min_world = listing.get("worldName", "")
    
    return min_price, min_world
