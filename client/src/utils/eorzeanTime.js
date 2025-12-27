// Eorzean Time Calculation Utility (Client-side)
// 1 Eorzean hour = 175 real seconds
// 1 ET day = 70 real minutes
// Multiplier: 3600/175 ≈ 20.5714

const EORZEA_MULTIPLIER = 3600 / 175;
const SECONDS_PER_DAY = 24 * 60 * 60;

/**
 * Get the current Eorzean Time
 * @returns {{ hours: number, minutes: number, seconds: number }}
 */
export function getCurrentEorzeanTime() {
    // Use seconds for calculation to avoid Date object issues
    const nowSeconds = Date.now() / 1000;
    const eorzeaSeconds = nowSeconds * EORZEA_MULTIPLIER;

    // Get just the time of day portion
    const eorzeaDaySeconds = eorzeaSeconds % SECONDS_PER_DAY;

    const hours = Math.floor(eorzeaDaySeconds / 3600) % 24;
    const minutes = Math.floor((eorzeaDaySeconds % 3600) / 60);
    const seconds = Math.floor(eorzeaDaySeconds % 60);

    return { hours, minutes, seconds };
}

/**
 * Format ET time for display (12-hour AM/PM format)
 * @param {number} hours
 * @param {number} minutes
 * @returns {string}
 */
export function formatET(hours, minutes = 0) {
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
}



/**
 * Convert ET minutes to real-world time
 * @param {number} etMinutes - Eorzean minutes
 * @returns {string} - Real-world time string
 */
export function etMinutesToRealTime(etMinutes) {
    const realSeconds = (etMinutes * 60) / EORZEA_MULTIPLIER;
    const minutes = Math.floor(realSeconds / 60);
    const seconds = Math.floor(realSeconds % 60);

    if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
}
