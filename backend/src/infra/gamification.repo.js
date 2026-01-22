/**
 * GAMIFICATION REPOSITORY
 * Handle database ops for gamification and feedback
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

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
        // 1. Shift Stats (Mock for now, normally join shift_logs)
        // 2. Incident Stats (Mock)
        // 3. eNPS score (Avg of last 30 days)

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
            eNPS_30d: avgMood,
            feedback_count: feedbackData?.length || 0
        };
    }
}
