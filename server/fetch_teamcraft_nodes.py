"""
Fetch timed gathering nodes from Teamcraft and convert to our format.
Run this script to update gatheringNodes.json with accurate data.
"""

import json
import requests
from pathlib import Path

# Teamcraft data URLs
NODES_URL = "https://raw.githubusercontent.com/ffxiv-teamcraft/ffxiv-teamcraft/staging/libs/data/src/lib/json/nodes.json"
ITEMS_URL = "https://raw.githubusercontent.com/ffxiv-teamcraft/ffxiv-teamcraft/staging/libs/data/src/lib/json/items.json"
PLACES_URL = "https://raw.githubusercontent.com/ffxiv-teamcraft/ffxiv-teamcraft/staging/libs/data/src/lib/json/places.json"
MAPS_URL = "https://raw.githubusercontent.com/ffxiv-teamcraft/ffxiv-teamcraft/staging/libs/data/src/lib/json/maps.json"
AETHERYTES_URL = "https://raw.githubusercontent.com/ffxiv-teamcraft/ffxiv-teamcraft/staging/libs/data/src/lib/json/aetherytes.json"

# Node type: 0=unused, 1=Mining, 2=Quarrying, 3=Logging, 4=Harvesting
TYPE_TO_CLASS = {
    0: "Miner",
    1: "Miner",
    2: "Botanist", # Logging
    3: "Botanist", # Harvesting
    4: "Botanist"  # Spearfishing? (Unlikely for nodes.json, but safe fallback)
}

def fetch_json(url: str) -> dict:
    """Fetch JSON from URL."""
    print(f"Fetching {url}...")
    response = requests.get(url, timeout=30)
    response.raise_for_status()
    return response.json()

def get_expansion_by_level(level: int) -> str:
    """Determine expansion by node level."""
    if level >= 91:
        return "DT"
    elif level >= 81:
        return "EW"
    elif level >= 71:
        return "ShB"
    elif level >= 61:
        return "SB"
    elif level >= 51:
        return "HW"
    else:
        return "ARR"

def get_place_name(places: dict, place_id: int) -> str:
    """Get English place name from places.json."""
    place_data = places.get(str(place_id), {})
    if isinstance(place_data, dict):
        name = place_data.get("en", "")
        return name if name else f"Zone {place_id}"
    return f"Zone {place_id}"

def find_nearest_aetheryte(aetherytes: list, places: dict, map_id: int, x: float, y: float) -> str:
    """Find the nearest aetheryte to a node position on the same map."""
    nearest = None
    nearest_dist = float('inf')
    
    for aetheryte in aetherytes:
        if aetheryte.get("map") == map_id and aetheryte.get("type") == 0:  # type 0 = main aetherytes
            ax, ay = aetheryte.get("x", 0), aetheryte.get("y", 0)
            dist = ((x - ax) ** 2 + (y - ay) ** 2) ** 0.5
            if dist < nearest_dist:
                nearest_dist = dist
                nearest = aetheryte
    
    if nearest:
        nameid = nearest.get("nameid", 0)
        return get_place_name(places, nameid)
    return ""

def main():
    # Fetch all data
    nodes = fetch_json(NODES_URL)
    items = fetch_json(ITEMS_URL)
    places = fetch_json(PLACES_URL)
    maps = fetch_json(MAPS_URL)
    aetherytes = fetch_json(AETHERYTES_URL)
    
    # We'll just use the nodes with spawns data
    timed_nodes = []
    
    for node_id, node in nodes.items():
        # Skip nodes without spawn times (regular nodes)
        if not node.get("limited") or not node.get("spawns"):
            continue
        
        # Get node properties
        spawns = node.get("spawns", [])
        duration = node.get("duration", 120)
        level = node.get("level", 0)
        node_type = node.get("type", 0)
        map_id = node.get("map", 0)
        x = node.get("x", 0)
        y = node.get("y", 0)
        is_legendary = node.get("legendary", False)
        is_ephemeral = node.get("ephemeral", False)
        node_items = node.get("items", [])
        
        # Get gathering class
        gathering_class = TYPE_TO_CLASS.get(node_type, "Miner")
        
        # Get expansion
        expansion = get_expansion_by_level(level)
        
        # Get zone name from map's placename_id
        map_data = maps.get(str(map_id), {})
        placename_id = map_data.get("placename_id", 0)
        zone_name = get_place_name(places, placename_id)
        
        # Find nearest aetheryte
        aetheryte_name = find_nearest_aetheryte(aetherytes, places, map_id, x, y)
        if not aetheryte_name:
            aetheryte_name = zone_name  # Fallback to zone name
        
        # Calculate spawn times (each spawn is just the start hour)
        # Duration is in minutes, so 120 = 2 hours
        for spawn_hour in spawns:
            end_hour = (spawn_hour + duration // 60) % 24
            
            # Process items in this node
            for item_id in node_items:
                if isinstance(item_id, int) and item_id > 100:  # Filter out slot numbers
                    # Get item name
                    item_data = items.get(str(item_id), {})
                    if isinstance(item_data, str):
                        item_name = item_data
                    elif isinstance(item_data, dict):
                        item_name = item_data.get("en", f"Item {item_id}")
                    else:
                        item_name = f"Item {item_id}"
                    
                    
                    # Create node entry
                    is_collectable_item = item_name.startswith("Rarefied") or is_ephemeral
                    
                    node_entry = {
                        "itemId": item_id,
                        "itemName": item_name,
                        "level": level,
                        "etSpawnStart": spawn_hour,
                        "etSpawnEnd": end_hour,
                        "zone": zone_name,
                        "nearestAetheryte": aetheryte_name,
                        "coordinates": f"X: {x:.1f}, Y: {y:.1f}",
                        "expansion": expansion,
                        "gatheringClass": gathering_class,
                        "isCollectable": is_collectable_item,
                        "isEphemeral": is_ephemeral,
                        "isLegendary": is_legendary
                    }
                    timed_nodes.append(node_entry)
                    break  # Only add the first main item from each node
    
    # Remove duplicates (same item can appear multiple times)
    seen_items = set()
    unique_nodes = []
    for node in timed_nodes:
        key = (node["itemId"], node["etSpawnStart"])
        if key not in seen_items:
            seen_items.add(key)
            unique_nodes.append(node)
    
    # Sort by expansion and spawn time
    expansion_order = {"DT": 0, "EW": 1, "ShB": 2, "SB": 3, "HW": 4, "ARR": 5}
    unique_nodes.sort(key=lambda x: (expansion_order.get(x["expansion"], 99), x["etSpawnStart"]))
    
    print(f"\nFound {len(unique_nodes)} timed nodes")
    
    # Save to file
    output_path = Path(__file__).parent / "app" / "data" / "gatheringNodes.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(unique_nodes, f, indent=4, ensure_ascii=False)
    
    print(f"Saved to {output_path}")
    
    # Print summary
    by_expansion = {}
    for node in unique_nodes:
        exp = node["expansion"]
        by_expansion[exp] = by_expansion.get(exp, 0) + 1
    
    print("\nNodes by expansion:")
    for exp, count in sorted(by_expansion.items(), key=lambda x: expansion_order.get(x[0], 99)):
        print(f"  {exp}: {count}")

if __name__ == "__main__":
    main()
