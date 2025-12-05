/**
 * Startup Metric Benchmarks
 * Static data for typical SaaS/tech startup metrics by stage.
 * Used for:
 * 1. Methodology & Assumptions panel
 * 2. Metric hints under input fields
 * 
 * Sources: Industry reports, VC benchmarks (general SaaS best practices)
 */

export type StageKey = 'concept' | 'seed' | 'seriesA' | 'seriesB' | 'seriesC'

export type MetricBenchmark = {
  typical: [number, number]  // [min, max] of typical range
  good: number               // Above this = positive signal
  warning: number            // Below this = concern
  unit: string
  description: string
}

export type StageBenchmarks = {
  arr: MetricBenchmark
  monthlyGrowth: MetricBenchmark
  grossMargin: MetricBenchmark
  netRetention: MetricBenchmark
  burnMultiple: MetricBenchmark
  tam: MetricBenchmark
}

export const benchmarksByStage: Record<StageKey, StageBenchmarks> = {
  concept: {
    arr: {
      typical: [0, 0.05],
      good: 0,
      warning: -1, // N/A for pre-revenue
      unit: '$M',
      description: 'Pre-revenue; focus on MVP and validation',
    },
    monthlyGrowth: {
      typical: [0, 0],
      good: 0,
      warning: -1,
      unit: '%',
      description: 'N/A for pre-revenue stage',
    },
    grossMargin: {
      typical: [60, 85],
      good: 70,
      warning: 50,
      unit: '%',
      description: 'Target SaaS margins even at concept',
    },
    netRetention: {
      typical: [80, 100],
      good: 100,
      warning: 80,
      unit: '%',
      description: 'Early customer retention assumptions',
    },
    burnMultiple: {
      typical: [0, 3],
      good: 1.5,
      warning: 3,
      unit: 'x',
      description: 'Pre-revenue burn is expected',
    },
    tam: {
      typical: [0.5, 10],
      good: 1,
      warning: 0.3,
      unit: '$B',
      description: 'Minimum viable market size',
    },
  },
  seed: {
    arr: {
      typical: [0, 0.5],
      good: 0.1,
      warning: 0,
      unit: '$M',
      description: 'Early revenue traction',
    },
    monthlyGrowth: {
      typical: [10, 25],
      good: 15,
      warning: 5,
      unit: '%',
      description: 'T2D3 pace: ~15% MoM',
    },
    grossMargin: {
      typical: [60, 80],
      good: 70,
      warning: 50,
      unit: '%',
      description: 'Standard SaaS: 70%+',
    },
    netRetention: {
      typical: [85, 110],
      good: 100,
      warning: 85,
      unit: '%',
      description: 'Early retention signals',
    },
    burnMultiple: {
      typical: [1, 3],
      good: 1.5,
      warning: 2.5,
      unit: 'x',
      description: '<1.5x = efficient growth',
    },
    tam: {
      typical: [1, 20],
      good: 5,
      warning: 0.5,
      unit: '$B',
      description: 'Addressable market potential',
    },
  },
  seriesA: {
    arr: {
      typical: [1, 5],
      good: 2,
      warning: 0.5,
      unit: '$M',
      description: 'Series A typically requires $1M+ ARR',
    },
    monthlyGrowth: {
      typical: [8, 20],
      good: 15,
      warning: 5,
      unit: '%',
      description: 'Sustained growth momentum',
    },
    grossMargin: {
      typical: [65, 85],
      good: 75,
      warning: 60,
      unit: '%',
      description: 'Healthy unit economics',
    },
    netRetention: {
      typical: [100, 130],
      good: 110,
      warning: 90,
      unit: '%',
      description: 'Net expansion expected',
    },
    burnMultiple: {
      typical: [0.5, 2],
      good: 1,
      warning: 2,
      unit: 'x',
      description: '<1x = very efficient',
    },
    tam: {
      typical: [5, 50],
      good: 10,
      warning: 2,
      unit: '$B',
      description: 'Large addressable market',
    },
  },
  seriesB: {
    arr: {
      typical: [5, 20],
      good: 10,
      warning: 3,
      unit: '$M',
      description: 'Scale-up revenue targets',
    },
    monthlyGrowth: {
      typical: [5, 15],
      good: 10,
      warning: 3,
      unit: '%',
      description: 'Sustainable growth rate',
    },
    grossMargin: {
      typical: [70, 90],
      good: 80,
      warning: 65,
      unit: '%',
      description: 'Mature unit economics',
    },
    netRetention: {
      typical: [110, 150],
      good: 120,
      warning: 100,
      unit: '%',
      description: 'Strong expansion revenue',
    },
    burnMultiple: {
      typical: [0, 1.5],
      good: 0.8,
      warning: 1.5,
      unit: 'x',
      description: 'Path to efficiency',
    },
    tam: {
      typical: [10, 100],
      good: 20,
      warning: 5,
      unit: '$B',
      description: 'Proven market opportunity',
    },
  },
  seriesC: {
    arr: {
      typical: [20, 100],
      good: 50,
      warning: 15,
      unit: '$M',
      description: 'Pre-IPO revenue scale',
    },
    monthlyGrowth: {
      typical: [3, 10],
      good: 6,
      warning: 2,
      unit: '%',
      description: 'Sustainable at scale',
    },
    grossMargin: {
      typical: [75, 95],
      good: 85,
      warning: 70,
      unit: '%',
      description: 'Best-in-class margins',
    },
    netRetention: {
      typical: [115, 160],
      good: 130,
      warning: 105,
      unit: '%',
      description: 'Enterprise-grade retention',
    },
    burnMultiple: {
      typical: [0, 1],
      good: 0.5,
      warning: 1,
      unit: 'x',
      description: 'Near profitability expected',
    },
    tam: {
      typical: [20, 200],
      good: 50,
      warning: 10,
      unit: '$B',
      description: 'Large market validation',
    },
  },
}

