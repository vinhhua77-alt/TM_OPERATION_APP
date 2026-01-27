import { AccessService } from './access.service.js';

export class AccessControlService {
  /**
   * Kiểm tra quyền và Kill Switch
   * Nếu không đạt, throw error
   */
  static async assertPermission(user, featureKey, permissionCode) {
    // 1. Kiểm tra Kill Switch (User bị khóa)
    if (!user || !user.active) {
      const error = new Error('TÀI KHOẢN CỦA BẠN ĐÃ BỊ KHÓA HOẶC CHƯA ĐƯỢC CẤP QUYỀN.');
      error.error_code = 'AUTH:USER_DISABLED';
      error.statusCode = 403;
      throw error;
    }

    // 2. Nếu là IT hoặc ADMIN (hoặc đang trong SANDBOX MODE) thì luôn cho qua (Full Access)
    if (['ADMIN', 'IT'].includes(user.role) || user.is_sandbox_mode) {
      return true;
    }

    // 3. Kiểm tra quyền hạn chuẩn từ Database
    // FeatureKey có thể là null nếu chỉ check permission đơn lẻ
    const hasPermission = await AccessService.canAccess(user, featureKey || 'SYSTEM', permissionCode);

    if (!hasPermission) {
      const error = new Error(`BẠN KHÔNG CÓ QUYỀN THỰC HIỆN HÀNH ĐỘNG: ${permissionCode}`);
      error.error_code = 'AUTH:FORBIDDEN';
      error.statusCode = 403;
      throw error;
    }

    return true;
  }
}
