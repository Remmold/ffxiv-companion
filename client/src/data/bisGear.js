/**
 * BiS (Best in Slot) Gear Data for Dawntrail (Level 100)
 * Includes DoH (Disciples of the Hand) and DoL (Disciples of the Land) gear
 */

// Current DoH BiS: Indagator's Set (Crafted i700)
export const dohGear = {
    name: "Indagator's Set",
    ilvl: 700,
    type: "Crafted",
    slots: [
        {
            slot: "Main Hand",
            name: "Indagator's {Job} Primary Tool",
            perJob: true,
            stats: { craftsmanship: 1034, control: 627, cp: 8 },
            melds: ["CP +9 x2"],
            materials: [
                { name: "Ra'Kaznar Ingot", qty: 2 },
                { name: "Claro Walnut Lumber", qty: 1 },
                { name: "Rroneek Fleece", qty: 1 },
            ]
        },
        {
            slot: "Off Hand",
            name: "Indagator's {Job} Secondary Tool",
            perJob: true,
            stats: { craftsmanship: 776, control: 470, cp: 6 },
            melds: ["CP +9 x2"],
            materials: [
                { name: "Ra'Kaznar Ingot", qty: 2 },
                { name: "Claro Walnut Lumber", qty: 1 },
            ]
        },
        {
            slot: "Head",
            name: "Indagator's Cap of Crafting",
            stats: { craftsmanship: 466, control: 233, cp: 7 },
            melds: ["Craftsmanship +36 x2"],
            materials: [
                { name: "Rroneek Fleece", qty: 4 },
                { name: "Thunderyards Silk", qty: 2 },
                { name: "Gargantua Leather", qty: 1 },
            ]
        },
        {
            slot: "Body",
            name: "Indagator's Coat of Crafting",
            stats: { craftsmanship: 776, control: 388, cp: 12 },
            melds: ["Craftsmanship +36 x2"],
            materials: [
                { name: "Rroneek Fleece", qty: 6 },
                { name: "Thunderyards Silk", qty: 3 },
                { name: "Gargantua Leather", qty: 2 },
            ]
        },
        {
            slot: "Hands",
            name: "Indagator's Gloves of Crafting",
            stats: { craftsmanship: 466, control: 233, cp: 7 },
            melds: ["Control +36 x2"],
            materials: [
                { name: "Gargantua Leather", qty: 4 },
                { name: "Rroneek Fleece", qty: 2 },
                { name: "Thunderyards Silk", qty: 1 },
            ]
        },
        {
            slot: "Legs",
            name: "Indagator's Bottoms of Crafting",
            stats: { craftsmanship: 776, control: 388, cp: 12 },
            melds: ["Control +36 x2"],
            materials: [
                { name: "Rroneek Fleece", qty: 6 },
                { name: "Thunderyards Silk", qty: 3 },
                { name: "Gargantua Leather", qty: 2 },
            ]
        },
        {
            slot: "Feet",
            name: "Indagator's Boots of Crafting",
            stats: { craftsmanship: 466, control: 233, cp: 7 },
            melds: ["Control +36 x2"],
            materials: [
                { name: "Gargantua Leather", qty: 4 },
                { name: "Rroneek Fleece", qty: 2 },
                { name: "Ra'Kaznar Ingot", qty: 1 },
            ]
        },
        {
            slot: "Earrings",
            name: "Indagator's Earrings of Crafting",
            stats: { craftsmanship: 311, control: 155, cp: 5 },
            melds: ["CP +9 x2"],
            materials: [
                { name: "Ra'Kaznar Nugget", qty: 2 },
                { name: "Black Star", qty: 1 },
            ]
        },
        {
            slot: "Necklace",
            name: "Indagator's Necklace of Crafting",
            stats: { craftsmanship: 311, control: 155, cp: 5 },
            melds: ["CP +9 x2"],
            materials: [
                { name: "Ra'Kaznar Nugget", qty: 2 },
                { name: "Black Star", qty: 1 },
            ]
        },
        {
            slot: "Bracelet",
            name: "Indagator's Bracelet of Crafting",
            stats: { craftsmanship: 311, control: 155, cp: 5 },
            melds: ["CP +9 x2"],
            materials: [
                { name: "Ra'Kaznar Nugget", qty: 2 },
                { name: "Black Star", qty: 1 },
            ]
        },
        {
            slot: "Ring",
            name: "Indagator's Ring of Crafting",
            stats: { craftsmanship: 311, control: 155, cp: 5 },
            melds: ["Craftsmanship +36 x2"],
            materials: [
                { name: "Ra'Kaznar Nugget", qty: 2 },
                { name: "Black Star", qty: 1 },
            ],
            qty: 2 // Need two rings
        }
    ]
};

