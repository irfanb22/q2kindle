import Link from "next/link";
import { LandingAnimations } from "./landing-animations";
import "./landing.css";

export default function LandingPage() {
  return (
    <>
      <LandingAnimations />

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
            <div className="schedule-card">
              <div className="sc-label">Delivery schedule</div>
              <div className="sc-days">
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
