import { useEffect, useMemo, useReducer, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import type { ValuationRecord } from '../lib/supabase'
import {
  telemetry,
  telemetryInitialState,
  telemetryReducer,
} from '../analytics/telemetry'
import { useBrowserCapabilities } from '../hooks/useBrowserCapabilities'
import './ValuationTool.css'

/**
 * REALISTIC STARTUP VALUATION CONFIG
 * Based on 2024 market benchmarks and industry-standard methodologies:
 * - Pre-seed: Berkus Method (qualitative, $250K-$2M typical)
 * - Seed: Scorecard Method + early revenue multiples ($2M-$10M typical)
 * - Series A: Revenue multiple method (10x-25x ARR, $15M-$60M typical)
 * - Series B: Revenue multiple with efficiency focus (8x-18x ARR, $50M-$200M typical)
 * - Series C+: Revenue multiple + path to profitability (6x-15x ARR, $150M+ typical)
 */
const stageConfig = {
  concept: {
    label: 'Concept / Pre-seed',
    // Berkus method: max ~$2.5M for exceptional pre-revenue startups
    baseValuationFloor: 250_000,      // Minimum: idea + founder
    baseValuationCeiling: 2_500_000,  // Maximum: all Berkus factors maxed
    revenueMultipleRange: [0, 0],     // No revenue multiple for pre-revenue
    typicalRange: '$250K - $2M',
  },
  seed: {
    label: 'Seed / MVP',
    // Scorecard method base ~$3M, adjusted ±100%
    baseValuationFloor: 1_000_000,
    baseValuationCeiling: 10_000_000,
    revenueMultipleRange: [8, 15],    // If ARR exists: 8-15x
    typicalRange: '$2M - $10M',
  },
  seriesA: {
    label: 'Series A',
    // Revenue-based: requires meaningful ARR
    baseValuationFloor: 10_000_000,
    baseValuationCeiling: 80_000_000,
    revenueMultipleRange: [10, 25],   // 10-25x ARR based on growth
    typicalRange: '$15M - $60M',
  },
  seriesB: {
    label: 'Series B',
    // Scale-up: efficiency starts to matter
    baseValuationFloor: 40_000_000,
    baseValuationCeiling: 250_000_000,
    revenueMultipleRange: [8, 18],    // 8-18x ARR
    typicalRange: '$50M - $200M',
  },
  seriesC: {
    label: 'Series C+',
    // Growth + profitability path
    baseValuationFloor: 100_000_000,
    baseValuationCeiling: 1_000_000_000,
    revenueMultipleRange: [6, 15],    // 6-15x ARR
    typicalRange: '$150M+',
  },
} as const

type StageKey = keyof typeof stageConfig

type StartupInputs = {
  name: string
  stage: StageKey
  arr: number
  monthlyGrowth: number
  tam: number
  grossMargin: number
  netRetention: number
  burnMultiple: number
  teamStrength: number
  differentiation: number
}

type NumericInputKey = Exclude<keyof StartupInputs, 'name' | 'stage'>

type SliderField = {
  key: NumericInputKey
  label: string
  helper: string
  min: number
  max: number
  step: number
  format: (value: number) => string
}

type ValuationSnapshot = {
  bear: number
  base: number
  bull: number
  revenueMultiple: number
  confidence: number
  forwardArr: number
  marketPotential: number
  stageLabel: string
  lifts: {
    growth: number
    margin: number
    retention: number
    burn: number
    qualitative: number
  }
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const compactCurrencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
})

const formatCurrency = (value: number) =>
  currencyFormatter.format(Math.round(Math.max(value, 0)))

const formatCompactCurrency = (value: number) =>
  compactCurrencyFormatter.format(Math.round(Math.max(value, 0)))

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

const safeNumber = (value: number, fallback = 0) =>
  Number.isFinite(value) ? value : fallback

/**
 * SLIDER FIELD CONFIGURATION
 * Each field is calibrated based on real market data and VC expectations:
 * 
 * ARR: $0-$200M covers seed through late-stage growth
 * Monthly Growth: 0-50% covers stagnant to hypergrowth (T2D3 = ~15% MoM)
 * TAM: $100M-$500B covers niche B2B to massive consumer markets
 * Gross Margin: 20-95% covers hardware (20-40%), marketplace (40-60%), SaaS (70-90%)
 * NRR: 50-180% covers high-churn SMB to enterprise expansion
 * Burn Multiple: 0-5x covers profitable (0) to inefficient growth (5x)
 * Team/Moat: 1-5 qualitative scores
 */
