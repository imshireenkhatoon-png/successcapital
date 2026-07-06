const SHEET_NAME = 'SuccessCapitalApplication';
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

  var sheet = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName("SuccessCapitalApplication");

  sheet.appendRow([
    new Date(),
    e.parameter.name,
    e.parameter.phone,
    e.parameter.email,
    e.parameter.city,
    e.parameter.occupation,
    e.parameter.plan,
    e.parameter.amount,
    e.parameter.paymentScreenshotName,
    e.parameter.status
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
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
