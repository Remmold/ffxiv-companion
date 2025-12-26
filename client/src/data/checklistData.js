/**
 * Comprehensive checklist data for daily and weekly FFXIV activities.
 * All reset times are in UTC.
 */

// ============================================================================
// DAILY ITEMS - Reset at 3:00 PM UTC (11:00 AM EST / 8:00 AM PST)
// ============================================================================

export const dailyItems = [
    {
        id: 'gc-turnins',
        name: 'Grand Company Turn-ins',
        description: 'Daily expert delivery for gatherers',
        aetheryte: null, // Depends on your GC
        icon: '🏛️',
        category: 'daily',
        note: 'Check your Grand Company for today\'s requested items'
    },
    {
        id: 'mini-cactpot',
        name: 'Mini Cactpot',
        description: 'Daily scratch-off lottery',
        aetheryte: 'Gold Saucer',
        icon: '🎰',
        category: 'daily',
        note: 'Up to 3 tickets per day'
    },
    {
        id: 'beast-tribes',
        name: 'Beast Tribe Quests',
        description: '12 daily allowance (shared across all tribes)',
        aetheryte: null,
        icon: '🐾',
        category: 'daily',
        note: 'Priorities: Namazu (SB), Qitari (ShB), Omicrons (EW)',
        hasCounter: true,
        maxCount: 12
    },
    {
        id: 'retainer-ventures',
        name: 'Retainer Ventures',
        description: 'Dispatch retainers for items',
        aetheryte: null,
        icon: '📦',
        category: 'daily',
        note: 'Check summoning bells in major cities'
    },
    {
        id: 'map-allowance',
        name: 'Treasure Map Allowance',
        description: 'Gather one treasure map per day',
        aetheryte: null,
        icon: '🗺️',
        category: 'daily',
        note: 'Timeworn maps from level 80+ nodes recommended'
    }
];

// ============================================================================
// WEEKLY ITEMS - Reset Tuesday 8:00 AM UTC
// ============================================================================

export const weeklyItems = [
    {
        id: 'wondrous-tails',
        name: 'Wondrous Tails',
        description: 'Weekly journal from Khloe Aliapoh',
        aetheryte: 'Idyllshire',
        icon: '📔',
        category: 'weekly',
        note: 'Turn in for exp, MGP, or gear rewards'
    },
    {
        id: 'allied-society',
        name: 'Allied Society Quests',
        description: '12 weekly allowance for DT tribes',
        aetheryte: 'Solution Nine',
        icon: '🤝',
        category: 'weekly',
        note: 'Pelupelu and other Dawntrail tribes',
        hasCounter: true,
        maxCount: 12
    },
    {
        id: 'fashion-report',
        name: 'Fashion Report',
        description: 'Weekly judging at Gold Saucer',
        aetheryte: 'Gold Saucer',
        icon: '👗',
        category: 'weekly',
        note: 'Available Friday-Monday, 80+ points for max MGP'
    },
    {
        id: 'jumbo-cactpot',
        name: 'Jumbo Cactpot',
        description: 'Weekly lottery (Saturday draw)',
        aetheryte: 'Gold Saucer',
        icon: '🎟️',
        category: 'weekly',
        note: 'Buy up to 3 tickets, drawn Saturday'
    },
    {
        id: 'challenge-log',
        name: 'Challenge Log',
        description: 'Complete gathering challenges for bonus exp',
        aetheryte: null,
        icon: '📋',
        category: 'weekly',
        note: 'Gathering HQ items, unique items, fishing challenges'
    }
];

// ============================================================================
// CUSTOM DELIVERIES - Weekly, 12 deliveries shared across ALL NPCs
// ============================================================================

export const CUSTOM_DELIVERY_WEEKLY_CAP = 12;

