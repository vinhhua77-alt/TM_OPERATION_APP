/**
 * DOMAIN SERVICE: AUTH SERVICE
 * Chịu trách nhiệm: Logic đăng nhập, xác thực phiên làm việc.
 */
const AuthService = {
  
  /**
   * Xử lý logic đăng nhập
   * @param {string} staffId - Mã nhân viên nhập từ UI
   */
  login: function(staffId) {
    try {
      // 1. Lấy email thực tế từ Session (Bảo mật tuyệt đối)
      const email = Session.getActiveUser().getEmail();
      
      // 2. Truy vấn thông tin user từ Repository
      const user = UserRepo.getByEmail(email);

      // 3. Kiểm tra sự tồn tại của tài khoản
      if (!user) {
        return { 
          success: false, 
          message: "Email này (" + email + ") chưa được đăng ký trong hệ thống Thái Mậu." 
        };
      }

      // 4. Đối soát Mã nhân viên (Tránh việc dùng máy người khác đăng nhập mã mình)
      if (String(user.staff_id).toUpperCase() !== String(staffId).toUpperCase()) {
        return { 
          success: false, 
          message: "Mã nhân viên không khớp với Email đang đăng nhập." 
        };
      }

      // 5. Kiểm tra Kill Switch (Trạng thái hoạt động)
      if (!user.active) {
        return { 
          success: false, 
          message: "Tài khoản của bạn hiện đang bị khóa. Vui lòng liên hệ bộ phận OPS." 
        };
      }

      // 6. Trả về thông tin user sạch (không kèm các dữ liệu nhạy cảm nếu có)
      return {
        success: true,
        user: {
          id: user.staff_id,
          name: user.staff_name,
          role: user.role,
          storeCode: user.store_code
        }
      };

    } catch (e) {
      Logger.log("Lỗi AuthService.login: " + e.toString());
      return { success: false, message: "Hệ thống đang bận, vui lòng thử lại sau." };
    }
  }
};