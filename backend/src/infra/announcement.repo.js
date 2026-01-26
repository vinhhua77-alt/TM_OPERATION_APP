/**
 * ANNOUNCEMENT REPOSITORY
 * Database operations for announcements
 */
import { supabase } from './supabase.client.js';

export class AnnouncementRepo {
    /**
     * Get all announcements (with filters)
     */
    static async getAll(filters = {}) {
        let query = supabase
            .from('announcements')
            .select('*')
            .order('created_at', { ascending: false });

        if (filters.priority) query = query.eq('priority', filters.priority);
        if (filters.category) query = query.eq('category', filters.category);
        if (filters.active !== undefined) query = query.eq('active', filters.active);

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    }

    /**
     * Get announcements for a specific staff member
     */
    static async getForStaff(staffId, storeCode) {
        const now = new Date().toISOString();

        const { data, error } = await supabase
            .from('announcements')
            .select('*')
            .eq('active', true)
            .lte('start_date', now)
            .or(`end_date.is.null,end_date.gte.${now}`)
            .order('priority', { ascending: true }) // CRITICAL first
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Filter by targeting logic
        const filtered = (data || []).filter(ann => {
            if (ann.target_type === 'ALL') return true;
            if (ann.target_type === 'STORES') {
                return ann.target_stores && ann.target_stores.includes(storeCode);
            }
            if (ann.target_type === 'STAFF') {
                return ann.target_staff && ann.target_staff.includes(staffId);
            }
            return false;
        });

        return filtered;
    }

    /**
     * Get unread announcements for staff
     */
    static async getUnreadForStaff(staffId, storeCode) {
        const allAnnouncements = await this.getForStaff(staffId, storeCode);

        // Get read announcement IDs
        const { data: reads } = await supabase
            .from('announcement_reads')
            .select('announcement_id')
            .eq('staff_id', staffId);

        const readIds = new Set((reads || []).map(r => r.announcement_id));

        return allAnnouncements.filter(ann => !readIds.has(ann.id));
    }

    /**
     * Get single announcement
     */
    static async getById(id) {
        const { data, error } = await supabase
            .from('announcements')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Create announcement
     */
    static async create(announcementData) {
        const { data, error } = await supabase
            .from('announcements')
            .insert([announcementData])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Update announcement
     */
    static async update(id, updates) {
        const { data, error } = await supabase
            .from('announcements')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Delete announcement
     */
    static async delete(id) {
        const { error } = await supabase
            .from('announcements')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    }

    /**
     * Mark announcement as read
     */
    static async markAsRead(announcementId, staffId) {
        const { data, error } = await supabase
            .from('announcement_reads')
            .insert([{ announcement_id: announcementId, staff_id: staffId }])
            .select()
            .single();

        if (error && error.code !== '23505') throw error; // Ignore duplicate key error
        return data || { announcement_id: announcementId, staff_id: staffId };
    }

    /**
     * Get read statistics for announcement
     */
    static async getReadStats(announcementId) {
        const { data, error } = await supabase
            .from('announcement_reads')
            .select('staff_id, read_at')
            .eq('announcement_id', announcementId);

        if (error) throw error;
        return {
            total_reads: data?.length || 0,
            reads: data || []
        };
    }

    /**
     * Get unread count for staff
     */
    static async getUnreadCount(staffId, storeCode) {
        const unread = await this.getUnreadForStaff(staffId, storeCode);
        return unread.length;
    }
}
