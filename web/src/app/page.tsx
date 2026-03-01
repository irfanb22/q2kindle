"use client";

// Force fresh build chunks — v2
import { useEffect, useRef } from "react";
import Link from "next/link";

export default function LandingPage() {
  const scheduleCardRef = useRef<HTMLDivElement>(null);
  const scheduleDaysRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // General scroll-in for feature text + visuals
    const fadeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    document
      .querySelectorAll("[data-animate]")
      .forEach((el) => fadeObserver.observe(el));

    // Schedule card special animation
    const scheduleCard = scheduleCardRef.current;
    const scheduleDays = scheduleDaysRef.current;

    if (scheduleCard && scheduleDays) {
      const scheduleObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              scheduleDays.classList.add("animate");
              scheduleCard.classList.add("animate");
              scheduleObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.3 }
      );

      scheduleObserver.observe(scheduleCard);

      return () => {
        fadeObserver.disconnect();
        scheduleObserver.disconnect();
      };
    }

    return () => fadeObserver.disconnect();
  }, []);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
      `}</style>

      <style jsx>{`
        :global(:root) {
          --bg: #0a0a0a;
          --surface: #141414;
          --border: #262626;
          --text: #ededed;
          --text-muted: #888888;
          --text-dim: #555555;
          --accent: #22c55e;
          --accent-hover: #16a34a;
          --serif: 'Instrument Serif', Georgia, serif;
          --sans: 'DM Sans', -apple-system, sans-serif;
          --eink: #f5f1e8;
        }

        :global(html) { scroll-behavior: smooth; }

        :global(body) {
          background: var(--bg);
          color: var(--text);
          font-family: var(--sans);
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
        }

        /* NAV */
        .landing-nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          padding: 16px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          background: rgba(10,10,10,0.82);
          border-bottom: 1px solid rgba(38,38,38,0.4);
        }

        .nav-logo {
          font-family: var(--serif);
          font-size: 22px;
          color: var(--text);
          text-decoration: none;
          letter-spacing: -0.02em;
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .nav-login {
          font-family: var(--sans);
          font-size: 14px;
          color: var(--text-muted);
          text-decoration: none;
          transition: color 0.2s;
          font-weight: 400;
        }
        .nav-login:hover { color: var(--text); }

        .nav-cta {
          font-family: var(--sans);
          font-size: 14px;
          font-weight: 500;
          padding: 9px 22px;
          background: var(--accent);
          color: var(--bg);
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.2s;
          text-decoration: none;
        }
        .nav-cta:hover { background: var(--accent-hover); }

        /* HERO */
        .hero {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 130px 24px 80px;
          position: relative;
          background: var(--bg);
        }

        .hero::before {
          content: '';
          position: absolute;
          top: 38%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 900px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(ellipse, rgba(34,197,94,0.04) 0%, transparent 60%);
          pointer-events: none;
        }

        .hero::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
          background-size: 80px 80px;
          pointer-events: none;
        }

        .hero-inner {
          position: relative;
          z-index: 1;
          max-width: 700px;
        }

        .hero h1 {
          font-family: var(--serif);
          font-size: clamp(44px, 6vw, 72px);
          line-height: 1.08;
          letter-spacing: -0.03em;
          margin-bottom: 24px;
          opacity: 0;
          animation: fadeUp 0.8s ease 0.15s forwards;
        }

        .hero h1 em {
          font-style: italic;
          color: var(--accent);
        }

        .hero-sub {
          font-family: var(--sans);
          font-size: 18px;
          line-height: 1.65;
          color: var(--text-muted);
          max-width: 480px;
          margin: 0 auto 40px;
          opacity: 0;
          animation: fadeUp 0.8s ease 0.3s forwards;
        }

        .hero-cta-row {
          display: flex;
          gap: 16px;
          justify-content: center;
          align-items: center;
          opacity: 0;
          animation: fadeUp 0.8s ease 0.45s forwards;
        }

        .btn-primary {
          font-family: var(--sans);
          font-size: 16px;
          font-weight: 500;
          padding: 14px 32px;
          background: var(--accent);
          color: var(--bg);
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          box-shadow: 0 0 0 1px rgba(34,197,94,0.25), 0 2px 12px rgba(0,0,0,0.3);
        }
        .btn-primary:hover {
          background: var(--accent-hover);
          transform: translateY(-1px);
          box-shadow: 0 0 0 1px rgba(34,197,94,0.35), 0 6px 20px rgba(0,0,0,0.4);
        }

        .btn-ghost {
          font-family: var(--sans);
          font-size: 14px;
          color: var(--text-muted);
          text-decoration: none;
          transition: color 0.2s;
        }
        .btn-ghost:hover { color: var(--text); }

        .hero-note {
          font-family: var(--sans);
          font-size: 13px;
          color: var(--text-dim);
          margin-top: 20px;
          opacity: 0;
          animation: fadeUp 0.8s ease 0.55s forwards;
        }

        /* FEATURES */
        .features {
          padding: 80px 24px 60px;
          border-top: none;
          background: linear-gradient(180deg, var(--bg) 0%, #131313 8%, #131313 92%, var(--bg) 100%);
          position: relative;
        }

        .features-header {
          text-align: center;
          max-width: 560px;
          margin: 0 auto 56px;
        }

        .features-header h2 {
          font-family: var(--serif);
          font-size: 40px;
          letter-spacing: -0.02em;
          margin-bottom: 12px;
        }

        .features-header p {
          font-family: var(--sans);
          font-size: 16px;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .feature-row {
          max-width: 1000px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: center;
          padding: 52px 0;
          border-top: 1px solid rgba(255,255,255,0.04);
        }

        .feature-row:first-of-type {
          border-top: none;
          padding-top: 0;
        }

        .step-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid var(--accent);
          color: var(--accent);
          font-family: var(--sans);
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 16px;
          flex-shrink: 0;
        }

        .feature-row.flipped {
          direction: rtl;
        }
        .feature-row.flipped > * {
          direction: ltr;
        }

        .feature-text {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }

        .feature-text.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .feature-text h3 {
          font-family: var(--serif);
          font-size: 30px;
          letter-spacing: -0.02em;
          margin-bottom: 14px;
          line-height: 1.15;
        }

        .feature-text p {
          font-family: var(--sans);
          font-size: 16px;
          line-height: 1.65;
          color: var(--text-muted);
        }

        .feature-visual {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.6s ease 0.15s, transform 0.6s ease 0.15s;
        }

        .feature-visual.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* Queue Visual */
        .queue-card {
          border-radius: 16px;
          border: 1px solid var(--border);
          background: var(--surface);
          padding: 24px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.25);
        }

        .queue-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          border-radius: 10px;
          border: 1px solid rgba(38,38,38,0.6);
          background: var(--bg);
          margin-bottom: 8px;
        }

        .queue-item:last-child { margin-bottom: 0; }

        .queue-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--accent);
          flex-shrink: 0;
        }

        .queue-item-lines {
          flex: 1;
          min-width: 0;
        }

        .queue-line-title {
          height: 11px;
          border-radius: 4px;
          background: #333;
          margin-bottom: 6px;
        }

        .queue-line-meta {
          height: 8px;
          border-radius: 3px;
          background: #222;
          width: 55%;
        }

        /* Kindle Visual */
        .kindle-visual-wrap {
          display: flex;
          justify-content: center;
          position: relative;
        }

        .kindle-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 450px;
          height: 450px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(34,197,94,0.05) 0%, transparent 65%);
          pointer-events: none;
        }

        .kindle-device {
          width: 280px;
          background: #3a3a3a;
          border-radius: 22px;
          padding: 18px 16px 36px;
          box-shadow:
            0 40px 100px rgba(0,0,0,0.5),
            0 0 0 1px rgba(255,255,255,0.04) inset;
          position: relative;
        }

        .kindle-device::after {
          content: '';
          position: absolute;
          bottom: 14px;
          left: 50%;
          transform: translateX(-50%);
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #4a4a4a;
        }

        .kindle-screen {
          background: var(--eink);
          border-radius: 3px;
          padding: 28px 22px;
          min-height: 360px;
          font-family: Georgia, 'Times New Roman', serif;
          color: #1a1a1a;
          filter: grayscale(1);
        }

        .k-brand {
          font-family: var(--sans);
          font-size: 9px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #777;
          margin-bottom: 32px;
          text-align: center;
        }

        .k-issue-num {
          font-size: 20px;
          font-weight: normal;
          text-align: center;
          line-height: 1.25;
          margin-bottom: 5px;
        }

        .k-date {
          font-size: 11px;
          text-align: center;
          color: #777;
          margin-bottom: 28px;
        }

        .k-sep {
          width: 24px;
          height: 1px;
          background: #ccc;
          margin: 0 auto 20px;
        }

        .k-toc {
          list-style: none;
        }

        .k-toc li {
          font-size: 11px;
          color: #444;
          padding: 7px 0;
          border-bottom: 1px solid #e0dcd4;
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          line-height: 1.35;
        }

        .k-toc li:last-child { border-bottom: none; }

        .k-toc li span {
          font-size: 9px;
          color: #999;
          flex-shrink: 0;
          margin-left: 10px;
        }

        /* Schedule Visual */
        .schedule-card {
          border-radius: 16px;
          border: 1px solid var(--border);
          background: var(--surface);
          padding: 28px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.25);
        }

        .sc-label {
          font-family: var(--sans);
          font-size: 11px;
          font-weight: 500;
          color: var(--text-muted);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 20px;
        }

        .sc-days {
          display: flex;
          gap: 6px;
          margin-bottom: 24px;
        }

        .sc-pill {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--sans);
          font-size: 12px;
          font-weight: 500;
          border: 1px solid var(--border);
          background: var(--bg);
          color: var(--text-dim);
          transition: all 0.3s ease;
        }

        .sc-pill.on {
          background: var(--accent);
          color: var(--bg);
          border-color: var(--accent);
          box-shadow: 0 0 8px rgba(34,197,94,0.15);
        }

        .sc-days.animate .sc-pill.on {
          animation: pillPop 0.4s ease both;
        }

        .sc-days.animate .sc-pill.on:nth-child(1) { animation-delay: 0.1s; }
        .sc-days.animate .sc-pill.on:nth-child(4) { animation-delay: 0.25s; }
        .sc-days.animate .sc-pill.on:nth-child(6) { animation-delay: 0.4s; }

        @keyframes pillPop {
          0% { transform: scale(0.7); opacity: 0.5; }
          60% { transform: scale(1.08); }
          100% { transform: scale(1); opacity: 1; }
        }

        .sc-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 13px 0;
          border-top: 1px solid rgba(38,38,38,0.5);
          opacity: 0;
          transform: translateX(-8px);
          transition: opacity 0.4s ease, transform 0.4s ease;
        }

        .schedule-card.animate .sc-row:nth-child(3) { transition-delay: 0.5s; }
        .schedule-card.animate .sc-row:nth-child(4) { transition-delay: 0.65s; }
        .schedule-card.animate .sc-row:nth-child(5) { transition-delay: 0.8s; }

        .schedule-card.animate .sc-row {
          opacity: 1;
          transform: translateX(0);
        }

        .sc-row-label {
          font-family: var(--sans);
          font-size: 14px;
          color: var(--text-muted);
        }

        .sc-row-value {
          font-family: var(--sans);
          font-size: 14px;
          color: var(--text);
          padding: 5px 12px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--bg);
        }

        /* BOTTOM CTA */
        .bottom-cta {
          padding: 120px 24px;
          text-align: center;
          position: relative;
          background: var(--bg);
        }

        .bottom-cta::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 10%, var(--accent) 50%, transparent 90%);
          opacity: 0.25;
        }

        .bottom-cta::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 700px;
          height: 400px;
          border-radius: 50%;
          background: radial-gradient(ellipse, rgba(34,197,94,0.04) 0%, transparent 60%);
          pointer-events: none;
        }

        .bottom-inner {
          position: relative;
          z-index: 1;
        }

        .bottom-cta h2 {
          font-family: var(--serif);
          font-size: clamp(40px, 5.5vw, 60px);
          letter-spacing: -0.03em;
          line-height: 1.08;
          margin-bottom: 14px;
        }

        .bottom-cta h2 em {
          font-style: italic;
          color: var(--accent);
        }

        .bottom-cta .bottom-sub {
          font-family: var(--sans);
          font-size: 17px;
          color: var(--text-muted);
          margin-bottom: 40px;
          line-height: 1.5;
        }

        .bottom-cta .bottom-fine {
          font-family: var(--sans);
          font-size: 13px;
          color: var(--text-dim);
          margin-top: 20px;
        }

        /* FOOTER */
        .landing-footer {
          padding: 40px 24px;
          text-align: center;
          border-top: 1px solid var(--border);
        }

        .landing-footer p {
          font-family: var(--sans);
          font-size: 13px;
          color: var(--text-dim);
        }

        /* ANIMATIONS */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* RESPONSIVE */
        @media (max-width: 900px) {
          .feature-row {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .feature-row.flipped {
            direction: ltr;
          }
          .kindle-device { width: 240px; }
        }

        @media (max-width: 768px) {
          .landing-nav { padding: 14px 20px; }
          .nav-right { gap: 16px; }
        }
      `}</style>

      {/* NAV */}
      <nav className="landing-nav">
        <Link href="/" className="nav-logo">q2kindle</Link>
        <div className="nav-right">
          <Link href="/login" className="nav-login">Log in</Link>
          <Link href="/signup" className="nav-cta">Send your first article</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <h1>Your articles,<br />delivered to<br />your <em>Kindle.</em></h1>
          <p className="hero-sub">
            Queue articles. We compile them into a beautiful ebook and deliver it to your Kindle — on your schedule.
          </p>
          <div className="hero-cta-row">
            <Link href="/signup" className="btn-primary">Send your first article</Link>
            <a href="#features" className="btn-ghost">See how it works ↓</a>
          </div>
          <p className="hero-note">Free forever · Works with any Kindle · 30-second setup</p>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features" id="features">
        <div className="features-header">
          <h2>Three steps to distraction-free reading</h2>
          <p>Your articles, beautifully formatted on your Kindle.</p>
        </div>

        {/* Feature 1: Queue */}
        <div className="feature-row">
          <div className="feature-text" data-animate>
            <div className="step-number">1</div>
            <h3>Queue articles from anywhere</h3>
            <p>Found a great longread? Paste the URL. We extract the title, author, and content. It joins your queue.</p>
          </div>
          <div className="feature-visual" data-animate>
            <div className="queue-card">
              <div className="queue-item">
                <div className="queue-dot"></div>
                <div className="queue-item-lines">
                  <div className="queue-line-title" style={{width: '88%'}}></div>
                  <div className="queue-line-meta" style={{width: '50%'}}></div>
                </div>
              </div>
              <div className="queue-item">
                <div className="queue-dot"></div>
                <div className="queue-item-lines">
                  <div className="queue-line-title" style={{width: '72%'}}></div>
                  <div className="queue-line-meta" style={{width: '42%'}}></div>
                </div>
              </div>
              <div className="queue-item">
                <div className="queue-dot"></div>
                <div className="queue-item-lines">
                  <div className="queue-line-title" style={{width: '82%'}}></div>
                  <div className="queue-line-meta" style={{width: '58%'}}></div>
                </div>
              </div>
              <div className="queue-item">
                <div className="queue-dot" style={{opacity: 0.4}}></div>
                <div className="queue-item-lines">
                  <div className="queue-line-title" style={{width: '65%', opacity: 0.5}}></div>
                  <div className="queue-line-meta" style={{width: '38%', opacity: 0.5}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2: Ebook — flipped */}
        <div className="feature-row flipped">
          <div className="feature-text" data-animate>
            <div className="step-number">2</div>
            <h3>We build your ebook</h3>
            <p>Your articles become a formatted ebook — cover page, table of contents, clean typography. A real book, not a web page.</p>
          </div>
          <div className="feature-visual" data-animate>
            <div className="kindle-visual-wrap">
              <div className="kindle-glow"></div>
              <div className="kindle-device">
                <div className="kindle-screen">
                  <div className="k-brand">q2kindle</div>
                  <div className="k-issue-num">Issue #14</div>
                  <div className="k-date">February 21, 2026</div>
                  <div className="k-sep"></div>
                  <ul className="k-toc">
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

        {/* Feature 3: Schedule */}
        <div className="feature-row">
          <div className="feature-text" data-animate>
            <div className="step-number">3</div>
            <h3>Set your schedule.<br />We handle the rest.</h3>
            <p>Pick your days and time. q2kindle bundles your queue and delivers it — no button to press, nothing to remember.</p>
          </div>
          <div className="feature-visual" data-animate>
            <div className="schedule-card" ref={scheduleCardRef}>
              <div className="sc-label">Delivery schedule</div>
              <div className="sc-days" ref={scheduleDaysRef}>
                <div className="sc-pill on">M</div>
                <div className="sc-pill">T</div>
                <div className="sc-pill">W</div>
                <div className="sc-pill on">T</div>
                <div className="sc-pill">F</div>
                <div className="sc-pill on">S</div>
                <div className="sc-pill">S</div>
              </div>
              <div className="sc-row">
                <div className="sc-row-label">Delivery time</div>
                <div className="sc-row-value">7:00 AM</div>
              </div>
              <div className="sc-row">
                <div className="sc-row-label">Minimum articles</div>
                <div className="sc-row-value">3</div>
              </div>
              <div className="sc-row">
                <div className="sc-row-label">Timezone</div>
                <div className="sc-row-value">America/New_York</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="bottom-cta">
        <div className="bottom-inner">
          <h2>Stop saving.<br />Start <em>reading.</em></h2>
          <p className="bottom-sub">Your articles deserve better than a browser tab.</p>
          <Link href="/signup" className="btn-primary">Send your first article</Link>
          <p className="bottom-fine">Free forever · Works with any Kindle · 30-second setup</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <p>q2kindle — Queue articles. Get a beautiful ebook. Read distraction-free.</p>
      </footer>
    </>
  );
}
