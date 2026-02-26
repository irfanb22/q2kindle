import nodemailer from "nodemailer";

const BREVO_SMTP_HOST = "smtp-relay.brevo.com";
const BREVO_SMTP_PORT = 587;

// Brevo enforces a 4MB per-file attachment limit (20MB total message).
// Typical article digests are well under 1MB. Log a warning if approaching.
const ATTACHMENT_WARN_BYTES = 3.5 * 1024 * 1024; // 3.5 MB

const transporter = nodemailer.createTransport({
  host: BREVO_SMTP_HOST,
  port: BREVO_SMTP_PORT,
  secure: false, // STARTTLS (upgraded after connect)
  auth: {
    user: process.env.BREVO_SMTP_LOGIN!,
    pass: process.env.BREVO_SMTP_KEY!,
  },
});

export const KINDLE_SENDER = "q2kindle <kindle@q2kindle.com>";

export async function sendToKindle(options: {
  to: string;
  subject: string;
  epubBuffer: Buffer;
  epubFilename: string;
}): Promise<void> {
  if (options.epubBuffer.length > ATTACHMENT_WARN_BYTES) {
    console.warn(
      `EPUB attachment is ${(options.epubBuffer.length / 1024 / 1024).toFixed(1)} MB — ` +
        `approaching Brevo's 4 MB per-file limit. File: ${options.epubFilename}`
    );
  }

  await transporter.sendMail({
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
