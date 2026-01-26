/**
 * SHIFT SERVICE
 * Domain logic for Shift Log
 * Migrated to Supabase
 */

import { supabase } from '../../infra/supabase.client.js';
import { Sanitizer } from '../../utils/sanitizer.js';
import { SignalService } from '../decision/signal.service.js';

export class ShiftService {
  /**
   * Submit shift log to raw_shiftlog table
   */
  static async submit(user, payload) {
    try {
      console.log('Shift submit - received payload:', JSON.stringify(payload, null, 2));

      const userId = user.id || user.sub; // Ensure UUID

      // 1. Validate required fields
      if (!payload.storeId || !payload.layout) {
        return { success: false, message: 'Thiếu thông tin nhà hàng hoặc khu vực.' };
      }

      // --- STANDARDIZATION: STORE CODE ---
      let storeCodeToSave = payload.storeId;
      // If payload sends UUID (length > 30), resolve to Code
      if (storeCodeToSave.length > 30) {
        const { data: store } = await supabase
          .from('master_store_list') // or whatever master table
          .select('store_code')
          .eq('id', storeCodeToSave)
          .single();
        if (store) storeCodeToSave = store.store_code;
        else console.warn(`⚠️ Could not resolve Store UUID ${storeCodeToSave} to Code. Using raw value.`);
      }

      const today = payload.date || new Date().toISOString().split('T')[0];
      const staffId = userId; // Always use UUID

      // 2. Check if staff already submitted shifts today (max 2 for split shifts)
      const { data: existingShifts, error: checkError } = await supabase
        .from('raw_shiftlog')
        .select('id, start_time, end_time, created_at')
        .eq('staff_id', staffId)
        .eq('date', today)
        .order('created_at', { ascending: false });

      if (checkError) console.error('Error checking existing shifts:', checkError);

      if (existingShifts && existingShifts.length >= 2) {
        return { success: false, message: '⚠️ Bạn đã gửi đủ 2 ca trong ngày! (Ca gãy tối đa 2 lần/ngày)' };
      }

      // Check time gap between submissions (must be >= 2 hours)
      if (existingShifts && existingShifts.length === 1) {
        const lastSubmitTime = new Date(existingShifts[0].created_at);
        const now = new Date();
        const hoursSinceLastSubmit = (now - lastSubmitTime) / (1000 * 60 * 60);

        if (hoursSinceLastSubmit < 2) {
          const minutesRemaining = Math.ceil((2 - hoursSinceLastSubmit) * 60);
          return { success: false, message: `⏰ Vui lòng đợi ${minutesRemaining} phút nữa để gửi ca thứ 2! (Cần cách nhau tối thiểu 2 giờ)` };
        }
      }

      // 3. Prepare data for raw_shiftlog table
      const isLead = payload.lead && payload.lead !== 'KHÔNG CÓ LEAD' && payload.lead !== 'no_lead' && payload.lead !== '';

      const shiftData = {
        version: 'v3.0.0',
        store_id: storeCodeToSave, // ALWAYS STORE CODE
        date: today,
        staff_id: staffId, // ALWAYS UUID
        staff_name: payload.staffName || user.staff_name || user.name || 'Unknown',
        role: payload.role || user.role || 'STAFF',
        lead: isLead,
        start_time: payload.startTime || '',
        end_time: payload.endTime || '',
        duration: parseFloat(payload.duration) || 0,
        layout: payload.layout || 'Unknown',
        sub_pos: payload.subPos || '',
        checks: typeof payload.checks === 'string' ? payload.checks : JSON.stringify(payload.checks || {}),
        incident_type: payload.incidentType || '',
        incident_note: Sanitizer.sanitizeText(payload.incidentNote || ''),
        improvement_note: Sanitizer.sanitizeText(payload.improvementNote || ''),
        rating: payload.rating || 0,
        selected_reasons: typeof payload.selectedReasons === 'string' ? payload.selectedReasons : JSON.stringify(payload.selectedReasons || []),
        is_valid: true,
        photo_url: payload.photoUrl || '',
        created_at: new Date().toISOString()
      };

      console.log('Shift submit - prepared data:', JSON.stringify(shiftData, null, 2));

      // 4. Insert into raw_shiftlog (append-only)
      const { data, error } = await supabase
        .from('raw_shiftlog')
        .insert([shiftData])
        .select();

      if (error) throw error;

      console.log('Shift log inserted successfully:', data);

      // --- V3 DECISION ENGINE INTEGRATION ---
      try {
        const rawEvent = await SignalService.logRawEvent('SHIFT_LOG', shiftData, staffId, storeCodeToSave);
        if (rawEvent) await SignalService.extractFromShiftLog(rawEvent.id, shiftData);
      } catch (v3Error) {
        console.error('V3 Decision Engine Integration Error (Non-blocking):', v3Error);
      }

      return { success: true, message: 'Gửi báo cáo thành công!', data: data[0] };

    } catch (error) {
      console.error('ShiftService.submit error:', error);
      return { success: false, message: error.message || 'Lỗi khi gửi báo cáo' };
    }
  }

  /**
   * Get shift logs for a staff member
   * @param {string} staffId - Staff ID
   * @param {object} filters - Optional filters (startDate, endDate, layout)
   */
  static async getShiftLogs(staffId, filters = {}) {
    try {
      let query = supabase
        .from('raw_shiftlog')
        .select('*')
        .eq('staff_id', staffId)
        .eq('is_valid', true)
        .order('created_at', { ascending: false });

      if (filters.startDate) {
        query = query.gte('date', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('date', filters.endDate);
      }

      if (filters.layout) {
        query = query.eq('layout', filters.layout);
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        success: true,
        data: data || []
      };

    } catch (error) {
      console.error('Error fetching shift logs:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}
