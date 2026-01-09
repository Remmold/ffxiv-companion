"""
PydanticAI Agent for FFXIV Gathering Assistant.
Uses Groq LLM with tools to query game data.
"""

import os
import json
from pathlib import Path
from datetime import datetime
from typing import Optional

# Load .env file before importing models
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent.parent.parent / ".env")

from pydantic import BaseModel
from pydantic_ai import Agent, RunContext


# =============================================================================
# Rate Limiting - In-memory IP-based limits
# =============================================================================

from collections import defaultdict
from time import time

REQUEST_LOG: dict[str, list[float]] = defaultdict(list)
RATE_LIMIT_PER_IP_RPM = 5
RATE_LIMIT_PER_IP_RPD = 50


def check_rate_limit(ip: str) -> tuple[bool, str]:
    """Check if request is within rate limits."""
    now = time()
    minute_ago = now - 60
    day_ago = now - 86400
    
    REQUEST_LOG[ip] = [t for t in REQUEST_LOG[ip] if t > day_ago]
    
    reqs_last_minute = sum(1 for t in REQUEST_LOG[ip] if t > minute_ago)
    reqs_last_day = len(REQUEST_LOG[ip])
    
    if reqs_last_minute >= RATE_LIMIT_PER_IP_RPM:
        return False, f"Rate limit exceeded. Please wait (max {RATE_LIMIT_PER_IP_RPM}/min)."
    
    if reqs_last_day >= RATE_LIMIT_PER_IP_RPD:
        return False, f"Daily limit reached ({RATE_LIMIT_PER_IP_RPD}/day). Try again tomorrow!"
    
    return True, "OK"


def record_request(ip: str):
    REQUEST_LOG[ip].append(time())


# =============================================================================
# Agent Definition
# =============================================================================

SYSTEM_PROMPT = """You are an expert FFXIV gathering assistant for Patch 7.4 Dawntrail.

You MUST use your tools to answer questions. Each tool returns accurate game data.
Always call the relevant tool - never say you don't have data.

Current patch: 7.4 Dawntrail
"""


class AgentDeps(BaseModel):
    user_ip: str = "unknown"


# Using qwen/qwen3-32b which is recommended by Groq for tool calling
assistant = Agent(
    'groq:qwen/qwen3-32b',
    system_prompt=SYSTEM_PROMPT,
    deps_type=AgentDeps,
    retries=3,
)


# =============================================================================
# Agent Tools
# =============================================================================

@assistant.tool_plain
def get_gatherer_bis_gear() -> str:
    """Get Best-in-Slot gear for gatherers (Miner, Botanist, Fisher)."""
    return """## Gatherer BiS Gear (Patch 7.4)
**Set**: Crested Set + Gold Thumb's Tools
**Item Level**: 750 (crafted, pentameldable)

### Target Stats:
- Gathering: 5400+ (for +1 yield bonus)
- Perception: 5600+ (for +30% boon)
- GP: 960+ (for +1 integrity)

### Alternative: Orange Scrip Gear (iLvl 740)
Available if you prefer not to craft/pentameld."""


@assistant.tool_plain
def get_crafter_bis_gear() -> str:
    """Get Best-in-Slot gear for crafters (all DoH jobs)."""
    return """## Crafter BiS Gear (Patch 7.4)
**Set**: Crested Set + Gold Thumb's Tools
**Item Level**: 750 (crafted, pentameldable)

### Target Stats:
- Craftsmanship: 5380+ (for Master XII)
- Control: 4650+
- CP: 600+

### Melds:
- Tools: CP +9 x2
- Head/Body: Craftsmanship +36 x2
- Hands/Legs/Feet: Control +36 x2"""


@assistant.tool_plain
def get_beast_tribe_info(tribe_name: str = "") -> str:
    """Get info about Allied Societies / Beast Tribes for gatherers and crafters."""
    tribes = {
        "pelupelu": """## Pelupelu (Dawntrail Gatherer Tribe)
**Location**: Urqopacha (teleport to Tuliyollal)
**Unlock Quest**: "An Intrepid New Enterprise"
**Starting NPC**: Blue-garbed Pelu in Tuliyollal (X:13.6, Y:12.9)
**Rewards**: Orange Gatherer Scrips, Materia, Mounts
**Weekly Limit**: 12 quests shared""",
        "omicrons": """## Omicrons (Endwalker Crafter/Gatherer Tribe)
**Location**: Ultima Thule
**Rewards**: Purple Scrips, Materia""",
        "qitari": """## Qitari (Shadowbringers Gatherer Tribe)
**Location**: The Rak'tika Greatwood
**Rewards**: White Scrips, Materia""",
        "namazu": """## Namazu (Stormblood Crafter/Gatherer Tribe)
**Location**: The Azim Steppe
**Rewards**: Experience, ventures"""
    }
    
    if tribe_name:
        return tribes.get(tribe_name.lower(), f"Info for '{tribe_name}' not found. Available: Pelupelu, Omicrons, Qitari, Namazu")
    
    return """## Allied Societies for Gatherers/Crafters

**Dawntrail**: Pelupelu (Gatherer) - Best for Orange Scrips
**Endwalker**: Omicrons (Crafter/Gatherer)
**Shadowbringers**: Qitari (Gatherer)
**Stormblood**: Namazu (Crafter/Gatherer)

Daily allowance: 12 quests shared"""


