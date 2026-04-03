import { createHmac } from "crypto";

const BASE_URL = "https://q2kindle.com";

export function generateUnsubscribeUrl(userId: string): string {
  const secret = process.env.EMAIL_UNSUBSCRIBE_SECRET!;
  const sig = createHmac("sha256", secret).update(userId).digest("hex");
  return `${BASE_URL}/api/email/unsubscribe?uid=${userId}&sig=${sig}`;
}

export function verifyUnsubscribeToken(
  userId: string,
  sig: string
): boolean {
  const secret = process.env.EMAIL_UNSUBSCRIBE_SECRET!;
  const expected = createHmac("sha256", secret).update(userId).digest("hex");
  // Constant-time comparison to prevent timing attacks
  if (sig.length !== expected.length) return false;
  let result = 0;
  for (let i = 0; i < sig.length; i++) {
    result |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return result === 0;
}
