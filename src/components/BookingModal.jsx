import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './BookingModal.css'

const BookingModal = ({ rental, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventType: '',
    eventDate: '',
    duration: '1',
    location: '',
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
      onClose()
    }, 2000)
  }

  const calculateTotal = () => {
    const days = parseInt(formData.duration)
    if (days >= 7) {
      const weeks = Math.floor(days / 7)
      const remainingDays = days % 7
      return (weeks * rental.weeklyRate) + (remainingDays * rental.dailyRate)
    }
    return days * rental.dailyRate
  }

  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
          className="modal-content"
        >
          {submitted ? (
            <div className="submission-success">
              <div className="success-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="white"/>
                </svg>
              </div>
              <h3>Booking Request Submitted!</h3>
              <p>We'll contact you shortly to confirm your booking.</p>
            </div>
          ) : (
            <>
              <div className="modal-header">
                <h2>Book {rental.name}</h2>
                <button onClick={onClose} className="close-button">×</button>
              </div>
              <form onSubmit={handleSubmit} className="booking-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Event Type *</label>
                    <select
                      name="eventType"
                      value={formData.eventType}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Event Type</option>
                      <option value="wedding">Wedding</option>
                      <option value="photo-shoot">Photo Shoot</option>
                      <option value="special-event">Special Event</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Event Date *</label>
                    <input
                      type="date"
                      name="eventDate"
                      value={formData.eventDate}
                      onChange={handleChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="form-group">
                    <label>Duration (Days) *</label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      required
                      min="1"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Event Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    placeholder="Enter event location"
                  />
                </div>
                <div className="form-group">
                  <label>Additional Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Any special requirements or notes..."
                  />
                </div>
                <div className="booking-summary">
                  <div className="summary-item">
                    <span>Daily Rate:</span>
                    <span>${rental.dailyRate}/day</span>
                  </div>
                  <div className="summary-item">
                    <span>Duration:</span>
                    <span>{formData.duration} day(s)</span>
                  </div>
                  <div className="summary-total">
                    <span>Estimated Total:</span>
                    <span>${calculateTotal().toLocaleString()}</span>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    Submit Booking Request
                  </button>
                  <button type="button" onClick={onClose} className="btn btn-outline">
                    Cancel
                  </button>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default BookingModal

