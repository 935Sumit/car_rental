import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useCarContext } from '../context/CarContext'
import { HiCheckCircle, HiCash, HiDeviceMobile, HiCreditCard, HiTicket, HiCalendar, HiLocationMarker, HiCurrencyRupee, HiDownload } from 'react-icons/hi'
import MockPaymentModal from './MockPaymentModal'
import { downloadInvoice } from '../utils/invoiceGenerator'
import './BookingModal.css'

const BookingModal = ({ rental, onClose }) => {
  const { checkAvailability, addBooking, bookings } = useCarContext()
  const navigate = useNavigate()
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {}
  const [bookingId, setBookingId] = useState('')
  const receiptRef = useRef(null)
  const redirectTimerRef = useRef(null)

  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    paymentMethod: 'Cash on Delivery',
    driveType: 'self'
  })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [useSavedLicense, setUseSavedLicense] = useState(!!currentUser.licenseNumber)
  const [licenseInput, setLicenseInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showMockPayment, setShowMockPayment] = useState(false)
  const [isPaid, setIsPaid] = useState(false)
  const [paymentResponse, setPaymentResponse] = useState(null)
  const [pendingBookingData, setPendingBookingData] = useState(null)

  const paymentOptions = [
    { id: 'cod', label: 'Cash on Delivery', icon: <HiCash /> },
    { id: 'upi', label: 'UPI Payment', icon: <HiDeviceMobile /> },
    { id: 'card', label: 'Card Payment', icon: <HiCreditCard /> }
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    setError('') // Clear error on change
  }

  const duration = useMemo(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      const diffTime = end - start
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
      return diffDays > 0 ? diffDays : 0
    }
    return 0
  }, [formData.startDate, formData.endDate])

  const pricing = useMemo(() => {
    const chauffeurFee = formData.driveType === 'chauffeur' ? 500 * duration : 0
    const subtotal = (duration * rental.pricePerDay) + chauffeurFee
    let discountPercent = 0

    if (duration >= 30) discountPercent = 40
    else if (duration >= 26) discountPercent = 35
    else if (duration >= 21) discountPercent = 30
    else if (duration >= 16) discountPercent = 25
    else if (duration >= 11) discountPercent = 20
    else if (duration >= 7) discountPercent = 15
    else if (duration >= 4) discountPercent = 10
    else if (duration >= 2) discountPercent = 5

    const discountAmount = (subtotal * discountPercent) / 100
    const finalPrice = subtotal - discountAmount

    return { subtotal, discountPercent, discountAmount, finalPrice, chauffeurFee }
  }, [duration, rental.pricePerDay, formData.driveType])

  const playSuccessSound = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3')
    audio.volume = 0.5
    audio.play().catch(e => console.log('Audio play blocked'))
  }

  const finalizeBooking = async (payDetails = null) => {
    const generatedId = 'BR' + Math.random().toString(36).substring(2, 9).toUpperCase()
    setBookingId(generatedId)

    // Prepare final booking data
    const finalBookingData = {
      id: generatedId,
      carId: rental.id,
      carName: rental.name,
      carImage: rental.image,
      fuel: rental.fuel,
      transmission: rental.transmission,
      seats: rental.seats,
      userName: currentUser.fullName || 'Guest',
      userEmail: currentUser.email || '',
      city: rental.city,
      startDate: formData.startDate,
      endDate: formData.endDate,
      totalDays: duration,
      subtotal: pricing.subtotal,
      chauffeurFee: pricing.chauffeurFee,
      driveType: formData.driveType === 'chauffeur' ? 'With Driver' : 'Self Drive',
      discountPercent: pricing.discountPercent,
      discountAmount: pricing.discountAmount,
      totalPrice: pricing.finalPrice,
      paymentMethod: formData.paymentMethod,
      pickupAddress: '100 ft Road, Anand, 388001',
      status: 'Active',
      ...(payDetails ? {
        paymentId: payDetails.razorpay_payment_id,
        orderId: payDetails.razorpay_order_id,
        paymentStatus: 'Paid'
      } : { paymentStatus: 'Pending (COD)' })
    }

    try {
      await addBooking(finalBookingData)
      playSuccessSound()
      setSubmitted(true)
    } catch (e) {
      console.error("Booking error:", e)
      setError("Failed to create booking. Please try again.")
    }

    // Auto-close and redirect after 10 seconds (giving more time for download)
    redirectTimerRef.current = setTimeout(() => {
      onClose()
      navigate('/my-bookings')
    }, 10000)
  }

  const handleDownloadInvoice = () => {
    // Clear auto-redirect if user starts downloading
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current)
    }

    const bookingForInvoice = {
      id: bookingId,
      carName: rental.name,
      startDate: formData.startDate,
      endDate: formData.endDate,
      totalDays: duration,
      subtotal: pricing.subtotal,
      chauffeurFee: pricing.chauffeurFee,
      discountPercent: pricing.discountPercent,
      discountAmount: pricing.discountAmount,
      totalPrice: pricing.finalPrice,
      paymentMethod: formData.paymentMethod,
      driveType: formData.driveType === 'chauffeur' ? 'With Driver' : 'Self Drive'
    }

    downloadInvoice(bookingForInvoice, currentUser)
  }

  const handleMockPaymentSuccess = (response) => {
    setPaymentResponse(response)
    setIsPaid(true)
    setShowMockPayment(false)
    setIsProcessing(false)

    // Auto-confirm booking directly after payment
    finalizeBooking(response)
  }

  const handleMockPaymentFailure = () => {
    setShowMockPayment(false)
    setIsProcessing(false)
    setError('Payment failed. Please try again.')
  }

  const handleMockPaymentClose = () => {
    setShowMockPayment(false)
    setIsProcessing(false)
    setError('Payment was cancelled. Please try again to secure your booking.')
  }

  const validateForm = () => {
    if (duration <= 0) {
      setError('End date must be after or same as start date')
      return false
    }

    const licenseToUse = useSavedLicense ? currentUser.licenseNumber : licenseInput.trim()
    const licenseRegex = /^GJ-[0-9]{2}-[0-9]{4}-[0-9]{7}$/

    if (!licenseToUse) {
      setError('Please provide a valid driving licence to continue.')
      return false
    }

    if (!licenseRegex.test(licenseToUse)) {
      setError('Invalid licence format. Use GJ-05-2023-1234567 format.')
      return false
    }

    if (rental.status === 'maintenance') {
      setError('This car is currently under maintenance and cannot be booked.')
      return false
    }

    if (rental.status === 'booked') {
      setError('This car is currently marked as booked and is not available for new reservations.')
      return false
    }

    const isAvailable = checkAvailability(rental.id, formData.startDate, formData.endDate)
    if (!isAvailable) {
      setError('This car is already booked for the selected dates.')
      return false
    }

    return true
  }

  const handlePaymentMethodSelect = (methodLabel) => {
    // If already paid, don't allow changing method or triggering portal again
    if (isPaid) return

    setFormData({ ...formData, paymentMethod: methodLabel })
    setIsPaid(false)
    setPaymentResponse(null)
    setError('')

    if (methodLabel === 'UPI Payment' || methodLabel === 'Card Payment') {
      if (validateForm()) {
        const tempBookingData = {
          carId: rental.id,
          carName: rental.name,
          totalPrice: pricing.finalPrice
        }
        setPendingBookingData(tempBookingData)
        setShowMockPayment(true)
      } else {
        // Reset choice if invalid
        setFormData({ ...formData, paymentMethod: '' })
      }
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validateForm()) return

    if (!formData.paymentMethod) {
      setError('Please select a payment method.')
      return
    }

    if (formData.paymentMethod !== 'Cash on Delivery' && !isPaid) {
      setError('Please complete the payment before confirming.')
      return
    }

    finalizeBooking(isPaid ? paymentResponse : null)
  }

  return (
    <>
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
              <div className="submission-success premium-receipt">
                <div className="receipt-status-section">
                  <div className="gpay-success-wrapper">
                    <motion.div
                      className="gpay-circle"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 12, stiffness: 100 }}
                    />
                    <svg className="gpay-checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                      <motion.path
                        fill="none"
                        stroke="#fff"
                        strokeWidth="5"
                        strokeLinecap="round"
                        d="M14.1 27.2l7.1 7.2 16.7-16.8"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                      />
                    </svg>
                  </div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="confirmation-text"
                  >
                    <h3>Ride Secured Successfully!</h3>
                    <p>Your booking is confirmed. Get ready for the open road.</p>
                  </motion.div>
                </div>

                <div className="receipt-card" ref={receiptRef}>
                  <div className="receipt-ticket-header">
                    <span className="ticket-label"><HiTicket /> Booking Reference</span>
                    <span className="ticket-id">{bookingId}</span>
                  </div>

                  <div className="receipt-grid">
                    <div className="receipt-item">
                      <div className="item-icon"><HiCalendar /></div>
                      <div className="item-content">
                        <label>Rental Period</label>
                        <span>{formData.startDate} – {formData.endDate}</span>
                      </div>
                    </div>
                    <div className="receipt-item">
                      <div className="item-icon"><HiLocationMarker /></div>
                      <div className="item-content">
                        <label>Pickup Location</label>
                        <span>100 ft Road, Anand, 388001</span>
                      </div>
                    </div>
                    <div className="receipt-item">
                      <div className="item-icon"><HiCurrencyRupee /></div>
                      <div className="item-content">
                        <label>Total Investment</label>
                        <span className="price-text">₹{pricing.finalPrice.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    <div className="receipt-item">
                      <div className="item-icon">{formData.paymentMethod === 'Card Payment' ? <HiCreditCard /> : formData.paymentMethod === 'UPI Payment' ? <HiDeviceMobile /> : <HiCash />}</div>
                      <div className="item-content">
                        <label>Settlement Method</label>
                        <span>{formData.paymentMethod}</span>
                      </div>
                    </div>
                  </div>

                  <div className="receipt-details-list">
                    <div className="detail-row">
                      <span>Vehicle Selected</span>
                      <strong>{rental.name}</strong>
                    </div>
                    <div className="detail-row">
                      <span>Drive Configuration</span>
                      <strong>{formData.driveType === 'chauffeur' ? 'With Expert Driver' : 'Self Driven Experience'}</strong>
                    </div>
                    {pricing.discountPercent > 0 && (
                      <div className="detail-row savings">
                        <span>Exclusive Savings ({pricing.discountPercent}%)</span>
                        <strong>-₹{pricing.discountAmount.toLocaleString('en-IN')}</strong>
                      </div>
                    )}
                  </div>
                </div>

                <div className="receipt-actions">
                  <button className="btn-download-pdf" onClick={handleDownloadInvoice}>
                    <HiDownload /> Download Official Invoice
                  </button>
                </div>

                <div className="redirect-countdown">
                  <div className="progress-bar-container">
                    <motion.div
                      className="progress-bar-fill"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 5, ease: "linear" }}
                    />
                  </div>
                  <span>Redirecting to your dashboard in a moment...</span>
                </div>
              </div>
            ) : (
              <>
                <div className="modal-header">
                  <div className="header-title">
                    <h2>Book {rental.name}</h2>
                    <span className="city-badge">{rental.city}</span>
                  </div>
                  <button onClick={onClose} className="close-button">×</button>
                </div>

                <form onSubmit={handleSubmit} className="booking-form">
                  {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="error-message-box">{error}</motion.div>}

                  <div className="form-info-summary">
                    <p>Booking for: <strong>{currentUser.fullName}</strong></p>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Start Date *</label>
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        required
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="form-group">
                      <label>End Date *</label>
                      <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        required
                        min={formData.startDate || new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  {rental.chauffeurAvailable && (
                    <div className="drive-type-selection">
                      <label className="section-label">Select Drive Type</label>
                      <div className="drive-type-options">
                        <div
                          className={`drive-option ${formData.driveType === 'self' ? 'active' : ''}`}
                          onClick={() => setFormData({ ...formData, driveType: 'self' })}
                        >
                          <div className="drive-radio">
                            {formData.driveType === 'self' && <div className="radio-inner" />}
                          </div>
                          <div className="drive-info">
                            <span className="title">Self Drive</span>
                            <span className="desc">You drive the car yourself</span>
                          </div>
                        </div>
                        <div
                          className={`drive-option ${formData.driveType === 'chauffeur' ? 'active' : ''}`}
                          onClick={() => setFormData({ ...formData, driveType: 'chauffeur' })}
                        >
                          <div className="drive-radio">
                            {formData.driveType === 'chauffeur' && <div className="radio-inner" />}
                          </div>
                          <div className="drive-info">
                            <span className="title">With Chauffeur</span>
                            <span className="desc">+₹500/day for professional driver</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="license-verification-section">
                    <label className="section-label">Driving Licence Verification *</label>
                    {currentUser.licenseNumber ? (
                      <div className={`saved-license-choice ${useSavedLicense ? 'active' : ''}`} onClick={() => setUseSavedLicense(!useSavedLicense)}>
                        <div className="checkbox-tick">
                          {useSavedLicense && <HiCheckCircle />}
                        </div>
                        <div className="license-info">
                          <span className="label">Use Saved Licence</span>
                          <span className="value">{currentUser.licenseNumber}</span>
                        </div>
                      </div>
                    ) : null}

                    {(!currentUser.licenseNumber || !useSavedLicense) && (
                      <div className="form-group license-input-group">
                        <input
                          type="text"
                          placeholder="Enter Licence (e.g. GJ-05-2023-1234567)"
                          value={licenseInput}
                          onChange={(e) => setLicenseInput(e.target.value.toUpperCase())}
                          className="license-input"
                        />
                        <p className="input-hint">Format: GJ-XX-YYYY-ZZZZZZZ</p>
                      </div>
                    )}
                  </div>

                  <div className="payment-selection">
                    <label>Select Payment Method *</label>
                    <div className="payment-options">
                      {paymentOptions.map(option => (
                        <div
                          key={option.id}
                          className={`payment-option ${formData.paymentMethod === option.label ? 'active' : ''} ${isPaid && formData.paymentMethod === option.label ? 'paid-success' : ''} ${isPaid ? 'paid-lock' : ''}`}
                          onClick={() => handlePaymentMethodSelect(option.label)}
                        >
                          <span className="pay-icon">
                            {isPaid && formData.paymentMethod === option.label ? <HiCheckCircle style={{ color: '#10b981' }} /> : option.icon}
                          </span>
                          <span className="pay-label">
                            {option.label}
                            {isPaid && formData.paymentMethod === option.label && <span className="paid-badge">Paid</span>}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="booking-summary">
                    <div className="summary-item">
                      <span>Rate:</span>
                      <span>₹{rental.pricePerDay.toLocaleString('en-IN')}/day</span>
                    </div>
                    <div className="summary-item">
                      <span>Duration:</span>
                      <span>{duration > 0 ? `${duration} day(s)` : 'Select dates'}</span>
                    </div>
                    {duration > 0 && (
                      <>
                        <div className="summary-item">
                          <span>Subtotal:</span>
                          <span>₹{pricing.subtotal.toLocaleString('en-IN')}</span>
                        </div>
                        {pricing.chauffeurFee > 0 && (
                          <div className="summary-item">
                            <span>Chauffeur Fee:</span>
                            <span>+₹{pricing.chauffeurFee.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        {pricing.discountPercent > 0 && (
                          <div className="summary-item discount" style={{ color: '#059669', fontWeight: '600' }}>
                            <span>Discount ({pricing.discountPercent}%):</span>
                            <span>-₹{pricing.discountAmount.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                      </>
                    )}
                    <div className="summary-total">
                      <span>Final Price:</span>
                      <span>₹{pricing.finalPrice.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      type="submit"
                      className="btn btn-primary"
                    >
                      Confirm and Book
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

      {showMockPayment && (
        <MockPaymentModal
          amount={Math.round(pendingBookingData.totalPrice * 100)}
          currency="INR"
          method={formData.paymentMethod === 'UPI Payment' ? 'upi' : 'card'}
          onSuccess={handleMockPaymentSuccess}
          onFailure={handleMockPaymentFailure}
          onClose={handleMockPaymentClose}
        />
      )}
    </>
  )
}

export default BookingModal