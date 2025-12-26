/**
 * Collectable turn-in items for FFXIV gatherers.
 * Used to earn White and Purple Gatherer's Scrips.
 * Collectability is now capped at 1000 (post-rework system).
 */

export const collectables = [
    // Dawntrail (Lv. 100) - Purple Scrips
    { name: "Fennec Fur", level: 100, job: "Botanist", location: "Shaaloani", aetheryte: "Hhusatahwi", scrip: "Orange", value: 144, collectability: { min: 600, mid: 800, max: 1000 } },
    { name: "Turali Corn", level: 100, job: "Botanist", location: "Yak T'el", aetheryte: "Mamook", scrip: "Orange", value: 144, collectability: { min: 600, mid: 800, max: 1000 } },
    { name: "Rroneek Fleece", level: 100, job: "Botanist", location: "Kozama'uka", aetheryte: "Ok'hanu", scrip: "Orange", value: 144, collectability: { min: 600, mid: 800, max: 1000 } },
    { name: "Turali Alumen", level: 100, job: "Miner", location: "Urqopacha", aetheryte: "Wachunpelo", scrip: "Orange", value: 144, collectability: { min: 600, mid: 800, max: 1000 } },
    { name: "Electroite", level: 100, job: "Miner", location: "Shaaloani", aetheryte: "Hhusatahwi", scrip: "Orange", value: 144, collectability: { min: 600, mid: 800, max: 1000 } },

    // Endwalker (Lv. 90) - Purple Scrips
    { name: "Chloroschist", level: 90, job: "Miner", location: "Garlemald", aetheryte: "Camp Broken Glass", scrip: "Purple", value: 108, collectability: { min: 500, mid: 700, max: 1000 } },
    { name: "Ametrine", level: 90, job: "Miner", location: "Labyrinthos", aetheryte: "Aporia", scrip: "Purple", value: 108, collectability: { min: 500, mid: 700, max: 1000 } },
    { name: "Ilmenite", level: 90, job: "Miner", location: "Thavnair", aetheryte: "Yedlihmad", scrip: "Purple", value: 108, collectability: { min: 500, mid: 700, max: 1000 } },
    { name: "Paldao Log", level: 90, job: "Botanist", location: "Thavnair", aetheryte: "The Great Work", scrip: "Purple", value: 108, collectability: { min: 500, mid: 700, max: 1000 } },
    { name: "Luncheon Toad", level: 90, job: "Botanist", location: "Garlemald", aetheryte: "Camp Broken Glass", scrip: "Purple", value: 108, collectability: { min: 500, mid: 700, max: 1000 } },

    // Shadowbringers (Lv. 80) - White Scrips
    { name: "Raindrop Cotton Boll", level: 80, job: "Botanist", location: "Il Mheg", aetheryte: "Lydha Lran", scrip: "White", value: 60, collectability: { min: 400, mid: 600, max: 1000 } },
    { name: "Sandalwood Log", level: 80, job: "Botanist", location: "The Rak'tika Greatwood", aetheryte: "Slitherbough", scrip: "White", value: 60, collectability: { min: 400, mid: 600, max: 1000 } },
    { name: "Ethereal Cocoon", level: 80, job: "Botanist", location: "Amh Araeng", aetheryte: "Mord Souq", scrip: "White", value: 60, collectability: { min: 400, mid: 600, max: 1000 } },
    { name: "Prismstone", level: 80, job: "Miner", location: "Lakeland", aetheryte: "Fort Jobb", scrip: "White", value: 60, collectability: { min: 400, mid: 600, max: 1000 } },
    { name: "Raw Onyx", level: 80, job: "Miner", location: "Kholusia", aetheryte: "Tomra", scrip: "White", value: 60, collectability: { min: 400, mid: 600, max: 1000 } },

    // Stormblood (Lv. 70) - White Scrips
    { name: "Jhammel Ginger", level: 70, job: "Botanist", location: "Gyr Abania", aetheryte: "Ala Ghiri", scrip: "White", value: 50, collectability: { min: 350, mid: 550, max: 1000 } },
    { name: "Beech Log", level: 70, job: "Botanist", location: "The Ruby Sea", aetheryte: "Onokoro", scrip: "White", value: 50, collectability: { min: 350, mid: 550, max: 1000 } },
    { name: "Palladium Ore", level: 70, job: "Miner", location: "Yanxia", aetheryte: "Namai", scrip: "White", value: 50, collectability: { min: 350, mid: 550, max: 1000 } },

    // Heavensward (Lv. 60) - White Scrips
    { name: "Meteorite", level: 60, job: "Miner", location: "Azys Lla", aetheryte: "Helix", scrip: "White", value: 40, collectability: { min: 300, mid: 500, max: 1000 } },
    { name: "Eventide Jade", level: 60, job: "Miner", location: "The Churning Mists", aetheryte: "Moghome", scrip: "White", value: 40, collectability: { min: 300, mid: 500, max: 1000 } },
    { name: "Old World Fig", level: 60, job: "Botanist", location: "The Dravanian Forelands", aetheryte: "Tailfeather", scrip: "White", value: 40, collectability: { min: 300, mid: 500, max: 1000 } },

    // ARR (Lv. 50) - White Scrips
    { name: "Dravanian Paprika", level: 50, job: "Botanist", location: "Coerthas", aetheryte: "Camp Dragonhead", scrip: "White", value: 30, collectability: { min: 250, mid: 450, max: 1000 } },
    { name: "Coerthan Tea Leaves", level: 50, job: "Botanist", location: "Coerthas", aetheryte: "Camp Dragonhead", scrip: "White", value: 30, collectability: { min: 250, mid: 450, max: 1000 } },
    { name: "Cobalt Ore", level: 50, job: "Miner", location: "Mor Dhona", aetheryte: "Mor Dhona", scrip: "White", value: 30, collectability: { min: 250, mid: 450, max: 1000 } }
];

export const scripColors = {
    White: { bg: 'bg-gray-100/10', text: 'text-gray-200', border: 'border-gray-500/30' },
    Purple: { bg: 'bg-purple-900/20', text: 'text-purple-400', border: 'border-purple-600/30' },
    Orange: { bg: 'bg-orange-900/20', text: 'text-orange-400', border: 'border-orange-600/30' }
};
