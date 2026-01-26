/**
 * GAMIFICATION REPOSITORY
 * Handle database ops for gamification and feedback
 */
import { supabase } from './supabase.client.js';

export class GamificationRepo {

    // --- GAMIFICATION STATS ---

    static async getStats(staffId) {
        const { data, error } = await supabase
            .from('staff_gamification')
            .select('*')
            .eq('staff_id', staffId)
            .single();

        if (error && error.code === 'PGRST116') return null; // Not found
        if (error) throw error;
        return data;
    }

    static async initStats(staffId) {
        const { data, error } = await supabase
            .from('staff_gamification')
            .upsert({ staff_id: staffId, current_level: 1, total_xp: 0 })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async addXP(staffId, amount) {
        // Simple atomic update function logic could be better in SQL function
        // For now, read-modify-write (safe enough for low concurrency per user)
        let stats = await this.getStats(staffId);
        if (!stats) stats = await this.initStats(staffId);

        const newXP = stats.total_xp + amount;

        // Simple Level Formula: Level = Floor(sqrt(XP/100)) or just simple thresholds
        // Let's use: Level N requires N * 1000 XP total? Or linear?
        // Let's use linear for simplicity: 1000 XP per level
        const newLevel = Math.floor(newXP / 1000) + 1;

        const { data, error } = await supabase
            .from('staff_gamification')
            .update({
                total_xp: newXP,
                current_level: newLevel,
                updated_at: new Date().toISOString()
            })
            .eq('staff_id', staffId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // --- FEEDBACK ---

    static async createFeedback(feedbackData) {
        const { data, error } = await supabase
            .from('staff_feedback')
            .insert([feedbackData])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async getRecentFeedback(staffId, limit = 5) {
        const { data, error } = await supabase
            .from('staff_feedback')
            .select('*')
            .eq('staff_id', staffId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data;
    }

    // --- AGGREGATION FOR DASHBOARD ---

    static async getDashboardMetrics(staffId) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();

        // 1. Fetch shift logs for current month to calculate hours and incidents
        const { data: shiftData, error: shiftError } = await supabase
            .from('raw_shiftlog')
            .select('duration, incident_type, incident_note')
            .eq('staff_id', staffId)
            .gte('created_at', startOfMonth)
            .lte('created_at', endOfMonth);

        if (shiftError) console.error('Error fetching shift metrics:', shiftError);

        const totalHours = shiftData?.reduce((sum, s) => sum + (parseFloat(s.duration) || 0), 0) || 0;
        const incidentCount = shiftData?.filter(s => s.incident_type && s.incident_type !== 'NONE').length || 0;

        // 2. eNPS score (Avg of last 30 days mood score)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: feedbackData } = await supabase
            .from('staff_feedback')
            .select('mood_score')
            .eq('staff_id', staffId)
            .gte('created_at', thirtyDaysAgo.toISOString());

        const avgMood = feedbackData && feedbackData.length > 0
            ? (feedbackData.reduce((a, b) => a + b.mood_score, 0) / feedbackData.length).toFixed(1)
            : 0;

        return {
            total_hours_month: totalHours.toFixed(1),
            incident_count_month: incidentCount,
            eNPS_30d: avgMood,
            feedback_count: feedbackData?.length || 0
        };
    }
}
