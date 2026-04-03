import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { isAdmin } from "@/lib/admin";

export async function GET() {
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

    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await serviceClient
      .from("email_send_logs")
      .select(
        "id, subject, preview_text, recipient_count, success_count, failure_count, status, sent_at, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Failed to fetch send logs:", error.message);
      return NextResponse.json(
        { error: "Failed to fetch send logs" },
        { status: 500 }
      );
    }

    return NextResponse.json({ logs: data });
  } catch (error) {
    console.error("Logs route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
