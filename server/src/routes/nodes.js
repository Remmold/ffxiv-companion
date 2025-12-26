import { getCurrentEorzeanTime, getNodeStatus } from '../utils/eorzeanTime.js';
import gatheringNodes from '../data/gatheringNodes.json' with { type: 'json' };

/**
 * Register node routes
 * @param {import('fastify').FastifyInstance} fastify
 */
export default async function nodeRoutes(fastify) {
    // Get all nodes with their current status
    fastify.get('/api/nodes', async (request, reply) => {
        const { lookAhead = 4, gatheringClass, expansion } = request.query;

        const currentET = getCurrentEorzeanTime();

        let nodes = gatheringNodes.map(node => {
            const status = getNodeStatus(
                node.etSpawnStart,
                node.etSpawnEnd,
                parseInt(lookAhead)
            );

            return {
                ...node,
                ...status,
                currentET: {
                    hours: currentET.hours,
                    minutes: currentET.minutes
                }
            };
        });

        // Filter to only active/upcoming nodes
        nodes = nodes.filter(node =>
            node.status === 'active' || node.status === 'upcoming'
        );

        // Apply filters
        if (gatheringClass && gatheringClass !== 'All') {
            nodes = nodes.filter(node => node.gatheringClass === gatheringClass);
        }

        if (expansion && expansion !== 'All') {
            nodes = nodes.filter(node => node.expansion === expansion);
        }

        // Sort: active first, then by minutes until spawn
        nodes.sort((a, b) => {
            if (a.isActive && !b.isActive) return -1;
            if (!a.isActive && b.isActive) return 1;
            return a.minutesUntilSpawn - b.minutesUntilSpawn;
        });

        return {
            currentET,
            lookAheadHours: parseInt(lookAhead),
            count: nodes.length,
            nodes
        };
    });

    // Get all nodes (unfiltered, for reference)
    fastify.get('/api/nodes/all', async (request, reply) => {
        return {
            count: gatheringNodes.length,
            nodes: gatheringNodes
        };
    });

    // Get current Eorzean Time
    fastify.get('/api/time', async (request, reply) => {
        return getCurrentEorzeanTime();
    });
}
