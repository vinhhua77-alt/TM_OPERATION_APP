/**
 * DOMAIN SERVICE: ACCESS CONTROL
 * Quy tắc: Không hardcode quyền. Permission = Data.
 */
const AccessControlService = {
  
  /**
   * Kiểm tra quyền và Kill Switch. 
   * Nếu không đạt, sẽ ngắt mọi xử lý ngay lập tức.
   */
  assertPermission: function(permissionCode) {
    const user = this.getCurrentUser();
    
    // 1. Kiểm tra Kill Switch (User bị khóa)
    if (!user || user.active === false) {
      throw new Error("TÀI KHOẢN CỦA BẠN ĐÃ BỊ KHÓA HOẶC CHƯA ĐƯỢC CẤP QUYỀN.");
    }

    // 2. Kiểm tra quyền hạn dựa trên Data (Role -> Permission mapping)
    const hasPermission = this._checkPermissionData(user.role, permissionCode);
    if (!hasPermission) {
      throw new Error(`BẠN KHÔNG CÓ QUYỀN THỰC HIỆN HÀNH ĐỘNG: ${permissionCode}`);
    }

    return true;
  },

  /**
   * Lấy thông tin user hiện hành từ context an toàn
   */
  getCurrentUser: function() {
    const email = Session.getActiveUser().getEmail();
    // Logic này sẽ gọi sang UserRepository để tìm theo Gmail
    return UserRepo.getByEmail(email); 
  },

  /**
   * Logic nội bộ tra cứu bảng Role_Master/Permissions
   */
  _checkPermissionData: function(role, code) {
    // Phase 1: Mọi người đều có quyền xem (Để anh test UI)
    // Phase 2: Sẽ query thực tế vào sheet PERMISSION_MAPPING
    return true; 
  }
};