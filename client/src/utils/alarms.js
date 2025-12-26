/**
 * Node alarm system - stores nodes to alert when they become active.
 * Uses localStorage for persistence.
 */

const STORAGE_KEY = 'gathering-gold-alarms';

/**
 * Get all node IDs with alarms enabled.
 * @returns {Set<number>}
 */
export function getAlarms() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return new Set(JSON.parse(stored));
        }
    } catch (err) {
        console.error('Failed to load alarms:', err);
    }
    return new Set();
}

/**
 * Check if alarm is enabled for a node.
 * @param {number} itemId 
 * @returns {boolean}
 */
export function hasAlarm(itemId) {
    return getAlarms().has(itemId);
}

/**
 * Toggle alarm for a node.
 * @param {number} itemId 
 * @returns {boolean} New alarm status
 */
export function toggleAlarm(itemId) {
    const alarms = getAlarms();

    if (alarms.has(itemId)) {
        alarms.delete(itemId);
    } else {
        alarms.add(itemId);
    }

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...alarms]));
    } catch (err) {
        console.error('Failed to save alarms:', err);
    }

    return alarms.has(itemId);
}

/**
 * Play a soft alarm sound.
 * Uses Web Audio API to create a gentle chime.
 */
export function playAlarmSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Create a softer, more pleasant chime
        const playTone = (freq, startTime, duration) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = freq;
            oscillator.type = 'sine';

            // Soft attack and decay
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

            oscillator.start(startTime);
            oscillator.stop(startTime + duration);
        };

        const now = audioContext.currentTime;

        // Play a gentle two-tone chime
        playTone(659.25, now, 0.3);       // E5
        playTone(783.99, now + 0.15, 0.4); // G5

    } catch (err) {
        console.warn('Could not play alarm sound:', err);
    }
}

/**
 * Check if any newly active nodes should trigger alarm.
 * @param {number[]} newlyActiveIds - Item IDs that just became active
 * @returns {Object[]} Nodes that should trigger alarm
 */
export function checkAlarms(newlyActiveIds) {
    const alarms = getAlarms();
    return newlyActiveIds.filter(id => alarms.has(id));
}
