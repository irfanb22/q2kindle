import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyUnsubscribeToken } from "@/lib/email-tokens";

export async function GET(request: NextRequest) {
  const uid = request.nextUrl.searchParams.get("uid");
  const sig = request.nextUrl.searchParams.get("sig");

  if (!uid || !sig) {
    return new NextResponse(renderPage("Invalid unsubscribe link."), {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  if (!verifyUnsubscribeToken(uid, sig)) {
    return new NextResponse(renderPage("Invalid or expired unsubscribe link."), {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  // Use service role to bypass RLS
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabase.from("email_preferences").upsert(
    {
      user_id: uid,
      marketing_unsubscribed_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    console.error("Unsubscribe error:", error.message);
    return new NextResponse(
      renderPage("Something went wrong. Please try again later."),
      { status: 500, headers: { "Content-Type": "text/html" } }
    );
  }

  return new NextResponse(
    renderPage(
      "You've been unsubscribed from q2Kindle marketing emails.",
      true
    ),
    { status: 200, headers: { "Content-Type": "text/html" } }
  );
}

function renderPage(message: string, success = false): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>q2Kindle — Unsubscribe</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;">
  <div style="background:#fff;border-radius:12px;padding:48px 40px;max-width:440px;width:90%;text-align:center;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
    <div style="font-family:Georgia,'Times New Roman',serif;font-size:24px;color:#1a1a1a;margin-bottom:24px;letter-spacing:-0.02em;">q2Kindle</div>
    <p style="font-size:16px;line-height:1.5;color:#1a1a1a;margin:0 0 24px;">${message}</p>
    ${success ? '<a href="https://q2kindle.com" style="color:#2d5f2d;text-decoration:underline;font-size:14px;">Back to q2Kindle</a>' : ""}
  </div>
</body>
</html>`;
}
