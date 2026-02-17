import type { Config } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

// ── EPUB generation (self-contained — no cross-module imports) ──────────────

const FONT_MAP: Record<string, string> = {
  bookerly: 'Bookerly, Georgia, "Times New Roman", serif',
  georgia: 'Georgia, "Times New Roman", serif',
  palatino: '"Palatino Linotype", Palatino, Georgia, serif',
  helvetica: "Helvetica, Arial, sans-serif",
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

function stripImages(html: string): string {
  return html
    .replace(/<picture[^>]*>[\s\S]*?<\/picture>/gi, "")
    .replace(/<figure[^>]*>[\s\S]*?<\/figure>/gi, "")
    .replace(/<img[^>]*>/gi, "");
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function buildCoverHtml(options: {
  issueNumber: number | null;
  date: string;
  articleCount: number;
  totalReadTime: number;
}): string {
  const { issueNumber, date, articleCount, totalReadTime } = options;

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const issueLine = issueNumber
    ? `<h1 class="issue">Issue #${issueNumber}</h1>`
    : "";

  return `<div class="cover">
  <p class="brand">Kindle Sender</p>
  ${issueLine}
  <p class="date">${escapeHtml(formattedDate)}</p>
  <div class="divider"></div>
  <div class="stats">
    <p>${articleCount} article${articleCount !== 1 ? "s" : ""}</p>
    <p>~${totalReadTime} min total read time</p>
  </div>
</div>`;
}

function buildCss(fontFamily: string): string {
  return `body { font-family: ${fontFamily}; line-height: 1.7; margin: 1em; color: #1a1a1a; }
h1 { font-size: 1.35em; margin: 0 0 0.3em; }
.meta { color: #666; font-size: 0.82em; margin-bottom: 1.8em; }
p { margin: 0 0 0.75em; text-indent: 0; }
.cover { text-align: center; padding: 3em 1em; }
.cover .brand { font-size: 0.8em; text-transform: uppercase; letter-spacing: 0.2em; color: #999; margin-bottom: 2em; }
.cover .issue { font-size: 1.8em; margin: 0 0 0.2em; }
.cover .date { font-size: 0.95em; color: #555; margin-bottom: 1.5em; }
.cover .divider { width: 40px; height: 1px; background: #ccc; margin: 0 auto 1.5em; }
.cover .stats { font-size: 0.85em; color: #777; }
.cover .stats p { margin: 0.2em 0; }`;
}

type EpubPreferences = {
  font: string;
  includeImages: boolean;
  showAuthor: boolean;
  showReadTime: boolean;
  showPublishedDate: boolean;
};

type EpubArticle = {
  title?: string | null;
  url: string;
  author?: string | null;
  content: string;
  read_time_minutes?: number | null;
  published_at?: string | null;
};

async function generateKindleEpub(options: {
  articles: EpubArticle[];
  preferences: EpubPreferences;
  issueNumber: number | null;
}): Promise<{ buffer: Buffer; title: string; filename: string }> {
  // Dynamic import — ESM-safe, avoids require() issues in .mts context
  const epubModule = await import("epub-gen-memory");
  const generateEpub = epubModule.default ?? epubModule;

  const { articles, preferences, issueNumber } = options;
  const dateStr = new Date().toISOString().split("T")[0];
  const fontFamily = FONT_MAP[preferences.font] || FONT_MAP.bookerly;

  // Calculate total read time for cover
  const totalReadTime = articles.reduce(
    (sum, a) => sum + (a.read_time_minutes || 0),
    0
  );

  // Build cover page chapter
  const coverChapter = {
    title: "Cover",
    content: buildCoverHtml({
      issueNumber,
      date: dateStr,
      articleCount: articles.length,
      totalReadTime,
    }),
    filename: "cover.xhtml",
  };

  // Build article chapters
  const articleChapters = articles.map((article, i) => {
    const titleText = article.title || extractDomain(article.url);
    const readTime = article.read_time_minutes
      ? `${article.read_time_minutes} min`
      : "";
    const tocTitle = [titleText, readTime].filter(Boolean).join(" · ");

    // Build metadata parts based on preferences
    const metaParts: string[] = [];
    if (preferences.showAuthor) {
      const authorDisplay = article.author || extractDomain(article.url);
      metaParts.push(authorDisplay);
    }
    if (preferences.showReadTime && readTime) {
      metaParts.push(`${readTime} read`);
    }
    if (preferences.showPublishedDate && article.published_at) {
      const formattedPubDate = formatDate(article.published_at);
      if (formattedPubDate) {
        metaParts.push(formattedPubDate);
      }
    }

    const metaLine =
      metaParts.length > 0
        ? `<p class="meta">${escapeHtml(metaParts.join(" · "))}</p>\n`
        : "";

    // Optionally strip images
    let articleContent = article.content;
    if (!preferences.includeImages) {
      articleContent = stripImages(articleContent);
    }

    return {
      title: tocTitle,
      content: `${metaLine}${articleContent}`,
      filename: `article_${i}.xhtml`,
    };
  });

  const chapters = [coverChapter, ...articleChapters];
  const title = `ReadLater - ${dateStr}`;

  const rawResult = await generateEpub(
    {
      title,
      author: "Kindle Sender",
      css: buildCss(fontFamily),
      ignoreFailedDownloads: true,
      fetchTimeout: 10000,
      verbose: false,
    },
    chapters
  );

  let buffer: Buffer;
  if (Buffer.isBuffer(rawResult)) {
    buffer = rawResult;
  } else if (rawResult instanceof Uint8Array) {
    buffer = Buffer.from(rawResult);
  } else {
    throw new Error(
      `Unexpected epub result type: ${rawResult?.constructor?.name}`
    );
  }

  return {
    buffer,
    title,
    filename: `ReadLater-${dateStr}.epub`,
  };
}

// ── Timezone helpers ────────────────────────────────────────────────────────

const DAY_ABBREV: Record<number, string> = {
  0: "sun",
  1: "mon",
  2: "tue",
  3: "wed",
  4: "thu",
  5: "fri",
  6: "sat",
};

/**
 * Get the current day abbreviation and hour in a given timezone.
 * Uses Intl.DateTimeFormat to correctly handle DST and timezone offsets.
 */
function getCurrentDayAndHour(timezone: string): { day: string; hour: number } {
  try {
    const now = new Date();

    // Get the weekday in the user's timezone
    const dayFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      weekday: "short",
    });
    const dayStr = dayFormatter.format(now).toLowerCase().slice(0, 3); // "mon", "tue", etc.

    // Get the hour in the user's timezone
    const hourFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      hour12: false,
    });
    const parts = hourFormatter.formatToParts(now);
    const hourPart = parts.find((p) => p.type === "hour");
    const hour = hourPart ? parseInt(hourPart.value, 10) : 0;

    return { day: dayStr, hour };
  } catch {
    // Fallback to UTC if timezone is invalid
    const now = new Date();
    const day = DAY_ABBREV[now.getUTCDay()] || "mon";
    return { day, hour: now.getUTCHours() };
  }
}

