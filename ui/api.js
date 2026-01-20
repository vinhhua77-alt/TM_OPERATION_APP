/**
 * ui/api.gs
 */
function doGet(e) {
  try {
    return HtmlService.createTemplateFromFile('ui/APP_INDEX')
      .evaluate()
      .setTitle("THÁI MẬU GROUP")
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (err) {
    return HtmlService.createHtmlOutput("<h1>LỖI HỆ THỐNG</h1><p>" + err.toString() + "</p>");
  }
}

function include(filename) {
  try {
    // Ép kiểu về nội dung thuần túy để tránh lỗi định dạng
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
  } catch (e) {
    return '';
  }
}