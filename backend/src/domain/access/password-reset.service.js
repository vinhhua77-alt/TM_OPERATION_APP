/**
 * PASSWORD RESET SERVICE
 * Xử lý quên mật khẩu và reset mật khẩu
 * Refactored to remove legacy Google Sheets dependencies
 */

import { UserRepo } from '../../infra/user.repo.supabase.js';
import { AuditRepo } from '../../infra/audit.repo.js'; // Import AuditRepo
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';


dotenv.config();

// SECURITY: JWT_SECRET must be set separately from SUPABASE_SERVICE_ROLE_KEY
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('CRITICAL SECURITY ERROR: JWT_SECRET environment variable is not set! Password reset tokens cannot be generated securely.');
}

const APP_URL = process.env.CORS_ORIGIN || 'https://app.vinhhua.com';

export class PasswordResetService {
  /**
   * Gửi email reset password
   */
  static async requestReset(staffId, context = {}) {
    const { ip, userAgent } = context;
    if (!staffId) return { success: false, message: 'Thiếu mã nhân viên' };

    // 1. Check user exists
    const user = await UserRepo.getByStaffId(staffId);
    if (!user) {
      return { success: false, message: 'Không tìm thấy nhân viên với mã này' };
    }

    // 2. Generate Token (Valid for 15 mins)
    const token = jwt.sign(
      { staffId: user.staff_id, email: user.email, type: 'RESET_PASSWORD' },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    // 3. Create Link
    // Default to localhost if dev, or the production URL
    // Since we don't know exact frontend URL, we guess or use relative. 
    // Ideally user provides this in env.
    const resetLink = `${APP_URL}/?token=${token}&staffId=${user.staff_id}`;

    // 4. Send Email via Nodemailer
    // Dynamic import to avoid potential circular dependency or just for clean separation
    const { EmailService } = await import('../../infra/email.service.js');
    const emailSent = await EmailService.sendResetEmail(user.email, resetLink);

    // LOGGING
    await AuditRepo.log({
      userId: user.id,
      action: 'PASSWORD_RESET_REQUESTED',
      resourceType: 'auth',
      details: { emailSent },
      ip,
      userAgent
    });

    if (emailSent) {
      return {
        success: true,
        message: `Đã gửi email reset đến ${user.email}. Vui lòng kiểm tra hộp thư (đôi khi nằm trong Spam).`
      };
    } else {
      console.log(`[FALLBACK] Reset Link for ${staffId}: ${resetLink}`);
      return {
        success: true,
        message: `Không thể gửi email (Lỗi hệ thống). Link reset tạm thời của bạn là: ${resetLink}`
      };
    }
  }

  /**
   * Reset password với token
   */
  static async resetPassword(staffId, token, newPassword, context = {}) {
    const { ip, userAgent } = context;
    if (!staffId || !token || !newPassword) {
      return { success: false, message: 'Thiếu thông tin bắt buộc' };
    }

    try {
      // 1. Verify Token
      const decoded = jwt.verify(token, JWT_SECRET);

      if (decoded.staffId !== staffId) {
        return { success: false, message: 'Token không khớp với nhân viên' };
      }

      if (decoded.type !== 'RESET_PASSWORD') {
        return { success: false, message: 'Token không hợp lệ' };
      }

      // 2. Hash Password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // 3. Update DB
      const result = await UserRepo.updatePassword(staffId, hashedPassword);

      if (!result) {
        return { success: false, message: 'Lỗi cập nhật mật khẩu vào Database' };
      }

      // LOGGING
      // Need user ID for log
      const user = await UserRepo.getByStaffId(staffId);
      if (user) {
        await AuditRepo.log({
          userId: user.id,
          action: 'PASSWORD_RESET_SUCCESS',
          resourceType: 'auth',
          ip,
          userAgent
        });
      }

      return {
        success: true,
        message: 'Đổi mật khẩu thành công! Hãy đăng nhập lại.'
      };

    } catch (error) {
      console.error('Reset Password Error:', error);
      if (error.name === 'TokenExpiredError') {
        return { success: false, message: 'Link reset đã hết hạn. Vui lòng thử lại.' };
      }
      return { success: false, message: 'Link reset không hợp lệ hoặc đã hết hạn.' };
    }
  }
}
