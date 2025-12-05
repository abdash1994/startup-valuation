import { useEffect, useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getValuationById, type SavedValuation } from '../utils/savedValuations'
import MethodologyModal from '../components/MethodologyModal'
import { telemetry } from '../analytics/telemetry'
import './SharedValuation.css'

const compactCurrencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
})

const formatCompactCurrency = (value: number) =>
  compactCurrencyFormatter.format(Math.round(Math.max(value, 0)))

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const formatCurrency = (value: number) =>
  currencyFormatter.format(Math.round(Math.max(value, 0)))

const stageLabels: Record<string, string> = {
  concept: 'Concept / Pre-seed',
  seed: 'Seed / MVP',
  seriesA: 'Series A',
  seriesB: 'Series B',
  seriesC: 'Series C+',
}

type StageKey = 'concept' | 'seed' | 'seriesA' | 'seriesB' | 'seriesC'

export default function SharedValuation() {
  const { id } = useParams<{ id: string }>()
  const [valuation, setValuation] = useState<SavedValuation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showMethodology, setShowMethodology] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  useEffect(() => {
    if (!id) {
      setError('No valuation ID provided')
      setLoading(false)
      return
    }

    try {
      const data = getValuationById(id)
      if (data) {
        setValuation(data)
        telemetry.track('page_view', { page: 'shared', id })
      } else {
        setError('Valuation not found')
      }
    } catch (err) {
      console.error('Error loading shared valuation:', err)
      setError('Failed to load valuation')
    } finally {
      setLoading(false)
    }
  }, [id])

  const isPreRevenue = useMemo(() => {
    if (!valuation) return false
    return valuation.stage === 'concept' || (valuation.stage === 'seed' && valuation.arr < 0.1)
  }, [valuation])

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setLinkCopied(true)
      telemetry.track('share_link_copied', {})
      setTimeout(() => setLinkCopied(false), 2000)
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = window.location.href
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="shared-loading">
        <div className="loading-spinner" />
        <p>Loading valuation...</p>
      </div>
    )
  }

  if (error || !valuation) {
    return (
      <div className="shared-error">
        <span className="shared-error__icon">🔍</span>
        <h2>Valuation Not Found</h2>
        <p>{error || 'This valuation may have been deleted or the link is invalid.'}</p>
        <Link to="/valuator" className="shared-error__btn">
          Create New Valuation
        </Link>
      </div>
    )
  }

  const scenarioMax = Math.max(valuation.bull, valuation.base, valuation.bear, 1)
  const confidencePercent = Math.round(valuation.confidence * 100)
  const annualGrowth = Math.pow(1 + valuation.monthlyGrowth / 100, 12) - 1

  return (
    <div className="shared-container">
      <div className="shared-backdrop" />
      <div className="shared-glow" />

      <div className="shared-content">
        {/* Header */}
        <header className="shared-header">
          <div className="shared-header__info">
            <span className="shared-header__badge">Shared Valuation</span>
            <h1>{valuation.companyName}</h1>
            <p className="shared-header__stage">
              {stageLabels[valuation.stage] || valuation.stage}
            </p>
          </div>
          <div className="shared-header__actions">
            <button 
              onClick={handleCopyLink} 
              className="shared-btn shared-btn--secondary"
            >
              {linkCopied ? '✓ Copied!' : '🔗 Copy Link'}
            </button>
            <Link to="/valuator" className="shared-btn shared-btn--primary">
              Create Your Own
            </Link>
          </div>
        </header>

        {/* Scenario Cards */}
        <section className="shared-scenarios">
          <div className="shared-scenarios__header">
            <h2>Valuation Scenarios</h2>
            <button 
              className="methodology-trigger"
              onClick={() => setShowMethodology(true)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Methodology
            </button>
          </div>

          <div className="scenario-grid">
            {(['bear', 'base', 'bull'] as const).map((key) => {
              const value = valuation[key]
              const delta = key === 'base' ? 0 : value / Math.max(valuation.base, 1) - 1

              return (
                <article className={`valuation-card valuation-card--${key}`} key={key}>
                  <div className="valuation-card__header">
                    <p>{key === 'bear' ? 'Bear Case' : key === 'bull' ? 'Bull Case' : 'Base Case'}</p>
                    <span>
                      {key === 'base'
                        ? 'Balanced view'
                        : `${delta > 0 ? '+' : ''}${(delta * 100).toFixed(0)}% vs base`}
                    </span>
                  </div>
                  <div className="valuation-card__value">{formatCompactCurrency(value)}</div>
                  <p className="valuation-card__helper">
                    {key === 'bear' && 'Conservative downside protection'}
                    {key === 'base' && 'Blends revenue, market, and forward ARR'}
                    {key === 'bull' && 'Optimistic capture with growth premium'}
                  </p>
                </article>
              )
            })}
          </div>

          {/* Scenario Bars */}
          <div className="scenario-bars">
            {(['bear', 'base', 'bull'] as const).map((key) => (
              <div className="scenario-bar" key={key}>
                <span>{key === 'bear' ? 'Bear' : key === 'bull' ? 'Bull' : 'Base'}</span>
                <div className="scenario-bar__track">
                  <div
                    style={{
                      width: `${Math.max((valuation[key] / scenarioMax) * 100, 6)}%`,
                    }}
                  />
                  <p>{formatCurrency(valuation[key])}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Key Metrics */}
        <section className="shared-metrics">
          <h2>Key Metrics</h2>
          <div className="metrics-grid">
            <div className="metric-item">
              <span className="metric-label">ARR</span>
              <span className="metric-value">{valuation.arr === 0 ? 'Pre-revenue' : `$${valuation.arr}M`}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Monthly Growth</span>
              <span className="metric-value">{valuation.monthlyGrowth}%</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Annual Growth</span>
              <span className="metric-value">{(annualGrowth * 100).toFixed(0)}%</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Revenue Multiple</span>
              <span className="metric-value">{valuation.revenueMultiple.toFixed(1)}x</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">TAM</span>
              <span className="metric-value">${valuation.tam}B</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Gross Margin</span>
              <span className="metric-value">{valuation.grossMargin}%</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Net Retention</span>
              <span className="metric-value">{valuation.netRetention}%</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Burn Multiple</span>
              <span className="metric-value">{valuation.burnMultiple === 0 ? 'Profitable' : `${valuation.burnMultiple}x`}</span>
            </div>
          </div>
        </section>

        {/* Confidence */}
        <section className="shared-confidence">
          <div className="confidence__headings">
            <h3>Model Confidence</h3>
            <p>Based on revenue, product moats, and market depth signals.</p>
          </div>
          <div className="confidence__meter">
            <div style={{ width: `${confidencePercent}%` }} />
          </div>
          <p className="confidence__percent">{confidencePercent}%</p>
        </section>

        {/* Insights */}
        {valuation.insights && valuation.insights.length > 0 && (
          <section className="shared-insights">
            <h2>Key Insights</h2>
            <ul className="insights-list">
              {valuation.insights.map((insight, index) => (
                <li key={index}>{insight}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Disclaimer */}
        <footer className="shared-footer">
          <p className="shared-disclaimer">
            <strong>Disclaimer:</strong> This is a directional estimate based on inputs and 
            typical startup valuation heuristics. It is not a formal valuation, fairness opinion, 
            or tax/legal advice. Consult qualified professionals for investment decisions.
          </p>
          <p className="shared-created">
            Created: {new Date(valuation.createdAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
          <div className="shared-footer__cta">
            <p>Want to create your own valuation?</p>
            <Link to="/valuator" className="shared-btn shared-btn--primary">
              Try Startup Value Navigator
            </Link>
          </div>
        </footer>
      </div>

      {/* Methodology Modal */}
      <MethodologyModal
        isOpen={showMethodology}
        onClose={() => setShowMethodology(false)}
        stage={valuation.stage as StageKey}
        isPreRevenue={isPreRevenue}
        valuation={{
          bear: valuation.bear,
          base: valuation.base,
          bull: valuation.bull,
          revenueMultiple: valuation.revenueMultiple,
          confidence: valuation.confidence,
          lifts: {
            growth: 1 + annualGrowth,
            margin: valuation.grossMargin / 100,
            retention: valuation.netRetention / 100,
            burn: valuation.burnMultiple,
            qualitative: (valuation.teamStrength + valuation.differentiation) / 10,
          },
        }}
        inputs={{
          arr: valuation.arr,
          monthlyGrowth: valuation.monthlyGrowth,
          grossMargin: valuation.grossMargin,
          netRetention: valuation.netRetention,
          burnMultiple: valuation.burnMultiple,
          teamStrength: valuation.teamStrength,
          differentiation: valuation.differentiation,
          tam: valuation.tam,
        }}
      />
    </div>
  )
}

