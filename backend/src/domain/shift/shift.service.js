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
      console.log('Shift submit - user:', JSON.stringify(user, null, 2));

      // 1. Validate required fields
      if (!payload.storeId || !payload.layout) {
        return {
          success: false,
          message: 'Thiếu thông tin nhà hàng hoặc khu vực.'
        };
      }

      // 2. Check if staff already submitted shifts today (max 2 for split shifts)
      const today = payload.date || new Date().toISOString().split('T')[0];
      const staffId = payload.staffId || user.id || user.staff_id;

      const { data: existingShifts, error: checkError } = await supabase
        .from('raw_shiftlog')
        .select('id, start_time, end_time, created_at')
        .eq('staff_id', staffId)
        .eq('date', today)
        .order('created_at', { ascending: false });

      if (checkError) {
        console.error('Error checking existing shifts:', checkError);
      }

      if (existingShifts && existingShifts.length >= 2) {
        return {
          success: false,
          message: '⚠️ Bạn đã gửi đủ 2 ca trong ngày! (Ca gãy tối đa 2 lần/ngày)'
        };
      }

      // Check time gap between submissions (must be >= 2 hours)
      if (existingShifts && existingShifts.length === 1) {
        const lastSubmitTime = new Date(existingShifts[0].created_at);
        const now = new Date();
        const hoursSinceLastSubmit = (now - lastSubmitTime) / (1000 * 60 * 60);

        if (hoursSinceLastSubmit < 2) {
          const minutesRemaining = Math.ceil((2 - hoursSinceLastSubmit) * 60);
          return {
            success: false,
            message: `⏰ Vui lòng đợi ${minutesRemaining} phút nữa để gửi ca thứ 2! (Cần cách nhau tối thiểu 2 giờ)`
          };
        }

        console.log(`⚠️ Staff ${staffId} đang gửi ca thứ 2 (ca gãy) cho ngày ${today} - Cách ca 1: ${hoursSinceLastSubmit.toFixed(1)}h`);
      }

      // 2. Prepare data for raw_shiftlog table
      // Handle lead field: convert string values to boolean
      // 'no_lead' or empty string = false, any other value = true
      const isLead = payload.lead &&
        payload.lead !== 'KHÔNG CÓ LEAD' &&
        payload.lead !== 'no_lead' &&
        payload.lead !== '';

      const shiftData = {
        version: 'v2.0.0',
        store_id: payload.storeId,
        date: payload.date || new Date().toISOString().split('T')[0],
        staff_id: payload.staffId || user.id || user.staff_id,
        staff_name: payload.staffName || user.staff_name || user.name || 'Unknown',
        role: payload.role || user.role || 'STAFF',
        lead: isLead, // Boolean: true if there's a lead
        start_time: payload.startTime || '',
        end_time: payload.endTime || '',
        duration: parseFloat(payload.duration) || 0,
        layout: payload.layout || 'Unknown', // Updated to include default
        sub_pos: payload.subPos || '',
        checks: typeof payload.checks === 'string' ? payload.checks : JSON.stringify(payload.checks || {}),
        incident_type: payload.incidentType || '',
        // Sanitize incident notes
        incident_note: Sanitizer.sanitizeText(payload.incidentNote || ''),
        improvement_note: Sanitizer.sanitizeText(payload.improvementNote || ''),
        rating: payload.rating || 0, // Updated to include default
        selected_reasons: typeof payload.selectedReasons === 'string' ? payload.selectedReasons : JSON.stringify(payload.selectedReasons || []),
        is_valid: true,
        photo_url: payload.photoUrl || '',
        created_at: new Date().toISOString()
      };

      console.log('Shift submit - prepared data:', JSON.stringify(shiftData, null, 2));

      // 3. Insert into raw_shiftlog (append-only)
      const { data, error } = await supabase
        .from('raw_shiftlog')
        .insert([shiftData])
        .select();

      if (error) {
        console.error('Error inserting shift log:', error);
        throw error;
      }

      console.log('Shift log inserted successfully:', data);

      // --- V3 DECISION ENGINE INTEGRATION ---
      try {
        // 4. Log Raw Event (Append-only Fact)
        const rawEvent = await SignalService.logRawEvent(
          'SHIFT_LOG',
          shiftData,
          staffId,
          payload.storeId
        );

        if (rawEvent) {
          // 5. Extract Operational Signals (Flags)
          await SignalService.extractFromShiftLog(rawEvent.id, shiftData);
        }
      } catch (v3Error) {
        console.error('V3 Decision Engine Integration Error (Non-blocking):', v3Error);
      }
      // --------------------------------------

      return {
        success: true,
        message: 'Gửi báo cáo thành công!',
        data: data[0]
      };

    } catch (error) {
      console.error('ShiftService.submit error:', error);
      return {
        success: false,
        message: error.message || 'Lỗi khi gửi báo cáo'
      };
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
