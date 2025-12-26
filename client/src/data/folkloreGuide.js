/**
 * Folklore book requirements data for FFXIV gathering nodes.
 * Each expansion requires specific books to unlock nodes.
 */

export const folkloreGuides = {
    DT: {
        name: "Dawntrail",
        books: [
            {
                name: "Regional Folklore - Tural",
                cost: "1,200 Purple Crafter's Scrips or 4,000 White Crafter's Scrips",
                vendor: "Scrip Exchange",
                notes: "Unlocks all Dawntrail timed nodes"
            }
        ],
        levelReq: "Lv. 100 Miner/Botanist",
        howToGet: "Purchase from Scrip Exchange vendors using Purple or White Scrips earned from collectables.",
        vendors: [
            { name: "Scrip Exchange", location: "Solution Nine", aetheryte: "Solution Nine", coords: "X:8.6, Y:13.5" },
            { name: "Scrip Exchange", location: "Tuliyollal", aetheryte: "Tuliyollal", coords: "X:12.5, Y:13.0" }
        ]
    },
    EW: {
        name: "Endwalker",
        books: [
            { name: "Regional Folklore - Sharlayan", cost: "100 Purple Gatherer's Scrips", vendor: "Scrip Exchange" },
            { name: "Regional Folklore - Thavnair", cost: "100 Purple Gatherer's Scrips", vendor: "Scrip Exchange" },
            { name: "Regional Folklore - Garlemald", cost: "100 Purple Gatherer's Scrips", vendor: "Scrip Exchange" },
            { name: "Regional Folklore - Mare Lamentorum", cost: "100 Purple Gatherer's Scrips", vendor: "Scrip Exchange" },
            { name: "Regional Folklore - Elpis", cost: "100 Purple Gatherer's Scrips", vendor: "Scrip Exchange" },
            { name: "Regional Folklore - Ultima Thule", cost: "100 Purple Gatherer's Scrips", vendor: "Scrip Exchange" }
        ],
        levelReq: "Lv. 90 Miner/Botanist",
        howToGet: "Purchase from Scrip Exchange using Purple Gatherer's Scrips.",
        vendors: [
            { name: "Scrip Exchange", location: "Radz-at-Han", aetheryte: "Radz-at-Han", coords: "X:11.5, Y:9.4" },
            { name: "Scrip Exchange", location: "Old Sharlayan", aetheryte: "Old Sharlayan", coords: "X:4.9, Y:9.3" }
        ]
    },
    ShB: {
        name: "Shadowbringers",
        books: [
            { name: "Regional Folklore - Norvrandt", cost: "100 White Gatherer's Scrips", vendor: "Scrip Exchange" }
        ],
        levelReq: "Lv. 80 Miner/Botanist",
        howToGet: "Purchase from Scrip Exchange using White Gatherer's Scrips.",
        vendors: [
            { name: "Scrip Exchange", location: "Eulmore", aetheryte: "Eulmore", coords: "X:11.8, Y:10.8" },
            { name: "Scrip Exchange", location: "The Crystarium", aetheryte: "The Crystarium", coords: "X:9.8, Y:8.5" }
        ]
    },
    SB: {
        name: "Stormblood",
        books: [
            { name: "Regional Folklore - Gyr Abania", cost: "100 White Gatherer's Scrips", vendor: "Scrip Exchange" },
            { name: "Regional Folklore - Othard", cost: "100 White Gatherer's Scrips", vendor: "Scrip Exchange" }
        ],
        levelReq: "Lv. 70 Miner/Botanist",
        howToGet: "Purchase from Scrip Exchange using White Gatherer's Scrips.",
        vendors: [
            { name: "Scrip Exchange", location: "Rhalgr's Reach", aetheryte: "Rhalgr's Reach", coords: "X:9.8, Y:12.5" },
            { name: "Scrip Exchange", location: "Kugane", aetheryte: "Kugane", coords: "X:12.2, Y:10.8" }
        ]
    },
    HW: {
        name: "Heavensward",
        books: [
            { name: "Regional Folklore - Dravania", cost: "100 White Gatherer's Scrips", vendor: "Scrip Exchange" },
            { name: "Regional Folklore - Abalathia's Spine", cost: "100 White Gatherer's Scrips", vendor: "Scrip Exchange" }
        ],
        levelReq: "Lv. 60 Miner/Botanist",
        howToGet: "Purchase from Scrip Exchange using White Gatherer's Scrips.",
        vendors: [
            { name: "Scrip Exchange", location: "Idyllshire", aetheryte: "Idyllshire", coords: "X:5.7, Y:7.0" }
        ]
    },
    ARR: {
        name: "A Realm Reborn",
        books: [
            { name: "Regional Folklore - La Noscea", cost: "99 Poetics or White Scrips", vendor: "Auriana or Scrip Exchange" },
            { name: "Regional Folklore - The Black Shroud", cost: "99 Poetics or White Scrips", vendor: "Auriana or Scrip Exchange" },
            { name: "Regional Folklore - Thanalan", cost: "99 Poetics or White Scrips", vendor: "Auriana or Scrip Exchange" },
            { name: "Regional Folklore - Coerthas", cost: "99 Poetics or White Scrips", vendor: "Auriana or Scrip Exchange" },
            { name: "Regional Folklore - Mor Dhona", cost: "99 Poetics or White Scrips", vendor: "Auriana or Scrip Exchange" }
        ],
        levelReq: "Lv. 50 Miner/Botanist",
        howToGet: "Purchase from Auriana using Poetics, or from any Scrip Exchange using White Scrips.",
        vendors: [
            { name: "Auriana", location: "Mor Dhona", aetheryte: "Mor Dhona", coords: "X:22.7, Y:6.7", notes: "Poetics vendor" },
            { name: "Scrip Exchange", location: "Limsa Lominsa", aetheryte: "Limsa Lominsa Lower Decks", coords: "X:6.0, Y:11.9" },
            { name: "Scrip Exchange", location: "Ul'dah", aetheryte: "Ul'dah - Steps of Nald", coords: "X:14.2, Y:10.8" },
            { name: "Scrip Exchange", location: "Gridania", aetheryte: "New Gridania", coords: "X:11.9, Y:12.3" }
        ]
    }
};

export const generalTips = [
    "White Gatherer's Scrips: Earned from Custom Deliveries and Collectable turn-ins",
    "Purple Gatherer's Scrips: Earned from high-level Collectable turn-ins (Lv. 90+)",
    "Poetics: Earned from roulettes, dungeons, and other content",
    "Tip: Custom Deliveries reset weekly and are the easiest source of scrips"
];
