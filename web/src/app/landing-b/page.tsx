"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function LandingB() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    document.querySelectorAll("[data-reveal]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,300;1,6..72,400&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,500;0,8..60,600;1,8..60,300;1,8..60,400&display=swap');
      `}</style>

      <style jsx global>{`
        :global(:root) {
          --bg: #faf7f2;
          --surface: #ffffff;
          --surface-warm: #f3ede4;
          --border: #e8e0d4;
          --border-light: #f0ead9;
          --text: #1a1714;
          --text-secondary: #5a5149;
          --text-dim: #a39889;
          --accent: #2d5f2d;
          --accent-light: #3a7a3a;
          --accent-pale: rgba(45,95,45,0.07);
          --accent-text: #2d5f2d;
          --heading: 'Newsreader', 'Georgia', serif;
          --body: 'Source Serif 4', 'Georgia', serif;
        }

        :global(html) { scroll-behavior: smooth; }

        :global(body) {
          background: var(--bg);
          color: var(--text);
          font-family: var(--body);
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
          margin: 0;
        }

        /* REVEAL */
        [data-reveal] {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
        [data-reveal].in-view {
          opacity: 1;
          transform: translateY(0);
        }
        [data-reveal="d1"] { transition-delay: 0.12s; }
        [data-reveal="d2"] { transition-delay: 0.24s; }

        /* NAV */
        .nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          padding: 18px 48px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          backdrop-filter: blur(20px) saturate(1.3);
          -webkit-backdrop-filter: blur(20px) saturate(1.3);
          background: rgba(250,247,242,0.85);
          border-bottom: 1px solid var(--border-light);
        }

        .nav-logo {
          font-family: var(--heading);
          font-size: 22px;
          font-weight: 400;
          color: var(--text);
          text-decoration: none;
          letter-spacing: -0.01em;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .nav-link {
          font-family: var(--body);
          font-size: 14px;
          font-weight: 400;
          color: var(--text-secondary);
          text-decoration: none;
          transition: all 0.25s;
          padding: 9px 22px;
          border-radius: 100px;
          border: 1px solid var(--border);
          background: transparent;
        }
        .nav-link:hover {
          color: var(--text);
          border-color: #ccc5b8;
          background: rgba(0,0,0,0.02);
        }

        .nav-cta {
          font-family: var(--body);
          font-size: 14px;
          font-weight: 500;
          padding: 9px 24px;
          background: var(--accent);
          color: #faf7f2;
          border: none;
          border-radius: 100px;
          cursor: pointer;
          transition: all 0.25s;
          text-decoration: none;
        }
        .nav-cta:hover {
          background: var(--accent-light);
          box-shadow: 0 2px 12px rgba(45,95,45,0.15);
        }

        /* HERO */
        .hero {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 140px 24px 100px;
          position: relative;
          overflow: hidden;
        }

        /* Paper texture — subtle noise */
        .hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.025;
          pointer-events: none;
        }

        .hero-ornament {
          position: absolute;
          top: 42%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 700px;
          height: 700px;
          border-radius: 50%;
          border: 1px solid rgba(45,95,45,0.06);
          pointer-events: none;
        }

        .hero-ornament::before {
          content: '';
          position: absolute;
          inset: 60px;
          border-radius: 50%;
          border: 1px solid rgba(45,95,45,0.04);
        }

        .hero-content {
          position: relative;
          z-index: 1;
          max-width: 660px;
        }

        .hero-label {
          font-family: var(--body);
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 32px;
          opacity: 0;
          animation: fadeIn 0.7s ease 0.2s forwards;
        }

        .hero-label-kindle {
          color: var(--accent);
          text-decoration: underline;
          text-decoration-color: rgba(45,95,45,0.4);
          text-underline-offset: 3px;
          text-decoration-thickness: 1.5px;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .hero h1 {
          font-family: var(--heading);
          font-size: clamp(44px, 6vw, 74px);
          font-weight: 300;
          line-height: 1.1;
          letter-spacing: -0.03em;
          margin: 0 0 28px;
          opacity: 0;
          animation: heroUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.3s forwards;
        }

        .hero h1 em {
          font-style: italic;
          color: var(--accent);
        }

        @keyframes heroUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .hero-sub {
          font-family: var(--body);
          font-size: 19px;
          font-weight: 400;
          line-height: 1.65;
          color: var(--text-secondary);
          max-width: 480px;
          margin: 0 auto 44px;
          opacity: 0;
          animation: heroUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.5s forwards;
        }

        .hero-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
          align-items: center;
          opacity: 0;
          animation: heroUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.65s forwards;
        }

        .btn-primary {
          font-family: var(--body);
          font-size: 16px;
          font-weight: 500;
          padding: 15px 36px;
          background: var(--accent);
          color: #faf7f2;
          border: none;
          border-radius: 100px;
          cursor: pointer;
          transition: all 0.3s;
          text-decoration: none;
        }
        .btn-primary:hover {
          background: var(--accent-light);
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(45,95,45,0.15);
        }

        .btn-text {
          font-family: var(--body);
          font-size: 15px;
          color: var(--text-secondary);
          text-decoration: none;
          padding: 15px 8px;
          transition: color 0.25s;
          border-bottom: 1px solid transparent;
        }
        .btn-text:hover {
          color: var(--accent);
          border-bottom-color: var(--accent);
        }

        .hero-proof {
          font-family: var(--body);
          font-size: 13px;
          color: var(--text-dim);
          margin-top: 28px;
          letter-spacing: 0.01em;
          opacity: 0;
          animation: heroUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.8s forwards;
        }

        .hero-proof span {
          margin: 0 8px;
          opacity: 0.4;
        }

        /* FEATURES */
        .features {
          padding: 100px 24px 80px;
          position: relative;
        }

        .features-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-bottom: 56px;
        }

        .divider-line {
          width: 60px;
          height: 1px;
          background: var(--border);
        }

        .divider-diamond {
          width: 6px;
          height: 6px;
          border: 1px solid var(--border);
          transform: rotate(45deg);
        }

        .section-heading {
          font-family: var(--heading);
          font-size: clamp(30px, 3.5vw, 42px);
          font-weight: 300;
          text-align: center;
          letter-spacing: -0.025em;
          margin-bottom: 10px;
          line-height: 1.2;
        }

        .section-sub {
          font-family: var(--body);
          font-size: 16px;
          color: var(--text-secondary);
          text-align: center;
          max-width: 440px;
          margin: 0 auto 72px;
          line-height: 1.65;
          font-weight: 400;
        }

        /* Feature rows */
        .feature-row {
          max-width: 1000px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
          padding: 56px 0;
          border-top: 1px solid var(--border-light);
        }

        .feature-row:first-of-type { border-top: none; padding-top: 0; }

        .feature-row.flip { direction: rtl; }
        .feature-row.flip > * { direction: ltr; }

        /* Italic number from Midnight Library style */
        .feature-num {
          font-family: var(--heading);
          font-size: 48px;
          font-weight: 300;
          color: var(--accent);
          opacity: 0.3;
          line-height: 1;
          margin-bottom: 16px;
          font-style: italic;
        }

        .feature-title {
          font-family: var(--heading);
          font-size: 28px;
          font-weight: 400;
          letter-spacing: -0.015em;
          margin-bottom: 16px;
          line-height: 1.2;
        }

        .feature-desc {
          font-family: var(--body);
          font-size: 16px;
          font-weight: 400;
          color: var(--text-secondary);
          line-height: 1.75;
        }

        /* Visual cards */
        .v-card {
          border-radius: 16px;
          border: 1px solid var(--border);
          background: var(--surface);
          padding: 28px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03);
        }

        /* Queue visual */
        .q-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          border-radius: 10px;
          background: var(--bg);
          border: 1px solid var(--border-light);
          margin-bottom: 8px;
        }
        .q-item:last-child { margin-bottom: 0; }

        .q-marker {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--accent);
          flex-shrink: 0;
          opacity: 0.7;
        }

        .q-lines { flex: 1; }

        .q-title-line {
          height: 10px;
          border-radius: 5px;
          background: var(--border);
          margin-bottom: 6px;
        }

        .q-meta-line {
          height: 7px;
          border-radius: 4px;
          background: var(--border-light);
          width: 50%;
        }

        /* Kindle visual */
        .kindle-wrap {
          display: flex;
          justify-content: center;
          position: relative;
        }

        .kindle-shadow {
          position: absolute;
          bottom: -30px;
          left: 50%;
          transform: translateX(-50%);
          width: 200px;
          height: 40px;
          background: radial-gradient(ellipse, rgba(0,0,0,0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        .kindle-frame {
          width: 270px;
          background: #4a453e;
          border-radius: 20px;
          padding: 16px 14px 34px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.12);
          position: relative;
        }

        .kindle-frame::after {
          content: '';
          position: absolute;
          bottom: 13px;
          left: 50%;
          transform: translateX(-50%);
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #5a554e;
        }

        .kindle-screen {
          background: #f5f1e8;
          border-radius: 3px;
          padding: 26px 20px;
          min-height: 340px;
          font-family: Georgia, serif;
          color: #1a1a1a;
        }

        .ks-brand {
          font-family: var(--body);
          font-size: 9px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #999;
          text-align: center;
          margin-bottom: 28px;
        }

        .ks-issue {
          font-size: 18px;
          text-align: center;
          line-height: 1.25;
          margin-bottom: 4px;
          font-family: var(--heading);
        }

        .ks-date {
          font-size: 10px;
          text-align: center;
          color: #888;
          margin-bottom: 24px;
        }

        .ks-rule {
          width: 20px;
          height: 1px;
          background: #ccc;
          margin: 0 auto 18px;
        }

        .ks-toc { list-style: none; padding: 0; margin: 0; }

        .ks-toc li {
          font-size: 10.5px;
          color: #444;
          padding: 6px 0;
          border-bottom: 1px solid #e8e4db;
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          line-height: 1.4;
        }
        .ks-toc li:last-child { border-bottom: none; }
        .ks-toc li span {
          font-size: 8px;
          color: #aaa;
          flex-shrink: 0;
          margin-left: 8px;
        }

        /* Schedule visual */
        .sched-label {
          font-family: var(--body);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-secondary);
          margin-bottom: 20px;
        }

        .sched-days {
          display: flex;
          gap: 6px;
          margin-bottom: 24px;
        }

        .sched-pill {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--body);
          font-size: 13px;
          font-weight: 400;
          border: 1px solid var(--border);
          background: var(--bg);
          color: var(--text-dim);
          transition: all 0.3s;
        }

        .sched-pill.active {
          background: var(--accent);
          color: #fff;
          border-color: var(--accent);
        }

        .sched-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-top: 1px solid var(--border-light);
        }

        .sched-row-label {
          font-family: var(--body);
          font-size: 14px;
          font-weight: 400;
          color: var(--text-secondary);
        }

        .sched-row-val {
          font-family: var(--body);
          font-size: 14px;
          color: var(--text);
          padding: 5px 14px;
          border-radius: 6px;
          border: 1px solid var(--border);
          background: var(--bg);
        }

        /* BOTTOM CTA */
        .bottom-cta {
          padding: 140px 24px;
          text-align: center;
          position: relative;
          background: var(--surface-warm);
        }

        .bottom-cta::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.02;
          pointer-events: none;
        }

        .bottom-inner {
          position: relative;
          z-index: 1;
        }

        .bottom-cta h2 {
          font-family: var(--heading);
          font-size: clamp(36px, 5vw, 58px);
          font-weight: 300;
          letter-spacing: -0.025em;
          line-height: 1.1;
          margin-bottom: 16px;
        }

        .bottom-cta h2 em {
          font-style: italic;
          color: var(--accent);
        }

        .bottom-sub {
          font-family: var(--body);
          font-size: 17px;
          font-weight: 400;
          color: var(--text-secondary);
          margin-bottom: 40px;
          line-height: 1.65;
        }

        .bottom-fine {
          font-family: var(--body);
          font-size: 13px;
          color: var(--text-dim);
          margin-top: 24px;
        }

        /* FOOTER */
        .landing-footer {
          padding: 44px 24px;
          text-align: center;
          border-top: 1px solid var(--border-light);
          background: var(--bg);
        }

        .landing-footer p {
          font-family: var(--body);
          font-size: 13px;
          color: var(--text-dim);
          font-weight: 400;
        }

        /* RESPONSIVE */
        @media (max-width: 900px) {
          .feature-row {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .feature-row.flip { direction: ltr; }
          .kindle-frame { width: 230px; }
        }

        @media (max-width: 768px) {
          .nav { padding: 14px 20px; }
          .nav-links { gap: 10px; }
        }
      `}</style>

      {/* NAV */}
      <nav className="nav">
        <Link href="/" className="nav-logo">q2kindle</Link>
        <div className="nav-links">
          <Link href="/login" className="nav-link">Log in</Link>
          <Link href="/login" className="nav-cta">Get started</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-ornament" />
        <div className="hero-content">
          <p className="hero-label">A reading companion for your <span className="hero-label-kindle">Kindle</span></p>
          <h1>Articles deserve<br />a quieter place<br />to be <em>read.</em></h1>
          <p className="hero-sub">
            Queue the articles you find. We compile them into a beautiful ebook and deliver it straight to your Kindle.
          </p>
          <div className="hero-actions">
            <Link href="/login" className="btn-primary">Send your first article</Link>
            <a href="#features" className="btn-text">See how it works</a>
          </div>
          <p className="hero-proof">Free forever<span>&middot;</span>Any Kindle device<span>&middot;</span>30-second setup</p>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features" id="features">
        <div data-reveal>
          <div className="features-divider">
            <div className="divider-line" />
            <div className="divider-diamond" />
            <div className="divider-line" />
          </div>
          <h2 className="section-heading">Three steps to distraction-free reading</h2>
          <p className="section-sub">No apps to install, no accounts to sync. Just your articles, beautifully set on your Kindle.</p>
        </div>

        {/* Feature 1 */}
        <div className="feature-row">
          <div data-reveal>
            <div className="feature-num">01</div>
            <h3 className="feature-title">Queue articles from anywhere</h3>
            <p className="feature-desc">Found something worth reading later? Paste the URL. We extract the title, author, and full text. It joins your personal queue.</p>
          </div>
          <div data-reveal="d1">
            <div className="v-card">
              <div className="q-item">
                <div className="q-marker" />
                <div className="q-lines">
                  <div className="q-title-line" style={{width: '88%'}} />
                  <div className="q-meta-line" style={{width: '50%'}} />
                </div>
              </div>
              <div className="q-item">
                <div className="q-marker" />
                <div className="q-lines">
                  <div className="q-title-line" style={{width: '72%'}} />
                  <div className="q-meta-line" style={{width: '42%'}} />
                </div>
              </div>
              <div className="q-item">
                <div className="q-marker" />
                <div className="q-lines">
                  <div className="q-title-line" style={{width: '82%'}} />
                  <div className="q-meta-line" style={{width: '56%'}} />
                </div>
              </div>
              <div className="q-item">
                <div className="q-marker" style={{opacity: 0.3}} />
                <div className="q-lines">
                  <div className="q-title-line" style={{width: '64%', opacity: 0.45}} />
                  <div className="q-meta-line" style={{width: '36%', opacity: 0.45}} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2 — flipped */}
        <div className="feature-row flip">
          <div data-reveal>
            <div className="feature-num">02</div>
            <h3 className="feature-title">We craft your ebook</h3>
            <p className="feature-desc">Your queue becomes a properly bound ebook — cover page, table of contents, clean typography. A real book, not a web clipping.</p>
          </div>
          <div data-reveal="d1">
            <div className="kindle-wrap">
              <div className="kindle-shadow" />
              <div className="kindle-frame">
                <div className="kindle-screen">
                  <div className="ks-brand">q2kindle</div>
                  <div className="ks-issue">Issue #14</div>
                  <div className="ks-date">February 21, 2026</div>
                  <div className="ks-rule" />
                  <ul className="ks-toc">
                    <li>The Arc of the Practical Creator <span>12 min</span></li>
                    <li>Why We Can&apos;t Have Nice Software <span>8 min</span></li>
                    <li>Reflections on a Year of Building <span>6 min</span></li>
                    <li>The Tyranny of the Marginal User <span>15 min</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 3 */}
        <div className="feature-row">
          <div data-reveal>
            <div className="feature-num">03</div>
            <h3 className="feature-title">Set your schedule.<br />We handle the rest.</h3>
            <p className="feature-desc">Choose your delivery days and time. q2kindle bundles your queue and delivers it — no button to press, nothing to remember.</p>
          </div>
          <div data-reveal="d1">
            <div className="v-card">
              <div className="sched-label">Delivery schedule</div>
              <div className="sched-days">
                <div className="sched-pill active">M</div>
                <div className="sched-pill">T</div>
                <div className="sched-pill">W</div>
                <div className="sched-pill active">T</div>
                <div className="sched-pill">F</div>
                <div className="sched-pill active">S</div>
                <div className="sched-pill">S</div>
              </div>
              <div className="sched-row">
                <div className="sched-row-label">Delivery time</div>
                <div className="sched-row-val">7:00 AM</div>
              </div>
              <div className="sched-row">
                <div className="sched-row-label">Minimum articles</div>
                <div className="sched-row-val">3</div>
              </div>
              <div className="sched-row">
                <div className="sched-row-label">Timezone</div>
                <div className="sched-row-val">America / New York</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="bottom-cta">
        <div className="bottom-inner" data-reveal>
          <h2>Stop saving.<br />Start <em>reading.</em></h2>
          <p className="bottom-sub">Your articles deserve better than a browser tab.</p>
          <Link href="/login" className="btn-primary">Send your first article</Link>
          <p className="bottom-fine">Free forever &middot; Any Kindle device &middot; 30-second setup</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <p>q2kindle &mdash; Queue articles. Get a beautiful ebook. Read distraction-free.</p>
      </footer>
    </>
  );
}
