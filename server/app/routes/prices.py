"""
Prices API routes - Universalis integration with caching.
"""

import httpx
from fastapi import APIRouter, HTTPException
from time import time

from app.utils.cache import get_cached, set_cached, cache_stats

router = APIRouter(prefix="/api", tags=["prices"])

UNIVERSALIS_BASE = "https://universalis.app/api/v2"


@router.get("/prices/{world}/{item_ids}")
async def get_prices(world: str, item_ids: str):
    """
    Get prices for specific items from Universalis.
    Uses 5-minute cache to avoid API spam.
    """
    cache_key = f"{world}:{item_ids}"
    
    # Check cache first
    cached = get_cached(cache_key)
    if cached:
        return {
            "source": "cache",
            "world": world,
            **cached
        }
    
    # Fetch from Universalis API
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{UNIVERSALIS_BASE}/{world}/{item_ids}",
                headers={"User-Agent": "GatheringGold/1.0 (FFXIV Node Tracker)"},
                timeout=10.0
            )
            response.raise_for_status()
            data = response.json()
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=502,
            detail=f"Universalis API returned {e.response.status_code}"
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch prices: {str(e)}"
        )
    
    # Transform the data
    prices = {}
    
    # Handle single item response (no items dict)
    if "itemID" in data:
        prices[str(data["itemID"])] = {
            "nqPrice": data.get("minPriceNQ", 0),
            "hqPrice": data.get("minPriceHQ", 0),
            "nqListings": data.get("nqSaleVelocity", 0),
            "hqListings": data.get("hqSaleVelocity", 0),
            "lastUploadTime": data.get("lastUploadTime")
        }
    elif "items" in data:
        # Handle multi-item response
        for item_id, item_data in data["items"].items():
            prices[item_id] = {
                "nqPrice": item_data.get("minPriceNQ", 0),
                "hqPrice": item_data.get("minPriceHQ", 0),
                "nqListings": item_data.get("nqSaleVelocity", 0),
                "hqListings": item_data.get("hqSaleVelocity", 0),
                "lastUploadTime": item_data.get("lastUploadTime")
            }
    
    result = {
        "prices": prices,
        "itemCount": len(prices),
        "fetchedAt": int(time() * 1000)
    }
    
    # Cache the result
    set_cached(cache_key, result)
    
    return {
        "source": "api",
        "world": world,
        **result
    }


@router.get("/prices/cache/stats")
async def get_cache_stats():
    """Get cache statistics."""
    return cache_stats()
