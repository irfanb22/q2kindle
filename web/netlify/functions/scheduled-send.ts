import type { Config } from "@netlify/functions";

export default async function handler() {
  console.log("⏰ SCHEDULED-SEND ALIVE at", new Date().toISOString());
  console.log("ENV check — SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET" : "MISSING");
  console.log("ENV check — SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "SET" : "MISSING");
  return new Response("OK", { status: 200 });
}

export const config: Config = {
  schedule: "0 * * * *",
};
