import { useState } from 'react'
import { motion } from 'framer-motion'
import './Contact.css'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // In a real app, this would send data to a backend
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      })
    }, 3000)
  }

  return (
    <div className="contact">
      <div className="page-header">
        <div className="container">
          <h1>Contact Us</h1>
          <p>We're here to help! Get in touch with our team</p>
        </div>
      </div>

      <div className="container">
        <div className="contact-content">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="contact-info"
          >
            <div className="info-section">
              <h2>Get in Touch</h2>
              <p>
                Have questions about our vintage cars? Need help with a listing? 
                Want to schedule a viewing? We're here to assist you every step of the way.
              </p>
            </div>

            <div className="contact-details">
              <div className="contact-item">
                <div className="contact-icon email-icon"></div>
                <div>
                  <h3>Email</h3>
                  <p>info@vintageridershub.com</p>
                  <p>support@vintageridershub.com</p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon phone-icon"></div>
                <div>
                  <h3>Phone</h3>
                  <p>+1 (555) 123-4567</p>
                  <p>Mon-Fri: 9AM - 6PM EST</p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon location-icon"></div>
                <div>
                  <h3>Address</h3>
                  <p>123 Classic Car Avenue</p>
                  <p>Los Angeles, CA 90001</p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon social-icon"></div>
                <div>
                  <h3>Social Media</h3>
                  <div className="social-links">
                    <a href="#">Facebook</a>
                    <a href="#">Instagram</a>
                    <a href="#">Twitter</a>
                  </div>
                </div>
              </div>
            </div>

            <div className="faq-section">
              <h3>Frequently Asked Questions</h3>
              <div className="faq-item">
                <strong>How do I list my car for sale?</strong>
                <p>Simply navigate to the "Sell Cars" page and fill out our listing form with your car's details.</p>
              </div>
              <div className="faq-item">
                <strong>Can I rent a car for my wedding?</strong>
                <p>Yes! Visit our "Rentals" page to browse available classic cars for your special occasion.</p>
              </div>
              <div className="faq-item">
                <strong>How accurate is the price predictor?</strong>
                <p>Our AI model provides estimates based on market data. Actual prices may vary based on specific conditions.</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="contact-form-section"
          >
            <div className="form-card">
              <h2>Send us a Message</h2>
              {submitted ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="submission-success"
                >
                  <div className="success-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="white"/>
                    </svg>
                  </div>
                  <h3>Message Sent!</h3>
                  <p>We'll get back to you as soon as possible.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="contact-form">
                  <div className="form-group">
                    <label>Your Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="john@example.com"
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div className="form-group">
                    <label>Subject *</label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="listing">Listing Question</option>
                      <option value="rental">Rental Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Message *</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="6"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>

                  <button type="submit" className="btn btn-primary">
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Contact

