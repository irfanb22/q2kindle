import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { isAdmin } from "@/lib/admin";
import { renderEmailHtml } from "@/lib/email-template";
import { generateUnsubscribeUrl } from "@/lib/email-tokens";

const RESEND_API_URL = "https://api.resend.com/emails";
const FROM_ADDRESS = "q2kindle <team@q2kindle.com>";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (!isAdmin(user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      mode,
      subject,
      previewText,
      bodyHtml,
      testRecipient,
    }: {
      mode: "test" | "send";
      subject: string;
      previewText?: string;
      bodyHtml: string;
      testRecipient?: string;
    } = body;

    if (!subject || !bodyHtml) {
      return NextResponse.json(
        { error: "subject and bodyHtml are required" },
        { status: 400 }
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return NextResponse.json(
        { error: "RESEND_API_KEY not configured" },
        { status: 500 }
      );
    }

    // --- Test mode: send to a single recipient ---
    if (mode === "test") {
      const recipient = testRecipient || user.email;
      if (!recipient) {
        return NextResponse.json(
          { error: "No test recipient specified" },
          { status: 400 }
        );
      }

      const html = renderEmailHtml({
        bodyHtml,
        previewText,
        // No unsubscribe URL for test emails
      });

      const result = await sendViaResend(resendApiKey, {
        to: recipient,
        subject: `[TEST] ${subject}`,
        html,
      });

      if (!result.ok) {
        return NextResponse.json(
          { error: `Failed to send test email: ${result.error}` },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: `Test email sent to ${recipient}`,
      });
    }

    // --- Production send mode ---
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Create log entry
    const { data: logEntry, error: logError } = await serviceClient
      .from("email_send_logs")
      .insert({
        subject,
        preview_text: previewText || null,
        status: "sending",
        sent_by: user.id,
        sent_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (logError || !logEntry) {
      console.error("Failed to create send log:", logError?.message);
      return NextResponse.json(
        { error: "Failed to create send log" },
        { status: 500 }
      );
    }

    // Fetch all users (paginate through all pages)
    const allUsers: { id: string; email: string }[] = [];
    let page = 1;
    const perPage = 100;
    while (true) {
      const { data, error } = await serviceClient.auth.admin.listUsers({
        page,
        perPage,
      });
      if (error) {
        console.error(`Failed to list users page ${page}:`, error.message);
        break;
      }
      for (const u of data.users) {
        if (u.email) {
          allUsers.push({ id: u.id, email: u.email });
        }
      }
      if (data.users.length < perPage) break;
      page++;
    }

    // Get unsubscribed user IDs
    const { data: unsubscribed } = await serviceClient
      .from("email_preferences")
      .select("user_id")
      .not("marketing_unsubscribed_at", "is", null);

    const unsubscribedIds = new Set(
      (unsubscribed || []).map((row) => row.user_id)
    );

    const recipients = allUsers.filter((u) => !unsubscribedIds.has(u.id));

    // Update log with recipient count
    await serviceClient
      .from("email_send_logs")
      .update({ recipient_count: recipients.length })
      .eq("id", logEntry.id);

    // Send to each recipient
    let successCount = 0;
    let failureCount = 0;

    for (const recipient of recipients) {
      const unsubscribeUrl = generateUnsubscribeUrl(recipient.id);
      const html = renderEmailHtml({
        bodyHtml,
        previewText,
        unsubscribeUrl,
      });

      const result = await sendViaResend(resendApiKey, {
        to: recipient.email,
        subject,
        html,
        unsubscribeUrl,
      });

      if (result.ok) {
        successCount++;
      } else {
        failureCount++;
        console.error(
          `Failed to send to ${recipient.email}: ${result.error}`
        );
      }
    }

    // Store rendered HTML (without user-specific unsubscribe URL) for reference
    const referenceHtml = renderEmailHtml({ bodyHtml, previewText });

    // Update log entry with final results
    const finalStatus =
      failureCount === 0
        ? "completed"
        : successCount === 0
          ? "failed"
          : "completed";

    await serviceClient
      .from("email_send_logs")
      .update({
        html_content: referenceHtml,
        success_count: successCount,
        failure_count: failureCount,
        status: finalStatus,
      })
      .eq("id", logEntry.id);

    return NextResponse.json({
      message: `Email sent to ${successCount} of ${recipients.length} subscribers`,
      sent: successCount,
      failed: failureCount,
      total: recipients.length,
    });
  } catch (error) {
    console.error("Send email route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function sendViaResend(
  apiKey: string,
  options: {
    to: string;
    subject: string;
    html: string;
    unsubscribeUrl?: string;
  }
): Promise<{ ok: boolean; error?: string }> {
  try {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };

    const emailPayload: Record<string, unknown> = {
      from: FROM_ADDRESS,
      to: [options.to],
      subject: options.subject,
      html: options.html,
    };

    // Add List-Unsubscribe headers for RFC 8058 compliance
    if (options.unsubscribeUrl) {
      emailPayload.headers = {
        "List-Unsubscribe": `<${options.unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      };
    }

    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(emailPayload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return { ok: false, error: `${response.status}: ${errorBody}` };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
