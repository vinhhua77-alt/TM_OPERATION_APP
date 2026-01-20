/**
 * DOMAIN LAYER: SHIFT QUERY
 * Chuyển đổi logic getMasterData cũ của anh vào đây
 */
const ShiftQuery = {
  getMasterData: function() {
    // Luôn check quyền xem dữ liệu
    AccessControlService.assertPermission("VIEW_MASTER_DATA");
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    // ... Giữ nguyên logic loop qua các sheet của anh ở đây ...
    // Nhưng hãy return về Object sạch cho UI
    return {
      stores: this._getStores(ss),
      layouts: this._getLayouts(ss),
      shifts: this._getShifts(ss)
    };
  },
  
  _getShifts: function(ss) {
     // Logic forceHHmm của anh đưa vào đây làm private helper
  }
};