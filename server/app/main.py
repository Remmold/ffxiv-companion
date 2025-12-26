"""
Gathering Gold - FastAPI Server
FFXIV Timed Gathering Node Tracker
"""

import os
from pathlib import Path
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.routes import nodes, prices, fishing, crafting, collectables, deals


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle management."""
    print("""
╔═══════════════════════════════════════════════════════╗
║     🌟 Gathering Gold Server Started! 🌟              ║
╠═══════════════════════════════════════════════════════╣
║  Server: http://0.0.0.0:3000                          ║
║  API:    http://0.0.0.0:3000/api/nodes                ║
║  Time:   http://0.0.0.0:3000/api/time                 ║
╚═══════════════════════════════════════════════════════╝
    """)
    yield


app = FastAPI(
    title="Gathering Gold API",
    description="FFXIV Timed Gathering Node Tracker",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
is_production = os.getenv("NODE_ENV") == "production"
if not is_production:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
        allow_methods=["GET", "POST"],
        allow_headers=["*"],
    )

# Register API routes
app.include_router(nodes.router)
app.include_router(prices.router)
app.include_router(fishing.router)
app.include_router(crafting.router)
app.include_router(collectables.router)
app.include_router(deals.router)


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    from time import time
    return {"status": "ok", "timestamp": int(time() * 1000)}


# Serve static files in production
PUBLIC_DIR = Path(__file__).parent.parent / "public"
if PUBLIC_DIR.exists():
    app.mount("/assets", StaticFiles(directory=PUBLIC_DIR / "assets"), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        """Serve the SPA for all non-API routes."""
        # Try to serve the file directly
        file_path = PUBLIC_DIR / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        # Fall back to index.html for SPA routing
        return FileResponse(PUBLIC_DIR / "index.html")


def start():
    """Entry point for the server."""
    port = int(os.getenv("PORT", 3000))
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=not is_production
    )


if __name__ == "__main__":
    start()
