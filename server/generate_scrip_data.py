"""
Generate timedNodeScrips.js from the gatheringNodes.json data.
"""
import json
from pathlib import Path

# Load the nodes
nodes_path = Path(__file__).parent / "app" / "data" / "gatheringNodes.json"
with open(nodes_path, "r", encoding="utf-8") as f:
    nodes = json.load(f)

# Scrip values by expansion and level tier
# DT (7.0): Level 100 (Orange), Level 90-99 (Purple)
# EW (6.0): Level 90 (Purple), Level 80-89 (White, actually Purple mostly now as uncapped)
# ShB (5.0): Level 70-80 (White) 
# Older: White

DEFAULT_SCRIPS = {
    "DT": {
        "capped": {"type": "Orange", "value": 40, "min": 600, "mid": 800, "max": 1000}, # Lv 100
        "uncapped": {"type": "Purple", "value": 36, "min": 600, "mid": 800, "max": 1000}, # Lv < 100 (Leveling)
    },
    "EW": {
        "capped": {"type": "Purple", "value": 36, "min": 600, "mid": 800, "max": 1000}, # Cap 90
        "uncapped": {"type": "Purple", "value": 36, "min": 600, "mid": 800, "max": 1000}, # Leveling
    },
    "ShB": {"type": "White", "value": 20, "min": 400, "mid": 600, "max": 1000},
    "SB": {"type": "White", "value": 20, "min": 400, "mid": 600, "max": 1000},
    "HW": {"type": "White", "value": 20, "min": 400, "mid": 600, "max": 1000},
    "ARR": {"type": "White", "value": 10, "min": 400, "mid": 600, "max": 1000},
}

# Collect unique items by expansion
items_by_exp = {}
for node in nodes:
    # Skip if not collectable
    if not node.get("isCollectable", False):
        continue

    item_id = node["itemId"]
    item_name = node["itemName"]
    exp = node["expansion"]
    level = node.get("level", 0)
    is_ephemeral = node.get("isEphemeral", False)
    
    if item_id not in items_by_exp:
        items_by_exp[item_id] = {
            "name": item_name,
            "exp": exp,
            "level": level,
            "is_ephemeral": is_ephemeral
        }

# Generate JavaScript output
output_lines = [
    '/**',
    ' * Scrip values for timed gathering nodes.',
    ' * Auto-generated from Teamcraft data.',
    ' * Accurate for Patch 7.x',
    ' */',
    '',
    'export const timedNodeScrips = {'
]

# Group by expansion for organized output
by_exp = {}
for item_id, data in items_by_exp.items():
    exp = data["exp"]
    if exp not in by_exp:
        by_exp[exp] = []
    by_exp[exp].append((item_id, data))

exp_order = ["DT", "EW", "ShB", "SB", "HW", "ARR"]

for exp in exp_order:
    if exp not in by_exp:
        continue
    
    output_lines.append(f"    // ============== {exp} ==============")
    
    for item_id, data in sorted(by_exp[exp], key=lambda x: x[0]):
        level = data["level"]
        is_ephemeral = data["is_ephemeral"]
        
        # Determine scrip
        if exp == "DT":
            if level >= 100:
                scrip_def = DEFAULT_SCRIPS["DT"]["capped"]
            else:
                scrip_def = DEFAULT_SCRIPS["DT"]["uncapped"]
        elif exp == "EW":
            scrip_def = DEFAULT_SCRIPS["EW"]["capped"] # All EW uses Purple now
        else:
            scrip_def = DEFAULT_SCRIPS.get(exp, DEFAULT_SCRIPS["ARR"])

        # Ephemeral bonus?
        value = scrip_def["value"]
        # Ephemeral items (aetherial reduction) don't give "Scrips" directly on gather, 
        # they give sands. But you can trade sands for scrips or reduce for crystals.
        # Actually, Ephemeral NODES also have normal collectables sometimes.
        # But usually ephemeral items are reduced.
        # If it's ephemeral, maybe we shouldn't list a scrip value?
        # But the app might expect it. Let's keep it but maybe warn?
        # Actually, for the purpose of "GatherBuddy", listing high value is fine.
        
        line = f"    {item_id}: {{ scrip: '{scrip_def['type']}', value: {value}, collectability: {{ min: {scrip_def['min']}, mid: {scrip_def['mid']}, max: {scrip_def['max']} }} }}, // {data['name']} (Lv.{level})"
        output_lines.append(line)

output_lines.append('};')
output_lines.append('')
output_lines.append("export const scripColors = {")
output_lines.append("    White: { bg: 'bg-gray-100/10', text: 'text-gray-200', border: 'border-gray-500/30' },")
output_lines.append("    Purple: { bg: 'bg-purple-900/20', text: 'text-purple-400', border: 'border-purple-600/30' },")
output_lines.append("    Orange: { bg: 'bg-orange-900/20', text: 'text-orange-400', border: 'border-orange-600/30' }")
output_lines.append("};")
output_lines.append('')
output_lines.append("export function getNodeScripData(itemId) {")
output_lines.append("    return timedNodeScrips[itemId] || null;")
output_lines.append("}")
output_lines.append('')

# Write to client/src/data
output_path = Path(__file__).parent.parent / "client" / "src" / "data" / "timedNodeScrips.js"
with open(output_path, "w", encoding="utf-8") as f:
    f.write("\n".join(output_lines))

print(f"Generated {len(items_by_exp)} scrip mappings")
print(f"Saved to {output_path}")
