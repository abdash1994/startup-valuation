import { useEffect, useRef } from 'react'
import type { StageKey } from '../utils/benchmarks'
import { methodologyDescriptions } from '../utils/benchmarks'
import './MethodologyModal.css'

type MethodologyModalProps = {
  isOpen: boolean
  onClose: () => void
  stage: StageKey
  isPreRevenue: boolean
  // Live valuation data to display
  valuation: {
    bear: number
    base: number
    bull: number
    revenueMultiple: number
    confidence: number
    lifts: {
      growth: number
      margin: number
      retention: number
      burn: number
      qualitative: number
    }
  }
  inputs: {
    arr: number
    monthlyGrowth: number
    grossMargin: number
    netRetention: number
    burnMultiple: number
    teamStrength: number
    differentiation: number
    tam: number
  }
}

const compactCurrencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
})

const formatCompactCurrency = (value: number) =>
  compactCurrencyFormatter.format(Math.round(Math.max(value, 0)))

export default function MethodologyModal({
  isOpen,
  onClose,
  stage,
  isPreRevenue,
  valuation,
  inputs,
}: MethodologyModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen) {
      dialog.showModal()
    } else {
      dialog.close()
    }
  }, [isOpen])

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === dialogRef.current) {
      onClose()
    }
  }

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const methodology = isPreRevenue
    ? methodologyDescriptions.berkus
    : methodologyDescriptions.revenueMultiple

  const stageLabels: Record<StageKey, string> = {
    concept: 'Concept / Pre-seed',
    seed: 'Seed / MVP',
    seriesA: 'Series A',
    seriesB: 'Series B',
    seriesC: 'Series C+',
  }

  // Calculate derived values for display
  const annualGrowth = Math.pow(1 + inputs.monthlyGrowth / 100, 12) - 1
  const arrUsd = inputs.arr * 1_000_000

  return (
    <dialog
      ref={dialogRef}
      className="methodology-modal"
      onClick={handleBackdropClick}
    >
      <div className="methodology-modal__content">
        <header className="methodology-modal__header">
          <div>
            <span className="methodology-modal__badge">{stageLabels[stage]}</span>
            <h2>{methodology.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="methodology-modal__close"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <div className="methodology-modal__body">
          {/* Method Description */}
          <section className="methodology-section">
            <h3>How Your Valuation is Calculated</h3>
            {isPreRevenue ? (
              <>
                <p>
                  <strong>Berkus Method</strong> — For pre-revenue startups, we assign value to five key risk-reduction factors. 
                  Each factor can contribute up to $500K, with a maximum total valuation of ~$2.5M for exceptional early-stage companies. 
                  This method is industry-standard for concept and pre-seed stages where revenue multiples don't apply.
                </p>
                <p style={{ marginTop: '0.75rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                  <strong>Simplified formula:</strong> Valuation = (Idea Value + Prototype Value + Team Value + Strategic Value + Market Timing Value), 
                  each capped at their maximum contribution.
                </p>
              </>
            ) : (
              <>
                <p>
                  <strong>Revenue Multiple Method</strong> — For revenue-generating startups, your valuation is calculated as ARR multiplied by 
                  a growth-adjusted multiple. The base multiple comes from your stage (e.g., 10–25x for Series A), then we adjust it based on 
                  your growth rate, margins, retention, and burn efficiency. This aligns with how VCs actually price deals at revenue stages.
                </p>
                <p style={{ marginTop: '0.75rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                  <strong>Simplified formula:</strong> Base Valuation = ARR × (Base Multiple × Growth Adjustment × Margin Adjustment × Retention Adjustment × Burn Adjustment × Qualitative Adjustment)
                </p>
              </>
            )}
          </section>

          {/* Formula */}
          <section className="methodology-section methodology-section--formula">
            <h4>Formula</h4>
            <code>{methodology.formula}</code>
          </section>

          {/* Factor Breakdown */}
          <section className="methodology-section">
            <h3>Value Drivers</h3>
            <div className="methodology-factors">
              {methodology.factors.map((factor) => (
                <div key={factor.name} className="methodology-factor">
                  <div className="methodology-factor__header">
                    <span className="methodology-factor__name">{factor.name}</span>
                    {'maxValue' in factor && (
                      <span className="methodology-factor__max">Up to {(factor as { maxValue: string }).maxValue}</span>
                    )}
                  </div>
                  <p className="methodology-factor__driver">{factor.driver}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Your Current Values */}
          <section className="methodology-section">
            <h3>Your Input Summary</h3>
            <div className="methodology-inputs">
              {isPreRevenue ? (
                <>
                  <div className="methodology-input">
                    <span>Team Strength</span>
                    <strong>{inputs.teamStrength.toFixed(1)} / 5</strong>
                  </div>
                  <div className="methodology-input">
                    <span>Product Moat</span>
                    <strong>{inputs.differentiation.toFixed(1)} / 5</strong>
                  </div>
                  <div className="methodology-input">
                    <span>TAM</span>
                    <strong>${inputs.tam.toFixed(1)}B</strong>
                  </div>
                </>
              ) : (
                <>
                  <div className="methodology-input">
                    <span>ARR</span>
                    <strong>{formatCompactCurrency(arrUsd)}</strong>
                  </div>
                  <div className="methodology-input">
                    <span>Annual Growth</span>
                    <strong>{(annualGrowth * 100).toFixed(0)}%</strong>
                  </div>
                  <div className="methodology-input">
                    <span>Revenue Multiple</span>
                    <strong>{valuation.revenueMultiple.toFixed(1)}x</strong>
                  </div>
                  <div className="methodology-input">
                    <span>Gross Margin</span>
                    <strong>{inputs.grossMargin.toFixed(0)}%</strong>
                  </div>
                  <div className="methodology-input">
                    <span>Net Retention</span>
                    <strong>{inputs.netRetention.toFixed(0)}%</strong>
                  </div>
                  <div className="methodology-input">
                    <span>Burn Multiple</span>
                    <strong>{inputs.burnMultiple === 0 ? 'Profitable' : `${inputs.burnMultiple.toFixed(1)}x`}</strong>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Adjustments (for revenue multiple method) */}
          {!isPreRevenue && (
            <section className="methodology-section">
              <h3>Applied Adjustments</h3>
              <div className="methodology-adjustments">
                <div className="methodology-adjustment">
                  <span>Growth Lift</span>
                  <span className={valuation.lifts.growth >= 1.5 ? 'positive' : valuation.lifts.growth < 1.1 ? 'warning' : ''}>
                    {((valuation.lifts.growth - 1) * 100).toFixed(0)}% YoY → {valuation.lifts.growth >= 1.5 ? '↑' : valuation.lifts.growth < 1.1 ? '↓' : '→'} multiple
                  </span>
                </div>
                <div className="methodology-adjustment">
                  <span>Margin Impact</span>
                  <span className={inputs.grossMargin >= 80 ? 'positive' : inputs.grossMargin < 60 ? 'warning' : ''}>
                    {inputs.grossMargin >= 80 ? '+10%' : inputs.grossMargin < 60 ? '-20%' : '0%'} adjustment
                  </span>
                </div>
                <div className="methodology-adjustment">
                  <span>Retention Impact</span>
                  <span className={inputs.netRetention >= 120 ? 'positive' : inputs.netRetention < 90 ? 'warning' : ''}>
                    {inputs.netRetention >= 120 ? '+15%' : inputs.netRetention < 90 ? '-15%' : '0%'} adjustment
                  </span>
                </div>
                <div className="methodology-adjustment">
                  <span>Burn Efficiency</span>
                  <span className={inputs.burnMultiple === 0 ? 'positive' : inputs.burnMultiple > 2 ? 'warning' : ''}>
                    {inputs.burnMultiple === 0 ? '+20% (profitable)' : 
                     inputs.burnMultiple < 1.5 ? '+10% (efficient)' :
                     inputs.burnMultiple > 3 ? '-25% (high burn)' : '0%'}
                  </span>
                </div>
              </div>
            </section>
          )}

          {/* Result Summary */}
          <section className="methodology-section methodology-section--result">
            <h3>Resulting Valuations</h3>
            <div className="methodology-results">
              <div className="methodology-result methodology-result--bear">
                <span>Bear</span>
                <strong>{formatCompactCurrency(valuation.bear)}</strong>
              </div>
              <div className="methodology-result methodology-result--base">
                <span>Base</span>
                <strong>{formatCompactCurrency(valuation.base)}</strong>
              </div>
              <div className="methodology-result methodology-result--bull">
                <span>Bull</span>
                <strong>{formatCompactCurrency(valuation.bull)}</strong>
              </div>
            </div>
            <p className="methodology-confidence">
              Model confidence: <strong>{Math.round(valuation.confidence * 100)}%</strong>
            </p>
          </section>

          {/* Disclaimer */}
          <section className="methodology-disclaimer">
            <p>
              <strong>Disclaimer:</strong> This is a directional estimate based on your inputs and 
              typical startup valuation heuristics. It is not a formal valuation, fairness opinion, 
              or tax/legal advice. Consult qualified professionals for investment decisions.
            </p>
          </section>
        </div>
      </div>
    </dialog>
  )
}

