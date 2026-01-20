/**
 * REGISTER SERVICE
 * Logic đăng ký nhân viên mới
 * Phien ban Supabase
 */

import { UserRepo } from '../../infra/user.repo.supabase.js';
import bcrypt from 'bcryptjs';

export class RegisterService {
  /**
   * Đăng ký nhân viên mới
   */
  static async register(formData) {
    try {
      // 1. VALIDATE NGHIỆP VỤ: Kiểm tra định dạng mã nhân viên
      const tmRegex = /^TM\d{4}$/;
      if (!tmRegex.test(formData.id)) {
        return {
          success: false,
          message: 'Mã nhân viên không đúng định dạng TMxxxx (Ví dụ: TM0001).'
        };
      }

      // 2. VALIDATE PASSWORD
      if (!formData.password || formData.password.length < 6) {
        return {
          success: false,
          message: 'Mật khẩu phải có ít nhất 6 ký tự.'
        };
      }

      // 3. VALIDATE EMAIL
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        return {
          success: false,
          message: 'Email không hợp lệ.'
        };
      }

      // 4. KIỂM TRA TRÙNG LẶP
      const isDuplicate = await UserRepo.checkExists(formData.id, formData.email);
      if (isDuplicate) {
        return {
          success: false,
          message: 'Mã nhân viên hoặc Email này đã được đăng ký trước đó.'
        };
      }

      // 5. Hash password
      const passwordHash = await bcrypt.hash(formData.password, 10);

      // 6. TẠO USER (Supabase)
      const user = await UserRepo.create({
        staff_id: formData.id,
        staff_name: formData.name,
        email: formData.email,
        password_hash: passwordHash,
        store_code: formData.storeId,
        role: 'STAFF',
        active: 1
      });

      if (!user) {
        throw new Error('Failed to create user in database');
      }

      return {
        success: true,
        message: 'Đăng ký thành công! Bạn có thể đăng nhập ngay.'
      };

    } catch (error) {
      console.error('RegisterService.register error:', error);
      return {
        success: false,
        message: `Lỗi hệ thống: ${error.message}`
      };
    }
  }
}
