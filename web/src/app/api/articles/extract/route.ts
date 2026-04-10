import { NextResponse } from "next/server";
import { createApiClient } from "@/lib/supabase/api";
import { extract, extractFromHtml } from "@extractus/article-extractor";
import { DAILY_EXTRACTION_LIMIT, getDailyExtractionCount } from "@/lib/send-limits";
import { validateUrl } from "@/lib/url-validation";

function calculateReadTime(htmlContent: string): number {
  // Strip HTML tags to get plain text
  const text = htmlContent.replace(/<[^>]*>/g, "");
  // Count words (split on whitespace, filter empty strings)
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  // 238 words per minute, minimum 1 minute
  return Math.max(1, Math.ceil(wordCount / 238));
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    const { url, html } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    // Authenticate the user (supports both cookie auth and Bearer token)
    const supabase = await createApiClient(request);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Check daily extraction limit
    const extractionCount = await getDailyExtractionCount(supabase, user.id);
    if (extractionCount >= DAILY_EXTRACTION_LIMIT) {
      return NextResponse.json(
        { error: "Daily limit reached. Try again tomorrow." },
        { status: 429 }
      );
    }

    // Normalize the URL
    const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;

    // SSRF protection: block private/internal addresses
    const urlCheck = await validateUrl(normalizedUrl);
    if (!urlCheck.valid) {
      return NextResponse.json(
        { error: urlCheck.error || "Invalid URL" },
        { status: 400 }
      );
    }

    const domain = extractDomain(normalizedUrl);

    // First, insert the article immediately with a placeholder so the UI can show it
    const { data: placeholderArticle, error: insertError } = await supabase
      .from("articles")
      .insert({
        user_id: user.id,
        url: normalizedUrl,
        title: domain,
        status: "queued",
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    // Return the placeholder immediately so the UI can render it
    // Then attempt extraction and update the article
    const articleId = placeholderArticle.id;

    // Attempt article extraction with a timeout
    let extractedData: {
      title?: string | null;
      author?: string | null;
      description?: string | null;
      content?: string | null;
      source?: string | null;
      published?: string | null;
    } | null = null;

    try {
      let result;

      if (html && typeof html === "string") {
        // Use provided HTML (from Chrome extension — captures paywalled content)
        result = await extractFromHtml(html, normalizedUrl);
      } else {
        // Fetch and extract from URL (web app flow)
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000); // 15 second timeout
        result = await extract(normalizedUrl, {}, { signal: controller.signal });
        clearTimeout(timeout);
      }

      if (result) {
        extractedData = {
          title: result.title || null,
          author: result.author || null,
          description: result.description || null,
          content: result.content || null,
          source: result.source || null,
          published: result.published || null,
        };
      }
    } catch {
      // Extraction failed — article stays with placeholder data
      extractedData = null;
    }

    // Update the article with extracted data (or mark as failed extraction)
    if (extractedData && extractedData.content) {
      const readTime = calculateReadTime(extractedData.content);

      // Use author, fall back to source/publisher name, fall back to domain
      const author = extractedData.author || extractedData.source || domain;

      const { data: updatedArticle, error: updateError } = await supabase
        .from("articles")
        .update({
          title: extractedData.title || domain,
          author: author,
          description: extractedData.description,
          content: extractedData.content,
          read_time_minutes: readTime,
          published_at: extractedData.published || null,
        })
        .eq("id", articleId)
        .select()
        .single();

      if (updateError) {
        // Update failed but article is still in queue with placeholder
        return NextResponse.json({ article: placeholderArticle });
      }

      return NextResponse.json({ article: updatedArticle });
    } else {
      // Extraction failed — return the placeholder article as-is
      // The UI will show a warning badge for articles without content
      return NextResponse.json({ article: placeholderArticle, extractionFailed: true });
    }
  } catch {
    return NextResponse.json(
      { error: "Failed to process article" },
      { status: 500 }
    );
  }
}
