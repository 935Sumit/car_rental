import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiLockClosed, HiCreditCard, HiDeviceMobile, HiCheckCircle } from 'react-icons/hi'
import './MockPaymentModal.css'

const MockPaymentModal = ({ amount, currency, method, onSuccess, onClose }) => {
  const [step, setStep] = useState(method || 'options')
  const [cardData, setCardData] = useState({
    number: '', expiry: '', cvv: '', name: ''
  })
  const [upiId, setUpiId] = useState('')
  const [errors, setErrors] = useState({})
  const [processing, setProcessing] = useState(false)

  const formatAmount = (paise) => {
    return '₹' + (paise / 100).toLocaleString('en-IN')
  }

  const formatCardNumber = (value) => {
    return value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  }

  const formatExpiry = (value) => {
    const clean = value.replace(/\D/g, '').slice(0, 4)
    if (clean.length >= 3) return clean.slice(0, 2) + '/' + clean.slice(2)
    return clean
  }

  const validateCard = () => {
    const newErrors = {}
    if (cardData.name.trim().length < 3) newErrors.name = 'Enter cardholder name'
    if (cardData.number.replace(/\s/g, '').length < 16) newErrors.number = 'Enter valid 16-digit card number'
    if (cardData.expiry.length < 5) newErrors.expiry = 'Enter valid expiry MM/YY'
    if (cardData.cvv.length < 3) newErrors.cvv = 'Enter valid 3-digit CVV'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateUpi = () => {
    const newErrors = {}
    if (!upiId.includes('@') || upiId.length < 5) {
      newErrors.upi = 'Enter valid UPI ID (example: name@upi)'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCardPay = () => {
    if (!validateCard()) return
    setProcessing(true)
    setTimeout(() => {
      setProcessing(false)
      setStep('success')
      setTimeout(() => {
        onSuccess({
          razorpay_payment_id: 'pay_DEMO' + Math.random().toString(36).substring(2, 9).toUpperCase(),
          razorpay_order_id: 'order_DEMO' + Math.random().toString(36).substring(2, 9).toUpperCase(),
          razorpay_signature: 'demo_signature'
        })
      }, 1500)
    }, 2000)
  }

  const handleUpiPay = () => {
    if (!validateUpi()) return
    setProcessing(true)
    setTimeout(() => {
      setProcessing(false)
      setStep('success')
      setTimeout(() => {
        onSuccess({
          razorpay_payment_id: 'pay_DEMO' + Math.random().toString(36).substring(2, 9).toUpperCase(),
          razorpay_order_id: 'order_DEMO' + Math.random().toString(36).substring(2, 9).toUpperCase(),
          razorpay_signature: 'demo_signature'
        })
      }, 1500)
    }, 2000)
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1.5px solid #e5e7eb',
    fontSize: '14px',
    outline: 'none',
    marginBottom: '4px',
    boxSizing: 'border-box'
  }

  const errorStyle = {
    color: '#dc2626',
    fontSize: '12px',
    marginBottom: '10px',
    display: 'block'
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.6)',
      zIndex: 999999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          background: '#fff',
          borderRadius: '20px',
          padding: '32px',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HiLockClosed style={{ color: '#059669', fontSize: '18px' }} />
            <span style={{ fontWeight: '800', fontSize: '16px', color: '#1a1a1a' }}>Secure Payment</span>
          </div>
          <span style={{
            background: '#fef3c7',
            color: '#92400e',
            padding: '3px 10px',
            borderRadius: '50px',
            fontSize: '11px',
            fontWeight: '700'
          }}>DEMO MODE</span>
        </div>

        {/* Amount */}
        <div style={{
          background: '#f0fdf4',
          border: '1.5px solid #bbf7d0',
          borderRadius: '12px',
          padding: '14px 18px',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>Amount to Pay</p>
          <p style={{ margin: '4px 0 0', fontSize: '24px', fontWeight: '900', color: '#059669' }}>
            {formatAmount(amount)}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* Options Step */}
          {step === 'options' && (
            <motion.div key="options" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p style={{ fontSize: '13px', color: '#888', marginBottom: '14px' }}>Choose payment method</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button onClick={() => setStep('card')} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '14px 16px', borderRadius: '10px',
                  border: '1.5px solid #e5e7eb', background: '#fff',
                  cursor: 'pointer', fontSize: '14px', fontWeight: '600'
                }}>
                  <HiCreditCard style={{ fontSize: '20px', color: '#2563eb' }} />
                  Card Payment
                </button>
                <button onClick={() => setStep('upi')} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '14px 16px', borderRadius: '10px',
                  border: '1.5px solid #e5e7eb', background: '#fff',
                  cursor: 'pointer', fontSize: '14px', fontWeight: '600'
                }}>
                  <HiDeviceMobile style={{ fontSize: '20px', color: '#7c3aed' }} />
                  UPI Payment
                </button>
              </div>
            </motion.div>
          )}

          {/* Card Step */}
          {step === 'card' && !processing && (
            <motion.div key="card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <button onClick={() => setStep('options')} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#666', fontSize: '13px', marginBottom: '16px', padding: 0
              }}>← Back</button>
              <p style={{ fontWeight: '700', fontSize: '15px', marginBottom: '16px', color: '#1a1a1a' }}>
                Enter Card Details
              </p>
              <input
                style={inputStyle}
                placeholder="Cardholder Name"
                value={cardData.name}
                onChange={e => setCardData({ ...cardData, name: e.target.value })}
              />
              {errors.name && <span style={errorStyle}>{errors.name}</span>}
              <input
                style={inputStyle}
                placeholder="Card Number (16 digits)"
                value={cardData.number}
                onChange={e => setCardData({ ...cardData, number: formatCardNumber(e.target.value) })}
                maxLength={19}
              />
              {errors.number && <span style={errorStyle}>{errors.number}</span>}
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <input
                    style={inputStyle}
                    placeholder="MM/YY"
                    value={cardData.expiry}
                    onChange={e => setCardData({ ...cardData, expiry: formatExpiry(e.target.value) })}
                    maxLength={5}
                  />
                  {errors.expiry && <span style={errorStyle}>{errors.expiry}</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <input
                    style={inputStyle}
                    placeholder="CVV"
                    type="password"
                    value={cardData.cvv}
                    onChange={e => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                    maxLength={3}
                  />
                  {errors.cvv && <span style={errorStyle}>{errors.cvv}</span>}
                </div>
              </div>
              <button onClick={handleCardPay} style={{
                width: '100%', padding: '14px',
                background: '#2563eb', color: '#fff',
                border: 'none', borderRadius: '10px',
                fontWeight: '800', fontSize: '15px',
                cursor: 'pointer', marginTop: '8px'
              }}>
                Pay {formatAmount(amount)}
              </button>
            </motion.div>
          )}

          {/* UPI Step */}
          {step === 'upi' && !processing && (
            <motion.div key="upi" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <button onClick={() => setStep('options')} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#666', fontSize: '13px', marginBottom: '16px', padding: 0
              }}>← Back</button>
              <p style={{ fontWeight: '700', fontSize: '15px', marginBottom: '16px', color: '#1a1a1a' }}>
                Enter UPI Details
              </p>
              <input
                style={inputStyle}
                placeholder="Enter UPI ID (example: name@upi)"
                value={upiId}
                onChange={e => setUpiId(e.target.value)}
              />
              {errors.upi && <span style={errorStyle}>{errors.upi}</span>}
              <div style={{
                display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap'
              }}>
                {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map(app => (
                  <button key={app} onClick={() => setUpiId('demo@' + app.toLowerCase())} style={{
                    padding: '6px 14px', borderRadius: '50px',
                    border: '1.5px solid #e5e7eb', background: '#f9fafb',
                    fontSize: '12px', fontWeight: '600', cursor: 'pointer'
                  }}>{app}</button>
                ))}
              </div>
              <button onClick={handleUpiPay} style={{
                width: '100%', padding: '14px',
                background: '#7c3aed', color: '#fff',
                border: 'none', borderRadius: '10px',
                fontWeight: '800', fontSize: '15px',
                cursor: 'pointer'
              }}>
                Pay {formatAmount(amount)}
              </button>
            </motion.div>
          )}

          {/* Processing Step */}
          {processing && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{
                width: '48px', height: '48px', border: '4px solid #e5e7eb',
                borderTopColor: '#2563eb', borderRadius: '50%',
                animation: 'spin 0.8s linear infinite', margin: '0 auto 16px'
              }} />
              <p style={{ fontWeight: '700', color: '#1a1a1a' }}>Processing Payment...</p>
              <p style={{ fontSize: '13px', color: '#888' }}>Please wait</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </motion.div>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <motion.div key="success" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              style={{ textAlign: 'center', padding: '20px 0' }}>
              <HiCheckCircle style={{ fontSize: '64px', color: '#059669', marginBottom: '16px' }} />
              <p style={{ fontWeight: '800', fontSize: '18px', color: '#1a1a1a' }}>Payment Successful!</p>
              <p style={{ fontSize: '13px', color: '#888' }}>Confirming your booking...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        {step !== 'success' && !processing && (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button onClick={onClose} style={{
              background: 'none', border: 'none',
              color: '#888', fontSize: '13px', cursor: 'pointer'
            }}>Cancel Payment</button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default MockPaymentModal
