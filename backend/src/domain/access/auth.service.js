/**
 * AUTH SERVICE
 * Logic đăng nhập, xác thực
 * Sử dụng Google Sheets làm backend
 */

import { UserRepo } from '../../infra/user.repo.supabase.js';
import { AuditRepo } from '../../infra/audit.repo.js';
import { LoginAttemptRepo } from '../../infra/login_attempt.repo.js'; // Import Repo
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export class AuthService {
  /**
   * Xử lý logic đăng nhập bằng Mã Nhân Viên + Password
   * @param {string} staffId - Mã nhân viên
   * @param {string} password - Mật khẩu
   * @param {Object} context - Context info (ip, userAgent) for logging
   */
  static async login(staffId, password, context = {}) {
    const { ip, userAgent } = context;
    let user = null;

    try {
      // 0. CHECK ACCOUNT LOCKOUT STATUS
      const loginAttempt = await LoginAttemptRepo.get(staffId);
      if (loginAttempt?.locked_until) {
        const lockedUntil = new Date(loginAttempt.locked_until);
        if (lockedUntil > new Date()) {
          const remainingMinutes = Math.ceil((lockedUntil - new Date()) / 60000);

          await AuditRepo.log({
            userId: null, // User might not be resolved yet, or use staffId if possible
            action: 'LOGIN_BLOCKED_LOCKED',
            resourceType: 'auth',
            details: { staffId, remainingMinutes },
            ip,
            userAgent
          });

          return {
            success: false,
            message: `Tài khoản tạm thời bị khóa do nhập sai nhiều lần. Vui lòng thử lại sau ${remainingMinutes} phút.`
          };
        }
      }

      // 1. Truy vấn thông tin user từ Repository
      user = await UserRepo.getByStaffId(staffId);

      // 2. Kiểm tra sự tồn tại của tài khoản
      if (!user) {
        // Log failed attempt (unknown user)
        // Record failure for IP/Unknown ID? (Optional, but good for anti-brute force on non-existent accounts)
        // For now, we only track by valid staff_id structure or just return generic.

        await AuditRepo.log({
          userId: null,
          action: 'LOGIN_FAILED',
          resourceType: 'auth',
          details: { reason: 'User not found', staffId },
          ip,
          userAgent
        });

        return {
          success: false,
          message: 'Mã nhân viên không tồn tại trong hệ thống.'
        };
      }

      // 3. Kiểm tra trạng thái PENDING (Chờ duyệt)
      if (user.status === 'PENDING') {
        await AuditRepo.log({
          userId: user.id,
          action: 'LOGIN_FAILED',
          resourceType: 'auth',
          details: { reason: 'User pending approval' },
          ip,
          userAgent
        });

        return {
          success: false,
          message: 'Tài khoản của bạn đang chờ duyệt từ quản lý. Vui lòng liên hệ Store Manager để được kích hoạt.'
        };
      }

      // 4. Kiểm tra Kill Switch (Trạng thái hoạt động)
      if (!user.active) {
        await AuditRepo.log({
          userId: user.id,
          action: 'LOGIN_FAILED',
          resourceType: 'auth',
          details: { reason: 'User disabled' },
          ip,
          userAgent
        });

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
        // RECORD FAILURE
        const attempt = await LoginAttemptRepo.recordFailure(staffId, ip);
        const MAX_ATTEMPTS = 5;

        if (attempt && attempt.attempt_count >= MAX_ATTEMPTS) {
          // LOCK ACCOUNT
          await LoginAttemptRepo.lockAccount(staffId, 15); // Lock for 15 mins

          await AuditRepo.log({
            userId: user.id,
            action: 'ACCOUNT_LOCKED',
            resourceType: 'auth',
            details: { attempts: attempt.attempt_count },
            ip,
            userAgent
          });

          return {
            success: false,
            message: 'Tài khoản đã bị khóa 15 phút do nhập sai mật khẩu quá 5 lần.'
          };
        }

        await AuditRepo.log({
          userId: user.id,
          action: 'LOGIN_FAILED',
          resourceType: 'auth',
          details: { reason: 'Invalid password', attempts: attempt?.attempt_count },
          ip,
          userAgent
        });

        const remaining = MAX_ATTEMPTS - (attempt?.attempt_count || 0);
        return {
          success: false,
          message: `Mật khẩu không đúng. Bạn còn ${remaining} lần thử trước khi bị khóa.`
        };
      }

      // LOGIN SUCCESS: Clear attempts
      await LoginAttemptRepo.clear(staffId);

      // 5. Tạo JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, staffId: user.staff_id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Log success
      await AuditRepo.log({
        userId: user.id,
        action: 'LOGIN_SUCCESS',
        resourceType: 'auth',
        details: { staffId: user.staff_id },
        ip,
        userAgent
      });

      // 6. Check for pending approvals count for Manager notification
      let pendingApprovals = 0;
      if (['ADMIN', 'IT', 'OPS', 'SM'].includes(user.role)) {
        const filter = { status: 'PENDING' };
        if (user.role === 'SM') {
          filter.store_code = user.store_code;
        }
        const pendingList = await UserRepo.getAllStaff(filter);
        pendingApprovals = pendingList.length;
      }

      // 7. Trả về thông tin user và token
      return {
        success: true,
        token,
        user: {
          id: user.id,
          staff_id: user.staff_id,
          name: user.staff_name,
          role: user.role,
          storeCode: user.store_code,
          pendingApprovals // Popup logic use this
        }
      };
    } catch (error) {
      console.error('AuthService.login error:', error);

      // Log system error if user is known
      if (user) {
        await AuditRepo.log({
          userId: user.id,
          action: 'LOGIN_ERROR',
          resourceType: 'auth',
          details: { error: error.message },
          ip,
          userAgent
        });
      }

      return {
        success: false,
        message: 'Hệ thống đang bận, vui lòng thử lại sau.'
      };
    }
  }
}
