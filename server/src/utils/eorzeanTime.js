// Eorzean Time Calculation Utility
// 1 Eorzean hour = 175 real seconds
// Multiplier: 3600/175 ≈ 20.5714

const EORZEA_MULTIPLIER = 3600 / 175;

/**
 * Get the current Eorzean Time
 * @returns {{ hours: number, minutes: number, totalMinutes: number }}
 */
export function getCurrentEorzeanTime() {
    const now = Date.now();
    const eorzeaMs = now * EORZEA_MULTIPLIER;
    const eorzeaDate = new Date(eorzeaMs);

    return {
        hours: eorzeaDate.getUTCHours(),
        minutes: eorzeaDate.getUTCMinutes(),
        totalMinutes: eorzeaDate.getUTCHours() * 60 + eorzeaDate.getUTCMinutes()
    };
}

/**
 * Calculate minutes until a specific Eorzean hour
 * @param {number} targetHour - Target ET hour (0-23)
 * @returns {number} Minutes until target hour in ET
 */
export function getMinutesUntilET(targetHour) {
    const current = getCurrentEorzeanTime();
    const currentTotalMinutes = current.hours * 60 + current.minutes;
    const targetTotalMinutes = targetHour * 60;

    let diff = targetTotalMinutes - currentTotalMinutes;
    if (diff < 0) {
        diff += 24 * 60; // Add a full ET day
    }

    return diff;
}

/**
 * Check if a node is currently active or spawning within the next N ET hours
 * @param {number} spawnStart - Node spawn start hour (ET)
 * @param {number} spawnEnd - Node spawn end hour (ET)
 * @param {number} lookAheadHours - Hours to look ahead (default 4)
 * @returns {{ isActive: boolean, minutesUntilSpawn: number, status: string }}
 */
export function getNodeStatus(spawnStart, spawnEnd, lookAheadHours = 4) {
    const current = getCurrentEorzeanTime();
    const currentHour = current.hours;
    const currentMinutes = current.minutes;

    // Handle wraparound (e.g., spawn 22:00 - 02:00)
    let isActive = false;
    if (spawnEnd >= spawnStart) {
        isActive = currentHour >= spawnStart && currentHour < spawnEnd;
    } else {
        isActive = currentHour >= spawnStart || currentHour < spawnEnd;
    }

    if (isActive) {
        return {
            isActive: true,
            minutesUntilSpawn: 0,
            status: 'active'
        };
    }

    // Calculate minutes until spawn
    const minutesUntilSpawn = getMinutesUntilET(spawnStart);
    const lookAheadMinutes = lookAheadHours * 60;

    if (minutesUntilSpawn <= lookAheadMinutes) {
        return {
            isActive: false,
            minutesUntilSpawn,
            status: 'upcoming'
        };
    }

    return {
        isActive: false,
        minutesUntilSpawn,
        status: 'inactive'
    };
}

/**
 * Format ET time for display
 * @param {number} hours
 * @param {number} minutes
 * @returns {string}
 */
export function formatET(hours, minutes = 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}
