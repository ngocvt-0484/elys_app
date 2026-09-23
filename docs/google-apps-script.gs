// Paste this into Extensions > Apps Script on the Google Sheet that should
// collect leads, then deploy it as a Web App (see README.md "Lead form data").
// Payload shape must match src/lib/leadForm.ts's LeadFormData.

function doPost(e) {
  // Wrapped in try/catch so a bug surfaces as a readable JSON response
  // instead of a generic Google "can't open file" error page.
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Leads") || ss.getActiveSheet();

    sheet.appendRow([
      new Date(),
      data.name || "",
      data.phone || "",
      data.email || "",
      data.interest || "",
      data.note || "",
      data.source || "",
      data.locale || "",
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Optional: lets you sanity-check the deployment URL in a browser tab.
function doGet() {
  return ContentService.createTextOutput("OK");
}
