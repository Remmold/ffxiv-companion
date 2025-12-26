"""
Fetch crafting collectable data with recipe/materials from Teamcraft.
Creates craftingCollectables.json with material requirements for cost calculation.
"""

import requests
import json
from pathlib import Path

# Teamcraft data URLs
COLLECTABLES_URL = "https://raw.githubusercontent.com/ffxiv-teamcraft/ffxiv-teamcraft/staging/libs/data/src/lib/json/collectables.json"
ITEMS_URL = "https://raw.githubusercontent.com/ffxiv-teamcraft/ffxiv-teamcraft/staging/libs/data/src/lib/json/items.json"
RECIPES_URL = "https://raw.githubusercontent.com/ffxiv-teamcraft/ffxiv-teamcraft/staging/libs/data/src/lib/json/recipes.json"

# Crafter scrip reward IDs mapped to types
CRAFTER_SCRIP_REWARDS = {
    33913: "Purple",   # Purple Crafters' Scrip (Endwalker/ShB/SB/HW)
    41784: "Orange",   # Orange Crafters' Scrip (Dawntrail)
}

# Crafting class IDs from FFXIV
CRAFTING_CLASS_IDS = {
    8: "Carpenter",
    9: "Blacksmith",
    10: "Armorer",
    11: "Goldsmith",
    12: "Leatherworker",
    13: "Weaver",
    14: "Alchemist",
    15: "Culinarian",
}

# Icons for crafting classes
CLASS_ICONS = {
    "Carpenter": "🪵",
    "Blacksmith": "⚒️",
    "Armorer": "🛡️",
    "Goldsmith": "💎",
    "Leatherworker": "🧥",
    "Weaver": "🧵",
    "Alchemist": "⚗️",
    "Culinarian": "🍳",
}

# Level ranges for expansions
EXPANSION_LEVELS = {
    "DT": (91, 100),   # Dawntrail
    "EW": (81, 90),    # Endwalker
    "ShB": (71, 80),   # Shadowbringers
    "SB": (61, 70),    # Stormblood
    "HW": (51, 60),    # Heavensward
    "ARR": (1, 50),    # A Realm Reborn
}


def get_expansion(level: int) -> str:
    """Get expansion code from level."""
    for exp, (min_lvl, max_lvl) in EXPANSION_LEVELS.items():
        if min_lvl <= level <= max_lvl:
            return exp
    return "ARR"


def fetch_json(url: str) -> dict:
    """Fetch JSON from URL."""
    print(f"Fetching {url}...")
    response = requests.get(url, timeout=30)
    response.raise_for_status()
    return response.json()


