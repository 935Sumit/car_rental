import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useCarContext } from '../context/CarContext'
import ExtendBookingModal from '../components/ExtendBookingModal'
import { HiCheckCircle, HiDownload } from 'react-icons/hi'
import { FaCarSide } from 'react-icons/fa'
import { downloadInvoice } from '../utils/invoiceGenerator'
import './MyBookings.css'

const MyBookings = () => {
    const { bookings, cancelBooking, rentals } = useCarContext()
    const currentUser = JSON.parse(localStorage.getItem('currentUser'))
    const [cancelMessage, setCancelMessage] = useState('')
    const [extendingBooking, setExtendingBooking] = useState(null)

    const userBookings = bookings.filter(b => b.userEmail === currentUser?.email && b.status !== 'Cancelled')

    const handleCancel = (bookingId) => {
        if (window.confirm('Are you sure you want to cancel this booking?')) {
            cancelBooking(bookingId)
            setCancelMessage('Your booking has been cancelled successfully.')
            window.scrollTo({ top: 0, behavior: 'smooth' })
            setTimeout(() => setCancelMessage(''), 4000)
        }
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    }

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    }

    return (
        <div className="my-bookings-page">
            <div className="container">
                <header className="page-header">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        My Bookings
                    </motion.h1>
                    <p>Track and manage your car reservations easily.</p>
                </header>

                <AnimatePresence>
                    {cancelMessage && (
                        <motion.div
                            className="cancel-success-banner"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <HiCheckCircle className="success-check" /> {cancelMessage}
                        </motion.div>
                    )}
                </AnimatePresence>

                {userBookings.length === 0 ? (
                    <motion.div
                        className="empty-state"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <div style={{ fontSize: '5rem', marginBottom: '25px', color: 'var(--primary-color)' }}>
                            <FaCarSide />
                        </div>
                        <h3 style={{ color: 'var(--primary-color)', fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem' }}>No bookings yet!</h3>
                        <p style={{ marginBottom: '40px', color: 'var(--text-secondary)', fontWeight: '500' }}>Browse our collection and book your first ride!</p>
                        <Link to="/" className="btn-book" style={{ display: 'inline-block', width: 'auto', padding: '14px 40px' }}>Browse Cars</Link>
                    </motion.div>
                ) : (
                    <motion.div
                        className="bookings-grid"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {userBookings.map(booking => {
                            const car = rentals.find(r => r.id === booking.carId)
                            const displayImage = car?.image || booking.carImage || 'https://via.placeholder.com/300x200?text=Car'

                            return (
                                <motion.div key={booking.id} variants={cardVariants} className="booking-card-redesign">
                                    <div className="booking-image">
                                        <img
                                            src={displayImage}
                                            alt={booking.carName}
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/300x200?text=Car+Not+Found'
                                                e.target.onerror = null
                                            }}
                                        />
                                        {booking.status === 'Extended' && (
                                            <div className="extended-badge">Extended</div>
                                        )}
                                    </div>
                                    <div className="booking-details">
                                        <h3 className="car-name">{booking.carName}</h3>
                                        <div className="rc-specs" style={{ marginBottom: '15px' }}>
                                            {(car?.fuel || booking.fuel) && <span>{car?.fuel || booking.fuel}</span>}
                                            {(car?.fuel || booking.fuel) && (car?.transmission || booking.transmission || car?.seats || booking.seats) && <span className="separator">•</span>}
                                            {(car?.transmission || booking.transmission) && <span>{car?.transmission || booking.transmission}</span>}
                                            {(car?.transmission || booking.transmission) && (car?.seats || booking.seats) && <span className="separator">•</span>}
                                            {(car?.seats || booking.seats) && <span>{car?.seats || booking.seats} Seater</span>}
                                        </div>
                                        <div className="booking-info-row">
                                            <span className="info-label">Dates:</span>
                                            <span className="info-value">{booking.startDate} to {booking.endDate}</span>
                                        </div>

                                        {booking.driveType && (
                                            <div className="booking-info-row">
                                                <span className="info-label">Drive Type:</span>
                                                <span className="info-value highlight-blue">{booking.driveType}</span>
                                            </div>
                                        )}

                                        {booking.status === 'Extended' && (
                                            <div className="extension-details">
                                                <div className="booking-info-row">
                                                    <span className="info-label">Extension:</span>
                                                    <span className="info-value">+{booking.extraDays} days</span>
                                                </div>
                                                <div className="booking-info-row">
                                                    <span className="info-label">Remaining:</span>
                                                    <span className="info-value highlight">₹{booking.remainingPayment?.toLocaleString('en-IN')} (Pay at return)</span>
                                                </div>
                                            </div>
                                        )}

                                        {booking.discountPercent > 0 && (
                                            <div className="booking-info-row">
                                                <span className="info-label">Discount Applied:</span>
                                                <span className="info-value" style={{ color: '#059669' }}>{booking.discountPercent}%</span>
                                            </div>
                                        )}

                                        <div className="booking-info-row">
                                            <span className="info-label">Total Paid:</span>
                                            <span className="info-value price">₹{booking.totalPrice.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="booking-info-row">
                                            <span className="info-label">Payment:</span>
                                            <span className="info-value">{booking.paymentMethod || 'Cash on Delivery'}</span>
                                        </div>
                                        <div className="booking-info-row pickup-row">
                                            <span className="info-label">Pickup:</span>
                                            <span className="info-value address">{booking.pickupAddress || '100 ft Road, Anand, 388001'}</span>
                                        </div>
                                        <div className="booking-actions">
                                            <button
                                                className="btn-extend"
                                                onClick={() => setExtendingBooking(booking)}
                                            >
                                                Extend Booking
                                            </button>
                                            <button
                                                className="btn-download-invoice"
                                                onClick={() => downloadInvoice(booking, currentUser)}
                                                title="Download Official Invoice"
                                            >
                                                <HiDownload /> Invoice
                                            </button>
                                            <button
                                                className="btn-cancel"
                                                onClick={() => handleCancel(booking.id)}
                                            >
                                                Cancel Booking
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </motion.div>
                )}
            </div>

            {extendingBooking && (
                <ExtendBookingModal
                    booking={extendingBooking}
                    onClose={() => setExtendingBooking(null)}
                />
            )}
        </div>
    )
}

export default MyBookings
