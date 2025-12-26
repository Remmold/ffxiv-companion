"""
Request throttling utilities for API rate limiting.
Uses a semaphore to limit concurrent requests.
"""

import asyncio
from time import time
from typing import Optional


class RateLimiter:
    """
    Simple rate limiter using token bucket algorithm.
    Limits to max_requests per second.
    """
    
    def __init__(self, max_requests: int = 20, time_window: float = 1.0):
        self.max_requests = max_requests
        self.time_window = time_window
        self.tokens = max_requests
        self.last_refill = time()
        self._lock = asyncio.Lock()
    
    async def acquire(self) -> None:
        """Wait until a request slot is available."""
        async with self._lock:
            now = time()
            elapsed = now - self.last_refill
            
            # Refill tokens based on elapsed time
            self.tokens = min(
                self.max_requests,
                self.tokens + int(elapsed * self.max_requests / self.time_window)
            )
            self.last_refill = now
            
            if self.tokens <= 0:
                # Wait for a token to become available
                wait_time = self.time_window / self.max_requests
                await asyncio.sleep(wait_time)
                self.tokens = 1
            
            self.tokens -= 1


# Shared rate limiter for Universalis API calls
# Universalis allows 25 req/s, we use 20 to be safe
universalis_limiter = RateLimiter(max_requests=20, time_window=1.0)


async def throttled_request(limiter: RateLimiter, coro):
    """Execute a coroutine with rate limiting."""
    await limiter.acquire()
    return await coro
