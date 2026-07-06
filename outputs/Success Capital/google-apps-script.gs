const SHEET_NAME = 'Success Capital Leads';
const HEADERS = [
  'Timestamp',
  'Name',
  'Phone',
  'Email',
  'City',
  'Occupation',
  'Investment Plan',
  'Investment Amount',
  'Payment Screenshot',
  'Status'
];

function doPost(e) {
  try {
    const sheet = getLeadSheet_();
    const data = e && e.parameter ? e.parameter : {};
    const timestamp = buildTimestamp_(data.date, data.time);

    sheet.appendRow([
      timestamp,
      data.name || '',
      data.phone || '',
      data.email || '',
      data.city || '',
      data.occupation || '',
      data.plan || '',
      data.amount || '',
      data.paymentScreenshotName || '',
      data.status || 'Pending'
    ]);

    return jsonResponse_({ success: true });
  } catch (error) {
    return jsonResponse_({
      success: false,
      message: error && error.message ? error.message : 'Submission failed'
    });
  }
}

function getLeadSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  ensureHeaders_(sheet);
  return sheet;
}

function ensureHeaders_(sheet) {
  const current = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const hasHeaders = HEADERS.every((header, index) => current[index] === header);

  if (!hasHeaders) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
  }
}

function buildTimestamp_(date, time) {
  if (date && time) {
    return `${date} ${time}`;
  }

  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
