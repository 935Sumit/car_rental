import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import logo from '../assets/final logo.jpg.png'
import './Header.css'

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const { currentUser, logout } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  return (
    <>
      {/* Dark backdrop — tap to close mobile menu */}
      <div
        className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-container">
          <div className="header-content">
            <Link to={currentUser?.role === 'admin' ? "/admin/dashboard" : "/"} className="logo">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="logo-container"
              >
                <img src={logo} alt="Vintage Riders Hub Logo" className="logo-image" />
                <span className="logo-text">Vintage Rides Hub</span>
              </motion.div>
            </Link>

            <nav className={`nav ${isMobileMenuOpen ? 'open' : ''}`}>
              {currentUser?.role === 'admin' ? (
                <>
                  <Link
                    to="/admin/dashboard"
                    className={`nav-link ${isActive('/admin/dashboard') ? 'active' : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/admin/cars"
                    className={`nav-link ${isActive('/admin/cars') ? 'active' : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Cars
                  </Link>
                  <Link
                    to="/admin/bookings"
                    className={`nav-link ${isActive('/admin/bookings') ? 'active' : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Bookings
                  </Link>
                  <Link
                    to="/admin/users"
                    className={`nav-link ${isActive('/admin/users') ? 'active' : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Users
                  </Link>
                  <Link
                    to="/admin/calendar"
                    className={`nav-link ${isActive('/admin/calendar') ? 'active' : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Schedule
                  </Link>
                  <button onClick={handleLogout} className="logout-btn">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/"
                    className={`nav-link ${isActive('/') ? 'active' : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    to="/saved"
                    className={`nav-link ${isActive('/saved') ? 'active' : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Saved Cars
                  </Link>
                  <Link
                    to="/contact"
                    className={`nav-link ${isActive('/contact') ? 'active' : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Contact
                  </Link>
                  {currentUser ? (
                    <>
                      <Link
                        to="/my-bookings"
                        className={`nav-link ${isActive('/my-bookings') ? 'active' : ''}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        My Bookings
                      </Link>
                      <Link
                        to="/profile"
                        className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        My Profile
                      </Link>
                      <button onClick={handleLogout} className="logout-btn">
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className={`nav-link ${isActive('/login') ? 'active' : ''}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Login
                      </Link>
                      <Link
                        to="/signup"
                        className={`nav-link ${isActive('/signup') ? 'active' : ''}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </>
              )}
            </nav>

            <button
              className="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
              style={isMobileMenuOpen ? { gap: '0px' } : {}}
            >
              <span style={isMobileMenuOpen ? { transform: 'rotate(45deg) translate(4px, 4px)' } : {}}></span>
              <span style={isMobileMenuOpen ? { opacity: 0, transform: 'scaleX(0)' } : {}}></span>
              <span style={isMobileMenuOpen ? { transform: 'rotate(-45deg) translate(4px, -4px)' } : {}}></span>
            </button>
          </div>
        </div>
      </header>
    </>
  )
}

export default Header
