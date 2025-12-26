import { priceCache } from '../utils/cache.js';

/**
 * Register price routes
 * @param {import('fastify').FastifyInstance} fastify
 */
export default async function priceRoutes(fastify) {
    // Get prices for specific items from Universalis
    fastify.get('/api/prices/:world/:itemIds', async (request, reply) => {
        const { world, itemIds } = request.params;

        if (!world || !itemIds) {
            return reply.status(400).send({
                error: 'Missing required parameters: world and itemIds'
            });
        }

        // Create cache key
        const cacheKey = `${world}:${itemIds}`;

        // Check cache first
        const cached = priceCache.get(cacheKey);
        if (cached) {
            return {
                source: 'cache',
                world,
                ...cached
            };
        }

        try {
            // Fetch from Universalis API
            const url = `https://universalis.app/api/v2/${encodeURIComponent(world)}/${encodeURIComponent(itemIds)}`;

            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'GatheringGold/1.0 (FFXIV Node Tracker)'
                }
            });

            if (!response.ok) {
                throw new Error(`Universalis API returned ${response.status}`);
            }

            const data = await response.json();

            // Transform the data for easier consumption
            let prices = {};

            // Handle single item response (no items array)
            if (data.itemID) {
                prices[data.itemID] = {
                    nqPrice: data.minPriceNQ || 0,
                    hqPrice: data.minPriceHQ || 0,
                    nqListings: data.nqSaleVelocity || 0,
                    hqListings: data.hqSaleVelocity || 0,
                    lastUploadTime: data.lastUploadTime
                };
            } else if (data.items) {
                // Handle multi-item response
                for (const [itemId, itemData] of Object.entries(data.items)) {
                    prices[itemId] = {
                        nqPrice: itemData.minPriceNQ || 0,
                        hqPrice: itemData.minPriceHQ || 0,
                        nqListings: itemData.nqSaleVelocity || 0,
                        hqListings: itemData.hqSaleVelocity || 0,
                        lastUploadTime: itemData.lastUploadTime
                    };
                }
            }

            const result = {
                prices,
                itemCount: Object.keys(prices).length,
                fetchedAt: Date.now()
            };

            // Cache the result
            priceCache.set(cacheKey, result);

            return {
                source: 'api',
                world,
                ...result
            };

        } catch (error) {
            fastify.log.error('Universalis API error:', error);
            return reply.status(502).send({
                error: 'Failed to fetch prices from Universalis',
                details: error.message
            });
        }
    });

    // Get cache stats
    fastify.get('/api/prices/cache/stats', async (request, reply) => {
        return priceCache.stats();
    });
}
