import { useState, useMemo, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
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
  const { currentUser: authUser, updateUser } = useAuth()
  const currentUser = authUser || {}
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
  const [fieldErrors, setFieldErrors] = useState({})
  const [useSavedLicense, setUseSavedLicense] = useState(!!currentUser.licenseNumber)
  const [licenseInput, setLicenseInput] = useState('')
  const [saveLicenseForFuture, setSaveLicenseForFuture] = useState(true)

  // Keep useSavedLicense in sync when context user updates (e.g. after auto-save)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (currentUser.licenseNumber) {
      setUseSavedLicense(true)
    }
  }, [currentUser.licenseNumber])
  const [showMockPayment, setShowMockPayment] = useState(false)
  const [isPaid, setIsPaid] = useState(false)
  const [paymentResponse, setPaymentResponse] = useState(null)
  const [pendingBookingData, setPendingBookingData] = useState(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [specialRequests, setSpecialRequests] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponError, setCouponError] = useState('')
  const [showCouponsList, setShowCouponsList] = useState(false)

  // Valid coupon codes
  const couponsData = [
    { code: 'SAVE10', discount: 10, desc: '10% off on all vintage rides' },
    { code: 'VINTAGE20', discount: 20, desc: '20% off for the classic lovers' },
    { code: 'WELCOME25', discount: 25, desc: '25% off on your first booking' },
    { code: 'FIRST15', discount: 15, desc: '15% off for first-time explorers' },
    { code: 'RIDE5', discount: 5, desc: '5% extra discount' }
  ]

  const validCoupons = couponsData.reduce((acc, curr) => ({ ...acc, [curr.code]: curr.discount }), {})

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase()
    if (!code) {
      setCouponError('Please enter a coupon code')
      return
    }
    if (validCoupons[code]) {
      setCouponDiscount(validCoupons[code])
      setCouponApplied(true)
      setCouponError('')
    } else {
      setCouponError('Invalid coupon code. Try SAVE10 or VINTAGE20!')
      setCouponDiscount(0)
      setCouponApplied(false)
    }
  }

  const handleRemoveCoupon = () => {
    setCouponCode('')
    setCouponDiscount(0)
    setCouponApplied(false)
    setCouponError('')
  }

  const paymentOptions = [
    { id: 'cod', label: 'Cash on Delivery', icon: <HiCash /> },
    { id: 'upi', label: 'UPI Payment', icon: <HiDeviceMobile /> },
    { id: 'card', label: 'Card Payment', icon: <HiCreditCard /> }
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    setFieldErrors(prev => ({ ...prev, [name]: '', dates: '', general: '' }))
    if (name === 'endDate' && value) setCurrentStep(2)
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
    const afterDuration = subtotal - discountAmount
    const couponAmount = (afterDuration * couponDiscount) / 100
    const finalPrice = afterDuration - couponAmount

    return {
      subtotal, discountPercent, discountAmount,
      couponAmount, couponDiscount,
      finalPrice, chauffeurFee
    }
  }, [duration, rental.pricePerDay, formData.driveType, couponDiscount])

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
      specialRequests: specialRequests || 'None',
      couponCode: couponApplied ? couponCode : null,
      couponDiscount: couponDiscount,
      status: 'Active',
      ...(payDetails ? {
        paymentId: payDetails.razorpay_payment_id,
        orderId: payDetails.razorpay_order_id,
        paymentStatus: 'Paid'
      } : { paymentStatus: 'Pending (COD)' })
    }

    try {
      const { error } = await addBooking(finalBookingData)
      if (error) {
        console.error("Supabase Database Error:", error)
        setFieldErrors({ general: `Booking failed: ${error.message}.` })
        return
      }

      // Auto-save the license to profile if user typed a new one and opted in
      if (!useSavedLicense && licenseInput.trim() && saveLicenseForFuture) {
        const newLicense = licenseInput.trim()
        try {
          const { supabase } = await import('../supabase/supabaseClient')
          // Try preferred key
          const { error: err1 } = await supabase
            .from('users')
            .update({ licenseNumber: newLicense })
            .eq('id', currentUser.id)
            
          // Try fallback key if first fails
          if (err1) {
            await supabase
              .from('users')
              .update({ license_number: newLicense })
              .eq('id', currentUser.id)
          }
          updateUser({ licenseNumber: newLicense })
        } catch (licErr) {
          console.warn('License auto-save failed:', licErr)
        }
      }

      playSuccessSound()
      setSubmitted(true)
    } catch (e) {
      console.error("Booking error:", e)
      setFieldErrors({ general: "Failed to create booking. Please try again." })
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

    // Auto-confirm booking directly after payment
    finalizeBooking(response)
  }

  const handleMockPaymentFailure = () => {
    setShowMockPayment(false)
  }

  const handleMockPaymentClose = () => {
    setShowMockPayment(false)
    setFieldErrors(prev => ({ ...prev, payment: 'Payment was cancelled. Please try again to secure your booking.' }))
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (duration <= 0) {
      newErrors.dates = 'End date must be after or same as start date'
    }

    const licenseToUse = useSavedLicense ? currentUser.licenseNumber : licenseInput.trim()
    const licenseRegex = /^GJ-[0-9]{2}-[0-9]{4}-[0-9]{7}$/

    if (!licenseToUse) {
      newErrors.license = 'Please provide a valid driving licence to continue.'
    } else if (!licenseRegex.test(licenseToUse)) {
      newErrors.license = 'Invalid licence format. Use GJ-05-2023-1234567.'
    }

    if (rental.status === 'maintenance') {
      newErrors.general = 'This car is currently under maintenance.'
    } else if (rental.status === 'booked') {
      newErrors.general = 'This car is currently marked as booked.'
    }

    const isAvailable = checkAvailability(rental.id, formData.startDate, formData.endDate)
    if (formData.startDate && formData.endDate && !isAvailable) {
      newErrors.dates = 'This car is already booked for these dates.'
    }

    setFieldErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePaymentMethodSelect = (methodLabel) => {
    if (isPaid) return
    setCurrentStep(3)
    setFormData({ ...formData, paymentMethod: methodLabel })
    setIsPaid(false)
    setPaymentResponse(null)
    setFieldErrors(prev => ({ ...prev, payment: '', general: '' }))

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
        setFormData({ ...formData, paymentMethod: '' })
      }
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validateForm()) return

    if (!formData.paymentMethod) {
      setFieldErrors(prev => ({ ...prev, payment: 'Please select a payment method.' }))
      return
    }

    if (formData.paymentMethod !== 'Cash on Delivery' && !isPaid) {
      setFieldErrors(prev => ({ ...prev, payment: 'Please complete the payment before confirming.' }))
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
              {/* Progress Bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '20px',
                padding: '0 10px'
              }}>
                {[
                  { num: 1, label: 'Dates' },
                  { num: 2, label: 'Extras' },
                  { num: 3, label: 'Payment' }
                ].map((s, i) => (
                  <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        width: '32px', height: '32px',
                        borderRadius: '50%',
                        background: currentStep >= s.num
                          ? 'var(--primary-color, #5c3d1e)'
                          : '#e5e7eb',
                        color: currentStep >= s.num ? '#fff' : '#999',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '800', fontSize: '13px',
                        margin: '0 auto'
                      }}>
                        {currentStep > s.num ? '✓' : s.num}
                      </div>
                      <p style={{
                        fontSize: '11px', margin: '4px 0 0',
                        color: currentStep >= s.num
                          ? 'var(--primary-color, #5c3d1e)'
                          : '#999',
                        fontWeight: currentStep >= s.num ? '700' : '400'
                      }}>{s.label}</p>
                    </div>
                    {i < 2 && (
                      <div style={{
                        width: '50px', height: '2px',
                        background: currentStep > s.num
                          ? 'var(--primary-color, #5c3d1e)'
                          : '#e5e7eb',
                        marginBottom: '16px'
                      }} />
                    )}
                  </div>
                ))}
              </div>
              <div className="modal-header">

                  <div className="header-title">
                    <h2>Book {rental.name}</h2>
                    <span className="city-badge">{rental.city}</span>
                  </div>
                  <button onClick={onClose} className="close-button">×</button>
                </div>

                <form onSubmit={handleSubmit} className="booking-form">
                  {fieldErrors.general && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="error-message-box">{fieldErrors.general}</motion.div>}

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
                  {fieldErrors.dates && <p className="field-error-text" style={{ color: '#dc2626', fontSize: '13px', marginTop: '-12px', marginBottom: '20px', fontWeight: '700', textAlign: 'center' }}>{fieldErrors.dates}</p>}

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
                          className={`license-input ${fieldErrors.license ? 'error' : ''}`}
                        />
                        <p className="input-hint">Format: GJ-XX-YYYY-ZZZZZZZ</p>
                        {/* Save for future checkbox — only if user has no saved license */}
                        {!currentUser.licenseNumber && licenseInput.trim().length > 5 && (
                          <label style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            marginTop: '10px', fontSize: '13px', fontWeight: '600',
                            color: 'var(--primary-color)', cursor: 'pointer'
                          }}>
                            <input
                              type="checkbox"
                              checked={saveLicenseForFuture}
                              onChange={e => setSaveLicenseForFuture(e.target.checked)}
                              style={{ width: '15px', height: '15px', accentColor: 'var(--primary-color)', cursor: 'pointer' }}
                            />
                            Save this licence to my profile (won't ask again)
                          </label>
                        )}
                      </div>
                    )}
                    {fieldErrors.license && <p className="field-error-text" style={{ color: '#dc2626', fontSize: '12px', marginTop: '-8px', marginBottom: '16px', fontWeight: '600' }}>{fieldErrors.license}</p>}
                  </div>

                  {/* Coupon Code - Moved before Payment */}
                  <div style={{ marginBottom: '24px', background: '#f9fafb', padding: '16px', borderRadius: '12px', border: '1.5px solid #f3f4f6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <label style={{ fontSize: '13px', fontWeight: '700', color: '#374151' }}>
                        🎟️ Have a Coupon?
                      </label>
                      <button 
                        type="button" 
                        onClick={() => setShowCouponsList(!showCouponsList)}
                        style={{ background: 'none', border: 'none', color: 'var(--primary-color, #5c3d1e)', fontSize: '12px', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        {showCouponsList ? 'Hide Coupons' : 'View Available'}
                      </button>
                    </div>

                    <AnimatePresence>
                      {showCouponsList && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          style={{ overflow: 'hidden', marginBottom: '14px' }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px 0' }}>
                            {couponsData.map(c => (
                              <div 
                                key={c.code} 
                                onClick={() => { setCouponCode(c.code); setShowCouponsList(false); setCouponError('') }}
                                style={{ 
                                  padding: '10px', borderRadius: '8px', background: '#fff', 
                                  border: '1px dashed #d1d5db', cursor: 'pointer',
                                  transition: '0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                }}
                              >
                                <div>
                                  <span style={{ fontWeight: '800', color: 'var(--primary-color, #5c3d1e)', fontSize: '13px' }}>{c.code}</span>
                                  <p style={{ margin: 0, fontSize: '11px', color: '#666' }}>{c.desc}</p>
                                </div>
                                <span style={{ fontSize: '12px', fontWeight: '700', color: '#059669' }}>{c.discount}% OFF</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {!couponApplied ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          placeholder="Try SAVE10"
                          value={couponCode}
                          onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError('') }}
                          style={{
                            flex: 1, padding: '10px 14px',
                            borderRadius: '8px',
                            border: '1.5px solid #e5e7eb',
                            fontSize: '13px', outline: 'none'
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          style={{
                            padding: '10px 16px',
                            background: 'var(--primary-color, #5c3d1e)',
                            color: '#fff', border: 'none',
                            borderRadius: '8px', fontWeight: '700',
                            fontSize: '13px', cursor: 'pointer'
                          }}
                        >Apply</button>
                      </div>
                    ) : (
                      <div style={{
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between',
                        background: '#f0fdf4',
                        border: '1.5px solid #bbf7d0',
                        borderRadius: '8px', padding: '10px 14px'
                      }}>
                        <span style={{ color: '#059669', fontWeight: '700', fontSize: '13px' }}>
                          ✅ {couponCode} Applied!
                        </span>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '13px' }}
                        >Remove</button>
                      </div>
                    )}
                    {couponError && (
                      <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{couponError}</p>
                    )}
                  </div>

                  {/* Special Requests - Moved before Payment */}
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '8px' }}>
                      📝 Special Requests (optional)
                    </label>
                    <textarea
                      placeholder="e.g. need child seat, early pickup, specific colour..."
                      value={specialRequests}
                      onChange={e => setSpecialRequests(e.target.value)}
                      rows={2}
                      style={{
                        width: '100%', padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1.5px solid #e5e7eb',
                        fontSize: '13px', outline: 'none',
                        resize: 'none', boxSizing: 'border-box',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>

                  <div className="payment-selection">
                    <label>Select Payment Method *</label>
                    <div className="payment-options">
                      {paymentOptions.map(option => (
                        <div
                          key={option.id}
                          className={`payment-option ${formData.paymentMethod === option.label ? 'active' : ''} ${isPaid && formData.paymentMethod === option.label ? 'paid-success' : ''} ${isPaid ? 'paid-lock' : ''} ${fieldErrors.payment ? 'error-ring' : ''}`}
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
                    {fieldErrors.payment && <p className="field-error-text" style={{ color: '#dc2626', fontSize: '12px', marginTop: '8px', fontWeight: '600', textAlign: 'center' }}>{fieldErrors.payment}</p>}
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



                  {/* Coupon discount in summary */}
                  {couponApplied && pricing.couponAmount > 0 && (
                    <div className="summary-item" style={{ color: '#059669', fontWeight: '700' }}>
                      <span>Coupon ({couponCode}):</span>
                      <span>-₹{pricing.couponAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}



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