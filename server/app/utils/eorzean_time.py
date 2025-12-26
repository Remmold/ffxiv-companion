"""
Eorzean Time Calculation Utility
1 Eorzean hour = 175 real seconds
Multiplier: 3600/175 ≈ 20.5714
"""

from dataclasses import dataclass

EORZEA_MULTIPLIER = 3600 / 175  # ~20.5714
SECONDS_PER_DAY = 24 * 60 * 60


@dataclass
class EorzeanTime:
    hours: int
    minutes: int
    seconds: int = 0
    total_minutes: int = 0


def get_current_eorzean_time() -> EorzeanTime:
    """Get the current Eorzean Time."""
    import time
    
    # Get current Unix timestamp in seconds
    now_seconds = time.time()
    
    # Convert to Eorzean seconds
    eorzea_seconds = now_seconds * EORZEA_MULTIPLIER
    
    # Get just the time of day portion (avoid overflow by using modulo)
    eorzea_day_seconds = eorzea_seconds % SECONDS_PER_DAY
    
    hours = int(eorzea_day_seconds // 3600) % 24
    minutes = int((eorzea_day_seconds % 3600) // 60)
    seconds = int(eorzea_day_seconds % 60)
    
    return EorzeanTime(
        hours=hours,
        minutes=minutes,
        seconds=seconds,
        total_minutes=hours * 60 + minutes
    )


def get_minutes_until_et(target_hour: int) -> int:
    """Calculate minutes until a specific Eorzean hour."""
    current = get_current_eorzean_time()
    current_total = current.hours * 60 + current.minutes
    target_total = target_hour * 60
    
    diff = target_total - current_total
    if diff < 0:
        diff += 24 * 60  # Add a full ET day
    
    return diff


@dataclass
class NodeStatus:
    is_active: bool
    minutes_until_spawn: int
    status: str  # 'active', 'upcoming', 'inactive'


def get_node_status(spawn_start: int, spawn_end: int, look_ahead_hours: int = 4) -> NodeStatus:
    """
    Check if a node is currently active or spawning within the next N ET hours.
    """
    current = get_current_eorzean_time()
    current_hour = current.hours
    
    # Handle wraparound (e.g., spawn 22:00 - 02:00)
    if spawn_end >= spawn_start:
        is_active = spawn_start <= current_hour < spawn_end
    else:
        is_active = current_hour >= spawn_start or current_hour < spawn_end
    
    if is_active:
        return NodeStatus(is_active=True, minutes_until_spawn=0, status="active")
    
    # Calculate minutes until spawn
    minutes_until = get_minutes_until_et(spawn_start)
    look_ahead_minutes = look_ahead_hours * 60
    
    if minutes_until <= look_ahead_minutes:
        return NodeStatus(is_active=False, minutes_until_spawn=minutes_until, status="upcoming")
    
    return NodeStatus(is_active=False, minutes_until_spawn=minutes_until, status="inactive")


def format_et(hours: int, minutes: int = 0) -> str:
    """Format ET time for display."""
    return f"{hours:02d}:{minutes:02d}"
