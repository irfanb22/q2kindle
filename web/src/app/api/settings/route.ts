import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from("settings")
      .select(
        "kindle_email, sender_email, smtp_password, auto_send_threshold, schedule_day, schedule_time"
      )
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows found (not an error — user just hasn't configured settings)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({ settings: null });
    }

    // Mask the SMTP password — never send the actual value to the client
    return NextResponse.json({
      settings: {
        ...data,
        smtp_password: data.smtp_password ? "••••••••" : null,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { kindle_email, sender_email, smtp_password } = body;

    if (!kindle_email || !sender_email || !smtp_password) {
      return NextResponse.json(
        { error: "All three fields are required: Kindle email, Gmail address, and app password" },
        { status: 400 }
      );
    }

    // Basic email validation
    if (!sender_email.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid Gmail address" },
        { status: 400 }
      );
    }

    if (!kindle_email.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid Kindle email address" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { error } = await supabase.from("settings").upsert({
      user_id: user.id,
      kindle_email,
      sender_email,
      smtp_password,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}
