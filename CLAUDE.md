# Kindle Sender — Project Reference

Read this file first before working on this project. It covers how the app works, how it was built, key decisions, and known issues.

## What this is

A web app that lets you paste article URLs, queue them up, and send them to your Kindle as a formatted EPUB ebook via email — similar to Instapaper's send-to-Kindle feature. You paste a link, the app extracts the article content, and when you're ready (or automatically on a schedule), it bundles everything into an EPUB and emails it to your Kindle address.

**This project is being rewritten** from a Python desktop app (v1) to a full-stack TypeScript web app (v2). Both versions live in this repo. See "V2 Web App Rewrite" below for the current plan and progress.

## Project location

`~/Projects/kindle-sender` on the developer's Mac. The repo has a GitHub remote at `github.com/irfanb22/kindle-sender`.

---

# V1 — Python Desktop App (Legacy)

The original app. Still functional but being replaced by the v2 web app. All v1 files live in the repo root.

## V1 Tech stack

- **Backend**: Python 3 / Flask (web server + API routes)
- **Frontend**: Single HTML file with vanilla JS (no frameworks)
- **Article extraction**: trafilatura 2.0
- **EPUB creation**: ebooklib 0.18
- **Email delivery**: Python's built-in smtplib (SMTP via Gmail app passwords)
- **Desktop window**: pywebview 5.3.2 (when running from terminal; disabled in .app bundles)
- **macOS packaging**: py2app (builds a standalone .app bundle)

## V1 File overview

