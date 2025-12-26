/**
 * Material usage tags for nodes.
 * Maps item names to what they're commonly used for.
 */

export const materialUsages = {
    // BiS Gear base materials (timed nodes)
    "Black Star": {
        tags: ["⚙️ BiS Gear"],
        detail: "DoH/DoL Accessories",
        priority: "high"
    },
    "Ra'Kaznar Ore": {
        tags: ["⚙️ BiS Gear"],
        detail: "->Ingot/Nugget for Tools & Accessories",
        priority: "high"
    },
    "Claro Walnut Log": {
        tags: ["⚙️ BiS Gear"],
        detail: "->Lumber for Tools",
        priority: "high"
    },
    "Rroneek Wool": {
        tags: ["⚙️ BiS Gear"],
        detail: "->Fleece for Armor",
        priority: "high"
    },
    "Thunderyards Cocoon": {
        tags: ["⚙️ BiS Gear"],
        detail: "->Silk for Armor",
        priority: "high"
    },
    "Gargantua Skin": {
        tags: ["⚙️ BiS Gear"],
        detail: "->Leather for Armor",
        priority: "high"
    },

    // Food & Pots (timed collectables)
    "Turali Popoto": { tags: ["🍳 Food"], detail: "HQ Raid Food", priority: "medium" },
    "Moonlit Carrots": { tags: ["🍳 Food"], detail: "HQ Raid Food", priority: "medium" },
    "Butterbur Sprout": { tags: ["🍳 Food"], detail: "HQ Raid Food", priority: "medium" },
    "Dark Mushroom": { tags: ["🍳 Food"], detail: "HQ Raid Food", priority: "medium" },

    "Turali Mistletoe": { tags: ["⚗️ Pots"], detail: "Tinctures", priority: "medium" },

    // Scrip collectables
    "Rarefied": {
        tagPrefix: true, // Apply to any item starting with "Rarefied"
        tags: ["💜 Scrips"],
        detail: "Crafter/Gatherer Scrips",
        priority: "medium"
    },

    // Aethersand reduction
    "Light-kissed Aethersand": { tags: ["🔮 Aethersand"], detail: "Reduction", priority: "medium" },

    // Common crafting
    "Grade 8 Dark Matter": { tags: ["🔧 Repair"], detail: "Gear Repair", priority: "low" },
};

/**
 * Get usage tags for an item
 */
export function getItemUsage(itemName) {
    // Direct match
    if (materialUsages[itemName]) {
        return materialUsages[itemName];
    }

    // Prefix match (e.g., "Rarefied" items)
    for (const [key, value] of Object.entries(materialUsages)) {
        if (value.tagPrefix && itemName.startsWith(key)) {
            return value;
        }
    }

    return null;
}

/**
 * Get priority color for usage
 */
export function getUsagePriorityColor(priority) {
    switch (priority) {
        case 'high': return 'text-gold bg-gold/20 border-gold/30';
        case 'medium': return 'text-purple-400 bg-purple-900/20 border-purple-600/30';
        case 'low': return 'text-gray-400 bg-gray-800/50 border-gray-700/30';
        default: return 'text-gray-500 bg-gray-800/30 border-gray-700/30';
    }
}
