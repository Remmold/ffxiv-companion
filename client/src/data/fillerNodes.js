// Non-timed gathering nodes that are always available
// These are regular nodes you can farm while waiting for timed spawns
// Data includes real FFXIV item IDs for price lookups

export const fillerNodes = [
    // Dawntrail (Level 91-100)
    { itemId: 44814, name: 'Ra\'Kaznar Ore', level: 100, zone: 'Living Memory', aetheryte: 'Leynode Aero', class: 'Miner', expansion: 'DT' },
    { itemId: 44810, name: 'Levin Mint', level: 100, zone: 'Living Memory', aetheryte: 'Leynode Aero', class: 'Botanist', expansion: 'DT' },
    { itemId: 44092, name: 'Turali Alumen', level: 91, zone: 'Urqopacha', aetheryte: 'Wachunpelo', class: 'Miner', expansion: 'DT' },
    { itemId: 44084, name: 'Mountain Poplar Log', level: 91, zone: 'Urqopacha', aetheryte: 'Wachunpelo', class: 'Botanist', expansion: 'DT' },
    { itemId: 44098, name: 'Shrieker Cactus', level: 93, zone: 'Kozama\'uka', aetheryte: 'Ok\'hanu', class: 'Botanist', expansion: 'DT' },
    { itemId: 44100, name: 'Aluminum Ore', level: 95, zone: 'Shaaloani', aetheryte: 'Mehwahhetsoan', class: 'Miner', expansion: 'DT' },

    // Endwalker (Level 81-90)
    { itemId: 36256, name: 'AR-Caean Cotton Boll', level: 90, zone: 'Elpis', aetheryte: 'Poieten Oikos', class: 'Botanist', expansion: 'EW' },
    { itemId: 36254, name: 'Paldao Log', level: 85, zone: 'Garlemald', aetheryte: 'Camp Broken Glass', class: 'Botanist', expansion: 'EW' },
    { itemId: 36209, name: 'Chondrite', level: 81, zone: 'Thavnair', aetheryte: 'Yedlihmad', class: 'Miner', expansion: 'EW' },
    { itemId: 36215, name: 'Ilmenite', level: 85, zone: 'Mare Lamentorum', aetheryte: 'Bestways Burrow', class: 'Miner', expansion: 'EW' },
    { itemId: 36252, name: 'Palm Log', level: 83, zone: 'Thavnair', aetheryte: 'The Great Work', class: 'Botanist', expansion: 'EW' },

    // Shadowbringers (Level 71-80)
    { itemId: 27792, name: 'Sandalwood Log', level: 78, zone: 'The Tempest', aetheryte: 'The Ondo Cups', class: 'Botanist', expansion: 'ShB' },
    { itemId: 27756, name: 'Dolomite', level: 71, zone: 'Lakeland', aetheryte: 'Fort Jobb', class: 'Miner', expansion: 'ShB' },
    { itemId: 27764, name: 'Merbau Log', level: 73, zone: 'Il Mheg', aetheryte: 'Lydha Lran', class: 'Botanist', expansion: 'ShB' },
    { itemId: 27784, name: 'Titancopper Ore', level: 77, zone: 'Kholusia', aetheryte: 'Stilltide', class: 'Miner', expansion: 'ShB' },

    // Stormblood (Level 61-70)  
    { itemId: 19960, name: 'Windtea Leaves', level: 63, zone: 'Yanxia', aetheryte: 'Namai', class: 'Botanist', expansion: 'SB' },
    { itemId: 19948, name: 'Koppranickel Ore', level: 63, zone: 'The Peaks', aetheryte: 'Ala Ghiri', class: 'Miner', expansion: 'SB' },
    { itemId: 19964, name: 'Larch Log', level: 65, zone: 'The Azim Steppe', aetheryte: 'Reunion', class: 'Botanist', expansion: 'SB' },
    { itemId: 19952, name: 'Molybdenum Ore', level: 67, zone: 'The Lochs', aetheryte: 'Porta Praetoria', class: 'Miner', expansion: 'SB' },

    // Heavensward (Level 51-60)
    { itemId: 12579, name: 'Mythrite Ore', level: 52, zone: 'The Churning Mists', aetheryte: 'Moghome', class: 'Miner', expansion: 'HW' },
    { itemId: 12586, name: 'Titanium Ore', level: 56, zone: 'The Dravanian Hinterlands', aetheryte: 'Idyllshire', class: 'Miner', expansion: 'HW' },
    { itemId: 12575, name: 'Cloud Banana', level: 52, zone: 'The Sea of Clouds', aetheryte: 'Camp Cloudtop', class: 'Botanist', expansion: 'HW' },
    { itemId: 12580, name: 'Birch Log', level: 54, zone: 'Coerthas Western Highlands', aetheryte: 'Falcon\'s Nest', class: 'Botanist', expansion: 'HW' },

    // A Realm Reborn (Level 1-50)
    { itemId: 5114, name: 'Mythril Ore', level: 35, zone: 'Northern Thanalan', aetheryte: 'Camp Bluefog', class: 'Miner', expansion: 'ARR' },
    { itemId: 5121, name: 'Electrum Ore', level: 40, zone: 'Eastern Thanalan', aetheryte: 'Camp Drybone', class: 'Miner', expansion: 'ARR' },
    { itemId: 5358, name: 'Oak Log', level: 26, zone: 'South Shroud', aetheryte: 'Quarrymill', class: 'Botanist', expansion: 'ARR' },
    { itemId: 5369, name: 'Mahogany Log', level: 38, zone: 'North Shroud', aetheryte: 'Fallgourd Float', class: 'Botanist', expansion: 'ARR' }
];
