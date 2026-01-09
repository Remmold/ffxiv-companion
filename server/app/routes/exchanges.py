"""
Currency Exchange API routes.
Shows items purchasable with scrips/tomestones and their market value.
Updated: 2024-12-29 - Mathematics tomestone for 7.4
"""

import json
from pathlib import Path
from fastapi import APIRouter
import httpx
from time import time

from app.utils.cache import get_cached, set_cached
from app.utils.throttle import universalis_limiter

router = APIRouter(prefix="/api", tags=["exchanges"])

UNIVERSALIS_BASE = "https://universalis.app/api/v2"

# Load exchange data
DATA_PATH = Path(__file__).parent.parent / "data" / "currencyExchanges.json"
with open(DATA_PATH, "r", encoding="utf-8") as f:
    EXCHANGES = json.load(f)

# World to DC mapping
WORLD_TO_DC = {
    "Adamantoise": "Aether", "Cactuar": "Aether", "Faerie": "Aether", "Gilgamesh": "Aether", 
    "Jenova": "Aether", "Midgardsormr": "Aether", "Sargatanas": "Aether", "Siren": "Aether",
    "Behemoth": "Primal", "Excalibur": "Primal", "Exodus": "Primal", "Famfrit": "Primal", 
    "Hyperion": "Primal", "Lamia": "Primal", "Leviathan": "Primal", "Ultros": "Primal",
    "Balmung": "Crystal", "Brynhildr": "Crystal", "Coeurl": "Crystal", "Diabolos": "Crystal", 
    "Goblin": "Crystal", "Malboro": "Crystal", "Mateus": "Crystal", "Zalera": "Crystal",
    "Halicarnassus": "Dynamis", "Maduin": "Dynamis", "Marilith": "Dynamis", "Seraph": "Dynamis",
    "Cerberus": "Chaos", "Louisoix": "Chaos", "Moogle": "Chaos", "Omega": "Chaos", 
    "Phantom": "Chaos", "Ragnarok": "Chaos", "Sagittarius": "Chaos", "Spriggan": "Chaos",
    "Alpha": "Light", "Lich": "Light", "Odin": "Light", "Phoenix": "Light", 
    "Raiden": "Light", "Shiva": "Light", "Twintania": "Light", "Zodiark": "Light",
}


@router.get("/exchanges/{world}")
async def get_exchanges(world: str):
    """Get all currency exchange items with market prices."""
    
    # Collect all item IDs
    item_ids = [e["itemId"] for e in EXCHANGES]
    
    # Fetch server prices
    prices = {}
    dc_prices = {}
    
    # Batch fetch (up to 100 at a time)
    ids_str = ",".join(str(id) for id in item_ids[:100])
    
    try:
        await universalis_limiter.acquire()
        async with httpx.AsyncClient() as client:
            # Server prices
            response = await client.get(
                f"{UNIVERSALIS_BASE}/{world}/{ids_str}",
                params={"listings": 5, "entries": 0},
                headers={"User-Agent": "FFXIVCompanion/1.0"},
                timeout=30.0
            )
            response.raise_for_status()
            data = response.json()
            
            if "items" in data:
                for item_id, item_data in data["items"].items():
                    prices[item_id] = {
                        "minPrice": item_data.get("minPriceNQ", 0) or item_data.get("minPriceHQ", 0),
                        "hqPrice": item_data.get("minPriceHQ", 0),
                        "nqPrice": item_data.get("minPriceNQ", 0),
                    }
            elif "itemID" in data:
                prices[str(data["itemID"])] = {
                    "minPrice": data.get("minPriceNQ", 0) or data.get("minPriceHQ", 0),
                    "hqPrice": data.get("minPriceHQ", 0),
                    "nqPrice": data.get("minPriceNQ", 0),
                }
            
            # DC prices
            dc = WORLD_TO_DC.get(world)
            if dc:
                await universalis_limiter.acquire()
                dc_response = await client.get(
                    f"{UNIVERSALIS_BASE}/{dc}/{ids_str}",
                    params={"listings": 10, "entries": 0},
                    headers={"User-Agent": "FFXIVCompanion/1.0"},
                    timeout=30.0
                )
                dc_response.raise_for_status()
                dc_data = dc_response.json()
                
                def find_min_listing(listings):
                    min_price, min_world = 0, ""
                    for listing in listings:
                        price = listing.get("pricePerUnit", 0)
                        if price > 0 and (min_price == 0 or price < min_price):
                            min_price = price
                            min_world = listing.get("worldName", "")
                    return min_price, min_world
                
                if "items" in dc_data:
                    for item_id, item_data in dc_data["items"].items():
                        min_price, min_world = find_min_listing(item_data.get("listings", []))
                        dc_prices[item_id] = {"minPrice": min_price, "minWorld": min_world}
                elif "itemID" in dc_data:
                    min_price, min_world = find_min_listing(dc_data.get("listings", []))
                    dc_prices[str(dc_data["itemID"])] = {"minPrice": min_price, "minWorld": min_world}
                    
    except Exception as e:
        print(f"Exchange price fetch error: {e}")
    
    # Build results
    results = []
    for exchange in EXCHANGES:
        item_id = str(exchange["itemId"])
        price_data = prices.get(item_id, {})
        dc_data = dc_prices.get(item_id, {})
        
        server_price = price_data.get("minPrice", 0)
        dc_price = dc_data.get("minPrice", 0)
        dc_world = dc_data.get("minWorld", "")
        
        currency_cost = exchange["currencyCost"]
        
        # Calculate gil per currency unit
        gil_per_currency = round(server_price / currency_cost, 2) if currency_cost > 0 else 0
        dc_gil_per_currency = round(dc_price / currency_cost, 2) if currency_cost > 0 and dc_price > 0 else 0
        
        results.append({
            **exchange,
            "serverPrice": server_price,
            "dcPrice": dc_price,
            "dcWorld": dc_world,
            "gilPerCurrency": gil_per_currency,
            "dcGilPerCurrency": dc_gil_per_currency,
            "hasPrice": server_price > 0
        })
    
    # Sort by gil per currency (highest first)
    results.sort(key=lambda x: x["gilPerCurrency"], reverse=True)
    
    return {
        "world": world,
        "dataCenter": WORLD_TO_DC.get(world),
        "count": len(results),
        "fetchedAt": int(time() * 1000),
        "exchanges": results
    }


@router.get("/exchanges/currencies")
async def get_currency_types():
    """Get available currency types."""
    currencies = list(set(e["currencyType"] for e in EXCHANGES))
    return {"currencies": sorted(currencies)}
