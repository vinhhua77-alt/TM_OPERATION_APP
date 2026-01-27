import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { supabase } from '../infra/supabase.client.js';
import { AccessService } from '../domain/access/access.service.js';

const router = express.Router();

/**
 * GET /api/master/stores
 * Public endpoint - Get store list for registration page
 * NO AUTHENTICATION REQUIRED
 */
router.get('/stores', async (req, res) => {
    try {
        const { data: stores, error } = await supabase
            .from('store_list')
            .select('store_code, store_name')
            .eq('active', true)
            .order('store_name');

        if (error) {
            console.error('Error fetching stores:', error);
            return res.status(500).json({
                success: false,
                message: 'Không thể tải danh sách cửa hàng'
            });
        }

        res.json({
            success: true,
            data: stores || []
        });
    } catch (error) {
        console.error('Unexpected error fetching stores:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống'
        });
    }
});

/**
 * GET /api/master/active-features
 * Get list of currently enabled feature flags (Global access for authenticated users)
 */
router.get('/active-features', authenticateToken, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('system_feature_flags')
            .select('flag_key')
            .eq('is_enabled', true);

        if (error) throw error;

        res.json({
            success: true,
            data: data.map(f => f.flag_key)
        });
    } catch (error) {
        console.error('Error fetching active features:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Tất cả routes sau đây cần authentication
router.use(async (req, res, next) => {
    await authenticateToken(req, res, next);
});

/**
 * GET /api/master/data
 * Lấy tất cả master data từ Database
 */
router.get('/data', async (req, res) => {
    try {
        const [
            { data: stores, error: errStores },
            { data: shifts, error: errShifts },
            { data: layouts, error: errLayouts },
            { data: subPositions, error: errSubPos },
            { data: checklists, error: errChecklists },
            { data: incidents, error: errIncidents },
            { data: staff, error: errStaff }
        ] = await Promise.all([
            supabase.from('store_list').select('id, store_code, store_name, active').eq('active', true),
            // [PERFORMANCE] Only select needed columns instead of SELECT *
            supabase.from('shift_master').select('shift_name, start_hour, end_hour, active').eq('active', true),
            supabase.from('layout_master').select('layout_code, sort_order, active').order('sort_order', { ascending: true }),
            supabase.from('sub_position_master').select('layout, sub_position, active'),
            supabase.from('checklist_master').select('id, checklist_id, checklist_text, layout, sort_order, active').order('sort_order', { ascending: true }),
            supabase.from('incident_master').select('incident_name, layout, active'),
            supabase.from('staff_master').select('id, staff_name, store_code, role, active').eq('active', true)
        ]);

        if (errStores || errShifts || errLayouts || errSubPos || errChecklists || errIncidents || errStaff) {
            console.error('Error fetching master data:', { errStores, errShifts, errLayouts, errSubPos, errChecklists, errIncidents, errStaff });
            return res.status(500).json({ success: false, message: 'Database error fetching master data' });
        }

        // 2. Transform Stores
        const storesData = stores.map(s => ({
            id: s.id,
            store_code: s.store_code,
            store_name: s.store_name,
            name: s.store_name // Alias for compatibility
        }));

        // 3. Transform Shifts
        const shiftsData = shifts.map(s => ({
            name: s.shift_name,
            start: s.start_hour,
            end: s.end_hour
        }));

        // 4. Transform Staff (Leaders & Staff for feedback)
        // APPLY ISOLATION: Only show staff relevant to the user's store or responsibility
        const userStoreCode = (req.user.store_code || req.user.storeCode || '').toString().trim().toUpperCase();
        const userStaffFilters = {};
        if (req.user.role === 'SM' || req.user.role === 'LEADER') {
            userStaffFilters.store_code = userStoreCode;
        } else if (req.user.responsibility && Array.isArray(req.user.responsibility) && req.user.responsibility.length > 0) {
            userStaffFilters.store_codes = req.user.responsibility.map(rc => rc.toString().trim().toUpperCase());
        }

        const filteredStaff = (staff || []).filter(s => {
            if (!s.store_code) return true; // Keep staff without store code (admin)
            const staffStore = s.store_code.toString().trim().toUpperCase();

            if (userStaffFilters.store_code) {
                return staffStore === userStaffFilters.store_code;
            }
            if (userStaffFilters.store_codes) {
                return userStaffFilters.store_codes.includes(staffStore);
            }
            return true; // ADMIN / Global OPS
        });

        const leadersData = filteredStaff
            .filter(s => s && ['LEADER', 'SM', 'ADMIN', 'OPS', 'AM'].includes(s.role?.toUpperCase()))
            .map(s => ({
                id: s.id,
                name: s.staff_name,
                store_code: s.store_code
            }));

        const staffData = filteredStaff.map(s => ({
            id: s.id,
            name: s.staff_name,
            store: s.store_code
        }));

        // 5. Transform Layouts (Heavy lifting)
        const layoutsData = {};

        // Helper to transform lists (only if active)
        const getChecklist = (layoutCode) => (checklists || [])
            .filter(ck => ck.layout === layoutCode && ck.active !== false)
            .map(ck => ({
                id: ck.checklist_id || `ck_${ck.id}`,
                text: ck.checklist_text
            }));

        const getIncidents = (layoutCode) => (incidents || [])
            .filter(ic => ic.layout === layoutCode && ic.active !== false)
            .map(ic => ic.incident_name);

        const getSubPositions = (layoutCode) => (subPositions || [])
            .filter(sp => sp.layout === layoutCode && sp.active !== false)
            .map(sp => sp.sub_position);

        // Add all layouts from layout_master (only if active)
        (layouts || []).forEach(l => {
            const layoutKey = l.layout_code;
            if (!layoutKey || l.active === false) return;
            layoutsData[layoutKey] = {
                name: l.layout_code,
                subPositions: getSubPositions(layoutKey),
                checklist: getChecklist(layoutKey),
                incidents: getIncidents(layoutKey)
            };
        });

        // SPECIAL: Add 'LEAD' layout manually if it exists in checklists but not in layout_master
        if (!layoutsData['LEAD']) {
            const leadChecklist = getChecklist('LEAD');
            if (leadChecklist.length > 0) {
                layoutsData['LEAD'] = {
                    name: 'QUẢN LÝ',
                    subPositions: [],
                    checklist: leadChecklist,
                    incidents: getIncidents('LEAD')
                };
            }
        }

        const masterData = {
            stores: storesData || [],
            leaders: leadersData || [],
            shifts: shiftsData || [],
            layouts: layoutsData || {},
            areas: (layouts || []).filter(l => l.active !== false).map(l => l.layout_code).filter(Boolean),
            staff: staffData || [],
            leaderChecklist: (checklists || []).filter(c => c.layout === 'LEAD').map(c => c.checklist_text),
            leaderIncidents: (incidents || []).filter(i => i.layout === 'LEAD').map(i => i.incident_name)
        };

        res.json({
            success: true,
            data: masterData
        });

    } catch (error) {
        console.error('Unexpected error in master data:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

export default router;