def main():
    # Fetch data from Teamcraft
    collectables = fetch_json(COLLECTABLES_URL)
    items = fetch_json(ITEMS_URL)
    recipes = fetch_json(RECIPES_URL)
    
    print(f"Loaded {len(collectables)} collectables")
    print(f"Loaded {len(items)} items")
    print(f"Loaded {len(recipes)} recipes")
    
    # Build recipe lookup: item_id -> recipe data (including ingredients)
    recipe_by_result = {}
    for recipe in recipes:
        result_id = recipe.get("result")
        job_id = recipe.get("job")
        if result_id and job_id in CRAFTING_CLASS_IDS:
            recipe_by_result[result_id] = {
                "craftingClass": CRAFTING_CLASS_IDS[job_id],
                "level": recipe.get("lvl", 0),
                "ingredients": recipe.get("ingredients", [])
            }
    
    print(f"Found {len(recipe_by_result)} craftable items with recipes")
    
    # Build crafting collectables list with materials
    crafting_collectables = []
    
    for item_id_str, data in collectables.items():
        item_id = int(item_id_str)
        
        # Check if this is a crafter scrip reward
        reward_id = data.get("reward", 0)
        if reward_id not in CRAFTER_SCRIP_REWARDS:
            continue
        
        # Check if this item has a recipe
        if item_id not in recipe_by_result:
            continue
        
        recipe = recipe_by_result[item_id]
        scrip_type = CRAFTER_SCRIP_REWARDS[reward_id]
        crafting_class = recipe["craftingClass"]
        level = recipe["level"]
        
        # Get item name
        item_name = items.get(str(item_id), {}).get("en", f"Item {item_id}")
        
        # Get collectability thresholds and scrip values
        base = data.get("base", {})
        mid = data.get("mid", {})
        high = data.get("high", {})
        
        # Get the scrip value at max collectability
        scrip_value = high.get("scrip", mid.get("scrip", base.get("scrip", 0)))
        
        if scrip_value <= 0:
            continue
        
        # Get collectability thresholds
        min_collectability = base.get("rating", 0)
        mid_collectability = mid.get("rating", 0)
        max_collectability = high.get("rating", 1000)
        
        # Build materials list from recipe ingredients
        materials = []
        for ing in recipe["ingredients"]:
            ing_id = ing.get("id")
            ing_qty = ing.get("amount", 1)
            if ing_id:
                ing_name = items.get(str(ing_id), {}).get("en", f"Item {ing_id}")
                materials.append({
                    "itemId": ing_id,
                    "name": ing_name,
                    "quantity": ing_qty
                })
        
        collectable = {
            "itemId": item_id,
            "name": item_name,
            "craftingClass": crafting_class,
            "icon": CLASS_ICONS.get(crafting_class, "🔨"),
            "level": level,
            "expansion": get_expansion(level),
            "scrip": scrip_type,
            "value": scrip_value,
            "collectability": {
                "min": min_collectability,
                "mid": mid_collectability,
                "max": max_collectability
            },
            "materials": materials
        }
        
        crafting_collectables.append(collectable)
    
    # Sort by level (descending), then by crafting class
    crafting_collectables.sort(key=lambda x: (-x["level"], x["craftingClass"], x["name"]))
    
    print(f"\nFound {len(crafting_collectables)} crafting collectables with materials")
    
    # Show breakdown by scrip type
    by_type = {}
    for item in crafting_collectables:
        scrip_type = item["scrip"]
        by_type[scrip_type] = by_type.get(scrip_type, 0) + 1
    
    print("\nBreakdown by scrip type:")
    for scrip_type, count in sorted(by_type.items()):
        print(f"  {scrip_type}: {count}")
    
    # Show breakdown by expansion
    by_exp = {}
    for item in crafting_collectables:
        exp = item["expansion"]
        by_exp[exp] = by_exp.get(exp, 0) + 1
    
    print("\nBreakdown by expansion:")
    for exp, count in sorted(by_exp.items()):
        print(f"  {exp}: {count}")
    
    # Collect all unique materials for the materials browser
    all_materials = {}
    for item in crafting_collectables:
        for mat in item["materials"]:
            mat_id = mat["itemId"]
            if mat_id not in all_materials:
                all_materials[mat_id] = {
                    "itemId": mat_id,
                    "name": mat["name"],
                    # Estimate expansion from level of items that use it
                    "usedInLevels": []
                }
            all_materials[mat_id]["usedInLevels"].append(item["level"])
    
    # Assign expansion to materials based on where they're most commonly used
    materials_list = []
    for mat_id, mat_data in all_materials.items():
        levels = mat_data["usedInLevels"]
        avg_level = sum(levels) / len(levels) if levels else 50
        materials_list.append({
            "itemId": mat_data["itemId"],
            "name": mat_data["name"],
            "expansion": get_expansion(int(avg_level)),
            "usageCount": len(levels)
        })
    
    materials_list.sort(key=lambda x: (-x["usageCount"], x["name"]))
    print(f"\nFound {len(materials_list)} unique materials")
    
    # Save collectables to JSON file for backend
    output_path = Path(__file__).parent / "app" / "data" / "craftingCollectables.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(crafting_collectables, f, indent=2, ensure_ascii=False)
    
    print(f"\nSaved collectables to {output_path}")
    
    # Save materials list
    materials_path = Path(__file__).parent / "app" / "data" / "craftingMaterials.json"
    with open(materials_path, "w", encoding="utf-8") as f:
        json.dump(materials_list, f, indent=2, ensure_ascii=False)
    
    print(f"Saved materials to {materials_path}")
    
    # Also generate JavaScript file for frontend
    js_output_path = Path(__file__).parent.parent / "client" / "src" / "data" / "craftingCollectables.js"
    
    js_content = """/**
 * Crafting collectable turn-in items with material requirements.
 * Used for calculating crafting costs for Crafter's Scrips.
 * Auto-generated from Teamcraft data.
 */

export const craftingCollectables = """
    
    js_content += json.dumps(crafting_collectables, indent=2, ensure_ascii=False)
    js_content += """;

export const scripColors = {
    Purple: { bg: 'bg-purple-900/20', text: 'text-purple-400', border: 'border-purple-600/30' },
    Orange: { bg: 'bg-orange-900/20', text: 'text-orange-400', border: 'border-orange-600/30' }
};
"""
    
    with open(js_output_path, "w", encoding="utf-8") as f:
        f.write(js_content)
    
    print(f"Saved frontend data to {js_output_path}")
    
    # Show sample with materials
    print("\nSample Orange Scrip item with materials:")
    for item in crafting_collectables:
        if item["scrip"] == "Orange" and item["materials"]:
            print(f"  {item['icon']} {item['name']} (Lv.{item['level']}) - {item['value']} scrips")
            print(f"    Materials:")
            for mat in item["materials"][:5]:
                print(f"      - {mat['quantity']}x {mat['name']}")
            break


if __name__ == "__main__":
    main()
