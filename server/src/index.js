import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import nodeRoutes from './routes/nodes.js';
import priceRoutes from './routes/prices.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Fastify instance
const fastify = Fastify({
    logger: process.env.NODE_ENV === 'production' ? true : {
        level: 'info'
    }
});

// Register CORS
await fastify.register(cors, {
    origin: process.env.NODE_ENV === 'production'
        ? false  // Same origin in production
        : ['http://localhost:5173', 'http://127.0.0.1:5173'], // Vite dev server
    methods: ['GET', 'POST']
});

// In production, serve static files from public directory
if (process.env.NODE_ENV === 'production') {
    await fastify.register(fastifyStatic, {
        root: join(__dirname, '..', 'public'),
        prefix: '/'
    });
}

// Register API routes
await fastify.register(nodeRoutes);
await fastify.register(priceRoutes);

// Health check endpoint
fastify.get('/api/health', async () => {
    return { status: 'ok', timestamp: Date.now() };
});

// In production, handle client-side routing
if (process.env.NODE_ENV === 'production') {
    fastify.setNotFoundHandler((request, reply) => {
        // For API routes, return 404
        if (request.url.startsWith('/api/')) {
            return reply.status(404).send({ error: 'Not found' });
        }
        // For other routes, serve index.html (SPA routing)
        return reply.sendFile('index.html');
    });
}

// Start server
const start = async () => {
    try {
        const port = process.env.PORT || 3000;
        const host = process.env.HOST || '0.0.0.0';

        await fastify.listen({ port, host });
        console.log(`
╔═══════════════════════════════════════════════════════╗
║     🌟 Gathering Gold Server Started! 🌟              ║
╠═══════════════════════════════════════════════════════╣
║  Server: http://${host}:${port}                       ║
║  API:    http://${host}:${port}/api/nodes             ║
║  Time:   http://${host}:${port}/api/time              ║
╚═══════════════════════════════════════════════════════╝
    `);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
