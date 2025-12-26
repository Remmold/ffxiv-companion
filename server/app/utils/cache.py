"""
Simple TTL cache for Universalis API responses.
"""

from cachetools import TTLCache
from typing import Any

# 5-minute TTL cache for price data
price_cache: TTLCache = TTLCache(maxsize=1000, ttl=300)  # 300 seconds = 5 minutes


def get_cached(key: str) -> Any | None:
    """Get a value from cache."""
    return price_cache.get(key)


def set_cached(key: str, value: Any) -> None:
    """Set a value in cache."""
    price_cache[key] = value


def has_cached(key: str) -> bool:
    """Check if key exists in cache."""
    return key in price_cache


def cache_stats() -> dict:
    """Get cache statistics."""
    return {
        "size": len(price_cache),
        "maxsize": price_cache.maxsize,
        "ttl": price_cache.ttl
    }
