/**
 * SHIFT SERVICE
 * Domain logic cho Shift Log
 * Sử dụng Google Sheet làm backend
 */

import { AccessControlService } from '../access/access.control.service.js';
import { BaseRepository } from '../../infra/base.repository.js';

export class ShiftService {
  /**
   * Submit shift log
   */
  static async submit(user, requestId, payload) {
    // 1. GÁC CỔNG: Kiểm tra quyền
    await AccessControlService.assertPermission(user, 'SHIFT_LOG_SUBMIT');

    // 2. NGHIỆP VỤ: Validate dữ liệu
    if (!payload.storeId || !payload.layout) {
      return {
        success: false,
        message: 'Thiếu thông tin nhà hàng hoặc khu vực.'
      };
    }

    // 3. HẠ TẦNG: Ghi dữ liệu an toàn qua BaseRepository
    try {
      return await BaseRepository.executeIdempotent(
        requestId,
        'SHIFT_CREATE',
        async () => {
          const rawShiftLogId = process.env.ID_RAW_SHIFTLOG || process.env.SPREADSHEET_ID;
          
          const rowData = [
            new Date().toISOString(),
            'v1.0.0',
            payload.storeId,
            payload.date || new Date().toISOString().split('T')[0],
            payload.staffId || user.staff_id,
            payload.staffName || user.staff_name,
            payload.role || user.role,
            payload.lead ? 'TRUE' : 'FALSE',
            payload.startTime || '',
            payload.endTime || '',
            payload.duration || '',
            payload.layout,
            payload.subPos || '',
            JSON.stringify(payload.checks || []),
            payload.incidentType || '',
            payload.incidentNote || '',
            payload.rating || '',
            JSON.stringify(payload.selectedReasons || []),
            'TRUE',
            payload.photoUrl || ''
          ];

          // Ghi vào RAW_SHIFTLOG sheet
          await BaseRepository.batchInsert(
            rawShiftLogId,
            'RAW_DATA',
            [rowData]
          );

          // Audit log
          await BaseRepository.audit(
            user.id,
            user.tenant_id,
            'SHIFT_CREATE',
            'shift_log',
            null,
            'success'
          );

          return {
            success: true,
            message: 'Gửi báo cáo thành công!'
          };
        }
      );
    } catch (error) {
      console.error('ShiftService.submit error:', error);
      return {
        success: false,
        message: error.message || 'Lỗi khi gửi báo cáo'
      };
    }
  }
}
