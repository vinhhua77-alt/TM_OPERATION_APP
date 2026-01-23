import { useState, useEffect } from 'react';
import { featureFlagAPI } from '../api/featureFlags';

/**
 * useFeatureHook (v3.0)
 * Evaluates a feature flag for the current context.
 * 
 * @param {string} key - The feature flag key to check.
 * @returns {boolean} - True if the feature is enabled.
 */
export const useFeature = (key) => {
    const [flags, setFlags] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadFlags = async () => {
            try {
                const res = await featureFlagAPI.getMyFlags();
                if (res.success) {
                    setFlags(res.data);
                }
            } catch (error) {
                console.error('Failed to load feature flags:', error);
            } finally {
                setLoading(false);
            }
        };

        loadFlags();
    }, []);

    // If key is not provided, return the whole flag set
    if (!key) return { flags, loading };

    // Default to false if not found or error
    return flags[key] || false;
};
