"""
Market Deals API - Cross-world arbitrage and crash detection.
"""

import json
from pathlib import Path
from fastapi import APIRouter, Query
import httpx
from time import time

from app.utils.throttle import universalis_limiter

router = APIRouter(prefix="/api", tags=["deals"])

UNIVERSALIS_BASE = "https://universalis.app/api/v2"

# Load materials to scan
MATERIALS_PATH = Path(__file__).parent.parent / "data" / "craftingMaterials.json"
try:
    with open(MATERIALS_PATH, "r", encoding="utf-8") as f:
        MATERIALS = json.load(f)
except FileNotFoundError:
    MATERIALS = []

# Load key materials for vendor comparison
KEY_MATERIALS_PATH = Path(__file__).parent.parent / "data" / "keyMaterials.json"
try:
    with open(KEY_MATERIALS_PATH, "r", encoding="utf-8") as f:
        KEY_MATERIALS = json.load(f)
except FileNotFoundError:
    KEY_MATERIALS = []

# Data centers
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


@router.get("/deals/datacenters")
async def get_data_centers():
    """Get list of data centers."""
    return {"dataCenters": list(DATA_CENTERS.keys())}


@router.get("/deals/{dc}")
async def get_market_deals(
    dc: str,
    min_profit: int = Query(default=1000, alias="minProfit"),
    min_discount: int = Query(default=30, alias="minDiscount"),
    expansion: str = Query(default="All"),
):
    """
    Get market deals for a data center.
    Returns arbitrage opportunities and crash detections.
    """
    if dc not in DATA_CENTERS:
        return {"error": f"Unknown data center: {dc}"}
    
    worlds = DATA_CENTERS[dc]
    
    # Filter materials by expansion
    materials = MATERIALS
    if expansion != "All":
        materials = [m for m in materials if m.get("expansion") == expansion]
    
    if not materials:
        return {
            "dataCenter": dc,
            "worlds": worlds,
            "arbitrage": [],
            "crashes": [],
            "fetchedAt": int(time() * 1000)
        }
    
    # Get item IDs to check
    item_ids = [m["itemId"] for m in materials[:50]]  # Limit to 50 items per request
    
    # Fetch DC-wide prices
    prices = await fetch_dc_prices(dc, item_ids)
    
    # Build item name lookup
    item_names = {m["itemId"]: m["name"] for m in materials}
    item_expansions = {m["itemId"]: m.get("expansion", "?") for m in materials}
    
    # Find arbitrage opportunities
    arbitrage = []
    crashes = []
    
    for item_id, data in prices.items():
        item_id_int = int(item_id)
        item_name = item_names.get(item_id_int, f"Item {item_id}")
        item_exp = item_expansions.get(item_id_int, "?")
        
        # Get per-world prices
        world_prices = {}
        for listing in data.get("listings", []):
            world = listing.get("worldName")
            price = listing.get("pricePerUnit", 0)
            if world and price > 0:
                if world not in world_prices or price < world_prices[world]:
                    world_prices[world] = price
        
        if len(world_prices) < 2:
            continue
        
        # Find min and max
        sorted_prices = sorted(world_prices.items(), key=lambda x: x[1])
        min_world, min_price = sorted_prices[0]
        max_world, max_price = sorted_prices[-1]
        
        profit = max_price - min_price
        profit_pct = round((profit / min_price) * 100, 1) if min_price > 0 else 0
        
        # Add arbitrage if profitable enough
        if profit >= min_profit and profit_pct >= 10:
            arbitrage.append({
                "itemId": item_id_int,
                "name": item_name,
                "expansion": item_exp,
                "buyWorld": min_world,
                "buyPrice": min_price,
                "sellWorld": max_world,
                "sellPrice": max_price,
                "profit": profit,
                "profitPct": profit_pct
            })
        
        # Check for crash (current min price vs average)
        avg_price = data.get("averagePrice", 0)
        if avg_price > 0 and min_price > 0:
            discount_pct = round(((avg_price - min_price) / avg_price) * 100, 1)
            
            if discount_pct >= min_discount:
                crashes.append({
                    "itemId": item_id_int,
                    "name": item_name,
                    "expansion": item_exp,
                    "world": min_world,
                    "currentPrice": min_price,
                    "averagePrice": round(avg_price),
                    "discountPct": discount_pct
                })
    
    # Sort by profit/discount
    arbitrage.sort(key=lambda x: -x["profit"])
    crashes.sort(key=lambda x: -x["discountPct"])
    
    return {
        "dataCenter": dc,
        "worlds": worlds,
        "arbitrage": arbitrage[:20],  # Top 20
        "crashes": crashes[:20],
        "fetchedAt": int(time() * 1000),
        "itemsScanned": len(item_ids)
    }


