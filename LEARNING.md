# Gathering Gold - Project Learning Guide

A comprehensive guide to understanding the **Gathering Gold** project, designed to help you explain the technical details and FFXIV-specific concepts to others.

---

## 🛠️ Tech Stack Overview

### Frontend (React + Vite)

| Technology | Purpose | Why It's Used |
|------------|---------|---------------|
| **React 18** | UI Framework | Component-based architecture, hooks for state management |
| **Vite** | Build Tool | Fast HMR (Hot Module Replacement), quick dev server |
| **Tailwind CSS** | Styling | Utility-first CSS, rapid prototyping, consistent design |
| **React Router** | Navigation | Client-side routing between pages |

### Backend (Python + FastAPI)

| Technology | Purpose | Why It's Used |
|------------|---------|---------------|
| **Python 3.12** | Language | Clean syntax, great for data processing |
| **FastAPI** | Web Framework | Async support, automatic OpenAPI docs, type validation |
| **uvicorn** | ASGI Server | Runs the FastAPI app, supports hot-reload |
| **uv** | Package Manager | Fast Python dependency management (like npm for Python) |

### External APIs

| API | Purpose | Documentation |
|-----|---------|---------------|
| **Universalis** | Real-time market prices | [universalis.app](https://universalis.app) |
| **Teamcraft** | Item/node data | Data fetched via `fetch_teamcraft_nodes.py` |
| **XIVAPI** | Character lookups | [xivapi.com](https://xivapi.com) |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Client                              │
│  React App (port 5173)                                      │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐│
│  │   Pages     │  │  Components  │  │  Utils/Data         ││
│  │ GatheringPg │  │  NodeTable   │  │  eorzeanTime.js     ││
│  │ CraftingPg  │  │  Filters     │  │  timedNodeScrips.js ││
│  │ DealsPg     │  │  Clock       │  │  etc.               ││
│  └─────────────┘  └──────────────┘  └─────────────────────┘│
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP (fetch)
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                         Server                              │
│  FastAPI App (port 3000)                                    │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐│
│  │   Routes    │  │    Utils     │  │       Data          ││
│  │  /api/nodes │  │ eorzean_time │  │ gatheringNodes.json ││
│  │  /api/prices│  │   throttle   │  │ fishingHoles.json   ││
│  │  /api/deals │  │    cache     │  │                     ││
│  └─────────────┘  └──────────────┘  └─────────────────────┘│
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP
                             ▼
              ┌──────────────────────────────┐
              │      External APIs           │
              │  • Universalis (prices)      │
              │  • Teamcraft (game data)     │
              └──────────────────────────────┘
```

---

## ⏰ FFXIV Eorzean Time System

### The Core Concept

FFXIV has its own in-game clock called **Eorzean Time (ET)**. Many gathering nodes only appear during specific ET windows.

### Time Conversion

| Unit | Real-World Equivalent |
|------|----------------------|
| 1 Eorzean minute | ~2.92 real seconds |
| 1 Eorzean hour ("bell") | 2 min 55 sec |
| 1 Eorzean day | 70 real minutes |
| **Multiplier** | 3600/175 ≈ **20.57** |

### Code Reference

The conversion is implemented in both client and server:

- **Client**: `client/src/utils/eorzeanTime.js`
- **Server**: `server/app/utils/eorzean_time.py`

```javascript
// Core formula
const eorzeaSeconds = (Date.now() / 1000) * (3600 / 175);
```

---

## 📦 Node Types Explained

Gathering nodes in FFXIV come in different types, each indicated by icons in the app:

| Type | Icon | Description |
|------|------|-------------|
| **Legendary** | 🌟 | Rare nodes, require **Folklore** books to unlock |
| **Ephemeral** | ⏳ | Spawn randomly during 4-hour windows, used for **Aetherial Reduction** |
| **Unspoiled** | 📍 | Standard timed nodes, appear twice per ET day |
| **Collectable** | 📦 | Can be turned in for **Scrips** (currency) |

### What Are Folklore Books?

Folklore books are endgame unlocks purchased with Scrips. Each region has a book that reveals Legendary nodes in that area. The app includes a **Folklore Guide** to help players unlock all books.

---

## 💰 Currency & Reward Systems

### Scrips

Scrips are crafting/gathering currencies earned by turning in **Collectables**:

| Scrip Type | Color | Used For |
|------------|-------|----------|
| **Purple Scrips** | 💜 | Current endgame gear, materia, materials |
| **Orange Scrips** | 🟠 | Premium rewards, relic tools |
| **White Scrips** | ⚪ | Older content (largely deprecated) |

### Aetherial Reduction

**Ephemeral** nodes yield items that can be "reduced" into rare crystals/clusters. These items are flagged in the data as `isReduction: true`.

---

## 🔌 API Endpoints

All API routes are defined in `server/app/routes/`:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/nodes` | GET | Get timed nodes with status (active/upcoming) |
| `/api/nodes/all` | GET | Get all nodes (unfiltered) |
| `/api/time` | GET | Current Eorzean Time |
| `/api/prices/{world}/{ids}` | GET | Market prices from Universalis |
| `/api/fishing` | GET | Timed fishing holes |
| `/api/deals/{dc}` | GET | Cross-world arbitrage deals |
| `/api/collectables` | GET | Crafting collectables data |
| `/api/health` | GET | Health check |

### Query Parameters for `/api/nodes`

```
?lookAhead=4         # ET hours to look ahead (default: 12)
&gatheringClass=Miner # "Miner", "Botanist", or "All"
&expansion=DT         # "DT", "EW", "ShB", "SB", "HW", "ARR", or "All"
```

---

## 📂 Key Files Reference

### Must-Know Files

| File | Purpose |
|------|---------|
| `server/fetch_teamcraft_nodes.py` | **CRITICAL** - Updates node data from Teamcraft |
| `client/src/data/timedNodeScrips.js` | **CRITICAL** - Manual scrip values and reduction flags |
| `server/app/data/gatheringNodes.json` | The "truth source" for all gathering nodes |
| `client/src/utils/eorzeanTime.js` | Client-side ET calculations |
| `server/app/utils/eorzean_time.py` | Server-side ET calculations |

### Page Component Structure

Each major page is in `client/src/pages/`:

| Page | Description |
|------|-------------|
| `GatheringPage.jsx` | Nodes + Fishing tabs |
| `CraftingPage.jsx` | Levequests + Collectables + Bulk Refining tabs |
| `MarketDealsPage.jsx` | Cross-world arbitrage & crash detection |
| `ChecklistPage.jsx` | Personal gathering checklists |
| `GearGuidePage.jsx` | Best-in-Slot gear recommendations |

---

## 📖 Glossary

| Term | Definition |
|------|------------|
| **ET** | Eorzean Time - the in-game clock |
| **Bell** | One Eorzean hour |
| **Node** | A gathering point in the world |
| **Unspoiled** | Timed nodes that appear at specific ET hours |
| **Legendary** | Rare nodes requiring Folklore books |
| **Ephemeral** | Random spawn nodes during 4-hour ET windows |
| **Scrips** | Currency earned from collectable turn-ins |
| **Folklore** | Books that unlock Legendary nodes |
| **Reduction** | Converting ephemeral items into crystals |
| **Gil** | The main in-game currency |
| **World** | An individual game server |
| **Data Center** | A group of Worlds (for cross-world features) |
| **Universalis** | Third-party market board API |

---

## 🚀 Running the Project

### Development Mode

```bash
# Terminal 1 - Backend
cd server
uv sync                    # Install Python dependencies
uvicorn app.main:app --reload --port 3000

# Terminal 2 - Frontend
cd client
npm install                # Install Node dependencies
npm run dev                # Starts on http://localhost:5173
```

### Production (Docker)

```bash
docker-compose up -d --build
# Access at http://localhost (port 80)
```

---

## 🔄 Data Update Workflow

When FFXIV patches add new content:

1. **Run the fetch script**:
   ```bash
   python server/fetch_teamcraft_nodes.py
   ```

2. **Update scrip data** (manual):
   - Edit `client/src/data/timedNodeScrips.js`
   - Add new collectable values
   - Mark reduction items with `isReduction: true`

3. **Verify the app**:
   - Check that new nodes appear
   - Verify scrip calculations are correct