const sliderFields: SliderField[] = [
  {
    key: 'arr',
    label: 'Annual Recurring Revenue (ARR)',
    helper: 'Current annualized recurring revenue. Pre-revenue startups enter 0.',
    min: 0,
    max: 200,        // Extended to $200M for late-stage
    step: 0.05,      // $50K increments for precision
    format: (value) => value === 0 ? '$0 (Pre-revenue)' : `$${value.toFixed(2)}M`,
  },
  {
    key: 'monthlyGrowth',
    label: 'Monthly Growth Rate (MoM)',
    helper: 'Avg month-over-month revenue growth. T2D3 pace ≈ 15% MoM. Enter 0 if pre-revenue.',
    min: 0,
    max: 50,         // Extended for hypergrowth early-stage
    step: 0.5,
    format: (value) => value === 0 ? '0% (N/A)' : `${value.toFixed(1)}%`,
  },
  {
    key: 'tam',
    label: 'Total Addressable Market (TAM)',
    helper: 'Total market size in USD. Niche B2B: $100M-$1B. Large markets: $10B+.',
    min: 0.1,        // $100M minimum - realistic for niche startups
    max: 500,        // $500B for massive markets (cloud, fintech, healthcare)
    step: 0.1,       // $100M increments
    format: (value) => value < 1 ? `$${(value * 1000).toFixed(0)}M` : `$${value.toFixed(1)}B`,
  },
  {
    key: 'grossMargin',
    label: 'Gross Margin',
    helper: 'Revenue minus COGS. SaaS: 70-85%, Marketplace: 40-60%, Hardware: 20-40%.',
    min: 20,         // Hardware/physical products floor
    max: 95,         // Pure software ceiling
    step: 1,
    format: (value) => `${value.toFixed(0)}%`,
  },
  {
    key: 'netRetention',
    label: 'Net Revenue Retention (NRR)',
    helper: 'Revenue retained + expansion from existing customers. <100% = net churn. Best-in-class: 120%+.',
    min: 50,         // Severe churn scenario
    max: 180,        // Exceptional enterprise expansion
    step: 1,
    format: (value) => `${value.toFixed(0)}%`,
  },
  {
    key: 'burnMultiple',
    label: 'Burn Multiple',
    helper: 'Net burn ÷ Net new ARR. 0 = profitable, <1x = efficient, >2x = concerning.',
    min: 0,          // 0 = cash flow positive/profitable
    max: 5,          // Extended for inefficient early-stage
    step: 0.1,
    format: (value) => value === 0 ? '0x (Profitable)' : `${value.toFixed(1)}x`,
  },
  {
    key: 'teamStrength',
    label: 'Team Strength',
    helper: '1 = First-time founders, 3 = Experienced operators, 5 = Serial entrepreneurs with exits.',
    min: 1,
    max: 5,
    step: 0.5,       // Half-point increments for meaningful differentiation
    format: (value) => {
      const labels = ['', 'Novice', 'Developing', 'Competent', 'Strong', 'Exceptional']
      return `${value.toFixed(1)} - ${labels[Math.round(value)] || ''}`
    },
  },
  {
    key: 'differentiation',
    label: 'Product Moat / Defensibility',
    helper: '1 = Easily copied, 3 = Some differentiation, 5 = Strong IP/network effects.',
    min: 1,
    max: 5,
    step: 0.5,
    format: (value) => {
      const labels = ['', 'Weak', 'Limited', 'Moderate', 'Strong', 'Exceptional']
      return `${value.toFixed(1)} - ${labels[Math.round(value)] || ''}`
    },
  },
]

const sliderMeta = sliderFields.reduce(
  (acc, field) => ({ ...acc, [field.key]: field }),
  {} as Record<NumericInputKey, SliderField>,
)