export const customDeliveryNPCs = [
    {
        id: 'cd-margrat',
        name: 'Margrat',
        location: 'Solution Nine',
        aetheryte: 'Solution Nine',
        expansion: 'DT',
        scripType: 'Orange',
        note: 'Dawntrail NPC'
    },
    {
        id: 'cd-ameliance',
        name: 'Ameliance Leveilleur',
        location: 'Old Sharlayan',
        aetheryte: 'Old Sharlayan',
        expansion: 'EW',
        scripType: 'Purple',
        note: "Alphinaud's mother"
    },
    {
        id: 'cd-anden',
        name: 'Anden',
        location: 'Old Sharlayan',
        aetheryte: 'Old Sharlayan',
        expansion: 'EW',
        scripType: 'Purple',
        note: 'Studium researcher'
    },
    {
        id: 'cd-kai-shirr',
        name: 'Kai-Shirr',
        location: 'Eulmore',
        aetheryte: 'Eulmore',
        expansion: 'ShB',
        scripType: 'White',
        note: 'Mystel from Eulmore'
    },
    {
        id: 'cd-ehll-tou',
        name: 'Ehll Tou',
        location: 'The Firmament',
        aetheryte: 'Foundation',
        expansion: 'ShB',
        scripType: 'White',
        note: 'Ishgardian Restoration dragon'
    },
    {
        id: 'cd-charlemend',
        name: 'Charlemend',
        location: 'The Firmament',
        aetheryte: 'Foundation',
        expansion: 'ShB',
        scripType: 'White',
        note: 'Temple Knight'
    },
    {
        id: 'cd-mnaago',
        name: "M'naago Rahz",
        location: "Rhalgr's Reach",
        aetheryte: "Rhalgr's Reach",
        expansion: 'SB',
        scripType: 'White',
        note: 'Resistance Fighter'
    },
    {
        id: 'cd-kurenai',
        name: 'Kurenai',
        location: 'Ruby Sea',
        aetheryte: 'Tamamizu',
        expansion: 'SB',
        scripType: 'White',
        note: 'Requires underwater access'
    },
    {
        id: 'cd-adkiragh',
        name: 'Adkiragh',
        location: 'Idyllshire',
        aetheryte: 'Idyllshire',
        expansion: 'SB',
        scripType: 'White',
        note: 'Qiqirn Trader'
    },
    {
        id: 'cd-zhloe',
        name: 'Zhloe Aliapoh',
        location: 'Idyllshire',
        aetheryte: 'Idyllshire',
        expansion: 'HW',
        scripType: 'White',
        note: 'First Custom Delivery NPC'
    }
];

// ============================================================================
// TIMER UTILITIES
// ============================================================================

/**
 * Calculate time until next daily reset (3:00 PM UTC / 15:00 UTC)
 */
export function getTimeUntilDailyReset() {
    const now = new Date();
    const resetHour = 15; // 3:00 PM UTC

    // Create reset time for today
    const resetToday = new Date(now);
    resetToday.setUTCHours(resetHour, 0, 0, 0);

    // If we've passed today's reset, get tomorrow's
    let resetTime = resetToday;
    if (now >= resetToday) {
        resetTime = new Date(resetToday.getTime() + 24 * 60 * 60 * 1000);
    }

    const diff = resetTime.getTime() - now.getTime();

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { hours, minutes, resetTime };
}

/**
 * Calculate time until next weekly reset (Tuesday 8:00 AM UTC)
 */
export function getTimeUntilWeeklyReset() {
    const now = new Date();

    // Find next Tuesday 8:00 AM UTC
    let daysUntilTuesday = (2 - now.getUTCDay() + 7) % 7;

    // Check if we're on Tuesday but past reset time
    if (daysUntilTuesday === 0 && (now.getUTCHours() > 8 || (now.getUTCHours() === 8 && now.getUTCMinutes() >= 0))) {
        daysUntilTuesday = 7; // Already past reset today
    }
    // If it's before 8 AM on Tuesday, daysUntilTuesday is still 0 which is correct

    const resetTime = new Date(now);
    resetTime.setUTCDate(now.getUTCDate() + daysUntilTuesday);
    resetTime.setUTCHours(8, 0, 0, 0);

    const diff = resetTime.getTime() - now.getTime();

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes, resetTime };
}

/**
 * Get today's date key for daily progress tracking
 */
export function getDailyKey() {
    const now = new Date();
    const resetHour = 15; // 3 PM UTC

    // If before reset, use previous day's key
    if (now.getUTCHours() < resetHour) {
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        return yesterday.toISOString().split('T')[0];
    }
    return now.toISOString().split('T')[0];
}

/**
 * Get current week's Monday as key for weekly progress tracking
 */
export function getWeeklyKey() {
    const now = new Date();

    // Adjust for Tuesday reset at 8 AM UTC
    const resetHour = 8;
    const dayOfWeek = now.getUTCDay();
    const hour = now.getUTCHours();

    // If it's before Tuesday 8 AM, we're still in last week
    let adjustedNow = new Date(now);
    if (dayOfWeek < 2 || (dayOfWeek === 2 && hour < resetHour)) {
        adjustedNow = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Find the Tuesday of this reset week
    const day = adjustedNow.getUTCDay();
    const diff = adjustedNow.getUTCDate() - day + 2; // 2 = Tuesday
    const tuesday = new Date(adjustedNow);
    tuesday.setUTCDate(diff);

    return tuesday.toISOString().split('T')[0];
}
