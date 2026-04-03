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

    // Service role client to access auth.users and email_preferences
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get total user count via admin API (page 1, perPage 1 gives total in response)
    const { data: usersData, error: usersError } =
      await serviceClient.auth.admin.listUsers({ page: 1, perPage: 1 });

    if (usersError) {
      console.error("Failed to list users:", usersError.message);
      return NextResponse.json(
        { error: "Failed to fetch user count" },
        { status: 500 }
      );
    }

    const total = usersData.total ?? 0;

    // Count unsubscribed users
    const { count: unsubscribedCount, error: prefError } = await serviceClient
      .from("email_preferences")
      .select("*", { count: "exact", head: true })
      .not("marketing_unsubscribed_at", "is", null);

    if (prefError) {
      console.error("Failed to count unsubscribed:", prefError.message);
    }

    const unsubscribed = unsubscribedCount ?? 0;
    const subscribed = total - unsubscribed;

    return NextResponse.json({ total, subscribed, unsubscribed });
  } catch (error) {
    console.error("Audience route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
