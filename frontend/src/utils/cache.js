/**
 * CACHE UTILITY
 * Helper functions for localStorage caching
 */

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get cached data if valid
 * @param {string} key - Cache key
 * @returns {any|null} - Cached data or null if expired/not found
 */
export const getCachedData = (key) => {
    try {
        const cached = localStorage.getItem(key);
        if (!cached) return null;

        const { data, timestamp } = JSON.parse(cached);

        if (Date.now() - timestamp < CACHE_DURATION) {
            console.log(`✅ Cache HIT: ${key}`);
            return data;
        } else {
            console.log(`⏰ Cache EXPIRED: ${key}`);
            localStorage.removeItem(key);
            return null;
        }
    } catch (error) {
        console.error('Error reading cache:', error);
        return null;
    }
};

/**
 * Set cached data with timestamp
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 */
export const setCachedData = (key, data) => {
    try {
        localStorage.setItem(key, JSON.stringify({
            data,
            timestamp: Date.now()
        }));
        console.log(`💾 Cache SET: ${key}`);
    } catch (error) {
        console.error('Error setting cache:', error);
    }
};

/**
 * Clear specific cache or all dashboard caches
 * @param {string|null} key - Specific key or null to clear all dashboard caches
 */
export const clearCache = (key = null) => {
    if (key) {
        localStorage.removeItem(key);
        console.log(`🗑️ Cache CLEARED: ${key}`);
    } else {
        // Clear all dashboard caches
        const keys = Object.keys(localStorage);
        keys.forEach(k => {
            if (k.startsWith('dashboard_')) {
                localStorage.removeItem(k);
            }
        });
        console.log('🗑️ All dashboard caches CLEARED');
    }
};

/**
 * Get cache statistics
 * @returns {object} - Cache stats
 */
export const getCacheStats = () => {
    const keys = Object.keys(localStorage);
    const dashboardCaches = keys.filter(k => k.startsWith('dashboard_'));

    return {
        total: dashboardCaches.length,
        keys: dashboardCaches,
        size: JSON.stringify(localStorage).length // Approximate size in bytes
    };
};
