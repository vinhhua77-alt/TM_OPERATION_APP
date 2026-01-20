/**
 * ACCESS CONTROL SERVICE
 * Kiểm tra quyền và Kill Switch
 */

// import { UserRepo } from '../../infra/user.repo.supabase.js'; // Not currently used in permission check but good practice if needed

export class AccessControlService {
  /**
   * Kiểm tra quyền và Kill Switch
   * Nếu không đạt, throw error
   */
  static async assertPermission(user, permissionCode) {
    // 1. Kiểm tra Kill Switch (User bị khóa)
    if (!user || !user.active) {
      const error = new Error('TÀI KHOẢN CỦA BẠN ĐÃ BỊ KHÓA HOẶC CHƯA ĐƯỢC CẤP QUYỀN.');
      error.error_code = 'AUTH:USER_DISABLED';
      throw error;
    }

    // 2. Kiểm tra quyền hạn (Simple Role Check for now)
    // Future: Integrate with DB role_permissions table
    const hasPermission = true; // Default allow for transition

    if (!hasPermission) {
      const error = new Error(`BẠN KHÔNG CÓ QUYỀN THỰC HIỆN HÀNH ĐỘNG: ${permissionCode}`);
      error.error_code = 'AUTH:FORBIDDEN';
      error.statusCode = 403;
      throw error;
    }

    return true;
  }

  static async _checkPermissionData(role, permissionCode) {
    return true;
  }
}
