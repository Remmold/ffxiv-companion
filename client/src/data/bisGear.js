/**
 * BiS (Best in Slot) Gear Data for Dawntrail 7.4 (Level 100)
 * Includes DoH (Disciples of the Hand) and DoL (Disciples of the Land) gear
 */

// Current DoH BiS: Crested Set + Gold Thumb's Tools (Crafted i750)
export const dohGear = {
    name: "Crested Set + Gold Thumb's Tools",
    ilvl: 750,
    type: "Crafted",
    patch: "7.4",
    slots: [
        {
            slot: "Main Hand",
            name: "Gold Thumb's {Job} Primary Tool",
            perJob: true,
            stats: { craftsmanship: 1115, control: 676, cp: 9 },
            melds: ["CP +9 x2"],
            materials: [
                { name: "Levinchrome Ingot", qty: 2 },
                { name: "Dawnwood Lumber", qty: 1 },
                { name: "Levinchrome Aethersand", qty: 2 },
            ]
        },
        {
            slot: "Off Hand",
            name: "Gold Thumb's {Job} Secondary Tool",
            perJob: true,
            stats: { craftsmanship: 836, control: 507, cp: 7 },
            melds: ["CP +9 x2"],
            materials: [
                { name: "Levinchrome Ingot", qty: 2 },
                { name: "Dawnwood Lumber", qty: 1 },
            ]
        },
        {
            slot: "Head",
            name: "Crested Cap of Crafting",
            stats: { craftsmanship: 502, control: 251, cp: 8 },
            melds: ["Craftsmanship +36 x2"],
            materials: [
                { name: "Crested Cloth", qty: 4 },
                { name: "Crested Felt", qty: 2 },
                { name: "Crested Leather", qty: 1 },
            ]
        },
        {
            slot: "Body",
            name: "Crested Coat of Crafting",
            stats: { craftsmanship: 836, control: 418, cp: 13 },
            melds: ["Craftsmanship +36 x2"],
            materials: [
                { name: "Crested Cloth", qty: 6 },
                { name: "Crested Felt", qty: 3 },
                { name: "Crested Leather", qty: 2 },
            ]
        },
        {
            slot: "Hands",
            name: "Crested Gloves of Crafting",
            stats: { craftsmanship: 502, control: 251, cp: 8 },
            melds: ["Control +36 x2"],
            materials: [
                { name: "Crested Leather", qty: 4 },
                { name: "Crested Cloth", qty: 2 },
                { name: "Crested Felt", qty: 1 },
            ]
        },
        {
            slot: "Legs",
            name: "Crested Bottoms of Crafting",
            stats: { craftsmanship: 836, control: 418, cp: 13 },
            melds: ["Control +36 x2"],
            materials: [
                { name: "Crested Cloth", qty: 6 },
                { name: "Crested Felt", qty: 3 },
                { name: "Crested Leather", qty: 2 },
            ]
        },
        {
            slot: "Feet",
            name: "Crested Boots of Crafting",
            stats: { craftsmanship: 502, control: 251, cp: 8 },
            melds: ["Control +36 x2"],
            materials: [
                { name: "Crested Leather", qty: 4 },
                { name: "Crested Cloth", qty: 2 },
                { name: "Levinchrome Ingot", qty: 1 },
            ]
        },
        {
            slot: "Earrings",
            name: "Crested Earrings of Crafting",
            stats: { craftsmanship: 335, control: 167, cp: 5 },
            melds: ["CP +9 x2"],
            materials: [
                { name: "Levinchrome Nugget", qty: 2 },
                { name: "Dawnstar", qty: 1 },
            ]
        },
        {
            slot: "Necklace",
            name: "Crested Necklace of Crafting",
            stats: { craftsmanship: 335, control: 167, cp: 5 },
            melds: ["CP +9 x2"],
            materials: [
                { name: "Levinchrome Nugget", qty: 2 },
                { name: "Dawnstar", qty: 1 },
            ]
        },
        {
            slot: "Bracelet",
            name: "Crested Bracelet of Crafting",
            stats: { craftsmanship: 335, control: 167, cp: 5 },
            melds: ["CP +9 x2"],
            materials: [
                { name: "Levinchrome Nugget", qty: 2 },
                { name: "Dawnstar", qty: 1 },
            ]
        },
        {
            slot: "Ring",
            name: "Crested Ring of Crafting",
            stats: { craftsmanship: 335, control: 167, cp: 5 },
            melds: ["Craftsmanship +36 x2"],
            materials: [
                { name: "Levinchrome Nugget", qty: 2 },
                { name: "Dawnstar", qty: 1 },
            ],
            qty: 2 // Need two rings
        }
    ]
};

