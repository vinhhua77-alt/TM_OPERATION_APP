import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { supabase } from '../infra/supabase.client.js';

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
        // 1. Fetch all required tables in parallel
        const [
            { data: stores, error: errStores },
            { data: shifts, error: errShifts },
            { data: layouts, error: errLayouts },
            { data: subPositions, error: errSubPos },
            { data: checklists, error: errChecklists },
            { data: incidents, error: errIncidents },
            { data: staff, error: errStaff }
        ] = await Promise.all([
            supabase.from('store_list').select('id, store_code, store_name').eq('active', true),
            supabase.from('shift_master').select('*').eq('active', true),
            supabase.from('layout_master').select('*').eq('active', true).order('sort_order', { ascending: true }),
            supabase.from('sub_position_master').select('*').eq('active', true),
            supabase.from('checklist_master').select('*').eq('active', true).order('sort_order', { ascending: true }),
            supabase.from('incident_master').select('*').eq('active', true),
            supabase.from('staff_master').select('id, staff_name, store_code, role').eq('active', true)
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
        const leadersData = staff
            .filter(s => ['LEADER', 'SM', 'ADMIN', 'OPS'].includes(s.role))
            .map(s => ({
                id: s.id, // Or s.staff_name if frontend uses name as value (checked: frontend uses name for lead in form state, but let's confirm usage)
                name: s.staff_name,
                store_code: s.store_code
            }));

        const staffData = staff.map(s => ({
            id: s.id,
            name: s.staff_name,
            store: s.store_code
        }));

        // 5. Transform Layouts (Heavy lifting)
        const layoutsData = {};

        // Define layout keys from DB (e.g., FOH, BOH) - assuming layout_id matches expected keys
        // Frontend expects keys like 'KITCHEN' mapping to 'BẾP', 'SERVICE' mapping to 'PHỤC VỤ'
        // Let's check the seed data. ui_layout_config has 'FOH', 'BOH', 'CASH', 'SUPPORT'.
        // BUT PageShiftLog.jsx seems to use 'KITCHEN' and 'SERVICE' in the previous mock.
        // Wait, the seed data says:
        // ('FOH', 'FOH', '#004AAD', 'users', 1),
        // ('BOH', 'BOH', '#10B981', 'flame', 2),
        // The previous PageShiftLog.jsx mock had:
        // "KITCHEN": { "name": "BẾP" }, "SERVICE": { "name": "PHỤC VỤ" }
        // The user said: "Hiện tại: Dữ liệu này KHÔNG lấy từ cột position hay subposition trong database. vậy lấy vào nhé! lưu ý đầy đủ tính logic"
        // This implies the frontend might need adjustment if the keys change from KITCHEN/SERVICE to FOH/BOH, OR we map them here.
        // Given the seed data is the "Truth" for 2025 structure, we should serve the dynamic keys (FOH, BOH) and frontend should likely adapt
        // OR the user accepts the new keys. 
        // Let's output what is in the DB.

        layouts.forEach(l => {
            const layoutKey = l.layout_code; // Use layout_code from layout_master

            // Filter related items
            const subPosList = subPositions
                .filter(sp => sp.layout === layoutKey)
                .map(sp => sp.sub_position);

            const checklistList = checklists
                .filter(ck => ck.layout === layoutKey)
                .map(ck => ({
                    id: ck.checklist_id || `ck_${ck.id}`,
                    text: ck.checklist_text
                }));

            const incidentList = incidents
                .filter(ic => ic.layout === layoutKey)
                .map(ic => ic.incident_name);

            layoutsData[layoutKey] = {
                name: l.layout_code, // Use layout_code for display (FOH, BOH, CASHIER)
                subPositions: subPosList,
                checklist: checklistList,
                incidents: incidentList
            };
        });

        const masterData = {
            stores: storesData,
            leaders: leadersData,
            shifts: shiftsData,
            layouts: layoutsData,
            // Extra data for Leader Report
            areas: layouts.map(l => l.layout_code), // Use layout_code (FOH, BOH, CASHIER)
            staff: staffData,
            leaderChecklist: checklists.filter(c => c.layout === 'LEAD').map(c => c.checklist_text),
            leaderIncidents: incidents.filter(i => i.layout === 'LEAD').map(i => i.incident_name)
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
