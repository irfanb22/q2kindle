import nodemailer from "nodemailer";

const BREVO_SMTP_HOST = "smtp-relay.brevo.com";
const BREVO_SMTP_PORT = 587;

// Brevo enforces a 4MB per-file attachment limit (20MB total message).
// Typical article digests are well under 1MB. Log a warning if approaching,
// and reject hard before SMTP would silently drop the message.
const ATTACHMENT_WARN_BYTES = 3.5 * 1024 * 1024; // 3.5 MB
const ATTACHMENT_MAX_BYTES = 4 * 1024 * 1024; // 4 MB (Brevo per-file limit)

export class EpubTooLargeError extends Error {
  readonly sizeBytes: number;
  readonly limitBytes: number;
  constructor(sizeBytes: number, limitBytes: number) {
    const sizeMB = (sizeBytes / 1024 / 1024).toFixed(1);
    const limitMB = (limitBytes / 1024 / 1024).toFixed(0);
    super(
      `Your ebook is too large to deliver (${sizeMB} MB, limit is ${limitMB} MB). ` +
        `Try removing some articles or turning off images in Settings, then send in smaller batches.`
    );
    this.name = "EpubTooLargeError";
    this.sizeBytes = sizeBytes;
    this.limitBytes = limitBytes;
  }
}

// Lazy-initialize transporter to ensure env vars are available in serverless
let _transporter: nodemailer.Transporter | null = null;
function getTransporter() {
  if (!_transporter) {
    console.log(`Brevo SMTP: login=${process.env.BREVO_SMTP_LOGIN}, key=${process.env.BREVO_SMTP_KEY ? "***set***" : "MISSING"}`);
    _transporter = nodemailer.createTransport({
      host: BREVO_SMTP_HOST,
      port: BREVO_SMTP_PORT,
      secure: false, // STARTTLS (upgraded after connect)
      auth: {
        user: process.env.BREVO_SMTP_LOGIN!,
        pass: process.env.BREVO_SMTP_KEY!,
      },
    });
  }
  return _transporter;
}

export const KINDLE_SENDER = "q2kindle <kindle@q2kindle.com>";

export async function sendToKindle(options: {
  to: string;
  subject: string;
  epubBuffer: Buffer;
  epubFilename: string;
}): Promise<void> {
  if (options.epubBuffer.length > ATTACHMENT_MAX_BYTES) {
    throw new EpubTooLargeError(options.epubBuffer.length, ATTACHMENT_MAX_BYTES);
  }

  if (options.epubBuffer.length > ATTACHMENT_WARN_BYTES) {
    console.warn(
      `EPUB attachment is ${(options.epubBuffer.length / 1024 / 1024).toFixed(1)} MB — ` +
        `approaching Brevo's 4 MB per-file limit. File: ${options.epubFilename}`
    );
  }

  await getTransporter().sendMail({
    from: KINDLE_SENDER,
    to: options.to,
    subject: options.subject,
    html: "<div></div>", // Kindle rejects emails with no body (E009)
    attachments: [
      {
        filename: options.epubFilename,
        content: options.epubBuffer,
        contentType: "application/epub+zip",
      },
    ],
  });
}
