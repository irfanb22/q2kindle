"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke={color} strokeWidth={weight} strokeLinecap="round"/>
          <rect x="9" y="3" width="6" height="4" rx="1" stroke={color} strokeWidth={weight}/>
          <path d="M9 12h6M9 16h4" stroke={color} strokeWidth={weight} strokeLinecap="round"/>
        </svg>
      );
    case "history":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke={color} strokeWidth={weight}/>
          <path d="M12 7v5l3 3" stroke={color} strokeWidth={weight} strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case "settings":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="3" stroke={color} strokeWidth={weight}/>
          <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" stroke={color} strokeWidth={weight} strokeLinecap="round"/>
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

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setUserEmail(user.email);
    });
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>

      {/* Top navigation bar */}
      <header className="border-b" style={{
        borderColor: 'var(--color-border-light)',
        background: 'rgba(244,244,244,0.85)',
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
          background: 'rgba(244,244,244,0.92)',
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
