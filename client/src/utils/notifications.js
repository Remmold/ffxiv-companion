/**
 * Notification system for node spawn alerts.
 */

const STORAGE_KEY = 'gathering-gold-notifications-enabled';

let notificationPermission = 'default';

/**
 * Request notification permission from the user.
 * @returns {Promise<boolean>} Whether permission was granted
 */
export async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.warn('Notifications not supported');
        return false;
    }

    if (Notification.permission === 'granted') {
        notificationPermission = 'granted';
        localStorage.setItem(STORAGE_KEY, 'true');
        return true;
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        notificationPermission = permission;
        if (permission === 'granted') {
            localStorage.setItem(STORAGE_KEY, 'true');
        }
        return permission === 'granted';
    }

    return false;
}

/**
 * Check if notifications are enabled (both permission granted AND user preference on).
 * @returns {boolean}
 */
export function isNotificationsEnabled() {
    const userPreference = localStorage.getItem(STORAGE_KEY);
    const hasPermission = notificationPermission === 'granted' || Notification?.permission === 'granted';
    return hasPermission && userPreference === 'true';
}

/**
 * Set notification preference.
 * @param {boolean} enabled 
 */
export function setNotificationsPreference(enabled) {
    localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false');
}

/**
 * Show a node spawn notification.
 * @param {Object} node - The node data
 */
export function showNodeNotification(node) {
    if (!isNotificationsEnabled()) return;

    try {
        const notification = new Notification(`${node.itemName} is spawning!`, {
            body: `${node.zone} - ${node.nearestAetheryte}`,
            icon: '/favicon.svg',
            tag: `node-${node.itemId}`, // Prevents duplicate notifications
            requireInteraction: false
        });

        // Auto-close after 10 seconds
        setTimeout(() => notification.close(), 10000);

        // Play a sound (optional)
        playNotificationSound();

    } catch (err) {
        console.error('Failed to show notification:', err);
    }
}

/**
 * Play a notification sound.
 */
function playNotificationSound() {
    try {
        // Create a simple beep sound using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (err) {
        // Silently fail if audio doesn't work
    }
}

/**
 * Copy teleport macro to clipboard.
 * @param {string} aetheryte - The aetheryte name
 * @returns {Promise<boolean>} Whether copy was successful
 */
export async function copyTeleportMacro(aetheryte) {
    const macro = `/teleport ${aetheryte}`;

    try {
        await navigator.clipboard.writeText(macro);
        return true;
    } catch (err) {
        // Fallback for older browsers
        try {
            const textArea = document.createElement('textarea');
            textArea.value = macro;
            textArea.style.position = 'fixed';
            textArea.style.left = '-9999px';
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        } catch (fallbackErr) {
            console.error('Failed to copy:', fallbackErr);
            return false;
        }
    }
}
