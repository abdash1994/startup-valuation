import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Navbar.css'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isActive = (path: string) => location.pathname === path

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    setDropdownOpen(false)
    await signOut()
    navigate('/login')
  }

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
  const userEmail = user?.email || ''

  // Get base URL for walkthrough link
  const baseUrl = import.meta.env.BASE_URL || '/'

  return (
    <nav className="navbar">
      <div className="navbar__content">
        <Link to="/" className="navbar__brand">
          <span className="navbar__logo">🚀</span>
          <span className="navbar__title">Startup Value Navigator</span>
        </Link>

        <div className="navbar__links">
          <Link
            to="/valuator"
            className={`navbar__link ${isActive('/valuator') ? 'navbar__link--active' : ''}`}
          >
            Valuator
          </Link>

          {/* User Guide Link */}
          <a
            href={`${baseUrl}walkthrough-full.html`}
            target="_blank"
            rel="noopener noreferrer"
            className="navbar__link navbar__link--guide"
            title="User Guide"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span className="navbar__link-text">Guide</span>
          </a>

          {user ? (
            <>
              <Link
                to="/dashboard"
                className={`navbar__link ${isActive('/dashboard') ? 'navbar__link--active' : ''}`}
              >
                Dashboard
              </Link>
              
              {/* User dropdown menu */}
              <div className="navbar__user-menu" ref={dropdownRef}>
                <button 
                  className="navbar__avatar-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  <span className="navbar__avatar">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                  <svg className={`navbar__chevron ${dropdownOpen ? 'navbar__chevron--open' : ''}`} width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                </button>
                
                {dropdownOpen && (
                  <div className="navbar__dropdown">
                    <div className="navbar__dropdown-header">
                      <span className="navbar__dropdown-name">{userName}</span>
                      <span className="navbar__dropdown-email">{userEmail}</span>
                    </div>
                    <div className="navbar__dropdown-divider" />
                    <Link 
                      to="/dashboard" 
                      className="navbar__dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <span>📊</span> My Valuations
                    </Link>
                    <Link 
                      to="/valuator" 
                      className="navbar__dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <span>➕</span> New Valuation
                    </Link>
                    <a 
                      href={`${baseUrl}walkthrough-full.html`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="navbar__dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <span>📖</span> User Guide
                    </a>
                    <div className="navbar__dropdown-divider" />
                    <button 
                      className="navbar__dropdown-item navbar__dropdown-item--danger"
                      onClick={handleSignOut}
                    >
                      <span>🚪</span> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`navbar__link ${isActive('/login') ? 'navbar__link--active' : ''}`}
              >
                Login
              </Link>
              <Link to="/signup" className="navbar__cta">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
