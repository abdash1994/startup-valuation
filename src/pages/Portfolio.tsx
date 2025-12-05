import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getSavedValuations, type SavedValuation } from '../utils/savedValuations'
import { telemetry } from '../analytics/telemetry'
import './Portfolio.css'

const compactCurrencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
})

const formatCompactCurrency = (value: number) =>
  compactCurrencyFormatter.format(Math.round(Math.max(value, 0)))

const stageLabels: Record<string, string> = {
  concept: 'Concept',
  seed: 'Seed',
  seriesA: 'Series A',
  seriesB: 'Series B',
  seriesC: 'Series C+',
}

type SortField = 'name' | 'stage' | 'arr' | 'growth' | 'burn' | 'bear' | 'base' | 'bull'
type SortDirection = 'asc' | 'desc'

export default function Portfolio() {
  const [valuations, setValuations] = useState<SavedValuation[]>([])
  const [sortField, setSortField] = useState<SortField>('base')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  useEffect(() => {
    const saved = getSavedValuations()
    setValuations(saved)
    telemetry.track('portfolio_viewed', { count: saved.length })
  }, [])

  // Sorting logic
  const sortedValuations = useMemo(() => {
    return [...valuations].sort((a, b) => {
      let comparison = 0
      
      switch (sortField) {
        case 'name':
          comparison = a.companyName.localeCompare(b.companyName)
          break
        case 'stage':
          const stageOrder = ['concept', 'seed', 'seriesA', 'seriesB', 'seriesC']
          comparison = stageOrder.indexOf(a.stage) - stageOrder.indexOf(b.stage)
          break
        case 'arr':
          comparison = a.arr - b.arr
          break
        case 'growth':
          comparison = a.monthlyGrowth - b.monthlyGrowth
          break
        case 'burn':
          comparison = a.burnMultiple - b.burnMultiple
          break
        case 'bear':
          comparison = a.bear - b.bear
          break
        case 'base':
          comparison = a.base - b.base
          break
        case 'bull':
          comparison = a.bull - b.bull
          break
      }
      
      return sortDirection === 'desc' ? -comparison : comparison
    })
  }, [valuations, sortField, sortDirection])

  // Aggregate calculations
  const aggregates = useMemo(() => {
    if (valuations.length === 0) {
      return {
        totalBase: 0,
        totalBear: 0,
        totalBull: 0,
        avgMultiple: 0,
        avgGrowth: 0,
        avgBurn: 0,
        totalArr: 0,
      }
    }

    const totalBase = valuations.reduce((sum, v) => sum + v.base, 0)
    const totalBear = valuations.reduce((sum, v) => sum + v.bear, 0)
    const totalBull = valuations.reduce((sum, v) => sum + v.bull, 0)
    const totalArr = valuations.reduce((sum, v) => sum + v.arr, 0)
    
    // Weighted average growth by ARR (companies with more ARR matter more)
    const totalArrForGrowth = valuations.filter(v => v.arr > 0).reduce((sum, v) => sum + v.arr, 0)
    const avgGrowth = totalArrForGrowth > 0
      ? valuations.filter(v => v.arr > 0).reduce((sum, v) => sum + v.monthlyGrowth * v.arr, 0) / totalArrForGrowth
      : valuations.reduce((sum, v) => sum + v.monthlyGrowth, 0) / valuations.length

    const avgMultiple = valuations.filter(v => v.revenueMultiple > 0).length > 0
      ? valuations.filter(v => v.revenueMultiple > 0).reduce((sum, v) => sum + v.revenueMultiple, 0) / valuations.filter(v => v.revenueMultiple > 0).length
      : 0

    const avgBurn = valuations.reduce((sum, v) => sum + v.burnMultiple, 0) / valuations.length

    return {
      totalBase,
      totalBear,
      totalBull,
      avgMultiple,
      avgGrowth,
      avgBurn,
      totalArr,
    }
  }, [valuations])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return <span className="sort-icon">{sortDirection === 'desc' ? '↓' : '↑'}</span>
  }

  return (
    <div className="portfolio-container">
      <div className="portfolio-backdrop" />
      <div className="portfolio-glow" />

      <div className="portfolio-content">
        {/* Header */}
        <header className="portfolio-header">
          <div className="portfolio-header__left">
            <h1>📊 Portfolio Overview</h1>
            <p>Aggregate view of your saved valuations</p>
          </div>
          <div className="portfolio-header__right">
            <Link to="/library" className="portfolio-btn portfolio-btn--secondary">
              View Library
            </Link>
            <Link to="/valuator" className="portfolio-btn portfolio-btn--primary">
              + Add Company
            </Link>
          </div>
        </header>

        {valuations.length === 0 ? (
          <div className="portfolio-empty">
            <span className="portfolio-empty__icon">📋</span>
            <h3>No companies in portfolio</h3>
            <p>Save some valuations to see your portfolio overview</p>
            <Link to="/valuator" className="portfolio-btn portfolio-btn--primary">
              Create First Valuation
            </Link>
          </div>
        ) : (
          <>
            {/* Aggregate Stats */}
            <section className="portfolio-aggregates">
              <div className="aggregate-card aggregate-card--primary">
                <span className="aggregate-card__label">Total Portfolio Value (Base)</span>
                <span className="aggregate-card__value">{formatCompactCurrency(aggregates.totalBase)}</span>
                <span className="aggregate-card__sub">
                  Bear: {formatCompactCurrency(aggregates.totalBear)} · Bull: {formatCompactCurrency(aggregates.totalBull)}
                </span>
              </div>
              <div className="aggregate-card">
                <span className="aggregate-card__label">Companies</span>
                <span className="aggregate-card__value">{valuations.length}</span>
              </div>
              <div className="aggregate-card">
                <span className="aggregate-card__label">Total ARR</span>
                <span className="aggregate-card__value">${aggregates.totalArr.toFixed(1)}M</span>
              </div>
              <div className="aggregate-card">
                <span className="aggregate-card__label">Avg Growth (MoM)</span>
                <span className="aggregate-card__value">{aggregates.avgGrowth.toFixed(1)}%</span>
              </div>
              <div className="aggregate-card">
                <span className="aggregate-card__label">Avg Multiple</span>
                <span className="aggregate-card__value">{aggregates.avgMultiple.toFixed(1)}x</span>
              </div>
              <div className="aggregate-card">
                <span className="aggregate-card__label">Avg Burn</span>
                <span className="aggregate-card__value">{aggregates.avgBurn.toFixed(1)}x</span>
              </div>
            </section>

            {/* Portfolio Table */}
            <section className="portfolio-table-container">
              <table className="portfolio-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('name')} className="sortable">
                      Company <SortIcon field="name" />
                    </th>
                    <th onClick={() => handleSort('stage')} className="sortable">
                      Stage <SortIcon field="stage" />
                    </th>
                    <th onClick={() => handleSort('arr')} className="sortable text-right">
                      ARR <SortIcon field="arr" />
                    </th>
                    <th onClick={() => handleSort('growth')} className="sortable text-right">
                      MoM <SortIcon field="growth" />
                    </th>
                    <th onClick={() => handleSort('burn')} className="sortable text-right">
                      Burn <SortIcon field="burn" />
                    </th>
                    <th onClick={() => handleSort('bear')} className="sortable text-right">
                      Bear <SortIcon field="bear" />
                    </th>
                    <th onClick={() => handleSort('base')} className="sortable text-right">
                      Base <SortIcon field="base" />
                    </th>
                    <th onClick={() => handleSort('bull')} className="sortable text-right">
                      Bull <SortIcon field="bull" />
                    </th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedValuations.map((v) => (
                    <tr key={v.id}>
                      <td className="company-name">{v.companyName}</td>
                      <td>
                        <span className="stage-badge">{stageLabels[v.stage] || v.stage}</span>
                      </td>
                      <td className="text-right">{v.arr === 0 ? '—' : `$${v.arr}M`}</td>
                      <td className="text-right">{v.monthlyGrowth}%</td>
                      <td className="text-right">
                        <span className={v.burnMultiple === 0 ? 'text-green' : v.burnMultiple > 2 ? 'text-warning' : ''}>
                          {v.burnMultiple === 0 ? '✓' : `${v.burnMultiple}x`}
                        </span>
                      </td>
                      <td className="text-right text-bear">{formatCompactCurrency(v.bear)}</td>
                      <td className="text-right text-base">{formatCompactCurrency(v.base)}</td>
                      <td className="text-right text-bull">{formatCompactCurrency(v.bull)}</td>
                      <td className="text-center">
                        <div className="table-actions">
                          <Link to={`/valuator?localId=${v.id}`} className="table-action" title="Edit">
                            ✏️
                          </Link>
                          <Link to={`/share/${v.id}`} className="table-action" title="Share">
                            🔗
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td><strong>Total / Avg</strong></td>
                    <td>—</td>
                    <td className="text-right"><strong>${aggregates.totalArr.toFixed(1)}M</strong></td>
                    <td className="text-right"><strong>{aggregates.avgGrowth.toFixed(1)}%</strong></td>
                    <td className="text-right"><strong>{aggregates.avgBurn.toFixed(1)}x</strong></td>
                    <td className="text-right text-bear"><strong>{formatCompactCurrency(aggregates.totalBear)}</strong></td>
                    <td className="text-right text-base"><strong>{formatCompactCurrency(aggregates.totalBase)}</strong></td>
                    <td className="text-right text-bull"><strong>{formatCompactCurrency(aggregates.totalBull)}</strong></td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </section>

            {/* Legend */}
            <footer className="portfolio-footer">
              <p>
                💡 Click column headers to sort. Avg Growth is ARR-weighted. 
                Portfolio value is simple sum of base valuations.
              </p>
            </footer>
          </>
        )}
      </div>
    </div>
  )
}

