import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../supabase/supabaseClient'
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
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.password) newErrors.password = 'Password is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsLoading(true)

    try {
      // Direct Database Login (bypassing broken Supabase Auth)
      const { data: userData, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('email', formData.email)
        .eq('password', formData.password)
        .single() // Finds exactly one match

      if (dbError || !userData) {
         throw new Error("Invalid email or password");
      }

      if (userData.status === 'blocked') {
        setErrors({ auth: 'Your account has been blocked.' })
        setIsLoading(false)
        return
      }

      localStorage.setItem('currentUser', JSON.stringify(userData))
      
      // Check if user is Admin dynamically from Database
      if (userData.role === 'admin') {
          localStorage.setItem('adminLoggedIn', 'true')
          setIsLoading(false)
          navigate('/admin/dashboard')
          window.location.reload()
          return
      }

      // Normal User Login
      setIsLoading(false)
      navigate('/')
      window.location.reload()
    } catch (error) {
      console.error("Login detail error:", error)
      setErrors({ auth: error.message || 'Invalid email or password' })
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-image">
          <div className="image-content">
            <h2>Welcome to Vintage Rides Hub</h2>
            <p>Discover and rent classic cars with ease.</p>
            <div className="features">
              <div className="feature-item"><div className="icon">🚗</div><span>Browse thousands of rides</span></div>
              <div className="feature-item"><div className="icon">⚡</div><span>Easy booking process</span></div>
              <div className="feature-item"><div className="icon">💳</div><span>Secure payments</span></div>
            </div>
          </div>
        </div>
        <motion.div className="auth-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="auth-header">
            <h1>Welcome Back</h1>
            <p>Login to access your account</p>
          </div>
          {errors.auth && <div className="error-banner">{errors.auth}</div>}
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input type="text" name="email" value={formData.email} onChange={handleChange} placeholder="your.email@example.com" className={errors.email ? 'error' : ''} />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Enter your password" className={errors.password ? 'error' : ''} />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>
            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" name="rememberMe" checked={formData.rememberMe} onChange={handleChange} />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" style={{ color: 'var(--secondary-color)', fontSize: '0.9rem', textDecoration: 'none' }}>Forgot password?</Link>
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <div className="auth-footer">
            <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Login
