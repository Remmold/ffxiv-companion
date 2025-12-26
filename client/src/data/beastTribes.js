/**
 * Allied Societies (Beast Tribes) data with unlock prerequisites and locations.
 * Organized by expansion and includes both combat and DoL/DoH tribes.
 */

export const beastTribes = [
    // ============================================================================
    // DAWNTRAIL (7.0) - Allied Societies
    // ============================================================================
    {
        id: 'pelupelu',
        name: 'Pelupelu',
        expansion: 'DT',
        type: 'Gatherer',
        location: 'Urqopacha',
        aetheryte: 'Wachunpelo',
        icon: '🦙',
        rewards: ['Orange Gatherer Scrips', 'Materia', 'Mounts', 'Minions'],
        unlockLevel: 80,
        unlockJob: 'MIN/BTN',
        weeklyAllowance: 12,
        prereqs: [
            {
                type: 'msq',
                name: 'Complete Dawntrail MSQ',
                description: 'Complete the Dawntrail main scenario quest through 7.0'
            },
            {
                type: 'quest',
                name: 'Pelu Forlorn',
                location: 'Solution Nine',
                npc: 'Ketenramm',
                coords: 'X: 9.2, Y: 13.2',
                description: 'Starting quest to unlock Pelupelu tribe'
            }
        ],
        description: 'The fluffy alpaca-like Pelupelu of Tural seek help gathering resources for their community.',
        tips: 'Best source for Orange Gatherer Scrips. Prioritize this tribe for endgame gathering rewards.'
    },
    {
        id: 'moblins',
        name: 'Moblins',
        expansion: 'DT',
        type: 'Crafter',
        location: 'Yak T\'el',
        aetheryte: 'Iq Br\'aax',
        icon: '🔧',
        rewards: ['Orange Crafter Scrips', 'Materia', 'Mounts', 'Minions'],
        unlockLevel: 80,
        unlockJob: 'Any Crafter',
        weeklyAllowance: 12,
        prereqs: [
            {
                type: 'msq',
                name: 'Complete Dawntrail MSQ',
                description: 'Complete the Dawntrail main scenario quest through 7.0'
            },
            {
                type: 'quest',
                name: 'Moblins Means Business',
                location: 'Solution Nine',
                npc: 'Ketenramm',
                coords: 'X: 9.2, Y: 13.2',
                description: 'Starting quest to unlock Moblin tribe'
            }
        ],
        description: 'Moblins are expert craftsmen who have set up shop in the jungles of Yak T\'el.',
        tips: 'Best for Orange Crafter Scrips. Pairs well with Pelupelu for gatherer materials.'
    },

    // ============================================================================
    // ENDWALKER (6.x) - Allied Societies
    // ============================================================================
    {
        id: 'omicrons',
        name: 'Omicrons',
        expansion: 'EW',
        type: 'Gatherer',
        location: 'Ultima Thule',
        aetheryte: 'Reah Tahra',
        icon: '🤖',
        rewards: ['Purple Gatherer Scrips', 'Materia', 'Omega Mounts', 'Minions'],
        unlockLevel: 80,
        unlockJob: 'MIN/BTN',
        weeklyAllowance: 12,
        prereqs: [
            {
                type: 'msq',
                name: 'Complete Endwalker MSQ',
                description: 'Complete the Endwalker main scenario through 6.0'
            },
            {
                type: 'quest',
                name: 'Where No Loporrit Has Gone Before',
                location: 'Ultima Thule',
                npc: 'Jammingway',
                coords: 'X: 24.5, Y: 26.2',
                description: 'Starting quest to unlock Omicron tribe'
            }
        ],
        description: 'The mysterious robotic Omicrons seek to understand organic life through gathering.',
        tips: 'Great for Purple Gatherer Scrips. Completion unlocks adorable Omicron-themed rewards.'
    },
    {
        id: 'loporrits',
        name: 'Loporrits',
        expansion: 'EW',
        type: 'Crafter',
        location: 'Mare Lamentorum',
        aetheryte: 'Bestways Burrow',
        icon: '🐰',
        rewards: ['Purple Crafter Scrips', 'Materia', 'Moon Mounts', 'Minions'],
        unlockLevel: 80,
        unlockJob: 'Any Crafter',
        weeklyAllowance: 12,
        prereqs: [
            {
                type: 'msq',
                name: 'Complete Endwalker MSQ',
                description: 'Complete the Endwalker main scenario through 6.0'
            },
            {
                type: 'quest',
                name: 'The Loporrits\' Flighty Fancy',
                location: 'Mare Lamentorum',
                npc: 'Usingway',
                coords: 'X: 22.2, Y: 14.2',
                description: 'Starting quest to unlock Loporrit tribe'
            }
        ],
        description: 'The adorable moon rabbits need help crafting supplies for their lunar endeavors.',
        tips: 'Good source of Purple Crafter Scrips. Very cute quests!'
    },
    {
        id: 'arkasodara',
        name: 'Arkasodara',
        expansion: 'EW',
        type: 'Combat',
        location: 'Thavnair',
        aetheryte: 'Yedlihmad',
        icon: '🐘',
        rewards: ['Tomestones', 'Materia', 'Elephant Mount', 'Minions'],
        unlockLevel: 80,
        unlockJob: 'Any Combat',
        dailyAllowance: 12,
        prereqs: [
            {
                type: 'msq',
                name: 'Complete Endwalker MSQ',
                description: 'Complete the Endwalker main scenario through 6.0'
            },
            {
                type: 'quest',
                name: 'What the Dealio Gigantalio',
                location: 'Thavnair',
                npc: 'Ogul',
                coords: 'X: 25.4, Y: 31.0',
                description: 'Starting quest to unlock Arkasodara tribe'
            }
        ],
        description: 'The elephant-like Arkasodara of Thavnair offer combat daily quests.',
        tips: 'Combat tribe. Good for leveling alt jobs and tomestone farming.'
    },

    // ============================================================================
    // SHADOWBRINGERS (5.x)
    // ============================================================================
    {
        id: 'qitari',
        name: 'Qitari',
        expansion: 'ShB',
        type: 'Gatherer',
        location: 'The Rak\'tika Greatwood',
        aetheryte: 'Fanow',
        icon: '🦎',
        rewards: ['White Gatherer Scrips', 'Materia', 'Qitari Mount', 'Minions'],
        unlockLevel: 70,
        unlockJob: 'MIN/BTN',
        dailyAllowance: 12,
        prereqs: [
            {
                type: 'msq',
                name: 'Complete Shadowbringers 5.0 MSQ',
                description: 'Complete "Shadowbringers" main scenario quest'
            },
            {
                type: 'quest',
                name: 'The Stewards of Note',
                location: 'The Rak\'tika Greatwood',
                npc: 'Concerned Mother',
                coords: 'X: 21.0, Y: 27.6',
                description: 'Starting quest to unlock Qitari tribe'
            }
        ],
        description: 'The scholarly lizard Qitari need help uncovering ancient Ronkan secrets.',
        tips: 'Excellent for leveling gatherers 70-80. Great lore about Ronka!'
    },
    {
        id: 'dwarves',
        name: 'Dwarves',
        expansion: 'ShB',
        type: 'Crafter',
        location: 'Kholusia',
        aetheryte: 'Tomra',
        icon: '⛏️',
        rewards: ['White Crafter Scrips', 'Materia', 'Tank Mount', 'Minions'],
        unlockLevel: 70,
        unlockJob: 'Any Crafter',
        dailyAllowance: 12,
        prereqs: [
            {
                type: 'msq',
                name: 'Complete Shadowbringers 5.0 MSQ',
                description: 'Complete "Shadowbringers" main scenario quest'
            },
            {
                type: 'quest',
                name: 'It\'s Dwarfin\' Time',
                location: 'Kholusia',
                npc: 'Affable Townsdwarf',
                coords: 'X: 12.7, Y: 9.0',
                description: 'Starting quest to unlock Dwarf tribe'
            }
        ],
        description: 'Lali-ho! The dwarves need crafters to help build their ultimate creation.',
        tips: 'Great for leveling crafters 70-80. Unlocks the iconic Tank Mount!'
    },
    {
        id: 'pixies',
        name: 'Pixies',
        expansion: 'ShB',
        type: 'Combat',
        location: 'Il Mheg',
        aetheryte: 'Lydha Lran',
        icon: '🧚',
        rewards: ['Tomestones', 'Materia', 'Porxie Mount', 'Minions'],
        unlockLevel: 70,
        unlockJob: 'Any Combat',
        dailyAllowance: 12,
        prereqs: [
            {
                type: 'msq',
                name: 'Complete Shadowbringers 5.0 MSQ',
                description: 'Complete "Shadowbringers" main scenario quest'
            },
            {
                type: 'quest',
                name: 'Pixie Problems',
                location: 'Il Mheg',
                npc: 'Pink Pixie',
                coords: 'X: 12.4, Y: 32.9',
                description: 'Starting quest to unlock Pixie tribe'
            }
        ],
        description: 'The mischievous pixies of Il Mheg want playmates for their games.',
        tips: 'Combat tribe. Fae lore and silly quests. Unlocks the Porxie mount!'
    },

    // ============================================================================
    // STORMBLOOD (4.x)
    // ============================================================================
    {
        id: 'namazu',
        name: 'Namazu',
        expansion: 'SB',
        type: 'Gatherer/Crafter',
        location: 'The Azim Steppe',
        aetheryte: 'Dhoro Iloh',
        icon: '🐱',
        rewards: ['Gil', 'Experience', 'Namazu Mount', 'Minions'],
        unlockLevel: 60,
        unlockJob: 'MIN/BTN or Any Crafter',
        dailyAllowance: 12,
        prereqs: [
            {
                type: 'msq',
                name: 'Complete "In Crimson They Walked"',
                description: 'Progress through Stormblood MSQ to unlock The Azim Steppe'
            },
            {
                type: 'job',
                name: 'Level 60 DoL or DoH',
                description: 'Have any gatherer or crafter at level 60'
            },
            {
                type: 'quest',
                name: 'Courage the Cowardly Lupin',
                location: 'The Azim Steppe',
                npc: 'Floundering Namazu',
                coords: 'X: 17.4, Y: 37.5',
                description: 'Starting quest to unlock Namazu tribe'
            }
        ],
        description: 'Yes, yes! The catfish-like Namazu host the famous Namazu Festival!',
        tips: 'Best tribe for leveling DoL/DoH 60-70. Very profitable mount sales!'
    },
    {
        id: 'ananta',
        name: 'Ananta',
        expansion: 'SB',
        type: 'Combat',
        location: 'The Fringes',
        aetheryte: 'Castellum Velodyna',
        icon: '🐍',
        rewards: ['Tomestones', 'Materia', 'Marid Mount', 'Minions'],
        unlockLevel: 60,
        unlockJob: 'Any Combat',
        dailyAllowance: 12,
        prereqs: [
            {
                type: 'msq',
                name: 'Complete "Rhalgr\'s Beacon"',
                description: 'Progress through Stormblood MSQ'
            },
            {
                type: 'quest',
                name: 'Brooding Broodmother',
                location: 'The Fringes',
                npc: 'M\'rahz Nunh',
                coords: 'X: 30.4, Y: 25.7',
                description: 'Starting quest to unlock Ananta tribe'
            }
        ],
        description: 'The snake-like Ananta seek allies against the Garlean Empire.',
        tips: 'Combat tribe. Good story and the Marid mount is very popular!'
    },
    {
        id: 'kojin',
        name: 'Kojin',
        expansion: 'SB',
        type: 'Combat',
        location: 'The Ruby Sea',
        aetheryte: 'Tamamizu',
        icon: '🐢',
        rewards: ['Tomestones', 'Materia', 'Striped Ray Mount', 'Minions'],
        unlockLevel: 60,
        unlockJob: 'Any Combat',
        dailyAllowance: 12,
        prereqs: [
            {
                type: 'msq',
                name: 'Complete "Tide Goes In, Imperials Go Out"',
                description: 'Progress through Stormblood MSQ to unlock underwater'
            },
            {
                type: 'quest',
                name: 'Heaven-sent',
                location: 'The Ruby Sea',
                npc: 'Vexed Villager',
                coords: 'X: 6.8, Y: 13.3',
                description: 'Starting quest to unlock Kojin tribe'
            }
        ],
        description: 'The turtle-like Kojin worship divine treasures beneath the waves.',
        tips: 'Combat tribe. Requires underwater travel. Nice underwater mount reward!'
    },

    // ============================================================================
    // HEAVENSWARD (3.x)
    // ============================================================================
    {
        id: 'moogles',
        name: 'Moogles',
        expansion: 'HW',
        type: 'Crafter',
        location: 'The Churning Mists',
        aetheryte: 'Moghome',
        icon: '🎀',
        rewards: ['Gil', 'Experience', 'Cloud Mallow Mount', 'Minions'],
        unlockLevel: 50,
        unlockJob: 'Any Crafter',
        dailyAllowance: 12,
        prereqs: [
            {
                type: 'msq',
                name: 'Complete "Familiar Faces"',
                description: 'Progress through Heavensward MSQ to unlock Churning Mists'
            },
            {
                type: 'job',
                name: 'Level 50 DoH',
                description: 'Have any crafter at level 50'
            },
            {
                type: 'quest',
                name: 'Tricks and Stones',
                location: 'The Churning Mists',
                npc: 'Seething Stonemason',
                coords: 'X: 27.2, Y: 34.5',
                description: 'Starting quest to unlock Moogle tribe'
            }
        ],
        description: 'Kupo! Help the moogles restore their sacred monument, the Mogmender!',
        tips: 'Best for leveling crafters 50-60. Unlocks the iconic Cloud Mallow mount!'
    },
    {
        id: 'vanu_vanu',
        name: 'Vanu Vanu',
        expansion: 'HW',
        type: 'Combat',
        location: 'The Sea of Clouds',
        aetheryte: 'Ok\' Zundu',
        icon: '🦅',
        rewards: ['Tomestones', 'Materia', 'Sanuwa Mount', 'Minions'],
        unlockLevel: 50,
        unlockJob: 'Any Combat',
        dailyAllowance: 12,
        prereqs: [
            {
                type: 'msq',
                name: 'Complete "Heavensward" MSQ',
                description: 'Complete the 3.0 main scenario'
            },
            {
                type: 'quest',
                name: 'Three Beaks to the Wind',
                location: 'The Sea of Clouds',
                npc: 'Sanu Vanu',
                coords: 'X: 11.7, Y: 14.2',
                description: 'Starting quest to unlock Vanu Vanu tribe'
            }
        ],
        description: 'The bird-like Vanu Vanu soar through the Sea of Clouds.',
        tips: 'Combat tribe. First Heavensward tribe. Sanuwa mount is a fan favorite!'
    },
    {
        id: 'vath',
        name: 'Vath',
        expansion: 'HW',
        type: 'Combat',
        location: 'The Dravanian Forelands',
        aetheryte: 'Tailfeather',
        icon: '🐛',
        rewards: ['Tomestones', 'Materia', 'Kongamato Mount', 'Minions'],
        unlockLevel: 50,
        unlockJob: 'Any Combat',
        dailyAllowance: 12,
        prereqs: [
            {
                type: 'msq',
                name: 'Complete "Heavensward" MSQ',
                description: 'Complete the 3.0 main scenario'
            },
            {
                type: 'quest',
                name: 'A Disarming Tribe',
                location: 'The Dravanian Forelands',
                npc: 'Taleseller Vath',
                coords: 'X: 24.9, Y: 19.6',
                description: 'Starting quest to unlock Vath tribe'
            }
        ],
        description: 'The insectoid Vath have broken free from the Gnath hivemind.',
        tips: 'Combat tribe. Interesting story about individuality!'
    },

    // ============================================================================
    // A REALM REBORN (2.x)
    // ============================================================================
    {
        id: 'ixali',
        name: 'Ixali',
        expansion: 'ARR',
        type: 'Crafter',
        location: 'North Shroud',
        aetheryte: 'Fallgourd Float',
        icon: '🦜',
        rewards: ['Gil', 'Experience', 'Ixali Mount', 'Minions'],
        unlockLevel: 1,
        unlockJob: 'Any Crafter',
        dailyAllowance: 12,
        prereqs: [
            {
                type: 'msq',
                name: 'Complete "Sylph-management"',
                description: 'Progress through 2.0 MSQ to unlock beast tribes'
            },
            {
                type: 'quest',
                name: 'A Bad Bladder',
                location: 'North Shroud',
                npc: 'Scarlet',
                coords: 'X: 24.8, Y: 22.7',
                description: 'Starting quest to unlock Ixali tribe'
            }
        ],
        description: 'The bird-like Ixali are master crafters building their ultimate airship.',
        tips: 'Only ARR crafter tribe! Great for leveling any crafter 1-50.'
    },
    {
        id: 'sylphs',
        name: 'Sylphs',
        expansion: 'ARR',
        type: 'Combat',
        location: 'East Shroud',
        aetheryte: 'The Hawthorne Hut',
        icon: '🌿',
        rewards: ['Tomestones', 'Materia', 'Goobue Mount', 'Minions'],
        unlockLevel: 42,
        unlockJob: 'Any Combat',
        dailyAllowance: 12,
        prereqs: [
            {
                type: 'msq',
                name: 'Complete "Sylph-management"',
                description: 'Complete this MSQ to unlock beast tribe quests'
            },
            {
                type: 'quest',
                name: 'Seeking Solace',
                location: 'New Gridania',
                npc: 'Vorsaile Heuloix',
                coords: 'X: 9.7, Y: 11.1',
                description: 'Starting quest to unlock Sylph tribe'
            }
        ],
        description: 'These ones are the friendly Sylphs of Little Solace!',
        tips: 'First beast tribe most players encounter. Goobue mount is iconic!'
    },
    {
        id: 'amalj_aa',
        name: 'Amalj\'aa',
        expansion: 'ARR',
        type: 'Combat',
        location: 'Southern Thanalan',
        aetheryte: 'Little Ala Mhigo',
        icon: '🦎',
        rewards: ['Tomestones', 'Materia', 'Cavalry Drake Mount', 'Minions'],
        unlockLevel: 43,
        unlockJob: 'Any Combat',
        dailyAllowance: 12,
        prereqs: [
            {
                type: 'msq',
                name: 'Complete "Sylph-management"',
                description: 'Complete this MSQ to unlock beast tribe quests'
            },
            {
                type: 'quest',
                name: 'Peace for Thanalan',
                location: 'Ul\'dah - Steps of Nald',
                npc: 'Swift',
                coords: 'X: 8.4, Y: 8.9',
                description: 'Starting quest to unlock Amalj\'aa tribe'
            }
        ],
        description: 'The lizard-like Amalj\'aa warriors seek worthy allies.',
        tips: 'Combat tribe in Thanalan. Cavalry Drake is a popular mount!'
    },
    {
        id: 'kobolds',
        name: 'Kobolds',
        expansion: 'ARR',
        type: 'Combat',
        location: 'Outer La Noscea',
        aetheryte: 'Camp Overlook',
        icon: '⛰️',
        rewards: ['Tomestones', 'Materia', 'Bomb Palanquin Mount', 'Minions'],
        unlockLevel: 44,
        unlockJob: 'Any Combat',
        dailyAllowance: 12,
        prereqs: [
            {
                type: 'msq',
                name: 'Complete "Sylph-management"',
                description: 'Complete this MSQ to unlock beast tribe quests'
            },
            {
                type: 'quest',
                name: 'Highway Robbery',
                location: 'Limsa Lominsa Upper Decks',
                npc: 'Trachraet',
                coords: 'X: 12.7, Y: 12.8',
                description: 'Starting quest to unlock Kobold tribe'
            }
        ],
        description: '789th Order Kobolds dig deep in search of precious ores!',
        tips: 'Combat tribe. Bomb Palanquin is one of the most unique mounts!'
    },
    {
        id: 'sahagin',
        name: 'Sahagin',
        expansion: 'ARR',
        type: 'Combat',
        location: 'Western La Noscea',
        aetheryte: 'Aleport',
        icon: '🐟',
        rewards: ['Tomestones', 'Materia', 'Cavalry Elbst Mount', 'Minions'],
        unlockLevel: 44,
        unlockJob: 'Any Combat',
        dailyAllowance: 12,
        prereqs: [
            {
                type: 'msq',
                name: 'Complete "Sylph-management"',
                description: 'Complete this MSQ to unlock beast tribe quests'
            },
            {
                type: 'quest',
                name: 'They Came from the Deep',
                location: 'Limsa Lominsa Upper Decks',
                npc: 'R\'ashaht Rhiki',
                coords: 'X: 13.2, Y: 12.8',
                description: 'Starting quest to unlock Sahagin tribe'
            }
        ],
        description: 'The fish-like Sahagin Clutchfather seeks peace with the surface.',
        tips: 'Combat tribe. Cavalry Elbst mount matches the aquatic theme!'
    }
];

/**
 * Get tribes filtered by type
 */
export function getTribesForGatherers() {
    return beastTribes.filter(t => t.type === 'Gatherer' || t.type === 'Gatherer/Crafter');
}

export function getTribesForCrafters() {
    return beastTribes.filter(t => t.type === 'Crafter' || t.type === 'Gatherer/Crafter');
}

export function getTribesByExpansion(expansion) {
    return beastTribes.filter(t => t.expansion === expansion);
}

/**
 * Expansion display names
 */
export const expansionNames = {
    'DT': 'Dawntrail',
    'EW': 'Endwalker',
    'ShB': 'Shadowbringers',
    'SB': 'Stormblood',
    'HW': 'Heavensward',
    'ARR': 'A Realm Reborn'
};

export const expansionOrder = ['DT', 'EW', 'ShB', 'SB', 'HW', 'ARR'];
