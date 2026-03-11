import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCarContext } from '../context/CarContext'
import './BookingModal.css' // Reuse modal styles

const ExtendBookingModal = ({ booking, onClose }) => {
    const { extendBooking, rentals } = useCarContext()
    const [newEndDate, setNewEndDate] = useState('')
    const [error, setError] = useState('')

    const car = rentals.find(r => r.id === booking.carId)
    const pricePerDay = car ? car.pricePerDay : 0

    const extraDays = useMemo(() => {
        if (!newEndDate) return 0
        const currentEnd = new Date(booking.endDate)
        const extendedEnd = new Date(newEndDate)
        const diffTime = extendedEnd - currentEnd
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays > 0 ? diffDays : 0
    }, [newEndDate, booking.endDate])

    const extraPayment = extraDays * pricePerDay

    const handleSubmit = (e) => {
        e.preventDefault()
        if (extraDays <= 0) {
            setError('New end date must be after the current end date.')
            return
        }

        extendBooking(booking.id, newEndDate, extraDays, extraPayment)
        onClose()
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
                    style={{ maxWidth: '500px' }}
                >
                    <div className="modal-header">
                        <h2>Extend Booking</h2>
                        <button onClick={onClose} className="close-button">×</button>
                    </div>

                    <form onSubmit={handleSubmit} className="booking-form">
                        {error && <div className="error-message-box">{error}</div>}

                        <div className="form-info-summary">
                            <p>Car: <strong>{booking.carName}</strong></p>
                            <p>Current End Date: <strong>{booking.endDate}</strong></p>
                        </div>

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
                                min={booking.endDate}
                            />
                        </div>

                        {extraDays > 0 && (
                            <div className="booking-summary" style={{ background: '#f8f8f8', padding: '20px', borderRadius: '12px' }}>
                                <div className="summary-item">
                                    <span>Extra Days:</span>
                                    <span>{extraDays} day(s)</span>
                                </div>
                                <div className="summary-item">
                                    <span>Price per Day:</span>
                                    <span>₹{pricePerDay.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="summary-total" style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #ddd' }}>
                                    <span>Amount Due:</span>
                                    <span>₹{extraPayment.toLocaleString('en-IN')}</span>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '15px', fontStyle: 'italic' }}>
                                    "Remaining amount to be paid at vehicle return."
                                </p>
                            </div>
                        )}

                        <div className="form-actions" style={{ marginTop: '30px' }}>
                            <button type="submit" className="btn btn-primary" disabled={extraDays <= 0}>
                                Confirm Extension
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