async def fetch_dc_prices(dc: str, item_ids: list[int]) -> dict:
    """Fetch prices for all worlds in a data center."""
    if not item_ids:
        return {}
    
    await universalis_limiter.acquire()
    
    batch_ids = ",".join(str(id) for id in item_ids)
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{UNIVERSALIS_BASE}/{dc}/{batch_ids}",
                params={"listings": 20, "entries": 0},
                headers={"User-Agent": "GatheringGold/1.0"},
                timeout=30.0
            )
            response.raise_for_status()
            data = response.json()
    except Exception as e:
        print(f"DC price fetch error: {e}")
        return {}
    
    # Handle single vs multi-item response
    if "itemID" in data:
        return {str(data["itemID"]): data}
    elif "items" in data:
        return data["items"]
    
    return {}


@router.get("/deals/key-materials/{world}")
async def get_key_material_deals(
    world: str,
    category: str = Query(default="All"),
):
    """
    Get deals for key crafting materials.
    Compares market prices to vendor prices and shows cheap buys.
    """
    if not KEY_MATERIALS:
        return {
            "world": world,
            "count": 0,
            "materials": []
        }
    
    # Filter by category if specified
    materials = KEY_MATERIALS
    if category != "All":
        materials = [m for m in materials if m.get("category") == category]
    
    # Get item IDs to fetch prices for
    item_ids = [m["itemId"] for m in materials]
    
    # Fetch prices from Universalis
    await universalis_limiter.acquire()
    
    batch_ids = ",".join(str(id) for id in item_ids)
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{UNIVERSALIS_BASE}/{world}/{batch_ids}",
                params={"listings": 10, "entries": 5},
                headers={"User-Agent": "GatheringGold/1.0"},
                timeout=30.0
            )
            response.raise_for_status()
            data = response.json()
    except Exception as e:
        print(f"Key materials price fetch error: {e}")
        return {
            "world": world,
            "count": 0,
            "materials": [],
            "error": str(e)
        }
    
    # Parse prices
    prices = {}
    if "itemID" in data:
        prices[str(data["itemID"])] = data
    elif "items" in data:
        prices = data["items"]
    
    # Build results
    results = []
    for mat in materials:
        item_id = str(mat["itemId"])
        price_data = prices.get(item_id, {})
        
        min_price_nq = price_data.get("minPriceNQ", 0)
        min_price_hq = price_data.get("minPriceHQ", 0)
        avg_price = price_data.get("averagePrice", 0)
        avg_price_nq = price_data.get("averagePriceNQ", 0)
        avg_price_hq = price_data.get("averagePriceHQ", 0)
        listings = price_data.get("listingsCount", 0)
        velocity = price_data.get("regularSaleVelocity", 0)
        
        # Use the cheaper of NQ/HQ for min price
        min_price = min_price_nq if min_price_nq > 0 else min_price_hq
        if min_price_hq > 0 and min_price_hq < min_price:
            min_price = min_price_hq
        
        # Calculate vs vendor price
        vendor_price = mat.get("vendorPrice")
        vs_vendor = None
        is_vendor_deal = False
        
        if vendor_price and min_price > 0:
            vs_vendor = round(((vendor_price - min_price) / vendor_price) * 100, 1)
            # If market price is close to or below vendor, it's a good deal
            is_vendor_deal = min_price <= vendor_price * 1.2
        
        # Calculate vs average
        discount_pct = 0
        if avg_price > 0 and min_price > 0:
            discount_pct = round(((avg_price - min_price) / avg_price) * 100, 1)
        
        # Determine deal type
        deal_type = None
        if discount_pct >= 30:
            deal_type = "crash"
        elif discount_pct >= 15:
            deal_type = "cheap"
        elif is_vendor_deal:
            deal_type = "vendor_deal"
        
        results.append({
            "itemId": mat["itemId"],
            "name": mat["name"],
            "category": mat.get("category", "Unknown"),
            "usedIn": mat.get("usedIn", []),
            "vendorPrice": vendor_price,
            "vendorLocation": mat.get("vendorLocation"),
            "minPriceNQ": min_price_nq,
            "minPriceHQ": min_price_hq,
            "avgPrice": round(avg_price),
            "avgPriceNQ": round(avg_price_nq),
            "avgPriceHQ": round(avg_price_hq),
            "listings": listings,
            "velocity": round(velocity, 1),
            "discountPct": discount_pct,
            "vsVendor": vs_vendor,
            "isVendorDeal": is_vendor_deal,
            "dealType": deal_type
        })
    
    # Sort by deal quality (crashes first, then cheap, then vendor deals)
    def deal_sort_key(x):
        if x["dealType"] == "crash":
            return (0, -x["discountPct"])
        elif x["dealType"] == "cheap":
            return (1, -x["discountPct"])
        elif x["dealType"] == "vendor_deal":
            return (2, x["vsVendor"] or 0)
        return (3, 0)
    
    results.sort(key=deal_sort_key)
    
    return {
        "world": world,
        "count": len(results),
        "fetchedAt": int(time() * 1000),
        "materials": results
    }


@router.get("/deals/key-materials/categories")
async def get_key_material_categories():
    """Get available categories for key materials."""
    categories = list(set(m.get("category", "Unknown") for m in KEY_MATERIALS))
    return {"categories": sorted(categories)}
