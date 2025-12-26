// Simple in-memory cache with TTL

class Cache {
    constructor(ttlMs = 5 * 60 * 1000) { // Default 5 minutes
        this.cache = new Map();
        this.ttlMs = ttlMs;
    }

    /**
     * Get a value from cache
     * @param {string} key
     * @returns {any|null}
     */
    get(key) {
        const entry = this.cache.get(key);
        if (!entry) return null;

        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return entry.value;
    }

    /**
     * Set a value in cache
     * @param {string} key
     * @param {any} value
     * @param {number} ttlMs - Optional custom TTL
     */
    set(key, value, ttlMs = this.ttlMs) {
        this.cache.set(key, {
            value,
            expiresAt: Date.now() + ttlMs
        });
    }

    /**
     * Check if key exists and is not expired
     * @param {string} key
     * @returns {boolean}
     */
    has(key) {
        return this.get(key) !== null;
    }

    /**
     * Clear all cache entries
     */
    clear() {
        this.cache.clear();
    }

    /**
     * Get cache stats
     */
    stats() {
        return {
            size: this.cache.size,
            ttlMs: this.ttlMs
        };
    }
}

// Export singleton instance for price caching
export const priceCache = new Cache(5 * 60 * 1000); // 5 minute TTL

export default Cache;
