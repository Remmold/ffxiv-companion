"""
Fetch ALL craftable item recipes from Teamcraft.
Creates craftableItems.json for recursive material cost calculation.
"""

import requests
import json
from pathlib import Path

RECIPES_URL = "https://raw.githubusercontent.com/ffxiv-teamcraft/ffxiv-teamcraft/staging/libs/data/src/lib/json/recipes.json"
ITEMS_URL = "https://raw.githubusercontent.com/ffxiv-teamcraft/ffxiv-teamcraft/staging/libs/data/src/lib/json/items.json"

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


def fetch_json(url: str) -> dict:
    """Fetch JSON from URL."""
    print(f"Fetching {url}...")
    response = requests.get(url, timeout=60)
    response.raise_for_status()
    return response.json()


def main():
    # Fetch data from Teamcraft
    recipes = fetch_json(RECIPES_URL)
    items = fetch_json(ITEMS_URL)
    
    print(f"Loaded {len(recipes)} recipes")
    print(f"Loaded {len(items)} items")
    
    # Build craftable items lookup: itemId -> recipe info
    craftable_items = {}
    
    for recipe in recipes:
        result_id = recipe.get("result")
        job_id = recipe.get("job")
        
        if not result_id or job_id not in CRAFTING_CLASS_IDS:
            continue
        
        # Get item name
        item_name = items.get(str(result_id), {}).get("en", f"Item {result_id}")
        
        # Get ingredients
        ingredients = []
        for ing in recipe.get("ingredients", []):
            ing_id = ing.get("id")
            ing_qty = ing.get("amount", 1)
            if ing_id:
                ing_name = items.get(str(ing_id), {}).get("en", f"Item {ing_id}")
                ingredients.append({
                    "itemId": ing_id,
                    "name": ing_name,
                    "quantity": ing_qty
                })
        
        # Only store the first/primary recipe for each item
        if result_id not in craftable_items:
            craftable_items[result_id] = {
                "itemId": result_id,
                "name": item_name,
                "craftingClass": CRAFTING_CLASS_IDS[job_id],
                "level": recipe.get("lvl", 0),
                "yields": recipe.get("yields", 1),
                "ingredients": ingredients
            }
    
    print(f"\nFound {len(craftable_items)} unique craftable items")
    
    # Save to JSON
    output_path = Path(__file__).parent / "app" / "data" / "craftableItems.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(craftable_items, f, indent=2, ensure_ascii=False)
    
    print(f"Saved to {output_path}")
    
    # Show some stats
    by_class = {}
    for item in craftable_items.values():
        cls = item["craftingClass"]
        by_class[cls] = by_class.get(cls, 0) + 1
    
    print("\nBreakdown by crafting class:")
    for cls, count in sorted(by_class.items()):
        print(f"  {cls}: {count}")


if __name__ == "__main__":
    main()
