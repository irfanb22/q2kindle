"use client";

import { useEffect } from "react";
import Link from "next/link";
import "./landing.css";

export default function LandingPage() {
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
            Queue the articles you find. We compile them into a beautiful ebook and deliver it straight to your <strong style={{fontWeight: 600, color: 'var(--color-text)'}}>Kindle</strong>.
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
                <div className="kindle-screen kindle-cover">
                  <div className="kc-title">Q2KINDLE</div>
                  <div className="kc-rule" />
                  <div className="kc-date">March 17, 2026</div>
                  <div className="kc-vol">Volume 1 • Issue 17</div>
                  <div className="kc-stats">5 articles • 47 min read</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 3 */}
        <div className="feature-row">
          <div data-reveal>
            <div className="feature-num">03</div>
            <h3 className="feature-title">Set your next<br />reading session.</h3>
            <p className="feature-desc">Pick your days and time. We bundle your queue into a fresh ebook and deliver it to your Kindle — nothing to press, nothing to remember.</p>
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