/**
 * Get benchmark status for a metric value
 */
export type BenchmarkStatus = 'good' | 'typical' | 'warning' | 'neutral'

export function getBenchmarkStatus(
  stage: StageKey,
  metric: keyof StageBenchmarks,
  value: number
): BenchmarkStatus {
  const benchmark = benchmarksByStage[stage]?.[metric]
  if (!benchmark) return 'neutral'

  // Special handling for burn multiple (lower is better)
  if (metric === 'burnMultiple') {
    if (value <= benchmark.good) return 'good'
    if (value >= benchmark.warning) return 'warning'
    return 'typical'
  }

  // For other metrics (higher is generally better)
  if (value >= benchmark.good) return 'good'
  if (value <= benchmark.warning && benchmark.warning > 0) return 'warning'
  if (value >= benchmark.typical[0] && value <= benchmark.typical[1]) return 'typical'
  return 'neutral'
}

/**
 * Format benchmark hint text for a metric
 */
export function formatBenchmarkHint(stage: StageKey, metric: keyof StageBenchmarks): string {
  const benchmark = benchmarksByStage[stage]?.[metric]
  if (!benchmark) return ''

  const stageLabel = {
    concept: 'Pre-seed',
    seed: 'Seed',
    seriesA: 'Series A',
    seriesB: 'Series B',
    seriesC: 'Series C+',
  }[stage]

  const [min, max] = benchmark.typical
  const unit = benchmark.unit

  if (metric === 'arr') {
    if (stage === 'concept') return `${stageLabel}: Pre-revenue typical`
    return `Typical ${stageLabel}: $${min}M–$${max}M ARR`
  }

  if (metric === 'monthlyGrowth') {
    if (stage === 'concept') return `${stageLabel}: Focus on validation`
    return `Typical ${stageLabel}: ${min}–${max}% MoM`
  }

  if (metric === 'burnMultiple') {
    return `${stageLabel}: ${min}–${max}x typical, <${benchmark.good}x = efficient`
  }

  return `Typical ${stageLabel}: ${min}–${max}${unit}`
}

/**
 * Methodology descriptions for the Methodology Panel
 */
export const methodologyDescriptions = {
  berkus: {
    name: 'Berkus Method',
    stages: ['concept', 'seed (pre-revenue)'],
    description:
      'The Berkus Method assigns value to five key risk-reduction factors for pre-revenue startups. Each factor can add up to $500K to the valuation, with a maximum of ~$2.5M for exceptional early-stage companies.',
    factors: [
      { name: 'Sound Idea / IP', maxValue: '$500K', driver: 'Product Moat score' },
      { name: 'Prototype / MVP', maxValue: '$500K', driver: 'Stage & early traction' },
      { name: 'Quality Team', maxValue: '$500K', driver: 'Team Strength score' },
      { name: 'Strategic Relationships', maxValue: '$300K', driver: 'Team + Moat combined' },
      { name: 'Market Timing', maxValue: '$200K', driver: 'TAM size' },
    ],
    formula: 'Valuation = Idea + Prototype + Team + Strategic + Timing (each capped)',
  },
  revenueMultiple: {
    name: 'Revenue Multiple Method',
    stages: ['seed (with revenue)', 'seriesA', 'seriesB', 'seriesC'],
    description:
      'For revenue-generating startups, valuation is primarily driven by ARR × a growth-adjusted multiple. The multiple is calibrated based on growth rate, margins, retention, and burn efficiency.',
    factors: [
      { name: 'Base Multiple', driver: 'Stage-specific range (e.g., 10–25x for Series A)' },
      { name: 'Growth Adjustment', driver: 'Annual growth rate (from MoM)' },
      { name: 'Margin Adjustment', driver: 'Gross margin vs. 70% SaaS benchmark' },
      { name: 'Retention Adjustment', driver: 'NRR vs. 100% baseline' },
      { name: 'Burn Adjustment', driver: 'Burn multiple (0 = profitable = premium)' },
      { name: 'Qualitative Adjustment', driver: 'Team + Moat scores (±15%)' },
    ],
    formula: 'Valuation = ARR × (Base Multiple × Adjustments)',
  },
}

