/**
 * PASSWORD RESET SERVICE
 * Xử lý quên mật khẩu và reset mật khẩu
 * Refactored to remove legacy Google Sheets dependencies
 */

import { UserRepo } from '../../infra/user.repo.supabase.js';
import bcrypt from 'bcryptjs';
// import crypto from 'crypto';

export class PasswordResetService {
  /**
   * Gửi email reset password
   */
  static async requestReset(staffId) {
    // TEMPORARILY DISABLED due to migration
    return {
      success: false,
      message: 'Tính năng đang bảo trì trong quá trình chuyển đổi hệ thống.'
    };
  }

  /**
   * Reset password với token
   */
  static async resetPassword(staffId, token, newPassword) {
    // TEMPORARILY DISABLED due to migration
    return {
      success: false,
      message: 'Tính năng đang bảo trì trong quá trình chuyển đổi hệ thống.'
    };
  }
}
