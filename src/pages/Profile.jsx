import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCarContext } from '../context/CarContext'
import './Profile.css'

const Profile = () => {
    const navigate = useNavigate()
    const { bookings } = useCarContext()
    const currentUser = JSON.parse(localStorage.getItem('currentUser'))

    if (!currentUser) {
        navigate('/login')
        return null
    }

    const userBookings = bookings.filter(b => b.userEmail === currentUser.email)
    const activeRentals = userBookings.filter(b => b.status === 'Active').length

    const handleLogout = () => {
        localStorage.removeItem('currentUser')
        window.location.reload()
    }

    return (
        <div className="profile-page">
            <div className="container">
                <motion.div
                    className="profile-header"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="welcome-banner">
                        <h1>Welcome back, {currentUser.fullName} 👋</h1>
                        <p>Ready for your next ride?</p>
                    </div>
                </motion.div>

                <div className="profile-dashboard">
                    <div className="stats-grid">
                        <div className="stat-card">
                            <span className="stat-value">{userBookings.length}</span>
                            <span className="stat-label">Total Bookings</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-value">{activeRentals}</span>
                            <span className="stat-label">Active Rentals</span>
                        </div>
                    </div>

                    <div className="quick-actions">
                        <h3>Quick Actions</h3>
                        <div className="action-buttons">
                            <Link to="/" className="action-btn">Browse Cars</Link>
                            <button className="action-btn secondary" onClick={() => document.getElementById('my-bookings').scrollIntoView()}>View Rentals</button>
                            <button className="action-btn logout" onClick={handleLogout}>Logout</button>
                        </div>
                    </div>

                    <div className="bookings-section" id="my-bookings">
                        <h3>My Bookings</h3>
                        {userBookings.length === 0 ? (
                            <div className="empty-bookings">
                                <p>No bookings found.</p>
                                <Link to="/" className="btn btn-primary">Start Booking</Link>
                            </div>
                        ) : (
                            <div className="bookings-list">
                                {userBookings.map(booking => (
                                    <div key={booking.id} className="booking-card">
                                        <div className="booking-info">
                                            <h4>{booking.carName}</h4>
                                            <p className="booking-dates">{booking.startDate} to {booking.endDate}</p>
                                            <p className="booking-price">Total: ₹{booking.totalPrice.toLocaleString('en-IN')}</p>
                                        </div>
                                        <div className="booking-status">
                                            <span className={`status-badge ${booking.status.toLowerCase()}`}>{booking.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profile
