import { createServerClient } from "@supabase/ssr";
import { createClient as createJsClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Creates a Supabase client for API routes.
 * Supports both cookie-based auth (web app) and Bearer token auth (Chrome extension).
 */
export async function createApiClient(request: Request) {
  const authHeader = request.headers.get("authorization");

  // Chrome extension: use Bearer token
  if (authHeader?.startsWith("Bearer ")) {
    return createJsClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );
  }

  // Web app: use cookie-based auth
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignored in Server Components — middleware handles session refresh.
          }
        },
      },
    }
  );
}