// Current DoL BiS: Pactmaker's Set (Crafted i700)
export const dolGear = {
    name: "Pactmaker's Set",
    ilvl: 700,
    type: "Crafted",
    slots: [
        {
            slot: "Main Hand",
            name: "Pactmaker's {Job} Primary Tool",
            perJob: true,
            stats: { gathering: 1034, perception: 627, gp: 8 },
            melds: ["GP +10 x2"],
            materials: [
                { name: "Ra'Kaznar Ingot", qty: 2 },
                { name: "Claro Walnut Lumber", qty: 1 },
                { name: "Gargantua Leather", qty: 1 },
            ]
        },
        {
            slot: "Off Hand",
            name: "Pactmaker's {Job} Secondary Tool",
            perJob: true,
            stats: { gathering: 776, perception: 470, gp: 6 },
            melds: ["GP +10 x2"],
            materials: [
                { name: "Ra'Kaznar Ingot", qty: 2 },
                { name: "Claro Walnut Lumber", qty: 1 },
            ]
        },
        {
            slot: "Head",
            name: "Pactmaker's Cap of Gathering",
            stats: { gathering: 466, perception: 233, gp: 7 },
            melds: ["Gathering +36 x2"],
            materials: [
                { name: "Rroneek Fleece", qty: 4 },
                { name: "Thunderyards Silk", qty: 2 },
                { name: "Gargantua Leather", qty: 1 },
            ]
        },
        {
            slot: "Body",
            name: "Pactmaker's Jacket of Gathering",
            stats: { gathering: 776, perception: 388, gp: 12 },
            melds: ["Gathering +36 x2"],
            materials: [
                { name: "Gargantua Leather", qty: 6 },
                { name: "Rroneek Fleece", qty: 3 },
                { name: "Thunderyards Silk", qty: 2 },
            ]
        },
        {
            slot: "Hands",
            name: "Pactmaker's Fingerless Gloves of Gathering",
            stats: { gathering: 466, perception: 233, gp: 7 },
            melds: ["Perception +36 x2"],
            materials: [
                { name: "Gargantua Leather", qty: 4 },
                { name: "Rroneek Fleece", qty: 2 },
                { name: "Thunderyards Silk", qty: 1 },
            ]
        },
        {
            slot: "Legs",
            name: "Pactmaker's Sarouel of Gathering",
            stats: { gathering: 776, perception: 388, gp: 12 },
            melds: ["Perception +36 x2"],
            materials: [
                { name: "Rroneek Fleece", qty: 6 },
                { name: "Thunderyards Silk", qty: 3 },
                { name: "Gargantua Leather", qty: 2 },
            ]
        },
        {
            slot: "Feet",
            name: "Pactmaker's Shoes of Gathering",
            stats: { gathering: 466, perception: 233, gp: 7 },
            melds: ["Perception +36 x2"],
            materials: [
                { name: "Gargantua Leather", qty: 4 },
                { name: "Rroneek Fleece", qty: 2 },
                { name: "Ra'Kaznar Ingot", qty: 1 },
            ]
        },
        {
            slot: "Earrings",
            name: "Pactmaker's Earrings of Gathering",
            stats: { gathering: 311, perception: 155, gp: 5 },
            melds: ["GP +10 x2"],
            materials: [
                { name: "Ra'Kaznar Nugget", qty: 2 },
                { name: "Black Star", qty: 1 },
            ]
        },
        {
            slot: "Necklace",
            name: "Pactmaker's Necklace of Gathering",
            stats: { gathering: 311, perception: 155, gp: 5 },
            melds: ["GP +10 x2"],
            materials: [
                { name: "Ra'Kaznar Nugget", qty: 2 },
                { name: "Black Star", qty: 1 },
            ]
        },
        {
            slot: "Bracelet",
            name: "Pactmaker's Bracelet of Gathering",
            stats: { gathering: 311, perception: 155, gp: 5 },
            melds: ["GP +10 x2"],
            materials: [
                { name: "Ra'Kaznar Nugget", qty: 2 },
                { name: "Black Star", qty: 1 },
            ]
        },
        {
            slot: "Ring",
            name: "Pactmaker's Ring of Gathering",
            stats: { gathering: 311, perception: 155, gp: 5 },
            melds: ["Gathering +36 x2"],
            materials: [
                { name: "Ra'Kaznar Nugget", qty: 2 },
                { name: "Black Star", qty: 1 },
            ],
            qty: 2
        }
    ]
};

// Key materials and what gear they're used for
export const gearMaterials = {
    "Ra'Kaznar Ingot": { uses: ["DoH Tools", "DoL Tools", "Feet"], timed: false },
    "Ra'Kaznar Nugget": { uses: ["Accessories"], timed: false },
    "Claro Walnut Lumber": { uses: ["Tools"], timed: false },
    "Rroneek Fleece": { uses: ["DoH Armor", "DoL Armor"], timed: false },
    "Thunderyards Silk": { uses: ["DoH Armor", "DoL Armor"], timed: false },
    "Gargantua Leather": { uses: ["DoL Armor", "DoH Armor"], timed: false },
    "Black Star": { uses: ["Accessories"], timed: true },
};

// Scrip gear alternative (for those not wanting to craft/buy)
export const scripGear = {
    doh: {
        name: "Quahog Set (Crafting)",
        ilvl: 690,
        cost: "Orange Crafters' Scrips",
        note: "Lower stats than Indagator but free with scrips"
    },
    dol: {
        name: "Quahog Set (Gathering)",
        ilvl: 690,
        cost: "Orange Gatherers' Scrips",
        note: "Lower stats than Pactmaker but free with scrips"
    }
};
