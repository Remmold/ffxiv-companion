"""
Fishing API routes.
"""

import json
from pathlib import Path
from fastapi import APIRouter, Query

from app.utils.eorzean_time import get_current_eorzean_time, get_node_status

router = APIRouter(prefix="/api", tags=["fishing"])

# Load fishing holes data
DATA_PATH = Path(__file__).parent.parent / "data" / "fishingHoles.json"
with open(DATA_PATH, "r", encoding="utf-8") as f:
    FISHING_HOLES = json.load(f)


@router.get("/fishing")
async def get_fishing_holes(
    look_ahead: int = Query(default=4, alias="lookAhead"),
    expansion: str = Query(default="All"),
):
    """Get all fishing holes with their current status, filtered by look-ahead window."""
    current_et = get_current_eorzean_time()
    
    holes = []
    for hole in FISHING_HOLES:
        status = get_node_status(
            hole["etSpawnStart"],
            hole["etSpawnEnd"],
            look_ahead
        )
        
        # Only include active/upcoming holes
        if status.status not in ("active", "upcoming"):
            continue
        
        # Apply filters
        if expansion != "All" and hole["expansion"] != expansion:
            continue
        
        holes.append({
            **hole,
            "isActive": status.is_active,
            "minutesUntilSpawn": status.minutes_until_spawn,
            "status": status.status,
            "currentET": {
                "hours": current_et.hours,
                "minutes": current_et.minutes
            }
        })
    
    # Sort: active first, then by minutes until spawn
    holes.sort(key=lambda x: (not x["isActive"], x["minutesUntilSpawn"]))
    
    return {
        "currentET": {
            "hours": current_et.hours,
            "minutes": current_et.minutes,
            "totalMinutes": current_et.total_minutes
        },
        "lookAheadHours": look_ahead,
        "count": len(holes),
        "holes": holes
    }


@router.get("/fishing/all")
async def get_all_fishing_holes():
    """Get all fishing holes (unfiltered, for reference)."""
    return {
        "count": len(FISHING_HOLES),
        "holes": FISHING_HOLES
    }