/**
 * REALISTIC VALUATION ALGORITHM
 * 
 * For PRE-REVENUE startups (Concept/Pre-seed):
 * Uses Berkus Method - assigns value to qualitative factors:
 * - Sound idea/IP: up to $500K
 * - Prototype/MVP: up to $500K  
 * - Quality team: up to $500K
 * - Strategic relationships: up to $500K
 * - Product rollout/traction: up to $500K
 * Max pre-money: ~$2.5M (exceptional cases up to $5M)
 * 
 * For REVENUE-GENERATING startups:
 * Uses Revenue Multiple Method adjusted for:
 * - Growth rate (higher growth = higher multiple)
 * - Gross margins (SaaS benchmark: 70%+)
 * - Net retention (benchmark: 100%+)
 * - Burn efficiency (benchmark: <2x)
 * - Team & moat (qualitative adjustment)
 */
const buildValuation = (inputs: StartupInputs): ValuationSnapshot => {
  const stage = stageConfig[inputs.stage]
  const arr = Math.max(safeNumber(inputs.arr), 0)
  const arrUsd = arr * 1_000_000
  const tamUsd = Math.max(safeNumber(inputs.tam), 0.1) * 1_000_000_000  // Min $100M TAM
  const monthlyGrowth = clamp(safeNumber(inputs.monthlyGrowth), 0, 50)   // Extended to 50% MoM
  const margin = clamp(safeNumber(inputs.grossMargin), 20, 95)          // Extended down to 20%
  const retention = clamp(safeNumber(inputs.netRetention), 50, 180)     // Extended range
  const burn = clamp(safeNumber(inputs.burnMultiple), 0, 5)             // 0 = profitable, up to 5x
  const team = clamp(safeNumber(inputs.teamStrength), 1, 5)
  const moat = clamp(safeNumber(inputs.differentiation), 1, 5)

  // Annualized growth rate from monthly
  const annualGrowthRate = Math.pow(1 + monthlyGrowth / 100, 12) - 1

  let base: number
  let revenueMultiple: number
  let forwardArr: number
  let marketPotential: number

  // ============================================
  // VALUATION METHOD SELECTION BY STAGE & ARR
  // ============================================

  if (inputs.stage === 'concept' || (inputs.stage === 'seed' && arrUsd < 100_000)) {
    // ----------------------------------------
    // BERKUS METHOD for Pre-revenue / Early Stage
    // ----------------------------------------
    // Each factor worth up to $500K (scaled by score)
    
    const ideaValue = (moat / 5) * 500_000           // Sound idea/IP
    const prototypeValue = (arrUsd > 0 ? 0.8 : monthlyGrowth > 0 ? 0.5 : 0.2) * 500_000  // Prototype exists
    const teamValue = (team / 5) * 500_000           // Quality management team
    const strategicValue = ((team + moat) / 10) * 300_000  // Strategic relationships
    const marketTimingValue = (tamUsd > 10_000_000_000 ? 0.7 : 0.4) * 200_000  // Right market/timing
    
    const berkusTotal = ideaValue + prototypeValue + teamValue + strategicValue + marketTimingValue
    
    // Apply stage ceiling
    base = clamp(berkusTotal, stage.baseValuationFloor, stage.baseValuationCeiling)
    
    // No meaningful revenue multiple for pre-revenue
    revenueMultiple = 0
    forwardArr = 0
    marketPotential = berkusTotal * 0.1  // Minimal market component
    
  } else {
    // ----------------------------------------
    // REVENUE MULTIPLE METHOD for Revenue Stage
    // ----------------------------------------
    
    // Base multiple from stage config, interpolated by growth
    const [minMult, maxMult] = stage.revenueMultipleRange
    
    // Growth-adjusted multiple: 
    // - <10% annual growth: minimum multiple
    // - 100%+ annual growth (T2D3): maximum multiple
    // - Linear interpolation between
    const growthScore = clamp(annualGrowthRate / 1.0, 0, 1)  // 0-100% growth maps to 0-1
    const baseMultiple = minMult + (maxMult - minMult) * growthScore
    
    // Margin adjustment: SaaS should be 70%+
    // Below 60%: -20% to multiple, Above 80%: +10%
    const marginAdjustment = margin < 60 ? 0.8 : margin > 80 ? 1.1 : 1.0
    
    // Retention adjustment: 100% is baseline
    // Below 90%: -15%, Above 120%: +15%
    const retentionAdjustment = retention < 90 ? 0.85 : retention > 120 ? 1.15 : 1.0
    
    // Burn efficiency: 0 = profitable (best), <1.5x great, >3x concerning
    const burnAdjustment = burn === 0 ? 1.2 :      // Profitable = 20% premium
                           burn < 1 ? 1.15 :        // <1x = very efficient
                           burn < 1.5 ? 1.1 :       // <1.5x = efficient
                           burn < 2 ? 1.0 :         // <2x = acceptable
                           burn < 3 ? 0.9 :         // 2-3x = concerning
                           0.75                     // >3x = inefficient
    
    // Team & moat qualitative adjustment (±15%)
    const qualitativeScore = ((team + moat) / 10)  // 0.2 to 1.0
    const qualitativeAdjustment = 0.85 + qualitativeScore * 0.3  // 0.85 to 1.15
    
    // Final revenue multiple
    revenueMultiple = clamp(
      baseMultiple * marginAdjustment * retentionAdjustment * burnAdjustment * qualitativeAdjustment,
      minMult * 0.5,  // Floor: 50% of min
      maxMult * 1.2   // Ceiling: 120% of max
    )
    
    // Revenue-based valuation
    const revenueValuation = arrUsd * revenueMultiple
    
    // Forward ARR (12-month projection)
    forwardArr = arrUsd * (1 + annualGrowthRate)
    
    // Market potential: small TAM adjustment (max 5% of valuation)
    // Only meaningful for later stages with proven TAM capture
    const tamCaptureRate = inputs.stage === 'seriesC' ? 0.001 : 
                          inputs.stage === 'seriesB' ? 0.0005 : 0.0002
    marketPotential = Math.min(tamUsd * tamCaptureRate * qualitativeAdjustment, revenueValuation * 0.05)
    
    // Base valuation: primarily revenue-driven
    base = revenueValuation + marketPotential
    
    // Apply stage floor/ceiling sanity checks
    base = clamp(base, stage.baseValuationFloor, stage.baseValuationCeiling)
    
    // Reality check: valuation shouldn't exceed 50x ARR even in best cases
    base = Math.min(base, arrUsd * 50)
  }

  // ============================================
  // SCENARIO SPREAD (Bear / Bull)
  // ============================================
  
  // Upside potential based on growth and moat
  const upsideFactor = clamp(
    0.15 + (annualGrowthRate * 0.15) + ((moat - 3) / 5) * 0.1,
    0.1,   // Min 10% upside
    0.4    // Max 40% upside
  )
  
  // Downside risk based on burn and team weakness
  const downsideFactor = clamp(
    0.15 + (burn > 2 ? (burn - 2) * 0.08 : 0) + ((5 - team) / 5) * 0.1,
    0.1,   // Min 10% downside
    0.35   // Max 35% downside
  )
  
  const bull = base * (1 + upsideFactor)
  const bear = base * (1 - downsideFactor)

  // ============================================
  // CONFIDENCE SCORE
  // ============================================
  // Higher confidence when: has revenue, good retention, strong team, efficient burn
  const confidence = clamp(
    0.30 +                                    // Base confidence
    (arrUsd > 500_000 ? 0.25 : arrUsd > 0 ? 0.15 : 0) +  // Revenue adds confidence
    0.15 * (retention / 150) +                // Good retention
    0.10 * (team / 5) +                       // Strong team
    0.10 * (1 - Math.min(burn, 3) / 4) +      // Efficient burn
    0.10 * (moat / 5),                        // Strong moat
    0.25,  // Min 25%
    0.90   // Max 90%
  )

  return {
    bear,
    base,
    bull,
    revenueMultiple,
    confidence,
    forwardArr,
    marketPotential,
    stageLabel: stage.label,
    lifts: {
      growth: 1 + annualGrowthRate,
      margin: margin / 100,
      retention: retention / 100,
      burn: burn,
      qualitative: (team + moat) / 10,
    },
  }
}

