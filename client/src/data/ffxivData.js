// FFXIV Data Centers and Worlds

export const dataCenters = {
    // North America
    Aether: ['Adamantoise', 'Cactuar', 'Faerie', 'Gilgamesh', 'Jenova', 'Midgardsormr', 'Sargatanas', 'Siren'],
    Primal: ['Behemoth', 'Excalibur', 'Exodus', 'Famfrit', 'Hyperion', 'Lamia', 'Leviathan', 'Ultros'],
    Crystal: ['Balmung', 'Brynhildr', 'Coeurl', 'Diabolos', 'Goblin', 'Malboro', 'Mateus', 'Zalera'],
    Dynamis: ['Halicarnassus', 'Maduin', 'Marilith', 'Seraph'],

    // Europe
    Chaos: ['Cerberus', 'Louisoix', 'Moogle', 'Omega', 'Phantom', 'Ragnarok', 'Sagittarius', 'Spriggan'],
    Light: ['Alpha', 'Lich', 'Odin', 'Phoenix', 'Raiden', 'Shiva', 'Twintania', 'Zodiark'],

    // Japan
    Elemental: ['Aegis', 'Atomos', 'Carbuncle', 'Garuda', 'Gungnir', 'Kujata', 'Tonberry', 'Typhon'],
    Gaia: ['Alexander', 'Bahamut', 'Durandal', 'Fenrir', 'Ifrit', 'Ridill', 'Tiamat', 'Ultima'],
    Mana: ['Anima', 'Asura', 'Chocobo', 'Hades', 'Ixion', 'Masamune', 'Pandaemonium', 'Titan'],
    Meteor: ['Belias', 'Mandragora', 'Ramuh', 'Shinryu', 'Unicorn', 'Valefor', 'Yojimbo', 'Zeromus'],

    // Oceania
    Materia: ['Bismarck', 'Ravana', 'Sephirot', 'Sophia', 'Zurvan']
};

export const regionOrder = ['North America', 'Europe', 'Japan', 'Oceania'];

export const dcByRegion = {
    'North America': ['Aether', 'Primal', 'Crystal', 'Dynamis'],
    'Europe': ['Chaos', 'Light'],
    'Japan': ['Elemental', 'Gaia', 'Mana', 'Meteor'],
    'Oceania': ['Materia']
};

// Flat list of all worlds for dropdown
export const worlds = Object.values(dataCenters).flat().sort();

// Expansion display names
export const expansions = [
    { value: 'All', label: 'All Expansions' },
    { value: 'DT', label: 'Dawntrail' },
    { value: 'EW', label: 'Endwalker' },
    { value: 'ShB', label: 'Shadowbringers' },
    { value: 'SB', label: 'Stormblood' },
    { value: 'HW', label: 'Heavensward' },
    { value: 'ARR', label: 'A Realm Reborn' }
];

// Gathering classes
export const gatheringClasses = [
    { value: 'All', label: 'All Classes' },
    { value: 'Miner', label: 'Miner' },
    { value: 'Botanist', label: 'Botanist' },
    { value: 'Fisher', label: 'Fisher' }
];

// Crafting classes (Disciples of the Hand)
export const craftingClasses = [
    { value: 'All', label: 'All Classes' },
    { value: 'Carpenter', label: 'Carpenter', icon: '🪵' },
    { value: 'Blacksmith', label: 'Blacksmith', icon: '⚒️' },
    { value: 'Armorer', label: 'Armorer', icon: '🛡️' },
    { value: 'Goldsmith', label: 'Goldsmith', icon: '💎' },
    { value: 'Leatherworker', label: 'Leatherworker', icon: '🧥' },
    { value: 'Weaver', label: 'Weaver', icon: '🧵' },
    { value: 'Alchemist', label: 'Alchemist', icon: '⚗️' },
    { value: 'Culinarian', label: 'Culinarian', icon: '🍳' }
];
