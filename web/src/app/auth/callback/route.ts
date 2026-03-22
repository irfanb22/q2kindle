import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPostHogServer } from "@/lib/posthog-server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Track new signups (created within last 60 seconds)
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.created_at) {
        const createdAt = new Date(user.created_at).getTime();
        const now = Date.now();
        if (now - createdAt < 60_000) {
          const posthog = getPostHogServer();
          if (posthog) {
            posthog.capture({ distinctId: user.id, event: "user_signed_up", properties: { email: user.email } });
            await posthog.shutdown();
          }
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth error — redirect to login with specific error for cross-browser guidance
  return NextResponse.redirect(`${origin}/login?error=link_failed`);
}