const buildInsights = (inputs: StartupInputs, snapshot: ValuationSnapshot) => {
  const baseName = inputs.name.trim() || 'This startup'
  const stage = stageConfig[inputs.stage]
  const arrUsd = inputs.arr * 1_000_000
  const annualGrowth = Math.pow(1 + inputs.monthlyGrowth / 100, 12) - 1
  const downside = Math.max(0, 1 - snapshot.bear / Math.max(snapshot.base, 1))

  const insights: string[] = []

  // Insight 1: Stage-appropriate valuation context
  if (inputs.stage === 'concept' || (inputs.stage === 'seed' && arrUsd < 100_000)) {
    insights.push(
      `${baseName} at ${snapshot.stageLabel} stage is valued using the Berkus Method. ` +
      `Team strength (${inputs.teamStrength.toFixed(1)}/5) and product moat (${inputs.differentiation.toFixed(1)}/5) ` +
      `are the primary value drivers at this pre-revenue stage. Typical range: ${stage.typicalRange}.`
    )
  } else {
    insights.push(
      `${baseName} commands a ${snapshot.revenueMultiple.toFixed(1)}x ARR multiple, ` +
      `reflecting ${(annualGrowth * 100).toFixed(0)}% annual growth and ${inputs.grossMargin.toFixed(0)}% gross margins. ` +
      `Typical ${snapshot.stageLabel} range: ${stage.typicalRange}.`
    )
  }

  // Insight 2: Growth trajectory
  if (arrUsd > 0) {
    insights.push(
      `At ${inputs.monthlyGrowth.toFixed(1)}% MoM growth, ${baseName} projects ` +
      `${formatCompactCurrency(snapshot.forwardArr)} ARR in 12 months—a ` +
      `${(annualGrowth * 100).toFixed(0)}% year-over-year increase.`
    )
  } else {
    insights.push(
      `Without recurring revenue, ${baseName} should focus on achieving product-market fit ` +
      `and first revenue milestones to unlock higher valuations in subsequent rounds.`
    )
  }

  // Insight 3: Efficiency and risks
  if (inputs.burnMultiple === 0) {
    insights.push(
      `✅ Profitable or cash-flow positive status is highly attractive to investors, ` +
      `providing optionality and reducing dilution risk. This adds a ~20% valuation premium.`
    )
  } else if (inputs.burnMultiple > 3) {
    insights.push(
      `⚠️ Burn multiple of ${inputs.burnMultiple.toFixed(1)}x signals capital inefficiency. ` +
      `Reducing to <2x could improve valuation by 15-25% and extend runway significantly.`
    )
  } else if (inputs.burnMultiple < 1.5 && arrUsd > 0) {
    insights.push(
      `✅ Efficient burn multiple of ${inputs.burnMultiple.toFixed(1)}x demonstrates strong unit economics, ` +
      `positively impacting the valuation multiple and investor confidence.`
    )
  } else if (inputs.netRetention < 90) {
    insights.push(
      `⚠️ Net retention at ${inputs.netRetention.toFixed(0)}% indicates significant churn concerns. ` +
      `Best-in-class SaaS targets 110%+ NRR. Focus on customer success and product stickiness.`
    )
  } else if (inputs.grossMargin < 50) {
    insights.push(
      `⚠️ Gross margin of ${inputs.grossMargin.toFixed(0)}% is below SaaS benchmarks (70%+). ` +
      `Consider pricing optimization or cost structure improvements to improve unit economics.`
    )
  } else {
    insights.push(
      `Bear case of ${formatCompactCurrency(snapshot.bear)} reflects ${(downside * 100).toFixed(0)}% downside risk, ` +
      `accounting for execution risk and market conditions.`
    )
  }

  // Insight 4: Stage-specific advice
  if (inputs.stage === 'concept') {
    insights.push(
      `To progress to Seed, focus on: MVP development, initial customer discovery, ` +
      `and demonstrating founder-market fit. Target: $50K-$500K in early revenue signals.`
    )
  } else if (inputs.stage === 'seed' && arrUsd < 500_000) {
    insights.push(
      `Series A readiness typically requires $1M+ ARR with 15%+ MoM growth. ` +
      `Current gap: ${formatCompactCurrency(Math.max(0, 1_000_000 - arrUsd))} in ARR.`
    )
  } else if (inputs.stage === 'seriesA' && inputs.netRetention > 110) {
    insights.push(
      `Strong NRR of ${inputs.netRetention.toFixed(0)}% supports expansion-driven growth—a key ` +
      `Series B readiness indicator alongside $5M+ ARR target.`
    )
  }

  return insights.slice(0, 4)  // Max 4 insights
}

