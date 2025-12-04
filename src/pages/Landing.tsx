import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Landing.css'

export default function Landing() {
  const { user } = useAuth()

  return (
    <div className="landing">
      <div className="landing__backdrop" />
      <div className="landing__glow" />

      <div className="landing__content">
        <section className="landing__hero">
          <div className="landing__badge">🚀 Startup Valuation Tool</div>
          <h1>
            Know Your Startup's
            <span className="gradient-text"> True Value</span>
          </h1>
          <p className="landing__subtitle">
            Intelligent valuation modeling combining market comparables, forward ARR,
            and qualitative signals. Get Bear, Base, and Bull case scenarios instantly.
          </p>

          <div className="landing__ctas">
            <Link to="/valuator" className="landing__cta landing__cta--primary">
              Try Valuator Free
            </Link>
            {!user && (
              <Link to="/signup" className="landing__cta landing__cta--secondary">
                Create Account
              </Link>
            )}
            {user && (
              <Link to="/dashboard" className="landing__cta landing__cta--secondary">
                View Dashboard
              </Link>
            )}
          </div>

          <div className="landing__trust">
            <span>✓ No credit card required</span>
            <span>✓ Save unlimited valuations</span>
            <span>✓ Export reports</span>
          </div>
        </section>

        <section className="landing__features">
          <h2>Why Startup Value Navigator?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-card__icon">📊</div>
              <h3>Three-Scenario Modeling</h3>
              <p>Get Bear, Base, and Bull case valuations that adjust in real-time as you tweak your inputs.</p>
            </div>

            <div className="feature-card">
              <div className="feature-card__icon">⚡</div>
              <h3>Instant Calculations</h3>
              <p>No waiting. See your valuation update live as you adjust ARR, growth, TAM, and more.</p>
            </div>

            <div className="feature-card">
              <div className="feature-card__icon">🎯</div>
              <h3>Stage-Aware Multiples</h3>
              <p>From Pre-seed to Series C+, we apply appropriate multiples for your company's stage.</p>
            </div>

            <div className="feature-card">
              <div className="feature-card__icon">💾</div>
              <h3>Save & Compare</h3>
              <p>Create an account to save valuations, track changes, and compare different scenarios.</p>
            </div>

            <div className="feature-card">
              <div className="feature-card__icon">🔒</div>
              <h3>Private & Secure</h3>
              <p>Your data is encrypted and never shared. Only you can access your valuations.</p>
            </div>

            <div className="feature-card">
              <div className="feature-card__icon">📈</div>
              <h3>AI-Powered Insights</h3>
              <p>Get intelligent takeaways and recommendations based on your inputs.</p>
            </div>
          </div>
        </section>

        <section className="landing__metrics">
          <h2>Inputs That Matter</h2>
          <div className="metrics-showcase">
            <div className="metric-item">
              <span className="metric-item__label">ARR</span>
              <span className="metric-item__range">$0 - $120M</span>
            </div>
            <div className="metric-item">
              <span className="metric-item__label">Monthly Growth</span>
              <span className="metric-item__range">0% - 30%</span>
            </div>
            <div className="metric-item">
              <span className="metric-item__label">TAM</span>
              <span className="metric-item__range">$5B - $250B</span>
            </div>
            <div className="metric-item">
              <span className="metric-item__label">Gross Margin</span>
              <span className="metric-item__range">30% - 95%</span>
            </div>
            <div className="metric-item">
              <span className="metric-item__label">Net Retention</span>
              <span className="metric-item__range">60% - 160%</span>
            </div>
            <div className="metric-item">
              <span className="metric-item__label">Burn Multiple</span>
              <span className="metric-item__range">0.2x - 4.0x</span>
            </div>
          </div>
        </section>

        <section className="landing__cta-section">
          <h2>Ready to Value Your Startup?</h2>
          <p>Join founders and investors who use Startup Value Navigator</p>
          <Link to="/valuator" className="landing__cta landing__cta--large">
            Get Started Free →
          </Link>
        </section>

        <footer className="landing__footer">
          <p>© 2025 Startup Value Navigator. Built for founders, by founders.</p>
          <p className="landing__disclaimer">
            Disclaimer: Valuations are for planning purposes only. Consult professionals for investment decisions.
          </p>
        </footer>
      </div>
    </div>
  )
}

