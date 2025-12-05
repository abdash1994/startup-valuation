import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './Auth.css'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [validSession, setValidSession] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const navigate = useNavigate()

  // Check if we have a valid session from the reset link
  useEffect(() => {
    const checkSession = async () => {
      try {
        // First, check if Supabase already has a session (e.g., from auto-detection)
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          setValidSession(true)
          setCheckingSession(false)
          return
        }

        // Check URL hash for recovery token (Supabase sends tokens in URL hash)
        // The hash might look like: #access_token=xxx&refresh_token=xxx&type=recovery
        const hash = window.location.hash
        if (hash && hash.length > 1) {
          const hashParams = new URLSearchParams(hash.substring(1))
          const accessToken = hashParams.get('access_token')
          const refreshToken = hashParams.get('refresh_token')
          const type = hashParams.get('type')
          
          if (accessToken && type === 'recovery') {
            // Set the session from the recovery token
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            })
            
            if (data.session && !error) {
              setValidSession(true)
              // Clean up the URL by removing the hash
              window.history.replaceState(null, '', window.location.pathname)
            } else {
              console.error('Session error:', error)
              setError('Invalid or expired reset link. Please request a new password reset.')
            }
          } else if (accessToken) {
            // Try anyway if we have an access token (might be different Supabase version)
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            })
            
            if (data.session && !error) {
              setValidSession(true)
              window.history.replaceState(null, '', window.location.pathname)
            } else {
              setError('Invalid or expired reset link. Please request a new password reset.')
            }
          } else {
            setError('Invalid or expired reset link. Please request a new password reset.')
          }
        } else {
          setError('No reset token found. Please request a new password reset link.')
        }
      } catch (err) {
        console.error('Error checking session:', err)
        setError('Something went wrong. Please request a new password reset.')
      } finally {
        setCheckingSession(false)
      }
    }

    // Small delay to ensure URL is properly restored after potential 404 redirect
    const timer = setTimeout(checkSession, 100)
    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validate passwords
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        setError(error.message)
      } else {
        setSuccess('Password updated successfully! Redirecting to login...')
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      }
    } catch {
      setError('Failed to update password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (checkingSession) {
    return (
      <div className="auth-container">
        <div className="auth-backdrop" />
        <div className="auth-glow" />
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">🔐</div>
            <h1>Verifying...</h1>
            <p>Please wait while we verify your reset link.</p>
          </div>
        </div>
      </div>
    )
  }

  if (!validSession) {
    return (
      <div className="auth-container">
        <div className="auth-backdrop" />
        <div className="auth-glow" />
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">⚠️</div>
            <h1>Invalid Reset Link</h1>
            <p>{error || 'This password reset link is invalid or has expired.'}</p>
          </div>
          <div className="auth-footer">
            <p>
              <Link to="/forgot-password">Request a new reset link</Link>
            </p>
            <p style={{ marginTop: '1rem' }}>
              <Link to="/login">Back to Login</Link>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <div className="auth-backdrop" />
      <div className="auth-glow" />
      
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">🔐</div>
          <h1>Reset Password</h1>
          <p>Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}
          
          <div className="auth-field">
            <label htmlFor="password">New Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete="new-password"
              data-testid="password-input"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete="new-password"
              data-testid="confirm-password-input"
            />
          </div>

          <button 
            type="submit" 
            className="auth-button" 
            disabled={loading}
            data-testid="reset-password-button"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Remember your password?{' '}
            <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

