import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCarContext } from '../context/CarContext'
import { HiCalendar, HiX } from 'react-icons/hi'
import './BookingModal.css'

const ExtendBookingModal = ({ booking, onClose }) => {
    const { extendBooking, rentals } = useCarContext()
    const [newEndDate, setNewEndDate] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const car = (rentals || []).find(r => r.id === booking.carId)
    const pricePerDay = car ? (Number(car.pricePerDay) || 0) : 0

    // Always extend from the CURRENT endDate (already updated on each extend)
    const currentEndDate = booking.endDate

    const extraDays = useMemo(() => {
        if (!newEndDate || !currentEndDate) return 0
        try {
            const currentEnd = new Date(currentEndDate)
            const extendedEnd = new Date(newEndDate)
            const diffTime = extendedEnd - currentEnd
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            return diffDays > 0 ? diffDays : 0
        } catch (e) {
            return 0
        }
    }, [newEndDate, currentEndDate])

    const extraPayment = extraDays * pricePerDay

    // Previous extensions summary
    const previousExtensions = Array.isArray(booking.extensions) ? booking.extensions : []
    const totalPreviousExtraDays = previousExtensions.reduce((sum, e) => sum + (Number(e.extraDays) || 0), 0)
    const totalPreviousBalance = previousExtensions.reduce((sum, e) => sum + (Number(e.remainingPayment) || 0), 0)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (extraDays <= 0) {
            setError('New end date must be after the current end date.')
            return
        }

        setLoading(true)
        try {
            // Build new extension entry
            const newExtension = {
                extensionNumber: previousExtensions.length + 1,
                fromDate: currentEndDate,
                toDate: newEndDate,
                extraDays,
                remainingPayment: extraPayment,
                extendedAt: new Date().toISOString()
            }

            await extendBooking(booking.id, newEndDate, newExtension)
            onClose()
        } catch (err) {
            setError('Failed to extend booking. Please try again.')
        } finally {
            setLoading(false)
        }
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
                    style={{ maxWidth: '520px' }}
                >
                    <div className="modal-header">
                        <h2>Extend Booking {previousExtensions.length > 0 && `(Extension #${previousExtensions.length + 1})`}</h2>
                        <button onClick={onClose} className="close-button">×</button>
                    </div>

                    <form onSubmit={handleSubmit} className="booking-form">
                        {error && <div className="error-message-box">{error}</div>}

                        {/* Car Info */}
                        <div className="form-info-summary">
                            <p>Car: <strong>{booking.carName}</strong></p>
                            <p>Original Booking: <strong>{booking.startDate}</strong> → <strong>{booking.originalEndDate || booking.startDate}</strong></p>
                            <p>Current End Date: <strong>{currentEndDate}</strong></p>
                        </div>

                        {/* Previous Extensions Summary */}
                        {previousExtensions.length > 0 && (
                            <div style={{
                                background: '#fef3c7',
                                border: '1px solid #f59e0b',
                                borderRadius: '12px',
                                padding: '16px',
                                marginBottom: '20px'
                            }}>
                                <p style={{ fontWeight: '700', color: '#92400e', marginBottom: '10px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    📋 Previous Extensions
                                </p>
                                {previousExtensions.map((ext, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: '0.9rem',
                                        color: '#78350f',
                                        padding: '4px 0',
                                        borderBottom: '1px dashed #fcd34d'
                                    }}>
                                        <span>Extension #{ext.extensionNumber || idx + 1}: +{ext.extraDays || 0} day(s)</span>
                                        <span style={{ fontWeight: '700' }}>₹{(ext.remainingPayment || 0).toLocaleString('en-IN')}</span>
                                    </div>
                                ))}
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontWeight: '800', color: '#92400e', fontSize: '0.9rem' }}>
                                    <span>Total Previous: +{totalPreviousExtraDays} day(s)</span>
                                    <span>₹{totalPreviousBalance.toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        )}

                        {/* New End Date Input */}
                        <div className="form-group" style={{ marginBottom: '25px' }}>
                            <label>New End Date *</label>
                            <input
                                type="date"
                                value={newEndDate}
                                onChange={(e) => {
                                    setNewEndDate(e.target.value)
                                    setError('')
                                }}
                                required
                                min={currentEndDate}
                            />
                        </div>

                        {/* New Extension Preview */}
                        {extraDays > 0 && (
                            <div className="booking-summary" style={{ background: '#f0fdf4', padding: '20px', borderRadius: '12px', border: '1px solid #86efac' }}>
                                <p style={{ fontWeight: '700', color: '#166534', marginBottom: '12px', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                                    ✅ This Extension (#{previousExtensions.length + 1})
                                </p>
                                <div className="summary-item">
                                    <span>Extra Days:</span>
                                    <span style={{ fontWeight: '700' }}>+{extraDays} day(s)</span>
                                </div>
                                <div className="summary-item">
                                    <span>Price per Day:</span>
                                    <span>₹{pricePerDay.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="summary-total" style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #86efac' }}>
                                    <span>Amount Due (This Extension):</span>
                                    <span style={{ color: '#15803d', fontWeight: '800' }}>₹{extraPayment.toLocaleString('en-IN')}</span>
                                </div>

                                {/* Grand Total if multiple extensions */}
                                {previousExtensions.length > 0 && (
                                    <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #86efac', display: 'flex', justifyContent: 'space-between', fontWeight: '800', color: '#b45309', fontSize: '0.95rem' }}>
                                        <span>Grand Total Balance Due:</span>
                                        <span>₹{(totalPreviousBalance + extraPayment).toLocaleString('en-IN')}</span>
                                    </div>
                                )}

                                <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '15px', fontStyle: 'italic' }}>
                                    💵 Remaining amount to be paid at vehicle return.
                                </p>
                            </div>
                        )}

                        <div className="form-actions" style={{ marginTop: '30px' }}>
                            <button type="submit" className="btn btn-primary" disabled={extraDays <= 0 || loading}>
                                {loading ? 'Extending...' : 'Confirm Extension'}
                            </button>
                            <button type="button" onClick={onClose} className="btn btn-outline">
                                Cancel
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}

export default ExtendBookingModal