*note that this is vibecoded and serves my purposes but isnt meant to be viewed as part of my coding portfolio

# Gathering Gold 🌟

A web application to track FFXIV timed gathering nodes and rank them by real-time market value.

![FFXIV](https://img.shields.io/badge/FFXIV-Gathering-gold)
![Python](https://img.shields.io/badge/Python-3.12-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)

## Features

- ⏰ **Eorzean Clock** - Live ET display (12-hour format)
- 📊 **Active View** - Shows nodes spawning within the next 4 ET hours
- 💰 **Gold Mode** - Rank nodes by Gil/Hour (Universalis prices)
- 💜 **Scrip Mode** - Rank nodes by Purple/Orange Scrips or Reduction value
- 🔍 **Advanced Filtering** - Filter by Class, Expansion, Type (Legendary/Ephemeral/Reduction), and Text Search
- 🎣 **Fishing Tracker** - Timed fishing holes with bait and weather info
- 🔔 **Smart Alarms** - Personal alarms + Global "Filter Match" sound alerts
- 🌍 **World Selector** - All FFXIV worlds organized by data center
- 📚 **Guides** - Integrated Folklore and Allied Society guides

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Python + FastAPI + uvicorn
- **Package Manager**: [uv](https://github.com/astral-sh/uv)
- **Deployment**: Docker + docker-compose

## Quick Start

### Development

1. **Start the backend:**
   ```bash
   cd server
   uv sync
   uv run uvicorn app.main:app --reload --port 3000
   ```

2. **Start the frontend (new terminal):**
   ```bash
   cd client
   npm install
   npm run dev
   ```

3. Open http://localhost:5173

### Production (Docker)

```bash
# Build and run
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

Access at http://localhost (port 80)

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/nodes` | Get active/upcoming nodes with filters |
| `GET /api/time` | Get current Eorzean Time |
| `GET /api/prices/{world}/{itemIds}` | Get prices from Universalis |
| `GET /api/health` | Health check |
| `GET /docs` | Swagger API documentation |

### Query Parameters for `/api/nodes`

- `lookAhead` - ET hours to look ahead (default: 4)
- `gatheringClass` - "Miner", "Botanist", or "All"
- `expansion` - "DT", "EW", "ShB", "SB", "HW", "ARR", or "All"

## Data Maintenance

> **See [HANDOVER.md](./HANDOVER.md) for detailed maintenance instructions.**

### Updating Nodes (New Patch)
Run the Teamcraft fetch script to pull the updated node data into `gatheringNodes.json`:
```bash
python server/fetch_teamcraft_nodes.py
```

### Updating Scrips/Collectables
Edit `client/src/data/timedNodeScrips.js` to adjust scrip yield values or mark items for Aetherial Reduction.

## Project Structure

```
ffxiv-gatherbuddy/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # UI Components (Clock, NodeTable, Filters)
│   │   ├── pages/           # Page Layouts (NodesPage, FishingPage)
│   │   ├── data/            # Static Data (Scrips, Guides)
│   │   └── utils/           # Helpers (Time, Notifications)
│   └── public/              # Sounds, Icons
├── server/                  # FastAPI backend
│   ├── app/
│   │   ├── routes/          # endpoints
│   │   └── utils/           # backend logic
│   ├── src/data/            # gatheringNodes.json (Truth Source)
│   └── fetch_teamcraft_nodes.py # Data Update Script
├── Dockerfile
└── docker-compose.yml
```

## Credits

- Prices from [Universalis](https://universalis.app)
- Data sourcing automated via Teamcraft/Garland Tools logic
- FINAL FANTASY XIV © SQUARE ENIX CO., LTD.

