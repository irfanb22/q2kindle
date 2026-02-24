import { SupabaseClient } from "@supabase/supabase-js";

export const DAILY_SEND_LIMIT = 10;

/**
 * Get the start of "today" in the user's timezone as a UTC ISO string.
 * Uses Intl.DateTimeFormat (same pattern as getCurrentDayAndHour in cron route).
 * Falls back to UTC midnight if timezone is invalid.
 */
export function getStartOfDayUtc(timezone: string): string {
  try {
    const now = new Date();

    // Get today's date in the user's timezone (en-CA gives YYYY-MM-DD format)
    const dateStr = now.toLocaleDateString("en-CA", { timeZone: timezone });

    // We need to find what UTC time corresponds to midnight in the user's timezone.
    // Create a formatter that shows full date+time in the user's timezone.
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    // Find the UTC offset by comparing: format a known UTC time in the target timezone
    // and see how the hour differs.
    const midnight = new Date(`${dateStr}T00:00:00Z`); // midnight UTC for today's date
    const parts = formatter.formatToParts(midnight);
    const tzHour = parseInt(
      parts.find((p) => p.type === "hour")?.value || "0",
      10
    );
    const tzDay = parseInt(
      parts.find((p) => p.type === "day")?.value || "0",
      10
    );
    const utcDay = midnight.getUTCDate();

    // Calculate offset in hours: what hour does the timezone show when it's 00:00 UTC?
    let offsetHours = tzHour;
    if (tzDay > utcDay) {
      // Timezone is ahead of UTC (e.g., UTC+5 shows 05:00 on same calendar day, or crosses to next day)
      offsetHours = tzHour;
    } else if (tzDay < utcDay) {
      // Timezone is behind UTC (e.g., UTC-5 shows 19:00 on previous day)
      offsetHours = tzHour - 24;
    }

    // Midnight in user's timezone = midnight UTC minus the offset
    // If timezone is UTC+5, midnight local = 00:00 local = 19:00 UTC previous day
    // So we subtract the offset from midnight UTC of today's date in their timezone
    const midnightLocal = new Date(midnight.getTime() - offsetHours * 3600000);

    return midnightLocal.toISOString();
  } catch {
    // Fallback: use UTC midnight
    const dateStr = new Date().toISOString().split("T")[0];
    return `${dateStr}T00:00:00.000Z`;
  }
}

/**
 * Count how many successful sends a user has made today (in their timezone).
 * Fails open (returns 0) on query errors so a transient DB issue doesn't block sends.
 */
export async function getDailySendCount(
  supabase: SupabaseClient,
  userId: string,
  timezone: string
): Promise<number> {
  const startOfDay = getStartOfDayUtc(timezone || "UTC");

  const { count, error } = await supabase
    .from("send_history")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "success")
    .gte("sent_at", startOfDay);

  if (error) {
    console.error("Failed to query daily send count:", error.message);
    return 0;
  }

  return count || 0;
}
