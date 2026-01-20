/**
 * INFRASTRUCTURE LAYER: USER REPOSITORY
 */
const UserRepo = {
  // Hàm 1: Lấy user theo Email
  getByEmail: function(email) {
    if (!email) return null;
    const ssId = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID") || SpreadsheetApp.getActiveSpreadsheet().getId();
    const sheet = SpreadsheetApp.openById(ssId).getSheetByName("STAFF_MASTER");
    if (!sheet) return null;

    const data = sheet.getDataRange().getValues();
    const headers = data.shift();
    const idxEmail = headers.indexOf("email");
    const userRow = data.find(row => row[idxEmail] === email);
    
    if (!userRow) return null;
    return {
      staff_id: userRow[headers.indexOf("staff_id")],
      staff_name: userRow[headers.indexOf("staff_name")],
      role: userRow[headers.indexOf("role")],
      store_code: userRow[headers.indexOf("store_code")],
      active: userRow[headers.indexOf("active")] === true || userRow[headers.indexOf("active")] === "TRUE"
    };
  }, // <--- PHẢI CÓ DẤU PHẨY Ở ĐÂY

  // Hàm 2: Kiểm tra trùng lặp (Dòng 52 anh đang bị lỗi)
  checkExists: function(staffId, email) {
    const ssId = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID") || SpreadsheetApp.getActiveSpreadsheet().getId();
    const sheet = SpreadsheetApp.openById(ssId).getSheetByName("STAFF_MASTER");
    const data = sheet.getDataRange().getValues();
    const headers = data.shift();
    
    const idxId = headers.indexOf("staff_id");
    const idxEmail = headers.indexOf("email");

    return data.some(row => 
      String(row[idxId]).toUpperCase() === String(staffId).toUpperCase() || 
      String(row[idxEmail]).toLowerCase() === String(email).toLowerCase()
    );
  }
};