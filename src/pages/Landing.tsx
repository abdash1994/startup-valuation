import { Link } from 'react-router-dom'
import './Landing.css'

export default function Landing() {
  const baseUrl = import.meta.env.BASE_URL || '/'

  return (
    <div className="landing">
      {/* Ambient background effects */}
      <div className="landing__orb landing__orb--1" />
      <div className="landing__orb landing__orb--2" />
      <div className="landing__orb landing__orb--3" />
      <div className="landing__grid" />

      <div className="landing__content">
        <section className="landing__hero">
          <div className="landing__badge">
            <span className="landing__badge-dot" />
            VC-Backed Valuation Methods
          </div>
          
          <h1>Startup Value Navigator</h1>
          
          <p className="landing__subtitle">
            Scenario-based valuations for early-stage founders and investors — with methods and assumptions you can actually defend.
          </p>

          <div className="landing__ctas">
            <Link to="/valuator" className="landing__cta landing__cta--primary" data-testid="valuator-cta">
              <span>Run a valuation</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
            <a 
              href={`${baseUrl}walkthrough-full.html`}
              target="_blank"
              rel="noopener noreferrer"
              className="landing__cta landing__cta--secondary"
            >
              See how it works
            </a>
          </div>

          <div className="landing__trust">
            <span><span className="trust-icon">✓</span> No credit card required</span>
            <span><span className="trust-icon">✓</span> Save unlimited valuations</span>
            <span><span className="trust-icon">✓</span> Research-backed methods</span>
          </div>
        </section>

        {/* Problem / Solution Section */}
        <section className="landing__problem-solution">
          <div className="landing__section-header">
            <span className="landing__section-tag">Why This Exists</span>
            <h2>The Problem We're Solving</h2>
          </div>
          
          <div className="problem-solution-grid">
            <div className="problem-solution-card problem-solution-card--problem">
              <h3>The Problem</h3>
              <p>
                Founders often guess at their startup's valuation, using vague comparables or 
                arbitrary numbers that don't reflect their actual metrics. Investors, meanwhile, 
                lack a shared language to discuss valuations consistently across different stages 
                and business models. This leads to misaligned expectations, wasted time in 
                fundraising conversations, and founders leaving money on the table—or pricing 
                themselves out of deals.
              </p>
            </div>
            <div className="problem-solution-card problem-solution-card--solution">
              <h3>The Solution</h3>
              <p>
                Startup Value Navigator provides a transparent, method-driven approach to valuation. 
                We use industry-standard methodologies (Berkus, Scorecard, Revenue Multiple) that 
                investors recognize, and we show you exactly how your inputs map to Bear, Base, and 
                Bull scenarios. This gives founders a defensible starting point for investor 
                conversations, and gives investors a consistent framework for evaluating deals.
              </p>
            </div>
          </div>
        </section>

        {/* Methodology Section */}
        <section className="landing__methods">
          <div className="landing__section-header">
            <span className="landing__section-tag">Methodology</span>
            <h2>Stage-Appropriate Valuation Methods</h2>
            <p>We apply the right methodology based on your company's stage and revenue.</p>
          </div>
          
          <div className="methods-grid">
            <div className="method-card">
              <div className="method-card__stage">Pre-seed / Concept</div>
              <h3>Berkus Method</h3>
              <p>Qualitative scoring across 5 risk dimensions for pre-revenue companies.</p>
              <div className="method-card__range">$250K – $2M</div>
            </div>
            <div className="method-card method-card--highlighted">
              <div className="method-card__stage">Seed</div>
              <h3>Scorecard Method</h3>
              <p>Weighted comparison against regional startup averages.</p>
              <div className="method-card__range">$2M – $10M</div>
            </div>
            <div className="method-card">
              <div className="method-card__stage">Series A+</div>
              <h3>Revenue Multiple</h3>
              <p>Growth-adjusted ARR multiples calibrated to your stage.</p>
              <div className="method-card__range">$15M – $1B+</div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="landing__features">
          <div className="landing__section-header">
            <span className="landing__section-tag">Features</span>
            <h2>Why Startup Value Navigator?</h2>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-card__icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 3v18h18"/>
                  <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
                </svg>
              </div>
              <h3>Three-Scenario Modeling</h3>
              <p>Get Bear, Base, and Bull case valuations that adjust in real-time as you tweak your inputs.</p>
            </div>

            <div className="feature-card">
              <div className="feature-card__icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              </div>
              <h3>Instant Calculations</h3>
              <p>No waiting. See your valuation update live as you adjust ARR, growth, TAM, and more.</p>
            </div>

            <div className="feature-card">
              <div className="feature-card__icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <h3>Stage-Aware Multiples</h3>
              <p>From Pre-seed to Series C+, we apply appropriate multiples for your company's stage.</p>
            </div>

            <div className="feature-card">
              <div className="feature-card__icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
              </div>
              <h3>Save & Compare</h3>
              <p>Create an account to save valuations, track changes, and compare different scenarios.</p>
            </div>

            <div className="feature-card">
              <div className="feature-card__icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <h3>Private & Secure</h3>
              <p>Your data is encrypted and never shared. Only you can access your valuations.</p>
            </div>

            <div className="feature-card">
              <div className="feature-card__icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <h3>AI-Powered Insights</h3>
              <p>Get intelligent takeaways and recommendations based on your inputs.</p>
            </div>
          </div>
        </section>

        {/* Metrics Section */}
        <section className="landing__metrics">
          <div className="landing__section-header">
            <span className="landing__section-tag">Inputs</span>
            <h2>Metrics That Matter</h2>
            <p>Comprehensive inputs calibrated to real market data.</p>
          </div>
          
          <div className="metrics-showcase">
            <div className="metric-item">
              <span className="metric-item__label">ARR</span>
              <span className="metric-item__range">$0 – $200M</span>
            </div>
            <div className="metric-item">
              <span className="metric-item__label">Monthly Growth</span>
              <span className="metric-item__range">0% – 50%</span>
            </div>
            <div className="metric-item">
              <span className="metric-item__label">TAM</span>
              <span className="metric-item__range">$100M – $500B</span>
            </div>
            <div className="metric-item">
              <span className="metric-item__label">Gross Margin</span>
              <span className="metric-item__range">20% – 95%</span>
            </div>
            <div className="metric-item">
              <span className="metric-item__label">Net Retention</span>
              <span className="metric-item__range">50% – 180%</span>
            </div>
            <div className="metric-item">
              <span className="metric-item__label">Burn Multiple</span>
              <span className="metric-item__range">0x – 5x</span>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="landing__cta-section">
          <div className="landing__cta-glow" />
          <h2>Ready to Value Your Startup?</h2>
          <p>Join founders and investors who use Startup Value Navigator</p>
          <div className="landing__cta-buttons">
            <Link to="/valuator" className="landing__cta landing__cta--large">
              Get Started Free
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
            <a 
              href={`${baseUrl}walkthrough-full.html`}
              target="_blank"
              rel="noopener noreferrer"
              className="landing__cta landing__cta--outline"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
              Read User Guide
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="landing__footer">
          <div className="landing__footer-links">
            <a 
              href={`${baseUrl}walkthrough-full.html`}
              target="_blank"
              rel="noopener noreferrer"
            >
              User Guide
            </a>
            <span className="landing__footer-divider">•</span>
            <Link to="/valuator">Valuator</Link>
            <span className="landing__footer-divider">•</span>
            <Link to="/login">Login</Link>
          </div>
          <p>© 2025 Startup Value Navigator. Built for founders, by founders.</p>
          <p className="landing__disclaimer">
            Disclaimer: Valuations are for planning purposes only. Consult professionals for investment decisions.
          </p>
        </footer>
      </div>
    </div>
  )
}