| File | Purpose |
|------|---------|
| `app.py` (~525 lines) | The entire backend: Flask routes, article extraction, EPUB creation, email sending, queue/settings persistence, background scheduler, and app entry points |
| `templates/index.html` (~655 lines) | Single-page frontend with all CSS and JS inline. Two collapsible settings panels. All event binding uses `addEventListener` (no inline `onclick` — those are blocked by pywebview's WebKit CSP) |
| `setup.py` | py2app build configuration. Lists all packages and includes needed for bundling |
| `build.sh` | One-command build script: creates venv, installs deps + py2app, cleans old builds, runs py2app, opens dist/ |
| `requirements.txt` | Python dependencies: flask, trafilatura, ebooklib, pywebview |
| `Kindle Sender.command` | Double-clickable macOS launcher for running without py2app. Creates a venv on first run |
| `icon.icns` | App icon (dark rounded square with open book and green send arrow) |
| `settings.json` | Created at runtime. Stores email config and schedule preferences. Gitignored |
| `queue.json` | Created at runtime. Persists the article queue across launches. Gitignored |

## How the V1 app works

### Core flow

1. User pastes a URL into the input field (or drags a link onto the drop zone)
2. Backend calls `fetch_article()` which uses trafilatura to download and extract readable text, title, and author
3. The extracted article is added to the in-memory `ARTICLES` list and persisted to `queue.json`
4. When the user clicks "Send to Kindle" (or auto-send triggers), `create_epub()` builds an EPUB from all queued articles, and `send_to_kindle_email()` emails it as an attachment
5. On success, the queue is cleared

### Article extraction details

trafilatura 2.0 returns either a dict or a Document object depending on the version, so `fetch_article()` uses `isinstance()` checks with `getattr()` fallbacks to handle both. There's also a `_extract_title_from_html()` fallback that tries `og:title`, `twitter:title`, and `<title>` tags if trafilatura doesn't return a title.

### EPUB format

The EPUB is titled "ReadLater - YYYY-MM-DD" with each article as a separate chapter. Articles get a serif font (Georgia), 1.7 line height, and a metadata line showing author and source URL. The table of contents is auto-generated from chapter titles.

### Email delivery

Uses SMTP (default: Gmail on port 587 with STARTTLS). Requires:
- A Gmail "app password" (not your regular password)
- The sender email added to Amazon's approved senders list
- Your Kindle email address (found in Amazon > Manage Content & Devices > Preferences)

### Auto-send features

Two automation modes, both optional:

1. **Threshold auto-send**: When the queue reaches N articles, they're automatically bundled and sent. Checked every time an article is added.
2. **Scheduled weekly send**: Sends on a specific day/time. A background thread checks every 60 seconds. If the app wasn't open at the scheduled time, `_check_missed_send()` catches up on the next launch (looks back up to 7 days).

### Settings persistence

Settings and schedule preferences are stored in `settings.json`. The frontend uses a merge pattern when saving — it fetches the current settings, updates only the relevant fields, and POSTs the full object back. This prevents the email settings panel from clobbering the schedule settings panel and vice versa.

### Queue persistence

The article queue (including full extracted text) is stored in `queue.json` and loaded on startup. This means articles survive app restarts.

## How to run V1

### From terminal (development)

```bash
cd ~/Projects/kindle-sender
source .venv/bin/activate
python app.py
```

This tries pywebview first (native window), falls back to opening in the browser.

### Double-click launcher

Double-click `Kindle Sender.command`. On first run, it creates a `.venv` and installs dependencies automatically.

### As a macOS .app

```bash
cd ~/Projects/kindle-sender
./build.sh
```

The built app appears at `dist/Kindle Sender.app`. Drag it to Applications. The .app always runs in browser mode (pywebview is disabled in bundles).

## V1 App entry points

`app.py` has three run modes at the bottom:

- `run_desktop()` — Starts Flask on a random free port in a background thread, then opens a pywebview native window pointing at it
- `run_browser()` — Starts Flask on a random free port, opens the system browser, runs Flask in the foreground
- The `__main__` block checks `_is_bundled_app()` to decide: bundled .app always uses `run_browser()`; otherwise tries pywebview first with a fallback to browser

## V1 py2app build — issues encountered and fixes

### 1. charset_normalizer ModuleNotFoundError

**Problem**: The bundled app crashed on launch with `ModuleNotFoundError: charset_normalizer.md__mypyc`.

**Fix**: Added `charset_normalizer` to the `packages` list and `charset_normalizer.md__mypyc` to the `includes` list in `setup.py`.

### 2. pywebview Cocoa crash inside py2app bundles

**Problem**: pywebview's Cocoa/WebKit backend triggers `module 'objc._objc' has no attribute '__file__'` when running inside a py2app bundle.

**Fix**: Added `_is_bundled_app()` detection in `app.py` that checks for `sys.frozen` or `.app/Contents` in the executable path. When detected, the app skips pywebview entirely and uses browser mode. Also removed `webview` from the `setup.py` packages list.

### 3. Port 5000 conflict on macOS Monterey+

**Problem**: First launch would hang (bouncing dock icon, never opens). Second launch after force-quit would work. macOS Monterey and later uses port 5000 for AirPlay Receiver, and `run_browser()` was hardcoding port 5000.

**Fix**: Changed `run_browser()` to use the existing `_find_free_port()` function instead of hardcoded port 5000.

## V1 py2app setup.py packages

These are the packages and includes that py2app needs to bundle correctly:

- **packages**: flask, trafilatura, ebooklib, jinja2, lxml, certifi, charset_normalizer, lxml_html_clean
- **includes**: lxml.html.clean, lxml._elementpath, charset_normalizer.md__mypyc
- webview was intentionally removed from packages (causes Cocoa crash in bundles)

---

# V2 — Web App Rewrite (In Progress)

Full rewrite from Python desktop app to a hosted TypeScript web app. All v2 code lives in the `web/` subdirectory.

## Why the rewrite

- py2app packaging was painful and fragile
- Needed multi-device access (phone, tablet, any browser)
- UI felt rough/outdated — wanted a modern, polished interface
- Wanted new features (article preview/reader, send history)
- Unified language (TypeScript everywhere) instead of Python backend + JS frontend

## V2 Tech stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js (App Router) + React + Tailwind CSS v4 |
| **Backend** | Next.js API routes / Netlify Functions |
| **Auth** | Supabase Auth — magic link (passwordless) |
| **Database** | Supabase Postgres |
| **Local cache** | React Query or SWR (planned) |
| **Article extraction** | `@extractus/article-extractor` (replaces trafilatura) |
| **EPUB creation** | `epub-gen-memory` (planned, replaces ebooklib) |
| **Email** | Nodemailer via Netlify Function (planned, replaces smtplib) |
| **Hosting** | Netlify |

## V2 Supabase details

- **Project URL**: `https://scxkmenczzxpwustppee.supabase.co`
- **Anon key**: stored in `web/.env.local` (gitignored)
- Free tier — no cost

### Database tables

```
users (managed by Supabase Auth)

articles
├── id (uuid, pk)
├── user_id (fk → auth.users)
├── url, title, author, content (extracted HTML)
├── description (article summary/excerpt)
├── read_time_minutes (integer, calculated at 238 wpm)
├── status (queued | sent | failed)
├── created_at, sent_at

send_history
├── id (uuid, pk)
├── user_id (fk → auth.users)
├── article_count, status (success | failed), error_message
├── sent_at

settings
├── user_id (pk, fk → auth.users)
├── kindle_email, sender_email, smtp_password (encrypted)
├── auto_send_threshold, schedule_day, schedule_time
├── created_at, updated_at (auto-updated via trigger)
```

## V2 File overview

All files live under `web/`:

| File | Purpose |
|------|---------|
| `web/package.json` | Node dependencies and scripts (`dev`, `build`, `start`, `lint`) |
| `web/tsconfig.json` | TypeScript config with `@/*` path alias to `./src/*` |
| `web/next.config.ts` | Next.js config (minimal — Netlify handles most settings) |
| `web/postcss.config.mjs` | PostCSS config for Tailwind CSS v4 (`@tailwindcss/postcss`) |
| `web/.env.local` | Supabase URL and anon key (gitignored) |
| `web/src/app/globals.css` | Global styles — CSS variables for dark theme, Tailwind import |
| `web/src/app/layout.tsx` | Root layout — html/body wrapper, metadata |
| `web/src/app/page.tsx` | Login page — magic link auth via Supabase, editorial dark UI |
| `web/src/app/auth/callback/route.ts` | Auth callback — exchanges Supabase code for session, redirects to dashboard |
| `web/src/middleware.ts` | Route protection — redirects unauthenticated users to login, authenticated users from `/` to `/dashboard` |
| `web/src/lib/supabase/client.ts` | Browser-side Supabase client (uses `createBrowserClient` from `@supabase/ssr`) |
| `web/src/lib/supabase/server.ts` | Server-side Supabase client (uses `createServerClient` with cookie handling) |
| `web/src/lib/supabase/middleware.ts` | Session refresh logic used by the middleware |
| `web/src/app/(app)/layout.tsx` | Authenticated layout — top nav bar (Queue/History/Settings), sign out, user email |
| `web/src/app/(app)/dashboard/page.tsx` | Dashboard — URL input, article queue list, send button, empty/loading states |
| `web/src/app/(app)/history/page.tsx` | Send history placeholder (Phase 5) |
| `web/src/app/(app)/settings/page.tsx` | Settings placeholder (Phase 5) |
| `web/src/app/api/articles/extract/route.ts` | Article extraction API — fetches URL, extracts content, calculates read time |
| `web/src/lib/types.ts` | Shared TypeScript types (Article) used across pages |
| `web/supabase/migrations/001_create_tables.sql` | Database schema — articles, send_history, settings tables + RLS policies |
| `web/supabase/migrations/002_add_read_time_and_description.sql` | Adds read_time_minutes and description columns to articles |

## V2 Design system

- **Theme**: Dark (#0a0a0a bg, #141414 surfaces, #262626 borders, #22c55e green accent)
- **Fonts**: Instrument Serif (headings), DM Sans (body) — loaded via Google Fonts
- **Style**: Editorial/literary aesthetic — serif headings, clean sans body, subtle green glow, grid texture background
- **Animations**: Staggered fadeUp on page load, focus ring transitions on inputs

## How to run V2

```bash
cd ~/Projects/kindle-sender/web
npm run dev
```

Opens at `http://localhost:3000`. Requires Node.js (installed via nvm, v24 LTS).

## V2 Build phases

| Phase | Description | Status |
|-------|-------------|--------|
| **Phase 1** | Project scaffold, Supabase config, auth flow, basic UI shell | ✅ Complete |
| **Phase 2** | Article extraction API + queue management + Supabase CRUD | ✅ Complete |
| **Phase 3** | Kindle preview page with device mockup | ⬜ Not started |
| **Phase 4** | EPUB generation + email sending via Netlify Functions | ⬜ Not started |
| **Phase 5** | Settings page, auto-send, send history | ⬜ Not started |
| **Phase 6** | Polish — mobile responsive, loading states, error handling, PWA | ⬜ Not started |

### Phase 1 progress

- ✅ Next.js project scaffolded with TypeScript + Tailwind CSS v4
- ✅ Supabase client configured (browser, server, middleware)
- ✅ Environment variables set up (`.env.local`)
- ✅ Auth callback route (`/auth/callback`)
- ✅ Middleware for route protection (login redirect, session refresh)
- ✅ Login page with magic link flow (Instrument Serif + DM Sans, dark editorial design)
- ✅ Supabase database tables (articles, send_history, settings) — with RLS policies
- ✅ Dashboard page shell — URL input, article queue list, send button, empty states
- ✅ App navigation/layout for authenticated pages — shared nav bar via `(app)` route group

### Phase 2 progress

- ✅ Server-side article extraction API (`/api/articles/extract`) using `@extractus/article-extractor`
- ✅ Extracts title, author, content, description from article URLs
- ✅ Read time calculation (238 words per minute) stored in `read_time_minutes` column
- ✅ Background extraction UX — article appears instantly with shimmer loading animation
- ✅ Richer queue cards — title, author (fallback to website name), read time with clock icon
- ✅ Failed extraction warning — amber badge when content can't be extracted
- ✅ Shared Article type definition (`web/src/lib/types.ts`)
- ✅ Database migration 002 — added `read_time_minutes` and `description` columns
- ✅ Middleware updated to exclude API routes from auth redirect

## V2 Pages (planned)

| Route | Purpose |
|-------|---------|
| `/` | Login — magic link email input |
| `/dashboard` | Main app — URL input, article queue, send button |
| `/article/:id` | Article reader/preview — read extracted content before sending |
| `/history` | Last 10 sends with status |
| `/settings` | Kindle email, SMTP config, auto-send preferences |

## V2 Deployment (planned)

- **Hosting**: Netlify (developer has an existing account)
- **Database**: Supabase free tier
- **Build command**: `npm run build` (from `web/` directory)
- **Netlify config**: Will need `@netlify/plugin-nextjs` or adapter for Next.js App Router support

---

## Decision log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-02-08 | Rewrite as full-stack TypeScript web app | py2app was fragile, needed multi-device access, wanted modern UI |
| 2025-02-08 | Chose Next.js + Tailwind + Supabase + Netlify | Developer had Netlify/Supabase accounts; Next.js has best Netlify support; Supabase gives free Postgres + auth |
| 2025-02-08 | Magic link auth (passwordless) | Simpler UX, no passwords to manage |
| 2025-02-08 | Supabase + local cache for storage | Supabase as source of truth for multi-device sync, local cache for speed |
| 2025-02-08 | Keep v1 Python code in repo root | Still functional, can reference during rewrite, no need to delete yet |
| 2025-02-08 | Node.js installed via nvm (v24 LTS) | Developer didn't have Node installed; nvm allows easy version management |
| 2025-02-10 | Background extraction UX (not inline wait) | Matches Instapaper/Reader pattern — article appears instantly, content fills in |
| 2025-02-10 | Author fallback to website name | If no author extracted, show publisher/source name, then domain as last resort |
| 2025-02-10 | Read time at 238 wpm | Industry standard reading speed; stored as integer minutes in DB |
| 2025-02-10 | Split Kindle preview into separate Phase 3 | Keep Phase 2 focused on extraction; preview is a distinct feature |
| 2025-02-10 | Failed extraction adds with warning, not rejected | User keeps the URL in queue even if content can't be extracted |
