/**
 * XIVAPI utility for fetching item data and icons.
 * 
 * Icon URL format: https://xivapi.com/i/{folder}/{iconId}.png
 * Where iconId is padded to 6 digits and folder is first 3 digits + "000"
 */

const XIVAPI_BASE = 'https://xivapi.com';

// Cache for icon IDs to avoid duplicate API calls
const iconCache = new Map();

/**
 * Get the icon URL for an item by its icon ID.
 * @param {number} iconId - The icon ID (e.g., 26039)
 * @returns {string} The full URL to the icon
 */
export function getIconUrl(iconId) {
    if (!iconId) return null;

    const paddedId = iconId.toString().padStart(6, '0');
    const folder = paddedId.slice(0, 3) + '000';

    return `${XIVAPI_BASE}/i/${folder}/${paddedId}.png`;
}

/**
 * Fetch item data from XIVAPI including icon.
 * @param {number} itemId - The item ID
 * @returns {Promise<{iconId: number, iconUrl: string} | null>}
 */
export async function fetchItemIcon(itemId) {
    if (iconCache.has(itemId)) {
        return iconCache.get(itemId);
    }

    try {
        const response = await fetch(`${XIVAPI_BASE}/item/${itemId}?columns=Icon,IconID`);
        if (!response.ok) return null;

        const data = await response.json();
        const result = {
            iconId: data.IconID,
            iconUrl: data.Icon ? `${XIVAPI_BASE}${data.Icon}` : null
        };

        iconCache.set(itemId, result);
        return result;
    } catch (err) {
        console.error(`Failed to fetch icon for item ${itemId}:`, err);
        return null;
    }
}

/**
 * Fetch icons for multiple items in parallel.
 * @param {number[]} itemIds - Array of item IDs
 * @returns {Promise<Map<number, string>>} Map of itemId to iconUrl
 */
export async function fetchItemIcons(itemIds) {
    const uniqueIds = [...new Set(itemIds)].filter(id => !iconCache.has(id));

    if (uniqueIds.length === 0) {
        // All items already cached
        const result = new Map();
        itemIds.forEach(id => {
            const cached = iconCache.get(id);
            if (cached?.iconUrl) {
                result.set(id, cached.iconUrl);
            }
        });
        return result;
    }

    // Batch fetch from XIVAPI (max 100 items per request)
    const result = new Map();

    try {
        const idsParam = uniqueIds.slice(0, 100).join(',');
        const response = await fetch(`${XIVAPI_BASE}/item?ids=${idsParam}&columns=ID,Icon`);

        if (response.ok) {
            const data = await response.json();

            if (data.Results) {
                data.Results.forEach(item => {
                    const iconUrl = item.Icon ? `${XIVAPI_BASE}${item.Icon}` : null;
                    iconCache.set(item.ID, { iconUrl });
                    if (iconUrl) {
                        result.set(item.ID, iconUrl);
                    }
                });
            }
        }
    } catch (err) {
        console.error('Failed to batch fetch icons:', err);
    }

    // Add cached items to result
    itemIds.forEach(id => {
        const cached = iconCache.get(id);
        if (cached?.iconUrl && !result.has(id)) {
            result.set(id, cached.iconUrl);
        }
    });

    return result;
}