// Current DoL BiS: Crested Set + Gold Thumb's Tools (Crafted i750)
export const dolGear = {
    name: "Crested Set + Gold Thumb's Tools",
    ilvl: 750,
    type: "Crafted",
    patch: "7.4",
    slots: [
        {
            slot: "Main Hand",
            name: "Gold Thumb's {Job} Primary Tool",
            perJob: true,
            stats: { gathering: 1115, perception: 676, gp: 9 },
            melds: ["GP +10 x2"],
            materials: [
                { name: "Levinchrome Ingot", qty: 2 },
                { name: "Dawnwood Lumber", qty: 1 },
                { name: "Levinchrome Aethersand", qty: 2 },
            ]
        },
        {
            slot: "Off Hand",
            name: "Gold Thumb's {Job} Secondary Tool",
            perJob: true,
            stats: { gathering: 836, perception: 507, gp: 7 },
            melds: ["GP +10 x2"],
            materials: [
                { name: "Levinchrome Ingot", qty: 2 },
                { name: "Dawnwood Lumber", qty: 1 },
            ]
        },
        {
            slot: "Head",
            name: "Crested Cap of Gathering",
            stats: { gathering: 502, perception: 251, gp: 8 },
            melds: ["Gathering +36 x2"],
            materials: [
                { name: "Crested Cloth", qty: 4 },
                { name: "Crested Felt", qty: 2 },
                { name: "Crested Leather", qty: 1 },
            ]
        },
        {
            slot: "Body",
            name: "Crested Jacket of Gathering",
            stats: { gathering: 836, perception: 418, gp: 13 },
            melds: ["Gathering +36 x2"],
            materials: [
                { name: "Crested Leather", qty: 6 },
                { name: "Crested Cloth", qty: 3 },
                { name: "Crested Felt", qty: 2 },
            ]
        },
        {
            slot: "Hands",
            name: "Crested Fingerless Gloves of Gathering",
            stats: { gathering: 502, perception: 251, gp: 8 },
            melds: ["Perception +36 x2"],
            materials: [
                { name: "Crested Leather", qty: 4 },
                { name: "Crested Cloth", qty: 2 },
                { name: "Crested Felt", qty: 1 },
            ]
        },
        {
            slot: "Legs",
            name: "Crested Sarouel of Gathering",
            stats: { gathering: 836, perception: 418, gp: 13 },
            melds: ["Perception +36 x2"],
            materials: [
                { name: "Crested Cloth", qty: 6 },
                { name: "Crested Felt", qty: 3 },
                { name: "Crested Leather", qty: 2 },
            ]
        },
        {
            slot: "Feet",
            name: "Crested Shoes of Gathering",
            stats: { gathering: 502, perception: 251, gp: 8 },
            melds: ["Perception +36 x2"],
            materials: [
                { name: "Crested Leather", qty: 4 },
                { name: "Crested Cloth", qty: 2 },
                { name: "Levinchrome Ingot", qty: 1 },
            ]
        },
        {
            slot: "Earrings",
            name: "Crested Earrings of Gathering",
            stats: { gathering: 335, perception: 167, gp: 5 },
            melds: ["GP +10 x2"],
            materials: [
                { name: "Levinchrome Nugget", qty: 2 },
                { name: "Dawnstar", qty: 1 },
            ]
        },
        {
            slot: "Necklace",
            name: "Crested Necklace of Gathering",
            stats: { gathering: 335, perception: 167, gp: 5 },
            melds: ["GP +10 x2"],
            materials: [
                { name: "Levinchrome Nugget", qty: 2 },
                { name: "Dawnstar", qty: 1 },
            ]
        },
        {
            slot: "Bracelet",
            name: "Crested Bracelet of Gathering",
            stats: { gathering: 335, perception: 167, gp: 5 },
            melds: ["GP +10 x2"],
            materials: [
                { name: "Levinchrome Nugget", qty: 2 },
                { name: "Dawnstar", qty: 1 },
            ]
        },
        {
            slot: "Ring",
            name: "Crested Ring of Gathering",
            stats: { gathering: 335, perception: 167, gp: 5 },
            melds: ["Gathering +36 x2"],
            materials: [
                { name: "Levinchrome Nugget", qty: 2 },
                { name: "Dawnstar", qty: 1 },
            ],
            qty: 2
        }
    ]
};

// Key materials and what gear they're used for
export const gearMaterials = {
    "Levinchrome Ingot": { uses: ["DoH Tools", "DoL Tools", "Feet"], timed: false },
    "Levinchrome Nugget": { uses: ["Accessories"], timed: false },
    "Levinchrome Aethersand": { uses: ["Tools"], timed: true, note: "From Ephemeral Nodes" },
    "Dawnwood Lumber": { uses: ["Tools"], timed: false },
    "Crested Cloth": { uses: ["DoH Armor", "DoL Armor"], timed: false },
    "Crested Felt": { uses: ["DoH Armor", "DoL Armor"], timed: false },
    "Crested Leather": { uses: ["DoL Armor", "DoH Armor"], timed: false },
    "Dawnstar": { uses: ["Accessories"], timed: true },
    "Condensed Solution": { uses: ["All crafted gear"], timed: false, note: "Orange Scrips or Culinarian collectables" },
};

// Scrip gear alternative (for those not wanting to craft/buy)
export const scripGear = {
    doh: {
        name: "7.4 Scrip Set (Crafting)",
        ilvl: 740,
        cost: "Orange Crafters' Scrips",
        note: "Lower stats than Crested but free with scrips"
    },
    dol: {
        name: "7.4 Scrip Set (Gathering)",
        ilvl: 740,
        cost: "Orange Gatherers' Scrips",
        note: "Lower stats than Crested but free with scrips"
    }
};

// Target stat recommendations for 7.4 endgame content
export const targetStats = {
    crafting: {
        safe: { craftsmanship: 5380, control: 4650, cp: 600 },
        optimal: { craftsmanship: 5811, control: 5461, cp: 649 },
        note: "Safe stats handle Master XII crafts; Optimal for min-maxing"
    },
    gathering: {
        yieldBonus: { gathering: 5400, perception: 5090 },
        boonBonus: { perception: 5600 },
        integrityBonus: { gp: 960 },
        optimal: { gathering: 5629, perception: 5532, gp: 987 },
        note: "Hit breakpoints for +1 yield and +30% boon bonuses"
    }
};
