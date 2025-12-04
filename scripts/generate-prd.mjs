import fs from 'node:fs'
import path from 'node:path'
import {
  AlignmentType,
  Document,
  HeadingLevel,
  Paragraph,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  WidthType,
  Packer,
} from 'docx'

const today = new Date().toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

const outputDir = path.join(process.cwd(), 'docs')
const outputPath = path.join(outputDir, 'StartupValueNavigator_PRD.docx')

fs.mkdirSync(outputDir, { recursive: true })

const titleParagraphs = [
  new Paragraph({
    text: 'Startup Value Navigator - Master PRD',
    heading: HeadingLevel.TITLE,
    alignment: AlignmentType.CENTER,
  }),
  new Paragraph({
    text: `Document version 1.0 | ${today}`,
    alignment: AlignmentType.CENTER,
  }),
  new Paragraph({
    text: 'Prepared by: Product Director, Growth Intelligence',
    alignment: AlignmentType.CENTER,
  }),
  new Paragraph({ text: '' }),
]

const section = (title, paragraphs = [], bullets = []) => {
  const children = []

  if (title) {
    children.push(
      new Paragraph({
        text: title,
        heading: HeadingLevel.HEADING_1,
      }),
    )
  }

  paragraphs.forEach((text) => {
    children.push(
      new Paragraph({
        children: [new TextRun(text)],
      }),
    )
  })

  bullets.forEach((text) => {
    children.push(
      new Paragraph({
        text,
        bullet: {
          level: 0,
        },
      }),
    )
  })

  return children
}

const metricTable = new Table({
  width: {
    size: 100,
    type: WidthType.PERCENTAGE,
  },
  layout: TableLayoutType.AUTOFIT,
  columnWidths: [2800, 6200, 2800],
  rows: [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({ children: [new Paragraph({ text: 'Metric' })] }),
        new TableCell({ children: [new Paragraph({ text: 'Definition' })] }),
        new TableCell({ children: [new Paragraph({ text: 'Target (H1 2026)' })] }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph('Weekly active modeling sessions')] }),
        new TableCell({
          children: [
            new Paragraph('Distinct browser sessions that submit at least one valuation scenario.'),
          ],
        }),
        new TableCell({ children: [new Paragraph('5,000+')] }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph('Median time-to-valuation')] }),
        new TableCell({
          children: [
            new Paragraph('Time from first input change to base scenario render on broadband.'),
          ],
        }),
        new TableCell({ children: [new Paragraph('< 2 seconds')] }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph('Confidence alignment score')] }),
        new TableCell({
          children: [
            new Paragraph('Percentage of users who rate outputs as "match" or better vs. benchmarks.'),
          ],
        }),
        new TableCell({ children: [new Paragraph('70%+ via post-session survey')] }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph('Browser compatibility pass rate')] }),
        new TableCell({
          children: [
            new Paragraph('Automated smoke tests passing on Chromium, Safari, and Firefox matrices.'),
          ],
        }),
        new TableCell({ children: [new Paragraph('99%+ for supported versions')] }),
      ],
    }),
  ],
})

const sections = []

sections.push(
  ...section('1. Executive summary', [
    'Startup Value Navigator is a browser-native valuation console that blends financial metrics, qualitative signals, and market data to help founders, finance teams, and investors align on credible startup enterprise values.',
    'The current build already demonstrates a production-ready UI, deterministic heuristics, and strong browser support. This PRD codifies the scope, success criteria, and roadmap required to harden the experience for wide rollout while preserving backwards compatibility.',
  ]),
)

sections.push(
  ...section('2. Product vision and objectives', [
    'Vision: Be the fastest way for modern operators to translate live operating metrics into investor-grade valuation narratives without needing bespoke analysts.',
    'Objectives:',
  ], [
    'Deliver balanced valuations that stay within contemporary market bands for each funding stage.',
    'Offer an always-on cockpit that feels premium (black/blue neon aesthetic) yet loads instantly on commodity hardware.',
    'Guarantee backwards-compatible math and UI so teams can rely on the tool during high-stakes fundraising.',
  ]),
)

sections.push(metricTable)

