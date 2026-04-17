// ============================================================
// B'My Lead Capture — Google Apps Script
// ============================================================
// HƯỚNG DẪN TRIỂN KHAI (làm 1 lần):
// 1. Mở Google Sheets → tạo sheet mới tên "B'My Leads"
// 2. Đặt header row 1: Name | Phone | Email | Consent | ConsentTimestamp | Date | Source | Tag | UserAgent | IP
// 3. Vào Extensions → Apps Script
// 4. Xóa hết code mặc định, paste toàn bộ code này vào
// 5. Click Deploy → New deployment → Web app
//    - Description: B'My Lead Capture v1
//    - Execute as: Me (bmy.life@gmail.com)
//    - Who has access: Anyone
// 6. Copy URL deployment (dạng https://script.google.com/macros/s/AKfycb.../exec)
// 7. Thay vào GOOGLE_SHEET_URL trong index.html (line ~1230)
// 8. Deploy lại landing page (Vercel/Netlify auto-deploy khi push)
//
// Lưu ý GDPR: cột Consent + ConsentTimestamp là bằng chứng opt-in hợp pháp.
// Giữ nguyên, không xóa. Nếu khách yêu cầu xóa data (right to be forgotten),
// tìm theo email/phone và xóa row tương ứng.
// ============================================================

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Từ form landing page
    var name = (e.parameter.name || '').toString().trim();
    var phone = (e.parameter.phone || '').toString().trim();
    var email = (e.parameter.email || '').toString().trim();
    var consent = (e.parameter.consent || 'no').toString().trim();
    var consentTs = (e.parameter.consent_ts || new Date().toISOString()).toString();
    var date = (e.parameter.date || new Date().toISOString()).toString();
    var source = (e.parameter.source || 'direct').toString();

    // Validation tối thiểu — nếu thiếu data cơ bản, reject
    if (!name || !phone || !email) {
      return jsonResponse({ result: 'error', message: 'Missing required fields' });
    }
    if (consent !== 'yes') {
      return jsonResponse({ result: 'error', message: 'Consent required (GDPR)' });
    }

    // Phân tag tự động dựa trên source URL
    var tag = autoTag(source);

    // Metadata (user agent + IP không lấy được từ Apps Script — để trống)
    var userAgent = '';
    var ip = '';

    // Append row
    sheet.appendRow([name, phone, email, consent, consentTs, date, source, tag, userAgent, ip]);

    return jsonResponse({ result: 'ok', row: sheet.getLastRow(), tag: tag });

  } catch (error) {
    return jsonResponse({ result: 'error', message: error.toString() });
  }
}

function doGet(e) {
  return jsonResponse({ status: 'B\'My Lead API v1 is running', date: new Date().toISOString() });
}

// Helper: phân tag lead tự động dựa trên UTM/source
function autoTag(source) {
  var s = (source || '').toLowerCase();
  if (s.indexOf('utm_source=poster') >= 0 || s.indexOf('utm_source=qr') >= 0) return 'QR-Poster';
  if (s.indexOf('utm_source=tiktok') >= 0) return 'TikTok';
  if (s.indexOf('utm_source=instagram') >= 0 || s.indexOf('utm_source=ig') >= 0) return 'Instagram';
  if (s.indexOf('utm_source=facebook') >= 0 || s.indexOf('utm_source=fb') >= 0) return 'Facebook';
  if (s.indexOf('utm_source=youtube') >= 0 || s.indexOf('utm_source=yt') >= 0) return 'YouTube';
  if (s.indexOf('utm_source=google') >= 0 || s.indexOf('gclid=') >= 0) return 'Google-Ads';
  return 'Organic';
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
