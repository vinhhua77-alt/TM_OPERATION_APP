/**
 * DOMAIN SERVICE: REGISTER SERVICE
 * Chịu trách nhiệm: Tiếp nhận và xử lý đăng ký nhân viên mới.
 */
const RegisterService = {
  
  /**
   * Đăng ký nhân viên mới
   * @param {Object} formData - Dữ liệu từ form đăng ký (id, name, email, storeId)
   */
  register: function(formData) {
    try {
      // 1. GÁC CỔNG: Kiểm tra trạng thái hệ thống (Kill Switch toàn cục nếu cần)
      // Trong Phase 1, ta cho phép mọi email truy cập trang Register để tạo tài khoản
      
      // 2. VALIDATE NGHIỆP VỤ: Kiểm tra định dạng mã nhân viên
      const tmRegex = /^TM\d{4}$/;
      if (!tmRegex.test(formData.id)) {
        return { success: false, message: "Mã nhân viên không đúng định dạng TMxxxx (Ví dụ: TM0001)." };
      }

      // 3. KIỂM TRA TRÙNG LẶP: Gọi Repository để check ID và Email đã tồn tại chưa
      // Lưu ý: UserRepo cần hàm checkDuplicate (sẽ bổ sung bên dưới)
      const isDuplicate = UserRepo.checkExists(formData.id, formData.email);
      if (isDuplicate) {
        return { success: false, message: "Mã nhân viên hoặc Email này đã được đăng ký trước đó." };
      }

      // 4. GHI DỮ LIỆU AN TOÀN: Qua BaseRepository để tránh tranh chấp
      const requestId = "REG_" + formData.id + "_" + new Date().getTime();
      
      return BaseRepository.executeIdempotent(requestId, () => {
        const ssId = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID") 
                     || SpreadsheetApp.getActiveSpreadsheet().getId();
        const ss = SpreadsheetApp.openById(ssId);
        const sh = ss.getSheetByName('STAFF_MASTER');

        const rowData = [
          formData.id,      // staff_id
          formData.name,    // staff_name
          formData.email,   // email
          formData.storeId, // store_code
          true,             // active (mặc định cho phép login nhưng status là PENDING)
          'STAFF',          // role mặc định
          'PENDING',        // status chờ duyệt
          new Date()        // ngày đăng ký
        ];

        sh.getRange(sh.getLastRow() + 1, 1, 1, rowData.length).setValues([rowData]);

        // 5. AUDIT LOG: Lưu vết hành động đăng ký
        this._logAudit(formData.id, 'REGISTER', 'PENDING');

        return { success: true, message: "Đăng ký thành công! Vui lòng chờ quản trị viên duyệt tài khoản." };
      });

    } catch (e) {
      Logger.log("Lỗi RegisterService.register: " + e.toString());
      return { success: false, message: "Lỗi hệ thống: " + e.message };
    }
  },

  _logAudit: function(staffId, action, status) {
    // Tận dụng hàm audit cũ của anh hoặc gọi AuditRepo (nếu đã tạo)
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sh = ss.getSheetByName('STAFF_AUDIT_LOG');
      sh.appendRow([new Date(), staffId, action, '', status, 'GUEST_REG']);
    } catch(e) {}
  }
};