sections.push(
  ...section('3. Target personas', [
    'Primary and secondary personas ensure the feature roadmap stays anchored to real operators.',
  ]),
)
sections.push(
  ...section('', [], [
    'Founder/CEO: Wants directional valuations for narrative building ahead of fundraising or board updates; needs ability to highlight growth efficiency trade-offs.',
    'Finance or RevOps Lead: Responsible for internal planning and sensitivity analysis; needs deterministic formulas and exportable outputs for audits.',
    'Investor/Advisor: Uses the tool to benchmark inbound pitches; needs scenario transparency and alignment with current market comparables.',
  ]),
)

sections.push(
  ...section('4. Core use cases', [
    'Each use case maps to explicit UI flows and validation steps.',
  ]),
)
sections.push(
  ...section('', [], [
    'Baseline modeling: User inputs ARR, growth, TAM, margins, and qualitative scores to generate bear/base/bull valuations plus forward ARR.',
    'Scenario planning: User adjusts single variables (e.g., burn multiple) to visualize confidence changes and talk-track around operational initiatives.',
    'Board/investor packet: User copies insights and telemetry to slideware or exports using screenshot/export hooks (future work).',
    'Backwards compatibility verification: QA scripts simulate legacy browsers, zero-ARR states, and high-burn cases to ensure deterministic outputs.',
  ]),
)

sections.push(
  ...section('5. Functional requirements', [
    'The following requirements must be met before GA. IDs (FR-x) trace to engineering tickets.',
  ]),
)
sections.push(
  ...section('', [], [
    'FR-1 Input stack: Provide text, select, slider, and numeric inputs for every metric with clamped ranges plus formatting chips.',
    'FR-2 Stage intelligence: Maintain stage configuration table with base multiples, maturity scores, and earliness floors. Persist in a typed module for auditability.',
    'FR-3 Valuation engine: Implement deterministic calculations for revenue multiples, forward ARR, market potential, and scenario spreads using utility helpers (clamp, safeNumber).',
    'FR-4 Scenario visualization: Render cards, progress bars, and telemetry tiles that update on every keystroke, staying under 16 ms frame budget.',
    'FR-5 Insight narrative: Auto-generate bullet explanations that translate input changes to investor-friendly statements, including burn efficiency guidance.',
    'FR-6 Confidence meter: Display percentage derived from data completeness, efficiency, and retention strength; expose aria attributes for accessibility.',
    'FR-7 Compatibility guardrails: Detect unsupported browsers and downgrade visual filters to flat colors without impacting computations.',
    'FR-8 Data privacy: Keep all calculations client-side; never transmit inputs unless explicit export/sharing feature is enabled.',
  ]),
)

sections.push(
  ...section('6. Non-functional requirements'),
)
sections.push(
  ...section('', [], [
    'Performance: First interactive under 2 seconds on 2018 MacBook Air equivalent; slider drag latency < 100 ms.',
    'Reliability: Calculations must be pure functions without external API calls to ensure offline behavior once assets are cached.',
    'Accessibility: Provide sufficient color contrast, keyboard focus states, and aria labels for all interactive controls.',
    'Localization readiness: Keep text in string constants to enable future i18n; avoid concatenated strings with embedded markup.',
    'Security: No persistent storage of sensitive metrics by default; guard against XSS by not evaluating user-provided HTML.',
  ]),
)

sections.push(
  ...section('7. Data model and algorithm notes', [
    'The valuation model is intentionally transparent. Key relationships:',
  ]),
)
sections.push(
  ...section('', [], [
    'Stage configuration table (concept through Series C) defines base multiples, maturity scores, and minimum ARR floors; maintained in stageConfig.',
    'Revenue multiple = baseMultiple * growthLift * marginLift * qualitativeComposite * normalizedBurn, clamped between 0.7x and 3x of baseline to stay realistic.',
    'Forward ARR: Compounded monthly growth across 12 months when ARR is provided; otherwise rely on earliness floor.',
    'Market potential: TAM * (0.008 + maturityScore * 0.012) * qualitativeLift * growth bias, providing strategic upside weightings.',
    'Scenario spreads: Bull uses upside factor from growth + moat; Bear subtracts risk load derived from burn and talent depth.',
  ]),
)

