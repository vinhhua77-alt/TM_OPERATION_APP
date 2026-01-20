/**
 * DOMAIN LAYER: SHIFT SERVICE
 */
const ShiftService = {
  submit: function(requestId, payload) {
    // 1. GÁC CỔNG: Kiểm tra quyền
    AccessControlService.assertPermission("SHIFT_LOG_SUBMIT");
    
    // 2. NGHIỆP VỤ: Validate dữ liệu (Ví dụ: kiểm tra giờ giấc)
    if (!payload.storeId || !payload.layout) {
      return { success: false, message: "Thiếu thông tin nhà hàng hoặc khu vực." };
    }

    // 3. HẠ TẦNG: Ghi dữ liệu an toàn qua BaseRepository
    return BaseRepository.executeIdempotent(requestId, () => {
      const rawId = PropertiesService.getScriptProperties().getProperty('ID_RAW_SHIFTLOG');
      const ss = SpreadsheetApp.openById(rawId);
      const sh = ss.getSheetByName('RAW_DATA');
      
      const rowData = [
        new Date(), 'v7.3-STABLE', payload.storeId, new Date(),
        payload.staffId, payload.staffName, payload.role, payload.lead,
        payload.startTime, payload.endTime, payload.duration,
        payload.layout, payload.subPos, JSON.stringify(payload.checks),
        payload.incidentType, payload.incidentNote, payload.rating,
        JSON.stringify(payload.selectedReasons), true, payload.photoUrl || ''
      ];

      // Batch write thay vì appendRow để an toàn hơn
      sh.getRange(sh.getLastRow() + 1, 1, 1, rowData.length).setValues([rowData]);
      
      return { success: true, message: "Gửi báo cáo thành công!" };
    });
  }
};