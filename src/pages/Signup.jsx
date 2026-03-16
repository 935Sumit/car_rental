import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../supabase/supabaseClient'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

const Signup = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
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
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsLoading(true)

    try {
      // 1. Check if email already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', formData.email)
        .single()
      
      if (existingUser) {
        throw new Error("An account with this email already exists.");
      }

      // 2. Generate a valid UUID
      const newId = crypto.randomUUID();

      // 3. Save directly to the 'users' table (bypassing the broken Supabase Auth system)
      const { data: newUser, error: dbError } = await supabase.from('users').insert([{
        id: newId,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password, // Storing password for direct login
        status: 'active',
        role: 'user',
        created_at: new Date().toISOString()
      }]).select().single()

      if (dbError) throw dbError

      // 4. Auto-Login
      login(newUser || {
        id: newId,
        fullName: formData.fullName,
        email: formData.email,
        role: 'user'
      })

      setIsLoading(false)
      alert("Registration successful! Welcome to Vintage Rides Hub.")
      navigate('/')
    } catch (error) {
      console.error("Signup error detail:", error)
      setErrors({ auth: error.message || 'Failed to create account. Please try again.' })
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-image">
          <div className="image-content">
            <h2>Join Vintage Rides Hub</h2>
            <p>Create your account and start renting classic cars.</p>
            <div className="features">
              <div className="feature-item"><div className="icon">🚗</div><span>Access exclusive listings</span></div>
              <div className="feature-item"><div className="icon">🔒</div><span>Your data stays safe</span></div>
              <div className="feature-item"><div className="icon">😊</div><span>24/7 support</span></div>
            </div>
          </div>
        </div>
        <motion.div className="auth-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="auth-header">
            <h1>Create Account</h1>
            <p>Join us to start your journey</p>
          </div>
          {errors.auth && <div className="error-banner">{errors.auth}</div>}
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="John Doe" className={errors.fullName ? 'error' : ''} />
              {errors.fullName && <span className="error-message">{errors.fullName}</span>}
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="your.email@example.com" className={errors.email ? 'error' : ''} />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="9876543210" className={errors.phone ? 'error' : ''} />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Create a strong password" className={errors.password ? 'error' : ''} />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter your password" />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input type="checkbox" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleChange} />
                <span>I agree to the <Link to="/terms" className="link-text">Terms & Conditions</Link></span>
              </label>
              {errors.agreeToTerms && <span className="error-message">{errors.agreeToTerms}</span>}
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
          <div className="auth-footer">
            <p>Already have an account? <Link to="/login">Login</Link></p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Signup
