import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import './Auth.css'

const Login = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (formData.email.trim() !== 'admin' && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    // Simulate API call and check localStorage
    setTimeout(() => {
      // Hardcoded Admin Check
      const isAdmin = (formData.email === 'admin' || formData.email === 'admin@vintagerides.com') && 
                      formData.password === 'admin123';

      if (isAdmin) {
        localStorage.setItem('adminLoggedIn', 'true')
        localStorage.setItem('currentUser', JSON.stringify({
          fullName: 'System Administrator',
          email: 'admin@vintagerides.com',
          role: 'admin'
        }))
        setIsLoading(false)
        navigate('/admin/dashboard')
        window.location.reload()
        return
      }

      const users = JSON.parse(localStorage.getItem('vantage_users') || '[]')
      const user = users.find(u => u.email === formData.email && u.password === formData.password)
      
      if (user) {
        if (user.status === 'blocked') {
          setErrors({ auth: 'Your account has been blocked. Please contact support.' })
          setIsLoading(false)
          return
        }
        localStorage.setItem('currentUser', JSON.stringify(user))
        setIsLoading(false)
        navigate('/')
        // Force refresh or trigger state update if needed. 
        // Better: user should be in a context.
        window.location.reload() // Quick fix for header update
      } else {
        setErrors({ auth: 'Invalid email or password' })
        setIsLoading(false)
      }
    }, 1500)
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* side panel visible on larger screens */}
        <div className="auth-image">
          <div className="image-content">
            <h2>Welcome to Vintage Rides Hub</h2>
            <p>Discover and rent classic cars with ease. Enjoy a seamless experience tailored for desktop.</p>
            <div className="features">
              <div className="feature-item">
                <div className="icon">🚗</div>
                <span>Browse thousands of rides</span>
              </div>
              <div className="feature-item">
                <div className="icon">⚡</div>
                <span>Easy booking process</span>
              </div>
              <div className="feature-item">
                <div className="icon">💳</div>
                <span>Secure payments</span>
              </div>
            </div>
          </div>
        </div>
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="auth-header">
            <h1>Welcome Back</h1>
            <p>Login to access your account</p>
          </div>

          {errors.auth && <div className="error-banner">{errors.auth}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="text"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="forgot-link">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="auth-divider">
            <span>or continue with</span>
          </div>

          <div className="social-login">
            <button className="btn-social btn-google">
              <svg width="20" height="20" viewBox="0 0 20 20">
                <path fill="#4285F4" d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z" />
                <path fill="#34A853" d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z" />
                <path fill="#FBBC05" d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z" />
                <path fill="#EA4335" d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z" />
              </svg>
              Google
            </button>
            <button className="btn-social btn-facebook">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="#1877F2">
                <path d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" />
              </svg>
              Facebook
            </button>
          </div>

          <div className="auth-footer">
            <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Login
