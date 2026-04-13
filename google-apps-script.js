// ============================================================
// B'My Lead Capture — Google Apps Script
// ============================================================
// HƯỚNG DẪN:
// 1. Mở Google Sheets → tạo sheet mới tên "B'My Leads"
// 2. Đặt header row 1: Name | Phone | Email | Date | Source
// 3. Vào Extensions → Apps Script
// 4. Xóa hết code mặc định, paste toàn bộ code này vào
// 5. Click Deploy → New deployment → Web app
//    - Execute as: Me
//    - Who has access: Anyone
// 6. Copy URL deployment → thay vào GOOGLE_SHEET_URL trong index.html
// ============================================================

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    var name = e.parameter.name || '';
    var phone = e.parameter.phone || '';
    var email = e.parameter.email || '';
    var date = e.parameter.date || new Date().toISOString();
    var source = e.parameter.source || 'direct';

    // Append row
    sheet.appendRow([name, phone, email, date, source]);

    // Return success
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'ok', row: sheet.getLastRow() }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'B\'My Lead API is running' }))
    .setMimeType(ContentService.MimeType.JSON);
}
