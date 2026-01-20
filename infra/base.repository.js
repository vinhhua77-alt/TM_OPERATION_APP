/**
 * TRÁI TIM HỆ THỐNG - CHỐNG TRANH CHẤP DỮ LIỆU
 */
const BaseRepository = {
  /**
   * Thực hiện ghi dữ liệu an toàn (Idempotent + Lock)
   */
  executeIdempotent: function(requestId, actionFn) {
    const lock = LockService.getScriptLock();
    try {
      // 1. Chờ tối đa 30s để lấy quyền ghi
      lock.waitLock(30000); 

      // 2. Kiểm tra requestId (Chống trùng)
      if (this._isDuplicate(requestId)) {
        return { success: false, message: "Yêu cầu đang xử lý hoặc đã tồn tại." };
      }

      // 3. Thực hiện nghiệp vụ chính
      const result = actionFn();

      // 4. Lưu vết requestId và Audit log
      this._saveIdempotency(requestId);
      
      return result;
    } catch (e) {
      Logger.log("Lỗi ghi dữ liệu: " + e.message);
      return { success: false, message: e.message };
    } finally {
      lock.releaseLock();
    }
  },

  _isDuplicate: function(id) {
    // Logic check trong sheet IDEMPOTENT_REQUESTS
    return false; // Tạm thời trả về false để anh test
  },

  _saveIdempotency: function(id) {
    // Lưu ID vào sheet để lần sau không ghi trùng
  }
};