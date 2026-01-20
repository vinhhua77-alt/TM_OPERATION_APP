/**
 * AUTH SERVICE
 * Logic đăng nhập, xác thực
 * Sử dụng Google Sheets làm backend
 */

import { UserRepo } from '../../infra/user.repo.supabase.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export class AuthService {
  /**
   * Xử lý logic đăng nhập bằng Mã Nhân Viên + Password
   * @param {string} staffId - Mã nhân viên
   * @param {string} password - Mật khẩu
   */
  static async login(staffId, password) {
    try {
      // 1. Truy vấn thông tin user từ Repository
      const user = await UserRepo.getByStaffId(staffId);

      // 2. Kiểm tra sự tồn tại của tài khoản
      if (!user) {
        return {
          success: false,
          message: 'Mã nhân viên không tồn tại trong hệ thống.'
        };
      }

      // 3. Kiểm tra Kill Switch (Trạng thái hoạt động)
      if (!user.active) {
        return {
          success: false,
          message: 'Tài khoản của bạn hiện đang bị khóa. Vui lòng liên hệ bộ phận OPS.'
        };
      }

      // 4. Kiểm tra password
      if (!user.password_hash) {
        return {
          success: false,
          message: 'Tài khoản chưa được thiết lập mật khẩu. Vui lòng liên hệ quản trị viên.'
        };
      }

      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Mật khẩu không đúng.'
        };
      }

      // 5. Tạo JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, staffId: user.staff_id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // 6. Trả về thông tin user và token
      return {
        success: true,
        token,
        user: {
          id: user.id,
          staff_id: user.staff_id,
          name: user.staff_name,
          role: user.role,
          storeCode: user.store_code
        }
      };
    } catch (error) {
      console.error('AuthService.login error:', error);
      return {
        success: false,
        message: 'Hệ thống đang bận, vui lòng thử lại sau.'
      };
    }
  }
}
