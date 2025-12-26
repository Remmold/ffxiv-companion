/**
 * Favorites system - stores favorite node item IDs in localStorage.
 */

const STORAGE_KEY = 'gathering-gold-favorites';

/**
 * Get all favorite item IDs.
 * @returns {Set<number>}
 */
export function getFavorites() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return new Set(JSON.parse(stored));
        }
    } catch (err) {
        console.error('Failed to load favorites:', err);
    }
    return new Set();
}

/**
 * Check if an item is favorited.
 * @param {number} itemId 
 * @returns {boolean}
 */
export function isFavorite(itemId) {
    return getFavorites().has(itemId);
}

/**
 * Toggle favorite status for an item.
 * @param {number} itemId 
 * @returns {boolean} New favorite status
 */
export function toggleFavorite(itemId) {
    const favorites = getFavorites();

    if (favorites.has(itemId)) {
        favorites.delete(itemId);
    } else {
        favorites.add(itemId);
    }

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...favorites]));
    } catch (err) {
        console.error('Failed to save favorites:', err);
    }

    return favorites.has(itemId);
}

/**
 * Add an item to favorites.
 * @param {number} itemId 
 */
export function addFavorite(itemId) {
    const favorites = getFavorites();
    favorites.add(itemId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...favorites]));
}

/**
 * Remove an item from favorites.
 * @param {number} itemId 
 */
export function removeFavorite(itemId) {
    const favorites = getFavorites();
    favorites.delete(itemId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...favorites]));
}
