# Gathering Gold Overlay

An always-on-top Electron overlay for FFXIV Gathering Gold.

## Features

- 🔝 **Always on Top** - Stays above all windows including fullscreen games
- 🖼️ **Frameless Window** - Clean, minimal UI
- ⌨️ **Keyboard Shortcut** - `Ctrl+Shift+G` to show/hide
- 🖱️ **System Tray** - Right-click for options
- 📍 **Draggable** - Move it anywhere on screen

## Requirements

- Node.js 18+
- The main Gathering Gold app running (client dev server)

## Quick Start

```bash
# Install dependencies
npm install

# Start the overlay (with client dev server running)
npm run dev
```

## Usage

1. **Start the main app first**:
   ```bash
   cd ../client && npm run dev
   cd ../server && uvicorn app.main:app --reload
   ```

2. **Start the overlay**:
   ```bash
   cd overlay-app && npm run dev
   ```

3. **Controls**:
   - `Ctrl+Shift+G` - Toggle visibility
   - Drag the top bar to move
   - Right-click tray icon for menu

## Building

```bash
npm run build
```

Creates a portable `.exe` in the `dist/` folder.

## Tray Menu Options

| Option | Description |
|--------|-------------|
| Show/Hide | Toggle overlay visibility |
| Reset Position | Move to bottom-right corner |
| Always on Top | Toggle always-on-top behavior |
| Quit | Close the overlay |
