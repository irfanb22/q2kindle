/**
 * Renders a marketing email HTML wrapper around the provided body content.
 * Uses table-based layout with inline CSS for maximum email client compatibility.
 *
 * The bodyHtml is whatever content Claude Code generates — paragraphs, images,
 * buttons, etc. This function wraps it with q2Kindle branding and an unsubscribe footer.
 */
export function renderEmailHtml(options: {
  bodyHtml: string;
  previewText?: string;
  unsubscribeUrl?: string;
}): string {
  const { bodyHtml, previewText, unsubscribeUrl } = options;

  const previewSpan = previewText
    ? `<span style="display:none;font-size:1px;color:#f4f4f4;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escapeHtml(previewText)}</span>`
    : "";

  const unsubscribeBlock = unsubscribeUrl
    ? `<a href="${escapeHtml(unsubscribeUrl)}" style="color:#999999;text-decoration:underline;">Unsubscribe</a> from marketing emails`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>q2Kindle</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">
  ${previewSpan}

  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- Inner container -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #e8e8e8;">
              <span style="font-family:Georgia,'Times New Roman',serif;font-size:24px;color:#1a1a1a;letter-spacing:-0.02em;font-weight:400;">q2Kindle</span>
            </td>
          </tr>

          <!-- Body content -->
          <tr>
            <td style="padding:32px 40px;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#1a1a1a;">
              ${bodyHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px 32px;border-top:1px solid #e8e8e8;">
              <p style="margin:0;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#999999;">
                You're receiving this because you have a q2Kindle account.<br>
                ${unsubscribeBlock}
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
