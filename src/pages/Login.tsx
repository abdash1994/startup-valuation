import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Auth.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = await signIn(email, password)

      if (error) {
        // Check if it's a connection error (Supabase not configured)
        if (error.message.includes('fetch') || error.message.includes('Failed') || error.message.includes('NetworkError')) {
          setError('Backend not configured. Please set up Supabase (see SETUP.md) or use the Valuator tool without an account.')
        } else if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. If you just signed up, please check your email to verify your account first.')
        } else if (error.message.includes('Email not confirmed')) {
          setError('Please verify your email before signing in. Check your inbox for a verification link.')
        } else {
          setError(error.message)
        }
        setLoading(false)
      } else {
        navigate('/dashboard')
      }
    } catch {
      setError('Backend not configured. Please set up Supabase (see SETUP.md) or use the Valuator tool without an account.')
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-backdrop" />
      <div className="auth-glow" />
      
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">🚀</div>
          <h1>Welcome Back</h1>
          <p>Sign in to access your valuations</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}
          
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              autoComplete="email"
              data-testid="email-input"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              data-testid="password-input"
            />
          </div>

          <div className="auth-links-row">
            <span></span>
            <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
          </div>

          <button type="submit" className="auth-button" disabled={loading} data-testid="login-button">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/signup">Create one</Link>
          </p>
        </div>

        <div className="auth-demo-notice">
          <p>🎯 <strong>Demo Mode:</strong> You can also <Link to="/valuator" data-testid="try-valuator-link">try the tool</Link> without signing in</p>
        </div>
      </div>
    </div>
  )
}

