"""
Fetch accurate collectable scrip data from Teamcraft.
Maps only items that exist in our timed gathering nodes.
"""

import json
import requests
from pathlib import Path

# Teamcraft data URLs
COLLECTABLES_URL = "https://raw.githubusercontent.com/ffxiv-teamcraft/ffxiv-teamcraft/staging/libs/data/src/lib/json/collectables.json"
ITEMS_URL = "https://raw.githubusercontent.com/ffxiv-teamcraft/ffxiv-teamcraft/staging/libs/data/src/lib/json/items.json"

# Scrip reward IDs to scrip type names
SCRIP_REWARDS = {
    # Gatherer scrips
    33913: "Purple",   # Purple Gatherers' Scrip
    33914: "White",    # White Gatherers' Scrip  
    41784: "Orange",   # Orange Gatherers' Scrip
}

def fetch_json(url: str) -> dict:
    """Fetch JSON from URL."""
    print(f"Fetching {url}...")
    response = requests.get(url, timeout=30)
    response.raise_for_status()
    return response.json()

def main():
    # Fetch data
    collectables = fetch_json(COLLECTABLES_URL)
    items = fetch_json(ITEMS_URL)
    
    # Load our gathering nodes to get the item IDs we care about
    nodes_path = Path(__file__).parent / "app" / "data" / "gatheringNodes.json"
    with open(nodes_path, "r", encoding="utf-8") as f:
        gathering_nodes = json.load(f)
    
    # Get unique item IDs from our nodes with their names
    node_items = {}
    for n in gathering_nodes:
        node_items[n["itemId"]] = n["itemName"]
    
    print(f"Found {len(node_items)} unique items in gathering nodes")
    
    # Build scrip data from collectables - only for items in our nodes
    scrip_data = {}
    matched = 0
    
    for item_id_str, data in collectables.items():
        item_id = int(item_id_str)
        
        # Only include if in our gathering nodes
        if item_id not in node_items:
            continue
        
        # Get reward type (scrip currency ID)
        reward_id = data.get("reward", 0)
        if reward_id not in SCRIP_REWARDS:
            continue
            
        scrip_type = SCRIP_REWARDS[reward_id]
        
        # Use "high" tier scrip value (max collectability)
        high_data = data.get("high", {})
        scrip_value = high_data.get("scrip", 0)
        
        if scrip_value > 0:
            matched += 1
            scrip_data[item_id] = {
                "name": node_items[item_id],
                "scrip": scrip_type,
                "value": scrip_value,
                "level": data.get("level", 0)
            }
    
    print(f"Matched {matched} items with scrip data")
    
    # For items NOT in collectables (e.g., ephemeral nodes, non-rarefied items),
    # they don't give scrips when collected as collectables
    not_collectable = set(node_items.keys()) - set(scrip_data.keys())
    print(f"{len(not_collectable)} items not in collectable turn-in list (ephemeral/non-scrip nodes)")
    
    # Show breakdown by scrip type
    by_type = {}
    for item_id, data in scrip_data.items():
        scrip_type = data["scrip"]
        by_type[scrip_type] = by_type.get(scrip_type, 0) + 1
    
    print("\nBreakdown by scrip type:")
    for scrip_type, count in sorted(by_type.items()):
        print(f"  {scrip_type}: {count}")
    
    # Generate JavaScript file
    output_path = Path(__file__).parent.parent / "client" / "src" / "data" / "timedNodeScrips.js"
    
    js_content = """// Auto-generated from Teamcraft collectables.json
// Accurate scrip data for timed gathering nodes
// Only includes items that can be turned in for scrips

export const timedNodeScrips = {
"""
    
    for item_id, data in sorted(scrip_data.items(), key=lambda x: (-x[1]["level"], x[1]["name"])):
        js_content += f'    {item_id}: {{ scrip: "{data["scrip"]}", value: {data["value"]} }},  // {data["name"]} (Lv.{data["level"]})\n'
    
    js_content += """}

export const scripColors = {
    White: { bg: 'bg-gray-700/50', text: 'text-gray-200', border: 'border-gray-500' },
    Purple: { bg: 'bg-purple-900/50', text: 'text-purple-300', border: 'border-purple-500' },
    Orange: { bg: 'bg-orange-900/50', text: 'text-orange-300', border: 'border-orange-500' }
}
"""
    
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(js_content)
    
    print(f"\nSaved to {output_path}")

if __name__ == "__main__":
    main()
