import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useCarContext } from '../context/CarContext'
import { useAuth } from '../context/AuthContext'
import ExtendBookingModal from '../components/ExtendBookingModal'
import { HiDownload, HiSearch, HiCalendar, HiX } from 'react-icons/hi'
import Toast from '../components/Toast'
import ConfirmModal from '../components/ConfirmModal'
import { FaCarSide } from 'react-icons/fa'
import { downloadInvoice } from '../utils/invoiceGenerator'
import './MyBookings.css'

const MyBookings = () => {
    const { bookings, cancelBooking, rentals } = useCarContext()
    const { currentUser } = useAuth()
    const [cancelMessage] = useState('')
    const [extendingBooking, setExtendingBooking] = useState(null)
    const [toast, setToast] = useState(null)
    const [confirmModal, setConfirmModal] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('All')

    const statusTabs = ['All', 'Active', 'Extended', 'Cancelled']

    const allUserBookings = useMemo(() =>
        bookings.filter(b => b.userEmail === currentUser?.email),
        [bookings, currentUser]
    )

    const userBookings = useMemo(() => {
        return allUserBookings.filter(b => {
            const matchesStatus = statusFilter === 'All' || b.status === statusFilter
            const matchesSearch = !searchQuery ||
                b.carName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                b.id?.toString().toLowerCase().includes(searchQuery.toLowerCase())
            return matchesStatus && matchesSearch
        })
    }, [allUserBookings, statusFilter, searchQuery])

    const handleCancel = (bookingId) => {
        setConfirmModal({
            message: 'Cancel this booking?',
            subMessage: 'This action cannot be undone. Your reservation will be permanently cancelled.',
            confirmText: 'Yes, Cancel Booking',
            cancelText: 'No, Keep It',
            type: 'danger',
            onConfirm: () => {
                cancelBooking(bookingId)
                setConfirmModal(null)
                setToast({ message: 'Booking cancelled successfully!', type: 'success' })
            },
            onCancel: () => setConfirmModal(null)
        })
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

                    {/* Search Bar */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        background: '#fff',
                        border: '1.5px solid #e5e7eb',
                        borderRadius: '16px',
                        padding: '16px 24px',
                        margin: '32px auto 0',
                        maxWidth: '650px',
                        width: '100%',
                        boxShadow: '0 4px 20px -4px rgba(0,0,0,0.05)',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                    }}
                    className="search-bar-container-enhanced"
                    >
                        <HiSearch style={{ color: 'var(--primary-color)', fontSize: '24px', flexShrink: 0 }} />
                        <input
                            type="text"
                            placeholder="Search by car name or booking ID..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{
                                border: 'none',
                                outline: 'none',
                                background: 'transparent',
                                fontSize: '16px',
                                width: '100%',
                                color: '#1a1a1a',
                                fontWeight: '500'
                            }}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                style={{
                                    background: '#f3f4f6',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#6b7280',
                                    fontSize: '18px',
                                    padding: '4px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '28px',
                                    height: '28px'
                                }}
                            >×</button>
                        )}
                    </div>

                    {/* Status Filter Tabs */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '12px',
                        marginTop: '24px',
                        flexWrap: 'wrap'
                    }}>
                        {statusTabs.map(tab => {
                            const isActive = statusFilter === tab;
                            const count = tab === 'All'
                                ? allUserBookings.length
                                : allUserBookings.filter(b => b.status === tab).length;

                            return (
                                <button
                                    key={tab}
                                    onClick={() => setStatusFilter(tab)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '10px 24px',
                                        borderRadius: '100px',
                                        border: isActive ? '2px solid var(--primary-color, #5c3d1e)' : '2px solid #e5e7eb',
                                        background: isActive ? 'var(--primary-color, #5c3d1e)' : '#fff',
                                        color: isActive ? '#fff' : '#4b5563',
                                        fontWeight: isActive ? '700' : '600',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        boxShadow: isActive ? '0 8px 16px -4px rgba(92, 61, 30, 0.3)' : '0 2px 8px rgba(0,0,0,0.04)'
                                    }}
                                >
                                    {tab}
                                    <span style={{
                                        background: isActive ? 'rgba(255,255,255,0.25)' : '#f3f4f6',
                                        color: isActive ? '#fff' : '#6b7280',
                                        borderRadius: '50px',
                                        padding: '2px 8px',
                                        fontSize: '12px',
                                        fontWeight: '800'
                                    }}>
                                        {count}
                                    </span>
                                </button>
                            )
                        })}
                    </div>

                    {/* Results count */}
                    <p style={{
                        marginTop: '16px',
                        fontSize: '14px',
                        color: '#6b7280',
                        fontWeight: '500'
                    }}>
                        Showing <strong style={{color: '#111827'}}>{userBookings.length}</strong> of <strong style={{color: '#111827'}}>{allUserBookings.length}</strong> bookings
                    </p>
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
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {userBookings.map(booking => {
                            const car = rentals.find(r => r.id === booking.carId)
                            const displayImage = car?.image || booking.carImage || 'https://via.placeholder.com/300x200?text=Car'

                            return (
                                <motion.div key={booking.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="booking-card-redesign">
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
                                                className="btn-action btn-extend"
                                                onClick={() => setExtendingBooking(booking)}
                                            >
                                                <HiCalendar /> Extend
                                            </button>
                                            <button
                                                className="btn-action btn-download-invoice"
                                                onClick={() => downloadInvoice(booking, currentUser)}
                                                title="Download Official Invoice"
                                            >
                                                <HiDownload /> Invoice
                                            </button>
                                            <button
                                                className="btn-action btn-cancel"
                                                onClick={() => handleCancel(booking.id)}
                                            >
                                                <HiX /> Cancel
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
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
            {confirmModal && (
                <ConfirmModal
                    message={confirmModal.message}
                    subMessage={confirmModal.subMessage}
                    confirmText={confirmModal.confirmText}
                    cancelText={confirmModal.cancelText}
                    type={confirmModal.type}
                    onConfirm={confirmModal.onConfirm}
                    onCancel={confirmModal.onCancel}
                />
            )}
        </div>
    )
}

export default MyBookings
