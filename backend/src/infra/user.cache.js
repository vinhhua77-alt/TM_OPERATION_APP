/**
 * USER CACHE SERVICE
 * Simple in-memory LRU cache to reduce database load for authentication
 */

class UserCache {
    constructor(limit = 100, ttl = 5 * 60 * 1000) {
        this.limit = limit;
        this.ttl = ttl; // Time to live in ms (default 5 mins)
        this.cache = new Map();
    }

    get(key) {
        if (!this.cache.has(key)) return null;

        const entry = this.cache.get(key);

        // Check expiry
        if (Date.now() > entry.expiry) {
            this.cache.delete(key);
            return null;
        }

        // Refresh LRU order (delete and re-add)
        this.cache.delete(key);
        this.cache.set(key, entry);

        return entry.value;
    }

    set(key, value) {
        // Evict oldest if limit reached
        if (this.cache.size >= this.limit) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }

        this.cache.set(key, {
            value,
            expiry: Date.now() + this.ttl
        });
    }

    delete(key) {
        this.cache.delete(key);
    }

    clear() {
        this.cache.clear();
    }

    /**
     * Helper to cache user object by both ID and StaffID
     */
    cacheUser(user) {
        if (!user) return;
        if (user.id) this.set(`ID:${user.id}`, user);
        if (user.staff_id) this.set(`STAFF:${user.staff_id}`, user);
    }

    /**
     * Helper to invalidate cache for user
     */
    invalidateUser(userId, staffId) {
        if (userId) this.delete(`ID:${userId}`);
        if (staffId) this.delete(`STAFF:${staffId}`);
    }
}

// Global instance
export const userCache = new UserCache(200, 5 * 60 * 1000); // 200 users, 5 mins TTL
