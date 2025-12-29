/**
 * Retainer Hunting Venture Data
 * Combat retainer ventures that provide monster drops
 * Organized by level requirement
 */

// Hunting ventures by level tier
export const huntingVentures = [
    // Level 1-10
    { itemId: 5057, name: "Sheepskin", level: 1, category: "Hide", qty: 10 },
    { itemId: 5058, name: "Dodo Skin", level: 5, category: "Hide", qty: 10 },
    { itemId: 5101, name: "Animal Fat", level: 5, category: "Reagent", qty: 10 },
    { itemId: 5056, name: "Marmot Pelt", level: 5, category: "Hide", qty: 10 },
    { itemId: 5116, name: "Bone Chip", level: 8, category: "Bone", qty: 15 },

    // Level 11-20
    { itemId: 5059, name: "Toad Skin", level: 12, category: "Hide", qty: 10 },
    { itemId: 5117, name: "Bat Fang", level: 12, category: "Fang", qty: 15 },
    { itemId: 5060, name: "Wolf Pelt", level: 15, category: "Hide", qty: 10 },
    { itemId: 5119, name: "Bat Wing", level: 15, category: "Wing", qty: 15 },
    { itemId: 5102, name: "Raptor Sinew", level: 17, category: "Sinew", qty: 10 },
    { itemId: 5061, name: "Aldgoat Skin", level: 20, category: "Hide", qty: 10 },

    // Level 21-30
    { itemId: 5062, name: "Buffalo Leather", level: 22, category: "Hide", qty: 10 },
    { itemId: 5103, name: "Hippogryph Sinew", level: 25, category: "Sinew", qty: 10 },
    { itemId: 5063, name: "Boar Leather", level: 27, category: "Hide", qty: 10 },
    { itemId: 5118, name: "Coeurl Whisker", level: 29, category: "Whisker", qty: 10 },
    { itemId: 5064, name: "Peiste Skin", level: 30, category: "Hide", qty: 10 },

    // Level 31-40
    { itemId: 5065, name: "Basilisk Skin", level: 32, category: "Hide", qty: 10 },
    { itemId: 5104, name: "Bomb Ash", level: 35, category: "Reagent", qty: 10 },
    { itemId: 5066, name: "Raptor Skin", level: 35, category: "Hide", qty: 10 },
    { itemId: 5067, name: "Karakul Skin", level: 38, category: "Hide", qty: 10 },
    { itemId: 5068, name: "Hippogryph Skin", level: 40, category: "Hide", qty: 10 },

    // Level 41-50
    { itemId: 5069, name: "Gagana Skin", level: 43, category: "Hide", qty: 10 },
    { itemId: 5120, name: "Gigant Clam", level: 45, category: "Shell", qty: 10 },
    { itemId: 5070, name: "Apkallu Skin", level: 46, category: "Hide", qty: 10 },
    { itemId: 5071, name: "Goobbue Skin", level: 48, category: "Hide", qty: 10 },
    { itemId: 5072, name: "Behemoth Horn", level: 50, category: "Horn", qty: 5 },

    // Level 51-60 (Heavensward)
    { itemId: 12561, name: "Archaeornis Skin", level: 51, category: "Hide", qty: 10 },
    { itemId: 12562, name: "Yak Skin", level: 53, category: "Hide", qty: 10 },
    { itemId: 12563, name: "Wyvern Skin", level: 55, category: "Hide", qty: 10 },
    { itemId: 12566, name: "Griffin Skin", level: 57, category: "Hide", qty: 10 },
    { itemId: 12568, name: "Amphiptere Skin", level: 59, category: "Hide", qty: 10 },
    { itemId: 12934, name: "Manticore Hair", level: 60, category: "Fur", qty: 10 },

    // Level 61-70 (Stormblood)
    { itemId: 19935, name: "Gyuki Skin", level: 61, category: "Hide", qty: 10 },
    { itemId: 19936, name: "True Griffin Skin", level: 63, category: "Hide", qty: 10 },
    { itemId: 19937, name: "Gazelle Skin", level: 65, category: "Hide", qty: 10 },
    { itemId: 19938, name: "Marid Skin", level: 67, category: "Hide", qty: 10 },
    { itemId: 19939, name: "Tiger Skin", level: 69, category: "Hide", qty: 10 },
    { itemId: 19940, name: "Gyr Abanian Alumen", level: 70, category: "Reagent", qty: 10 },

    // Level 71-80 (Shadowbringers)
    { itemId: 27720, name: "Ovibos Skin", level: 71, category: "Hide", qty: 10 },
    { itemId: 27721, name: "Saigaskin", level: 73, category: "Hide", qty: 10 },
    { itemId: 27722, name: "Zonureskin", level: 75, category: "Hide", qty: 10 },
    { itemId: 27723, name: "Hoptrap Leaf", level: 77, category: "Leaf", qty: 10 },
    { itemId: 27724, name: "Sea Swallow Skin", level: 79, category: "Hide", qty: 10 },
    { itemId: 27725, name: "Uru'uzan Skin", level: 80, category: "Hide", qty: 10 },

    // Level 81-90 (Endwalker)
    { itemId: 36150, name: "Almasty Fur", level: 81, category: "Fur", qty: 10 },
    { itemId: 36151, name: "Ophiotaurus Skin", level: 83, category: "Hide", qty: 10 },
    { itemId: 36152, name: "Kumbhira Skin", level: 85, category: "Hide", qty: 10 },
    { itemId: 36153, name: "Mousse Flesh", level: 87, category: "Flesh", qty: 10 },
    { itemId: 36154, name: "Dynamis Crystal", level: 89, category: "Crystal", qty: 5 },
    { itemId: 36155, name: "Rroneek Leather", level: 90, category: "Hide", qty: 10 },

    // Level 91-100 (Dawntrail)
    { itemId: 43879, name: "Rroneek Skin", level: 91, category: "Hide", qty: 10 },
    { itemId: 43880, name: "Valigarmanda Scale", level: 93, category: "Scale", qty: 10 },
    { itemId: 43881, name: "Yok Huy Skin", level: 95, category: "Hide", qty: 10 },
    { itemId: 43882, name: "Gargantua Hide", level: 97, category: "Hide", qty: 10 },
    { itemId: 43883, name: "Goldclaw Leather", level: 99, category: "Hide", qty: 10 },
    { itemId: 43884, name: "Br'aaxskin", level: 100, category: "Hide", qty: 10 },
];

// Expansion level ranges
export const expansionLevels = {
    'All': { min: 1, max: 100, label: 'All Levels' },
    'ARR': { min: 1, max: 50, label: 'A Realm Reborn' },
    'HW': { min: 51, max: 60, label: 'Heavensward' },
    'SB': { min: 61, max: 70, label: 'Stormblood' },
    'ShB': { min: 71, max: 80, label: 'Shadowbringers' },
    'EW': { min: 81, max: 90, label: 'Endwalker' },
    'DT': { min: 91, max: 100, label: 'Dawntrail' }
};

// Category icons
export const categoryIcons = {
    'Hide': '🦎',
    'Fur': '🐻',
    'Bone': '🦴',
    'Fang': '🦷',
    'Wing': '🦇',
    'Sinew': '💪',
    'Horn': '🦏',
    'Shell': '🐚',
    'Whisker': '🐱',
    'Reagent': '⚗️',
    'Leaf': '🍃',
    'Flesh': '🥩',
    'Crystal': '💎',
    'Scale': '🐉'
};