// ── Main handler ────────────────────────────────────────────────────────────

export default async function handler() {
  console.log("⏰ Scheduled send function invoked at", new Date().toISOString());

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.log("Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL — skipping scheduled send");
    return new Response("Missing env vars", { status: 200 });
  }

  console.log("✅ Env vars present, connecting to Supabase...");

  // Use service role key to bypass RLS
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Fetch all users who have scheduled days configured and complete email settings
  const { data: allSettings, error: settingsError } = await supabase
    .from("settings")
    .select("user_id, kindle_email, sender_email, smtp_password, schedule_days, schedule_time, timezone, min_article_count, epub_font, epub_include_images, epub_show_author, epub_show_read_time, epub_show_published_date")
    .not("schedule_days", "is", null)
    .not("schedule_time", "is", null)
    .not("kindle_email", "is", null)
    .not("sender_email", "is", null)
    .not("smtp_password", "is", null);

  if (settingsError) {
    console.error("Failed to query settings:", settingsError.message);
    return new Response("Settings query failed", { status: 200 });
  }

  if (!allSettings || allSettings.length === 0) {
    console.log("No users with scheduled sends configured");
    return new Response("No scheduled sends", { status: 200 });
  }

  console.log(`Found ${allSettings.length} user(s) with delivery settings configured`);

  // Filter to users whose schedule matches the current day/hour in their timezone
  const matchingUsers = allSettings.filter((s) => {
    const userTimezone = s.timezone || "UTC";
    const { day: currentDay, hour: currentHour } = getCurrentDayAndHour(userTimezone);

    // Check if current day is in their schedule_days array
    const scheduleDays = s.schedule_days as string[];
    if (!scheduleDays.includes(currentDay)) {
      console.log(`User ${s.user_id}: schedule_days=${JSON.stringify(scheduleDays)}, current day=${currentDay} — no match`);
      return false;
    }

    // Parse HH:MM and match the hour
    const [hourStr] = (s.schedule_time as string).split(":");
    const scheduleHour = parseInt(hourStr, 10);
    if (scheduleHour !== currentHour) {
      console.log(`User ${s.user_id}: schedule_time=${s.schedule_time} (hour ${scheduleHour}), current hour=${currentHour} in ${userTimezone} — no match`);
      return false;
    }

    console.log(`User ${s.user_id}: ✅ MATCHED — ${currentDay} at hour ${currentHour} in ${userTimezone}`);
    return true;
  });

  if (matchingUsers.length === 0) {
    console.log("No users matched for this hour");
    return new Response("No matching schedules", { status: 200 });
  }

  console.log(`${matchingUsers.length} user(s) matched, processing sends...`);

  for (const settings of matchingUsers) {
    try {
      // Fetch queued articles for this user
      const { data: articles, error: articlesError } = await supabase
        .from("articles")
        .select("*")
        .eq("user_id", settings.user_id)
        .eq("status", "queued")
        .order("created_at", { ascending: true });

      if (articlesError || !articles || articles.length === 0) {
        console.log(`User ${settings.user_id}: no queued articles, skipping`);
        continue;
      }

      // Filter to articles with content
      const sendableArticles = articles.filter(
        (a: { content?: string }) => a.content && a.content.trim().length > 0
      );

      if (sendableArticles.length === 0) {
        console.log(`User ${settings.user_id}: no articles with content, skipping`);
        continue;
      }

      // Check minimum article count
      const minCount = settings.min_article_count || 1;
      if (sendableArticles.length < minCount) {
        console.log(`User ${settings.user_id}: only ${sendableArticles.length} articles, minimum is ${minCount}, skipping`);
        continue;
      }

      console.log(`User ${settings.user_id}: ${sendableArticles.length} articles to send`);

      // Get next issue number for this user
      const { data: lastSend } = await supabase
        .from("send_history")
        .select("issue_number")
        .eq("user_id", settings.user_id)
        .eq("status", "success")
        .not("issue_number", "is", null)
        .order("issue_number", { ascending: false })
        .limit(1)
        .single();

      const issueNumber = (lastSend?.issue_number || 0) + 1;

      // Generate EPUB
      let epubBuffer: Buffer;
      let epubFilename: string;
      try {
        const result = await generateKindleEpub({
          articles: sendableArticles,
          preferences: {
            font: settings.epub_font || "bookerly",
            includeImages: settings.epub_include_images ?? true,
            showAuthor: settings.epub_show_author ?? true,
            showReadTime: settings.epub_show_read_time ?? true,
            showPublishedDate: settings.epub_show_published_date ?? true,
          },
          issueNumber,
        });
        epubBuffer = result.buffer;
        epubFilename = result.filename;
        console.log(`User ${settings.user_id}: EPUB generated — ${epubFilename} (${epubBuffer.length} bytes)`);
      } catch (epubError) {
        const msg = epubError instanceof Error ? epubError.message : "Unknown";
        console.error(`User ${settings.user_id}: EPUB generation failed: ${msg}`);
        await supabase.from("send_history").insert({
          user_id: settings.user_id,
          article_count: sendableArticles.length,
          status: "failed",
          error_message: `Scheduled send — EPUB generation failed: ${msg}`,
        });
        continue;
      }

      // Send email
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: settings.sender_email,
            pass: settings.smtp_password,
          },
        });

        await transporter.sendMail({
          from: settings.sender_email,
          to: settings.kindle_email,
          subject: "Articles",
          html: "<div></div>",
          attachments: [
            {
              filename: epubFilename,
              content: epubBuffer,
              contentType: "application/epub+zip",
            },
          ],
        });
        console.log(`User ${settings.user_id}: Email sent to ${settings.kindle_email}`);
      } catch (emailError) {
        const msg = emailError instanceof Error ? emailError.message : "Unknown";
        console.error(`User ${settings.user_id}: Email failed: ${msg}`);
        await supabase.from("send_history").insert({
          user_id: settings.user_id,
          article_count: sendableArticles.length,
          status: "failed",
          error_message: `Scheduled send — Email failed: ${msg}`,
        });
        continue;
      }

      // Success — update articles and log
      const nowIso = new Date().toISOString();
      await supabase
        .from("articles")
        .update({ status: "sent", sent_at: nowIso })
        .in("id", sendableArticles.map((a: { id: string }) => a.id));

      await supabase.from("send_history").insert({
        user_id: settings.user_id,
        article_count: sendableArticles.length,
        issue_number: issueNumber,
        status: "success",
      });

      console.log(`User ${settings.user_id}: ✅ Scheduled send successful — ${sendableArticles.length} articles (Issue #${issueNumber})`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      console.error(`User ${settings.user_id}: Unexpected error: ${msg}`);
    }
  }

  return new Response("Scheduled send complete", { status: 200 });
}

// Run every hour at the top of the hour
export const config: Config = {
  schedule: "0 * * * *",
};
