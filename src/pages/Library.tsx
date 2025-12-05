import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  getSavedValuations, 
  deleteValuation as deleteLocalValuation,
  type SavedValuation 
} from '../utils/savedValuations'
import { telemetry } from '../analytics/telemetry'
import './Library.css'

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

export default function Library() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [valuations, setValuations] = useState<SavedValuation[]>([])
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'valuation'>('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // Load valuations from localStorage
  const loadValuations = useCallback(() => {
    const saved = getSavedValuations()
    setValuations(saved)
  }, [])

  useEffect(() => {
    loadValuations()
    telemetry.track('library_viewed', {})
  }, [loadValuations])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this valuation from your library?')) return
    
    setDeleteLoading(id)
    try {
      const success = deleteLocalValuation(id)
      if (success) {
        setValuations(prev => prev.filter(v => v.id !== id))
        telemetry.track('scenario_saved', { action: 'deleted' })
      } else {
        alert('Failed to delete valuation')
      }
    } catch (error) {
      console.error('Error deleting:', error)
      alert('Failed to delete valuation')
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleLoad = (valuation: SavedValuation) => {
    // Navigate to valuator with the valuation data as query params
    // The valuator page will need to handle loading from localStorage
    navigate(`/valuator?localId=${valuation.id}`)
  }

  // Sort valuations
  const sortedValuations = [...valuations].sort((a, b) => {
    let comparison = 0
    
    switch (sortBy) {
      case 'name':
        comparison = a.companyName.localeCompare(b.companyName)
        break
      case 'valuation':
        comparison = a.base - b.base
        break
      case 'date':
      default:
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    }
    
    return sortDirection === 'desc' ? -comparison : comparison
  })

  // Calculate aggregates
  const totalBaseValuation = valuations.reduce((sum, v) => sum + v.base, 0)
  const avgBaseValuation = valuations.length > 0 ? totalBaseValuation / valuations.length : 0

  const toggleSort = (field: 'date' | 'name' | 'valuation') => {
    if (sortBy === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortDirection('desc')
    }
  }

  return (
    <div className="library-container">
      <div className="library-backdrop" />
      <div className="library-glow" />

      <div className="library-content">
        <header className="library-header">
          <div className="library-header__left">
            <h1>📚 Valuation Library</h1>
            <p>Your locally saved valuation scenarios</p>
          </div>
          <div className="library-header__right">
            <Link to="/valuator" className="library-btn library-btn--primary">
              + New Valuation
            </Link>
            {user && (
              <Link to="/dashboard" className="library-btn library-btn--secondary">
                Cloud Dashboard
              </Link>
            )}
          </div>
        </header>

        {/* Stats */}
        {valuations.length > 0 && (
          <div className="library-stats">
            <div className="stat-card">
              <span className="stat-card__icon">📊</span>
              <div className="stat-card__content">
                <p className="stat-card__value">{valuations.length}</p>
                <p className="stat-card__label">Saved Scenarios</p>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-card__icon">💰</span>
              <div className="stat-card__content">
                <p className="stat-card__value">{formatCompactCurrency(totalBaseValuation)}</p>
                <p className="stat-card__label">Total Base Value</p>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-card__icon">🎯</span>
              <div className="stat-card__content">
                <p className="stat-card__value">{formatCompactCurrency(avgBaseValuation)}</p>
                <p className="stat-card__label">Avg. Base Valuation</p>
              </div>
            </div>
          </div>
        )}

        {/* Sorting controls */}
        {valuations.length > 1 && (
          <div className="library-sort">
            <span>Sort by:</span>
            <button 
              onClick={() => toggleSort('date')}
              className={sortBy === 'date' ? 'active' : ''}
            >
              Date {sortBy === 'date' && (sortDirection === 'desc' ? '↓' : '↑')}
            </button>
            <button 
              onClick={() => toggleSort('name')}
              className={sortBy === 'name' ? 'active' : ''}
            >
              Name {sortBy === 'name' && (sortDirection === 'desc' ? '↓' : '↑')}
            </button>
            <button 
              onClick={() => toggleSort('valuation')}
              className={sortBy === 'valuation' ? 'active' : ''}
            >
              Valuation {sortBy === 'valuation' && (sortDirection === 'desc' ? '↓' : '↑')}
            </button>
          </div>
        )}

        {/* Valuations List */}
        <section className="library-valuations">
          {valuations.length === 0 ? (
            <div className="library-empty">
              <span className="library-empty__icon">📋</span>
              <h3>No saved valuations yet</h3>
              <p>Create your first valuation and save it to build your library</p>
              <Link to="/valuator" className="library-btn library-btn--primary">
                Create Valuation
              </Link>
              {!user && (
                <p className="library-empty__hint">
                  <Link to="/signup">Create an account</Link> to sync your valuations across devices
                </p>
              )}
            </div>
          ) : (
            <div className="valuations-grid">
              {sortedValuations.map((valuation) => (
                <article key={valuation.id} className="valuation-card">
                  <div className="valuation-card__header">
                    <h3>{valuation.companyName}</h3>
                    <span className="valuation-card__stage">
                      {stageLabels[valuation.stage] || valuation.stage}
                    </span>
                  </div>

                  <div className="valuation-card__metrics">
                    <div className="valuation-card__metric">
                      <span className="metric-label">Bear</span>
                      <span className="metric-value metric-value--bear">
                        {formatCompactCurrency(valuation.bear)}
                      </span>
                    </div>
                    <div className="valuation-card__metric">
                      <span className="metric-label">Base</span>
                      <span className="metric-value metric-value--base">
                        {formatCompactCurrency(valuation.base)}
                      </span>
                    </div>
                    <div className="valuation-card__metric">
                      <span className="metric-label">Bull</span>
                      <span className="metric-value metric-value--bull">
                        {formatCompactCurrency(valuation.bull)}
                      </span>
                    </div>
                  </div>

                  <div className="valuation-card__details">
                    <span>ARR: ${valuation.arr}M</span>
                    <span>Growth: {valuation.monthlyGrowth}%/mo</span>
                    <span>Multiple: {valuation.revenueMultiple.toFixed(1)}x</span>
                  </div>

                  <div className="valuation-card__footer">
                    <span className="valuation-card__date">
                      {new Date(valuation.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <div className="valuation-card__actions">
                      <button
                        onClick={() => handleLoad(valuation)}
                        className="action-btn action-btn--load"
                      >
                        Load
                      </button>
                      <Link
                        to={`/share/${valuation.id}`}
                        className="action-btn action-btn--share"
                      >
                        Share
                      </Link>
                      <button
                        onClick={() => handleDelete(valuation.id)}
                        className="action-btn action-btn--delete"
                        disabled={deleteLoading === valuation.id}
                      >
                        {deleteLoading === valuation.id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Info footer */}
        <footer className="library-footer">
          <p>
            💾 Valuations are stored in your browser's local storage. 
            {!user && (
              <>
                {' '}<Link to="/signup">Create an account</Link> to sync across devices.
              </>
            )}
          </p>
        </footer>
      </div>
    </div>
  )
}

