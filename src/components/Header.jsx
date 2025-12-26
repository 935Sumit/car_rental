import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import logo from '../assets/Logo.png'
import './Header.css'

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActive = (path) => location.pathname === path

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="logo-container"
            >
              <img src={logo} alt="Vintage Riders Hub Logo" className="logo-image" />
              <span className="logo-text">Vintage Riders Hub</span>
            </motion.div>
          </Link>

          <nav className={`nav ${isMobileMenuOpen ? 'open' : ''}`}>
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/buy" 
              className={`nav-link ${isActive('/buy') ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Buy Cars
            </Link>
            <Link 
              to="/sell" 
              className={`nav-link ${isActive('/sell') ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sell Cars
            </Link>
            <Link 
              to="/rent" 
              className={`nav-link ${isActive('/rent') ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Rentals
            </Link>
            <Link 
              to="/price-predictor" 
              className={`nav-link ${isActive('/price-predictor') ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Price Predictor
            </Link>
            <Link 
              to="/contact" 
              className={`nav-link ${isActive('/contact') ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <div className="auth-links">
              <Link 
                to="/login" 
                className="btn btn-outline-small"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className="btn btn-primary-small"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          </nav>

          <button 
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header

