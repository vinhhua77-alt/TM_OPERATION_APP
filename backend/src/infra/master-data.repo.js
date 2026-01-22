/**
 * MASTER DATA REPOSITORY
 * CRUD operations for all master tables (store, checklist, positions, incidents)
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://gsauyvtmaoegggubzuni.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export class MasterDataRepo {
    // ==================== STORE_LIST ====================

    static async getAllStores() {
        const { data, error } = await supabase
            .from('store_list')
            .select('*')
            .order('store_code', { ascending: true });
        if (error) throw error;
        return data || [];
    }

    static async getStore(storeCode) {
        const { data, error } = await supabase
            .from('store_list')
            .select('*')
            .eq('store_code', storeCode)
            .single();
        if (error) throw error;
        return data;
    }

    static async createStore(storeData) {
        const { data, error } = await supabase
            .from('store_list')
            .insert([storeData])
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    static async updateStore(storeCode, updates) {
        const { data, error } = await supabase
            .from('store_list')
            .update(updates)
            .eq('store_code', storeCode)
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    static async deleteStore(storeCode) {
        const { error } = await supabase
            .from('store_list')
            .delete()
            .eq('store_code', storeCode);
        if (error) throw error;
        return { success: true };
    }

    // ==================== CHECKLIST_MASTER ====================

    static async getAllChecklists(filters = {}) {
        let query = supabase
            .from('checklist_master')
            .select('*')
            .order('sort_order', { ascending: true });

        if (filters.layout) {
            query = query.eq('layout', filters.layout);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    }

    static async getChecklist(id) {
        const { data, error } = await supabase
            .from('checklist_master')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    }

    static async createChecklist(checklistData) {
        const { data, error } = await supabase
            .from('checklist_master')
            .insert([checklistData])
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    static async updateChecklist(id, updates) {
        const { data, error } = await supabase
            .from('checklist_master')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    static async deleteChecklist(id) {
        const { error } = await supabase
            .from('checklist_master')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return { success: true };
    }

    // ==================== SUB_POSITION_MASTER ====================

    static async getAllPositions(filters = {}) {
        let query = supabase
            .from('sub_position_master')
            .select('*')
            .order('layout', { ascending: true });

        if (filters.layout) {
            query = query.eq('layout', filters.layout);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    }

    static async getPosition(id) {
        const { data, error } = await supabase
            .from('sub_position_master')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    }

    static async createPosition(positionData) {
        const { data, error } = await supabase
            .from('sub_position_master')
            .insert([positionData])
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    static async updatePosition(id, updates) {
        const { data, error } = await supabase
            .from('sub_position_master')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    static async deletePosition(id) {
        const { error } = await supabase
            .from('sub_position_master')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return { success: true };
    }

    // ==================== INCIDENT_MASTER ====================

    static async getAllIncidents(filters = {}) {
        let query = supabase
            .from('incident_master')
            .select('*')
            .order('layout', { ascending: true });

        if (filters.layout) {
            query = query.eq('layout', filters.layout);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    }

    static async getIncident(id) {
        const { data, error } = await supabase
            .from('incident_master')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    }

    static async createIncident(incidentData) {
        const { data, error } = await supabase
            .from('incident_master')
            .insert([incidentData])
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    static async updateIncident(id, updates) {
        const { data, error } = await supabase
            .from('incident_master')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    static async deleteIncident(id) {
        const { error } = await supabase
            .from('incident_master')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return { success: true };
    }

    // ==================== LAYOUT_MASTER ====================

    static async getAllLayouts(filters = {}) {
        let query = supabase
            .from('layout_master')
            .select('*')
            .order('sort_order', { ascending: true });

        if (filters.active !== undefined) {
            query = query.eq('active', filters.active);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    }

    static async getLayout(id) {
        const { data, error } = await supabase
            .from('layout_master')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    }

    static async createLayout(layoutData) {
        const { data, error } = await supabase
            .from('layout_master')
            .insert([layoutData])
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    static async updateLayout(id, updates) {
        const { data, error } = await supabase
            .from('layout_master')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    static async deleteLayout(id) {
        const { error } = await supabase
            .from('layout_master')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return { success: true };
    }
}
