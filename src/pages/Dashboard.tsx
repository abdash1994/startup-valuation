import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import type { ValuationRecord } from '../lib/supabase'
import './Dashboard.css'

const compactCurrencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
})

const formatCompactCurrency = (value: number) =>
  compactCurrencyFormatter.format(Math.round(Math.max(value, 0)))

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [valuations, setValuations] = useState<ValuationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchValuations()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const fetchValuations = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('valuations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setValuations(data || [])
    } catch (error) {
      console.error('Error fetching valuations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this valuation?')) return

    setDeleteLoading(id)
    try {
      const { error } = await supabase
        .from('valuations')
        .delete()
        .eq('id', id)

      if (error) throw error
      setValuations(valuations.filter(v => v.id !== id))
    } catch (error) {
      console.error('Error deleting valuation:', error)
      alert('Failed to delete valuation')
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'

  return (
    <div className="dashboard-container">
      <div className="dashboard-backdrop" />
      <div className="dashboard-glow" />

      <div className="dashboard-content">
        <header className="dashboard-header">
          <div className="dashboard-header__left">
            <h1>👋 Welcome, {userName}</h1>
            <p>Manage your startup valuations</p>
          </div>
          <div className="dashboard-header__right">
            <Link to="/valuator" className="dashboard-btn dashboard-btn--primary">
              + New Valuation
            </Link>
            <button onClick={handleSignOut} className="dashboard-btn dashboard-btn--secondary">
              Sign Out
            </button>
          </div>
        </header>

        <div className="dashboard-stats">
          <div className="stat-card">
            <span className="stat-card__icon">📊</span>
            <div className="stat-card__content">
              <p className="stat-card__value">{valuations.length}</p>
              <p className="stat-card__label">Saved Valuations</p>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-card__icon">🎯</span>
            <div className="stat-card__content">
              <p className="stat-card__value">
                {valuations.length > 0
                  ? formatCompactCurrency(
                      valuations.reduce((sum, v) => sum + v.base_valuation, 0) / valuations.length
                    )
                  : '$0'}
              </p>
              <p className="stat-card__label">Avg. Base Valuation</p>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-card__icon">📈</span>
            <div className="stat-card__content">
              <p className="stat-card__value">
                {valuations.length > 0
                  ? formatCompactCurrency(Math.max(...valuations.map(v => v.bull_valuation)))
                  : '$0'}
              </p>
              <p className="stat-card__label">Highest Bull Case</p>
            </div>
          </div>
        </div>

        <section className="dashboard-valuations">
          <h2>Your Valuations</h2>

          {loading ? (
            <div className="dashboard-loading">
              <div className="loading-spinner" />
              <p>Loading your valuations...</p>
            </div>
          ) : valuations.length === 0 ? (
            <div className="dashboard-empty">
              <span className="dashboard-empty__icon">📋</span>
              <h3>No valuations yet</h3>
              <p>Create your first startup valuation to get started</p>
              <Link to="/valuator" className="dashboard-btn dashboard-btn--primary">
                Create Valuation
              </Link>
            </div>
          ) : (
            <div className="valuations-grid">
              {valuations.map((valuation) => (
                <div key={valuation.id} className="valuation-card">
                  <div className="valuation-card__header">
                    <h3>{valuation.startup_name}</h3>
                    <span className="valuation-card__stage">{valuation.stage}</span>
                  </div>

                  <div className="valuation-card__metrics">
                    <div className="valuation-card__metric">
                      <span className="metric-label">Bear</span>
                      <span className="metric-value metric-value--bear">
                        {formatCompactCurrency(valuation.bear_valuation)}
                      </span>
                    </div>
                    <div className="valuation-card__metric">
                      <span className="metric-label">Base</span>
                      <span className="metric-value metric-value--base">
                        {formatCompactCurrency(valuation.base_valuation)}
                      </span>
                    </div>
                    <div className="valuation-card__metric">
                      <span className="metric-label">Bull</span>
                      <span className="metric-value metric-value--bull">
                        {formatCompactCurrency(valuation.bull_valuation)}
                      </span>
                    </div>
                  </div>

                  <div className="valuation-card__details">
                    <span>ARR: ${valuation.arr}M</span>
                    <span>Growth: {valuation.monthly_growth}%/mo</span>
                    <span>Multiple: {valuation.revenue_multiple.toFixed(1)}x</span>
                  </div>

                  <div className="valuation-card__footer">
                    <span className="valuation-card__date">
                      {new Date(valuation.created_at!).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <div className="valuation-card__actions">
                      <Link
                        to={`/valuator?id=${valuation.id}`}
                        className="action-btn action-btn--edit"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(valuation.id!)}
                        className="action-btn action-btn--delete"
                        disabled={deleteLoading === valuation.id}
                      >
                        {deleteLoading === valuation.id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