sections.push(
  ...section('8. Experience and UI guidelines'),
)
sections.push(
  ...section('', [], [
    'Advanced aesthetic: Maintain layered gradients, glow panels, and telemetry grid consistent with black/blue theme while ensuring fallback colors exist.',
    'Responsive grid: Two-column layout above 1100px, single column on smaller devices with preserved hierarchy (inputs before results).',
    'Inline validation: Display formatted value chips beside labels so users see normalized inputs in real time.',
    'Content tone: Hero copy emphasizes always-on valuation rail; insight list uses declarative, data-backed statements.',
  ]),
)

sections.push(
  ...section('9. Edge cases and backwards compatibility'),
)
sections.push(
  ...section('', [], [
    'Zero ARR companies rely on earliness floors plus qualitative lifts; ensure messaging clarifies assumed baseline.',
    'Extreme TAM inputs (> 250B) should be capped and annotated so multipliers remain stable.',
    'High burn (> 3.5x) still returns valuations but widens bear/base spread visibly.',
    'Legacy browsers lacking backdrop-filter must still show legible panels; include feature detection and CSS fallbacks.',
    'Offline mode: Once assets cached, app continues to run without network; ensure service worker optionality is documented.',
  ]),
)

sections.push(
  ...section('10. Analytics and GTM plan', [
    'Instrumentation priorities:',
  ]),
)
sections.push(
  ...section('', [], [
    'Event taxonomy covering input changes, scenario renders, insights copied, and export actions.',
    'Session-level properties: persona flag (self-selected), stage distribution, browser/viewport data for compatibility reporting.',
    'Experiment hooks: Ability to A/B alternative insight narratives or UI treatments via feature flags.',
    'Rollout stages: Private alpha (internal finance teams), design partner beta (5 venture funds), public GA with documentation and landing page.',
    'Growth loops: Provide shareable link or export artifact so valuations can circulate in board docs with watermark attribution.',
  ]),
)

sections.push(
  ...section('11. Roadmap and release plan'),
)
sections.push(
  ...section('', [], [
    'Phase 1 (Now - Jan): Finalize heuristics, lock UI polish, add analytics beacons.',
    'Phase 2 (Feb - Mar): Introduce export to PDF/PNG, lightweight scenario history, and guidance tips.',
    'Phase 3 (Apr+): Layer in account system for saving models, optional API ingestion, and benchmark datasets.',
  ]),
)

sections.push(
  ...section('12. Risks and mitigations'),
)
sections.push(
  ...section('', [], [
    'R1: Market heuristics drift as funding climates change. Mitigation: refresh stageConfig quarterly with live comp sets.',
    'R2: Users over-index on tool outputs for official valuations. Mitigation: include clear disclaimer and encourage professional appraisal.',
    'R3: Visual richness impacts performance on low-end devices. Mitigation: enable reduced-motion and low-spec mode toggles.',
    'R4: Lack of export features could limit virality. Mitigation: prioritize screenshot/export backlog and provide API hooks.',
  ]),
)

sections.push(
  ...section('13. Dependencies and open questions'),
)
sections.push(
  ...section('', [], [
    'Dependency: Staying synced with capital market data providers (or internal research) for base multiple updates.',
    'Dependency: QA coverage across browser/device farms to uphold compatibility promise.',
    'Open question: Do we integrate with CRM/finance tools for auto-ingest, or stay manual-first for v1?',
  ]),
)

sections.push(
  ...section('14. Appendix - Current implementation map'),
)
sections.push(
  ...section('', [], [
    'UI Shell: src/App.tsx and src/App.css handle layout, hero, inputs, results, insights.',
    'Theme and resets: src/index.css handles typography, colors, and CSS variables.',
    'Valuation engine helpers: stageConfig, buildValuation, and buildInsights encapsulate business logic inside App.tsx for now.',
    'Readme overview: README.md captures highlights, modeling inputs, valuation stack, and browser support.',
  ]),
)

const doc = new Document({
  sections: [
    {
      children: [...titleParagraphs, ...sections],
    },
  ],
})

const buffer = await Packer.toBuffer(doc)
fs.writeFileSync(outputPath, buffer)
console.log(`PRD created at ${outputPath}`)

