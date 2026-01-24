/**
 * LEADER ROUTES
 * API endpoints cho Leader Report
 */

import express from 'express';
import { supabase } from '../infra/supabase.client.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { SignalService } from '../domain/decision/signal.service.js';

const router = express.Router();

// Tất cả routes cần authentication
router.use(async (req, res, next) => {
    await authenticateToken(req, res, next);
});

router.post('/submit', async (req, res, next) => {
    try {
        const payload = req.body;

        // Sanitize logging
        console.log(`📝 Received LEADER REPORT: Store=${payload.store_id}, Area=${payload.area_code}, Leader=${payload.leaderName}`);

        // Validation (Basic)
        if (!payload.store_id || !payload.area_code) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin bắt buộc (Chi nhánh, Khu vực)'
            });
        }

        // Format times
        const shiftStart = `${payload.startH}:${payload.startM}`;
        const shiftEnd = `${payload.endH}:${payload.endM}`;

        // Insert to Supabase
        const { data, error } = await supabase
            .from('leader_reports')
            .insert([
                {
                    leader_id: payload.leaderId,
                    leader_name: payload.leaderName,
                    store_code: payload.store_id, // Note: frontend sends store_id which maps to store_code
                    area_code: payload.area_code,
                    shift_start: shiftStart,
                    shift_end: shiftEnd,
                    has_peak: payload.has_peak,
                    has_out_of_stock: payload.has_out_of_stock,
                    has_customer_issue: payload.has_customer_issue,
                    checklist: payload.checklist,
                    observed_issue_code: payload.observed_issue_code,
                    observed_note: payload.observed_note,
                    mood: payload.mood,
                    khen_emp_id: payload.khen_emp,
                    khen_topic: payload.khen_topic,
                    nhac_emp_id: payload.nhac_emp,
                    nhac_topic: payload.nhac_topic,
                    next_shift_risk: payload.next_shift_risk,
                    next_shift_note: payload.next_shift_note,
                    improvement_initiative: payload.improvement_initiative,
                    is_confirmed: payload.confirm_all
                }
            ])
            .select();

        if (error) {
            console.error('Supabase Error:', error);
            throw new Error(error.message);
        }

        // --- V3 DECISION ENGINE INTEGRATION ---
        try {
            const reportData = data[0];
            // 1. Log Raw Event
            const rawEvent = await SignalService.logRawEvent(
                'LEADER_REPORT',
                reportData,
                payload.leaderId,
                payload.store_id
            );

            if (rawEvent) {
                // 2. Extract Signals
                await SignalService.extractFromLeaderReport(rawEvent.id, reportData);
            }
        } catch (v3Error) {
            console.error('V3 Decision Engine Integration Error (Non-blocking):', v3Error);
        }
        // --------------------------------------

        res.json({
            success: true,
            message: 'Gửi báo cáo Lead thành công',
            data: data[0]
        });
    } catch (error) {
        next(error);
    }
});

export default router;
