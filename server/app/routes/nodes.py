"""
Nodes API routes.
"""

import json
from pathlib import Path
from fastapi import APIRouter, Query

from app.utils.eorzean_time import get_current_eorzean_time, get_node_status

router = APIRouter(prefix="/api", tags=["nodes"])

# Load gathering nodes data
DATA_PATH = Path(__file__).parent.parent / "data" / "gatheringNodes.json"
with open(DATA_PATH, "r", encoding="utf-8") as f:
    GATHERING_NODES = json.load(f)


@router.get("/nodes")
async def get_nodes(
    look_ahead: int = Query(default=12, alias="lookAhead"),
    gathering_class: str = Query(default="All", alias="gatheringClass"),
    expansion: str = Query(default="All"),
):
    """Get all nodes with their current status, filtered by look-ahead window."""
    current_et = get_current_eorzean_time()
    
    nodes = []
    for node in GATHERING_NODES:
        status = get_node_status(
            node["etSpawnStart"],
            node["etSpawnEnd"],
            look_ahead
        )
        
        # Only include active/upcoming nodes
        if status.status not in ("active", "upcoming"):
            continue
        
        # Apply filters
        if gathering_class != "All" and node["gatheringClass"] != gathering_class:
            continue
        if expansion != "All" and node["expansion"] != expansion:
            continue
        
        nodes.append({
            **node,
            "isActive": status.is_active,
            "minutesUntilSpawn": status.minutes_until_spawn,
            "status": status.status,
            "currentET": {
                "hours": current_et.hours,
                "minutes": current_et.minutes
            }
        })
    
    # Sort: active first, then by minutes until spawn
    nodes.sort(key=lambda x: (not x["isActive"], x["minutesUntilSpawn"]))
    
    return {
        "currentET": {
            "hours": current_et.hours,
            "minutes": current_et.minutes,
            "totalMinutes": current_et.total_minutes
        },
        "lookAheadHours": look_ahead,
        "count": len(nodes),
        "nodes": nodes
    }


@router.get("/nodes/all")
async def get_all_nodes():
    """Get all nodes (unfiltered, for reference)."""
    return {
        "count": len(GATHERING_NODES),
        "nodes": GATHERING_NODES
    }


@router.get("/time")
async def get_time():
    """Get current Eorzean Time."""
    et = get_current_eorzean_time()
    return {
        "hours": et.hours,
        "minutes": et.minutes,
        "seconds": et.seconds,
        "totalMinutes": et.total_minutes
    }
