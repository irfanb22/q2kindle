import type { Config } from "@netlify/functions";

export default async function handler() {
  // Determine the site URL — Netlify provides this automatically
  const siteUrl = process.env.URL || process.env.DEPLOY_PRIME_URL || "https://kindle-sender.netlify.app";
  const cronSecret = process.env.CRON_SECRET || "";

  console.log(`⏰ Scheduled send triggered at ${new Date().toISOString()}`);
  console.log(`Calling ${siteUrl}/api/cron/send`);

  try {
    const response = await fetch(`${siteUrl}/api/cron/send`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${cronSecret}`,
      },
    });

    const body = await response.text();
    console.log(`Response: ${response.status} — ${body}`);

    return new Response(body, { status: response.status });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error(`Failed to call cron endpoint: ${msg}`);
    return new Response(`Error: ${msg}`, { status: 500 });
  }
}

export const config: Config = {
  schedule: "0 * * * *",
};
