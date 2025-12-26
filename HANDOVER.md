# Project Handover Documentation

## Overview
**Gathering Gold** (formerly `ffxiv-gatherbuddy`) is a web tool for FFXIV gatherers. It tracks timed nodes, fishing holes, and calculates real-time profitability using Universalis data.

## Recent Updates & Features
This project has seen significant updates to support **Dawntrail (7.x)** content and improve usability.

### 1. Data Accuracy (Patch 7.0/7.1)
- **Source**: Items and nodes are now auto-generated from Teamcraft data using `server/fetch_teamcraft_nodes.py`.
- **Verified Items**: All Dawntrail timed nodes (Legendary, Ephemeral, Collectable) should be accurate.
- **Scrip Data**: Manual scrip values are maintained in `client/src/data/timedNodeScrips.js`.
  - Distinguishes between **White/Purple/Orange** Scrip nodes and **Aetherial Reduction** nodes (Cyan).
  - *Correction*: "Rarefied Acacia Bark" is Purple, "Rarefied Acacia Log" is Orange (fixed in data).

### 2. Core Features
- **Nodes Page**:
  - **Gold Mode**: Ranks nodes by Gil/Hour (Market Price × Yield).
  - **Scrip Mode**: Ranks nodes by Scrip Amount/Hour.
  - **Filters**:
    - Class (Miner/Botanist)
    - Expansion (DT to ARR)
    - Type (Legendary 🌟, Ephemeral ⏳, Collectable 📦)
    - **Search**: Instant text search for items or zones.
  - **Alarms**:
    - 🔔 Personal Alarm: Toggle on specific items.
    - 🔊 **Global Filter Sound**: Plays a sound when *any* new node matching your filters spawns.
  - **12-Hour Clock**: All times display in AM/PM format by default.

- **Fishing Page**:
  - Timed fishing holes with spawn windows, bait requirements, and weather conditions.
  - 12-Hour clock support.

- **Other Pages**:
  - **Folklore Guide**: Walkthrough for unlocking Regional Folklore Books.
  - **Allied Societies**: Guide for tribal daily quests.
  - **Checklist**: Semi-persistent checklist for gathering goals.
  - **Collectables**: Reference for collectable breakpoints.

### 3. Key Files & Scripts
- **Backend** (`server/`):
  - `app/main.py`: Entry point.
  - `app/routes/`: API endpoints.
  - `fetch_teamcraft_nodes.py`: **CRITICAL**. Run this to update `gatheringNodes.json` if game data changes.
  - `generate_scrip_data.py`: Helper to scaffold scrip data entries.

- **Frontend** (`client/`):
  - `src/pages/NodesPage.jsx`: Main logic for the active node list, filtering, and alarms.
  - `src/utils/eorzeanTime.js`: Centralized time calculation (12h format).
  - `src/data/timedNodeScrips.js`: **CRITICAL**. Defines scrip values and "Reduction" status. Manually updated.

## Setup Instructions
See `README.md` for standard startup (npm run dev + uvicorn).

## Known Issues / Future Work
1.  **Weather Forecast**: Fishing page currently shows weather *requirements* but does not forecast *when* that weather will occur next in the zone. Adding a weather forecaster would be a high-value addition.
2.  **Gathering Routes**: Users requested a routing path feature.
3.  **Inventory Sync**: Currently, checkbox state is local/session-based. No persistent backend database for user user data exists yet.
4.  **Teamcraft Import**: `fetch_teamcraft_nodes.py` relies on `pyscript` references or raw JSON from Teamcraft's repo. If their URL changes, this script breaks.

## Maintenance
- **New Patch**:
    1. Run `python server/fetch_teamcraft_nodes.py` to get new nodes.
    2. Update `client/src/data/timedNodeScrips.js` with new collectable values (check Teamcraft or in-game).
    3. Verify if any new "Reduction" items need `isReduction: true` flag.
