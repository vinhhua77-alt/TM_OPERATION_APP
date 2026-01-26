/**
 * MASTER DATA REPOSITORY
 * CRUD operations for all master tables (store, checklist, positions, incidents, roles, shifts)
 */
import { supabase } from './supabase.client.js';

export class MasterDataRepo {
    // ==================== STORE_LIST ====================

    static async getAllStores(filters = {}) {
        let query = supabase
            .from('store_list')
            .select('*')
            .order('store_code', { ascending: true });

        if (filters.store_codes && Array.isArray(filters.store_codes)) {
            query = query.in('store_code', filters.store_codes);
        }

        const { data, error } = await query;
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
        if (filters.store_code && filters.store_code !== 'ALL') {
            query = query.or(`store_code.cs.{"${filters.store_code}"},store_code.cs.{"ALL"}`);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
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
        if (filters.store_code && filters.store_code !== 'ALL') {
            query = query.or(`store_code.cs.{"${filters.store_code}"},store_code.cs.{"ALL"}`);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
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
        if (filters.store_code && filters.store_code !== 'ALL') {
            query = query.or(`store_code.cs.{"${filters.store_code}"},store_code.cs.{"ALL"}`);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
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
        if (filters.store_code) {
            query = query.eq('store_code', filters.store_code);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
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

    // ==================== ROLE_MASTER ====================

    static async getAllRoles(filters = {}) {
        let query = supabase
            .from('role_master')
            .select('*')
            .order('role_name', { ascending: true });

        if (filters.store_code && filters.store_code !== 'ALL') {
            query = query.or(`store_code.cs.{"${filters.store_code}"},store_code.cs.{"ALL"}`);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    }

    static async createRole(roleData) {
        const { data, error } = await supabase
            .from('role_master')
            .insert([roleData])
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    static async updateRole(id, updates) {
        const { data, error } = await supabase
            .from('role_master')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    static async deleteRole(id) {
        const { error } = await supabase
            .from('role_master')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return { success: true };
    }

    // ==================== SHIFT_MASTER ====================

    static async getAllShifts(filters = {}) {
        let query = supabase
            .from('shift_master')
            .select('*')
            .order('start_hour', { ascending: true }); // Thống nhất dùng start_hour

        if (filters.store_code && filters.store_code !== 'ALL') {
            query = query.or(`store_code.cs.{"${filters.store_code}"},store_code.cs.{"ALL"}`);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    }

    static async createShift(shiftData) {
        const { data, error } = await supabase
            .from('shift_master')
            .insert([shiftData])
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    static async updateShift(id, updates) {
        const { data, error } = await supabase
            .from('shift_master')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    static async deleteShift(id) {
        const { error } = await supabase
            .from('shift_master')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return { success: true };
    }
    // ==================== TENANTS ====================
    static async getAllTenants() {
        const { data, error } = await supabase
            .from('tenants')
            .select('*')
            .order('tenant_name', { ascending: true });
        if (error) throw error;
        return data || [];
    }

    static async createTenant(tenantData) {
        const { data, error } = await supabase
            .from('tenants')
            .insert([tenantData])
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    static async updateTenant(id, updates) {
        const { data, error } = await supabase
            .from('tenants')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    static async deleteTenant(id) {
        const { error } = await supabase
            .from('tenants')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return { success: true };
    }

    // ==================== BRANDS ====================
    static async getAllBrands() {
        const { data, error } = await supabase
            .from('brands')
            .select('*')
            .order('brand_name', { ascending: true });
        if (error) throw error;
        return data || [];
    }

    static async createBrand(brandData) {
        const { data, error } = await supabase
            .from('brands')
            .insert([brandData])
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    static async updateBrand(id, updates) {
        const { data, error } = await supabase
            .from('brands')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    static async deleteBrand(id) {
        const { error } = await supabase
            .from('brands')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return { success: true };
    }
}
