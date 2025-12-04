import { Link } from 'react-router-dom'
import './NotFound.css'

export default function NotFound() {
  return (
    <div className="notfound-container">
      <div className="notfound-backdrop" />
      <div className="notfound-glow" />
      
      <div className="notfound-content">
        <div className="notfound-code">404</div>
        <h1>Page Not Found</h1>
        <p>Oops! The page you're looking for doesn't exist or has been moved.</p>
        
        <div className="notfound-actions">
          <Link to="/" className="notfound-btn notfound-btn--primary">
            Go Home
          </Link>
          <Link to="/valuator" className="notfound-btn notfound-btn--secondary">
            Try Valuator
          </Link>
        </div>
        
        <div className="notfound-links">
          <p>Or check out these pages:</p>
          <div className="notfound-links-grid">
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign Up</Link>
            <Link to="/dashboard">Dashboard</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