@assistant.tool_plain
def get_orange_scrip_nodes() -> str:
    """Get level 100 orange scrip gathering node locations."""
    return """## Level 100 Orange Scrip Nodes

### Mining:
- **Rarefied Magnesite Ore** (40 scrips) - Urqopacha, north of Wachunpelo
- **Rarefied Ra'Kaznar Ore** (40 scrips) - Kozama'uka, east of Earthenshire
- **Rarefied Ash Soil** (40 scrips) - Heritage Found, near Yyasulani

### Botany:
- **Rarefied Dark Mahogany Log** (40 scrips) - Yak T'el, south of Mamook
- **Rarefied Acacia Log** (40 scrips) - Shaaloani, near Hhusatahwi
- **Rarefied Windsbalm Bay Leaf** (40 scrips) - Living Memory, near Leynode Mnemo

**Tip**: Max collectability (1000) gives full scrip value."""


@assistant.tool_plain
def get_scrip_info() -> str:
    """Get information about gatherer scrips and how to earn them."""
    return """## Gatherer Scrips Guide (Patch 7.4)

### Orange Scrips (Endgame)
- Level 100 Rarefied collectables from timed nodes
- Buy iLvl 740+ gear, Grade XII Materia

### Purple Scrips
- Level 90-99 collectables, Custom Deliveries
- Folklore books, older gear

### Best Sources:
- Custom Deliveries (12/week) - Margrat in Solution Nine
- Pelupelu beast tribe quests
- Timed unspoiled nodes"""


@assistant.tool_plain
def get_daily_weekly_tasks() -> str:
    """Get daily and weekly reset tasks for gatherers."""
    return """## Daily & Weekly Tasks

### Daily Reset (3:00 PM UTC)
- Grand Company Turn-ins
- Beast Tribe Quests (12 allowance)
- Retainer Ventures
- Treasure Map (1/day)

### Weekly Reset (Tuesday 8:00 AM UTC)
- Custom Deliveries (12 total)
- Wondrous Tails
- Challenge Log
- Jumbo Cactpot"""


@assistant.tool_plain
def get_custom_delivery_info() -> str:
    """Get custom delivery NPCs and their rewards."""
    return """## Custom Deliveries (12/week)

### Dawntrail (Orange Scrips):
- **Margrat** - Solution Nine (X:9.1, Y:13.3)

### Endwalker (Purple Scrips):
- **Ameliance** - Old Sharlayan (X:12.1, Y:9.8)
- **Anden** - Radz-at-Han

Tip: HQ turn-ins give bonus scrips!"""


@assistant.tool_plain
def get_materia_melding_info() -> str:
    """Get materia melding info for gatherer/crafter gear."""
    return """## Materia Melding (Patch 7.4)

### Grade XII Materia (Best for iLvl 750):
- Gatherer's Guerdon XII: +22 Gathering
- Gatherer's Guile XII: +22 Perception
- Gatherer's Grasp XII: +10 GP

### Pentameld Success Rates:
- Slots 1-2: 100%
- Slot 3: ~17%
- Slot 4: ~10%
- Slot 5: ~7%

Buy from Orange Scrip Exchange in Solution Nine."""


@assistant.tool_plain
def get_folklore_book_info() -> str:
    """Get folklore book requirements for gathering nodes."""
    return """## Folklore Books

Unlock special timed nodes. Buy with Purple Scrips.

### Dawntrail:
- Regional Folklore - Tural (requires level 100)
- Cost: 1,500 Purple Scrips

### Vendors:
- Scrip Exchange in Radz-at-Han, Old Sharlayan, or Solution Nine"""


@assistant.tool_plain
def get_eorzea_time_info() -> str:
    """Get Eorzean time conversion info."""
    return """## Eorzean Time

### Conversion:
- 1 ET hour = 2.92 real minutes
- 1 ET day = 70 real minutes

### Node Spawns:
- Unspoiled: 2 ET hours
- Ephemeral: 4 ET hours
- Legendary: 2 ET hours (Folklore required)

Check the app's Nodes tab for real-time timers!"""


# =============================================================================
# Main Query Function
# =============================================================================

async def query_assistant(
    message: str, 
    user_ip: str = "unknown",
    message_history: list[dict] = None
) -> tuple[bool, str]:
    """Query the assistant with a user message and optional history."""
    allowed, reason = check_rate_limit(user_ip)
    if not allowed:
        return False, reason
    
    if not os.getenv("GROQ_API_KEY"):
        return False, "Assistant not configured. GROQ_API_KEY required."
    
    try:
        record_request(user_ip)
        deps = AgentDeps(user_ip=user_ip)
        
        # Build message history for context
        # PydanticAI uses message_history parameter
        result = await assistant.run(
            message, 
            deps=deps,
            message_history=message_history or []
        )
        return True, result.output
    except Exception as e:
        return False, f"Error: {str(e)}"