/**
 * DEFAULT INPUTS
 * Start with empty/neutral values - users should input their own data.
 * Using neutral middle-ground values for numeric fields to show realistic starting point.
 */
const defaultInputs: StartupInputs = {
  name: '',                // Empty - user must enter their company name
  stage: 'seed',           // Most common stage for users of this tool
  arr: 0,                  // Start at $0 - pre-revenue by default
  monthlyGrowth: 0,        // No growth if no revenue
  tam: 1,                  // $1B TAM - neutral starting point
  grossMargin: 70,         // 70% - typical SaaS baseline
  netRetention: 100,       // 100% - neutral (no churn, no expansion)
  burnMultiple: 2,         // 2x - typical early-stage
  teamStrength: 3,         // 3/5 - average competent team
  differentiation: 3,      // 3/5 - moderate differentiation
}

export default function ValuationTool() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const editId = searchParams.get('id')

  const [inputs, setInputs] = useState<StartupInputs>(defaultInputs)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [loadingEdit, setLoadingEdit] = useState(!!editId)

  const valuation = useMemo(() => buildValuation(inputs), [inputs])
  const insights = useMemo(() => buildInsights(inputs, valuation), [inputs, valuation])
  const capabilities = useBrowserCapabilities()
  const [telemetryState, dispatchTelemetry] = useReducer(telemetryReducer, telemetryInitialState)

  const scenarioMax = Math.max(valuation.bull, valuation.base, valuation.bear, 1)
  const confidencePercent = Math.round(valuation.confidence * 100)
  const stageLabel = stageConfig[inputs.stage].label

  // Load existing valuation for editing
  useEffect(() => {
    if (editId && user) {
      loadValuation(editId)
    } else {
      setLoadingEdit(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId, user])

  const loadValuation = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('valuations')
        .select('*')
        .eq('id', id)
        .eq('user_id', user?.id)
        .single()

      if (error) throw error

      if (data) {
        setInputs({
          name: data.startup_name,
          stage: data.stage as StageKey,
          arr: data.arr,
          monthlyGrowth: data.monthly_growth,
          tam: data.tam,
          grossMargin: data.gross_margin,
          netRetention: data.net_retention,
          burnMultiple: data.burn_multiple,
          teamStrength: data.team_strength,
          differentiation: data.differentiation,
        })
      }
    } catch (error) {
      console.error('Error loading valuation:', error)
    } finally {
      setLoadingEdit(false)
    }
  }

  const handleSave = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    // Validate required fields
    if (!inputs.name.trim()) {
      setSaveMessage('⚠️ Please enter a company name before saving')
      return
    }

    setSaving(true)
    setSaveMessage('')

    const record: Omit<ValuationRecord, 'id' | 'created_at' | 'updated_at'> = {
      user_id: user.id,
      startup_name: inputs.name,
      stage: inputs.stage,
      arr: inputs.arr,
      monthly_growth: inputs.monthlyGrowth,
      tam: inputs.tam,
      gross_margin: inputs.grossMargin,
      net_retention: inputs.netRetention,
      burn_multiple: inputs.burnMultiple,
      team_strength: inputs.teamStrength,
      differentiation: inputs.differentiation,
      bear_valuation: valuation.bear,
      base_valuation: valuation.base,
      bull_valuation: valuation.bull,
      revenue_multiple: valuation.revenueMultiple,
      confidence: valuation.confidence,
    }

    try {
      if (editId) {
        // Update existing
        const { error } = await supabase
          .from('valuations')
          .update({ ...record, updated_at: new Date().toISOString() })
          .eq('id', editId)
          .eq('user_id', user.id)

        if (error) throw error
        setSaveMessage('✓ Valuation updated!')
      } else {
        // Create new
        const { error } = await supabase.from('valuations').insert(record)

        if (error) throw error
        setSaveMessage('✓ Valuation saved!')
      }

      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      console.error('Error saving valuation:', error)
      setSaveMessage('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleNumberChange = (field: NumericInputKey, rawValue: number) => {
    const meta = sliderMeta[field]
    const nextValue = clamp(
      safeNumber(rawValue, inputs[field]),
      meta.min,
      meta.max,
    )
    dispatchTelemetry({ type: 'input' })
    telemetry.track('input_changed', { field })
    setInputs((prev) => ({ ...prev, [field]: Number(nextValue.toFixed(3)) }))
  }

  const handleNameChange = (value: string) => {
    dispatchTelemetry({ type: 'input' })
    telemetry.track('input_changed', { field: 'name' })
    setInputs((prev) => ({ ...prev, name: value }))
  }

  const handleStageChange = (value: StageKey) => {
    dispatchTelemetry({ type: 'input' })
    telemetry.track('stage_changed', { from: inputs.stage, to: value })
    setInputs((prev) => ({ ...prev, stage: value }))
  }

  useEffect(() => {
    telemetry.track('scenario_rendered', {
      stage: inputs.stage,
      multiple: Number(valuation.revenueMultiple.toFixed(2)),
      confidence: Math.round(valuation.confidence * 100),
    })
    dispatchTelemetry({ type: 'scenario' })
  }, [inputs.stage, valuation])

  const appShellClassNames = [
    'valuator-shell',
    !capabilities.backdropFilter ? 'valuator-shell--fallback' : '',
    capabilities.prefersReducedMotion ? 'valuator-shell--reduced-motion' : '',
  ]
    .filter(Boolean)
    .join(' ')

  if (loadingEdit) {
    return (
      <div className="valuator-loading">
        <div className="loading-spinner" />
        <p>Loading valuation...</p>
      </div>
    )
  }

  return (
    <div className={appShellClassNames}>
      <div className="valuator-shell__backdrop" aria-hidden="true" />
      <div className="valuator-shell__glow" aria-hidden="true" />

      <div className="valuator-shell__content">
        <header className="hero">
          <div className="hero__eyebrow">Apex Valuator - Q4 2025 - Evergreen build</div>
          <div className="hero__heading">
            <div>
              <h1>Startup Value Navigator</h1>
              <p>
                Intelligent valuation rails combining market comparables, forward ARR, and qualitative
                strength to benchmark modern startups in a balanced,
                backward-compatible browser experience.
              </p>
            </div>
            <div className="hero__meta">
              <div>
                <span>Model calibration</span>
                <strong>Updated weekly</strong>
              </div>
              <div>
                <span>Supported browsers</span>
                <strong>Chromium 90+, Safari 15+, Firefox 102+</strong>
              </div>
              <div>
                <span>Capabilities</span>
                <strong>
                  {capabilities.backdropFilter ? 'Full visual mode' : 'Fallback visuals'} ·{' '}
                  {capabilities.prefersReducedMotion ? 'Reduced motion' : 'Animations enabled'}
                </strong>
              </div>
            </div>
          </div>
        </header>

        <main className="layout-grid">
          <section className="panel panel--inputs" aria-label="Startup input form">
            <div className="panel__header">
              <div>
                <p className="eyebrow">Input stack</p>
                <h2>Company Signals</h2>
              </div>
              <span className="stage-badge">{stageLabel}</span>
            </div>

            <div className="field field--text">
              <div className="field__labels">
                <label htmlFor="startup-name">Company / Startup Name</label>
                <span className="field__value">{inputs.name || 'Enter name below'}</span>
              </div>
              <input
                id="startup-name"
                type="text"
                value={inputs.name}
                onChange={(event) => handleNameChange(event.currentTarget.value)}
                placeholder="Enter your company name..."
                autoComplete="organization"
                maxLength={100}
              />
            </div>

            <div className="field field--text">
              <div className="field__labels">
                <label htmlFor="startup-stage">Funding Stage</label>
                <span className="field__value">Typical range: {stageConfig[inputs.stage].typicalRange}</span>
              </div>
              <select
                id="startup-stage"
                value={inputs.stage}
                onChange={(event) => handleStageChange(event.currentTarget.value as StageKey)}
              >
                {Object.entries(stageConfig).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.label} ({config.typicalRange})
                  </option>
                ))}
              </select>
              <p className="field__helper">Select your current or target funding stage. This determines the valuation methodology used.</p>
            </div>

            <div className="input-grid">
              {sliderFields.map((field) => (
                <div className="field" key={field.key}>
                  <div className="field__labels">
                    <label htmlFor={`field-${field.key}`}>{field.label}</label>
                    <span className="field__value">{field.format(inputs[field.key])}</span>
                  </div>
                  <div className="field__controls">
                    <input
                      id={`field-${field.key}`}
                      type="range"
                      min={field.min}
                      max={field.max}
                      step={field.step}
                      value={inputs[field.key]}
                      onChange={(event) => handleNumberChange(field.key, event.currentTarget.valueAsNumber)}
                    />
                    <input
                      type="number"
                      min={field.min}
                      max={field.max}
                      step={field.step}
                      value={inputs[field.key]}
                      onChange={(event) => handleNumberChange(field.key, Number(event.currentTarget.value))}
                    />
                  </div>
                  <p className="field__helper">{field.helper}</p>
                </div>
              ))}
            </div>

            {/* Save Button */}
            <div className="save-section">
              {!inputs.name.trim() && (
                <p className="save-warning">⚠️ Enter a company name to save this valuation</p>
              )}
              <button
                onClick={handleSave}
                disabled={saving || (!inputs.name.trim() && !!user)}
                className="save-button"
              >
                {saving ? 'Saving...' : user ? (editId ? '💾 Update Valuation' : '💾 Save Valuation') : '🔒 Login to Save'}
              </button>
              {saveMessage && (
                <span className={`save-message ${saveMessage.includes('Failed') || saveMessage.includes('⚠️') ? 'save-message--error' : ''}`}>
                  {saveMessage}
                </span>
              )}
              {!user && (
                <p className="save-hint">Create a free account to save and track your valuations</p>
              )}
            </div>
          </section>

          <section className="panel panel--results" aria-label="Valuation output">
            <div className="panel__header">
              <div>
                <p className="eyebrow">Valuation stack</p>
                <h2>Scenario Modeling</h2>
              </div>
              <span className="panel__timestamp">Always-on - auto recalculated</span>
            </div>

            <div className="scenario-grid">
              {(['bear', 'base', 'bull'] as const).map((key) => {
                const value = valuation[key]
                const delta =
                  key === 'base'
                    ? 0
                    : value / Math.max(valuation.base, 1) - 1

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

            <div className="telemetry">
              <div className="telemetry__item">
                <span>EV / ARR multiple</span>
                <strong>{valuation.revenueMultiple.toFixed(1)}x</strong>
              </div>
              <div className="telemetry__item">
                <span>Forward ARR (12m)</span>
                <strong>{formatCompactCurrency(valuation.forwardArr)}</strong>
              </div>
              <div className="telemetry__item">
                <span>Market-derived value</span>
                <strong>{formatCompactCurrency(valuation.marketPotential)}</strong>
              </div>
              <div className="telemetry__item">
                <span>Confidence window</span>
                <strong>{confidencePercent}%</strong>
              </div>
              <div className="telemetry__item telemetry__item--secondary">
                <span>Session interactions</span>
                <strong>{telemetryState.inputInteractions} inputs</strong>
              </div>
              <div className="telemetry__item telemetry__item--secondary">
                <span>Scenario renders</span>
                <strong>{telemetryState.scenarioRenders}</strong>
              </div>
            </div>

            <div className="confidence">
              <div className="confidence__headings">
                <h3>Model Confidence</h3>
                <p>Signals aggregated from revenue, product moats, and market depth.</p>
              </div>
              <div className="confidence__meter" role="meter" aria-valuenow={confidencePercent} aria-valuemin={0} aria-valuemax={100}>
                <div style={{ width: `${confidencePercent}%` }} />
              </div>
            </div>
          </section>
        </main>

        <section className="panel panel--insights" aria-label="Insights and recommendations">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Insight stream</p>
              <h2>Prime Takeaways</h2>
            </div>
            <span className="panel__timestamp">
              {inputs.name || 'Your company'} - {stageLabel}
            </span>
          </div>

          <ul className="insights">
            {insights.map((insight) => (
              <li key={insight}>{insight}</li>
            ))}
          </ul>

          <div className="footnote">
            <p>
              Engineered for backwards compatibility - no experimental APIs, deterministic calculations, and graceful
              degradation when advanced visual styles are unavailable. Works consistently across evergreen browsers without manual refreshes.
            </p>
            <p className="footnote__disclaimer">
              Disclaimer: Startup Value Navigator provides directional valuations for planning purposes only and should not
              replace formal financial, legal, or tax advice from licensed professionals.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

