"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { usePostHog } from "posthog-js/react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Queue", icon: "queue" },
  { href: "/history", label: "History", icon: "history" },
  { href: "/settings", label: "Settings", icon: "settings" },
] as const;

function NavIcon({ icon, active }: { icon: string; active: boolean }) {
  const color = active ? "var(--color-accent)" : "var(--color-text-muted)";
  const weight = active ? "2" : "1.5";

  switch (icon) {
    case "queue":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="4" cy="6" r="1.5" fill={color}/>
          <line x1="9" y1="6" x2="21" y2="6" stroke={color} strokeWidth={weight} strokeLinecap="round"/>
          <circle cx="4" cy="12" r="1.5" fill={color}/>
          <line x1="9" y1="12" x2="21" y2="12" stroke={color} strokeWidth={weight} strokeLinecap="round"/>
          <circle cx="4" cy="18" r="1.5" fill={color}/>
          <line x1="9" y1="18" x2="21" y2="18" stroke={color} strokeWidth={weight} strokeLinecap="round"/>
        </svg>
      );
    case "history":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M1 4v6h6" stroke={color} strokeWidth={weight} strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3.51 15a9 9 0 102.13-9.36L1 10" stroke={color} strokeWidth={weight} strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 7v5l4 2" stroke={color} strokeWidth={weight} strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case "settings":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="3" stroke={color} strokeWidth={weight}/>
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.32 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke={color} strokeWidth={weight} strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    default:
      return null;
  }
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>("");
  const posthog = usePostHog();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setUserEmail(user.email);
      if (user && posthog) {
        posthog.identify(user.id, { email: user.email });
      }
    });
  }, [posthog]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    posthog?.reset();
    router.push("/");
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>

      {/* Top navigation bar */}
      <header className="border-b" style={{
        borderColor: 'var(--color-border-light)',
        background: 'rgba(252,250,248,0.85)',
        backdropFilter: 'blur(20px) saturate(1.3)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.3)',
      }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">

          {/* Left: logo + nav (nav hidden on mobile) */}
          <div className="flex items-center gap-8">
            <span
              className="text-lg cursor-pointer"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.01em' }}
              onClick={() => router.push("/dashboard")}
            >
              q2kindle
            </span>

            {/* Desktop nav — hidden on mobile */}
            <nav className="hidden sm:flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const active = item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);

                return (
                  <button
                    key={item.href}
                    onClick={() => router.push(item.href)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors duration-150 cursor-pointer"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontWeight: 500,
                      color: active ? 'var(--color-accent)' : 'var(--color-text-muted)',
                      background: active ? 'var(--color-accent-pale)' : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (!active) e.currentTarget.style.color = 'var(--color-text)';
                    }}
                    onMouseLeave={(e) => {
                      if (!active) e.currentTarget.style.color = 'var(--color-text-muted)';
                    }}
                  >
                    <NavIcon icon={item.icon} active={active} />
                    {item.label}
                  </button>
                );
              })}
              <a
                href="https://chromewebstore.google.com/detail/q2kindle-%E2%80%94-save-to-queue/pjicihhhplcnbnjbhnklldmibgidkmon"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors duration-150"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontWeight: 500,
                  color: 'var(--color-text-muted)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-text)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)'; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5a2.5 2.5 0 00-5 0V5H4c-1.1 0-2 .9-2 2v3.8h1.5a2.5 2.5 0 010 5H2V19c0 1.1.9 2 2 2h3.8v-1.5a2.5 2.5 0 015 0V21H16c1.1 0 2-.9 2-2v-4h1.5a2.5 2.5 0 000-5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Extension
              </a>
            </nav>
          </div>

          {/* Right: user (desktop only) + sign out */}
          <div className="flex items-center gap-4">
            {userEmail && (
              <span className="hidden sm:inline text-xs" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-dim)' }}>
                {userEmail}
              </span>
            )}
            <button
              onClick={handleSignOut}
              className="text-xs px-3 py-1.5 rounded-lg border transition-colors duration-150 cursor-pointer"
              style={{
                fontFamily: 'var(--font-body)',
                color: 'var(--color-text-muted)',
                borderColor: 'var(--color-border)',
                background: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--color-text)';
                e.currentTarget.style.borderColor = 'var(--color-border-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--color-text-muted)';
                e.currentTarget.style.borderColor = 'var(--color-border)';
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Page content — extra bottom padding on mobile for fixed tab bar */}
      <main className={`${pathname.startsWith('/article/') ? 'max-w-6xl' : 'max-w-4xl'} mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-20 sm:pb-10`}>
        {children}
      </main>

      {/* Mobile bottom tab bar — visible only on small screens */}
      <nav
        className="fixed bottom-0 left-0 right-0 sm:hidden border-t flex items-center justify-around"
        style={{
          borderColor: 'var(--color-border-light)',
          background: 'rgba(252,250,248,0.92)',
          backdropFilter: 'blur(20px) saturate(1.3)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.3)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          height: 'calc(56px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        {NAV_ITEMS.map((item) => {
          const active = item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);

          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 pt-2 cursor-pointer"
              style={{
                fontFamily: 'var(--font-body)',
                color: active ? 'var(--color-accent)' : 'var(--color-text-muted)',
                background: 'transparent',
                border: 'none',
              }}
            >
              <NavIcon icon={item.icon} active={active} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
