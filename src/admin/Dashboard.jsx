import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCarContext } from '../context/CarContext'
import './Dashboard.css'

const Dashboard = () => {
    const navigate = useNavigate()
    const { rentals, bookings } = useCarContext()

    useEffect(() => {
        // Route Protection
        const isAdmin = localStorage.getItem('adminLoggedIn')
        if (isAdmin !== 'true') {
            navigate('/login')
        }
    }, [navigate])

    // Real Data Calculations
    const activeBookings = (bookings || []).filter(b => b.status !== 'Cancelled')
    const totalCars = (rentals || []).length
    const totalBookings = activeBookings.length
    const availableCars = (rentals || []).filter(car => car.availability).length
    const totalRevenue = activeBookings.reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0)

    const stats = [
        { label: 'Total Cars', value: totalCars.toString() },
        { label: 'Total Bookings', value: totalBookings.toString() },
        { label: 'Available Cars', value: availableCars.toString() },
        { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}` }
    ]

    // Get recent 5 bookings
    const recentBookings = [...(bookings || [])]
        .filter(b => b.bookingDate) // Ensure date exists
        .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate))
        .slice(0, 3)

    // Calculate top performing cars (by booking count)
    const carBookingCounts = activeBookings.reduce((acc, b) => {
        if (b.carName) {
            acc[b.carName] = (acc[b.carName] || 0) + 1
        }
        return acc
    }, {})

    const topCars = Object.entries(carBookingCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 4)
        .map(([name, count]) => ({ name, count }))

    return (
        <div className="admin-dashboard">
            <main className="admin-content">
                <header className="admin-header dashboard-hero">
                    <div className="hero-content">
                        <h1>Admin Dashboard</h1>
                        <p className="welcome-text">Greetings, <span className="admin-name">Administrator</span>. Here's your fleet's status at a glance.</p>
                    </div>
                </header>

                <div className="stats-grid">
                    {stats.map((stat, index) => (
                        <div key={index} className="stat-card fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                            <span className="stat-label">{stat.label}</span>
                            <span className="stat-value">{stat.value}</span>
                        </div>
                    ))}
                </div>

                <div className="dashboard-grid fade-in-up" style={{ animationDelay: '0.4s' }}>
                    {/* Recent Activity */}
                    <div className="dashboard-card recent-bookings">
                        <div className="card-header">
                            <h2>Recent Bookings</h2>
                            <Link to="/admin/bookings" className="view-all">View All</Link>
                        </div>
                        <div className="activity-list">
                            {recentBookings.length === 0 ? (
                                <p className="no-data">No recent bookings yet.</p>
                            ) : (
                                recentBookings.map((booking, idx) => (
                                    <div key={idx} className="activity-item">
                                        <div className="activity-info">
                                            <span className="customer-name">{booking.userName}</span>
                                            <span className="activity-detail">booked {booking.carName}</span>
                                        </div>
                                        <div className="activity-meta">
                                            <span className={`status-dot ${booking.status?.toLowerCase() || 'pending'}`}></span>
                                            <span className="booking-price">₹{booking.totalPrice}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Top Cars */}
                    <div className="dashboard-card top-cars">
                        <div className="card-header">
                            <h2>Top Performing Fleet</h2>
                        </div>
                        <div className="performance-list">
                            {topCars.length === 0 ? (
                                <p className="no-data">Data will appear as bookings increase.</p>
                            ) : (
                                topCars.map((car, idx) => (
                                    <div key={idx} className="performance-item">
                                        <div className="car-rank">#{idx + 1}</div>
                                        <div className="car-perf-info">
                                            <span className="perf-name">{car.name}</span>
                                            <div className="perf-bar-bg">
                                                <div 
                                                    className="perf-bar-fill" 
                                                    style={{ width: `${totalBookings > 0 ? (car.count / totalBookings) * 100 : 0}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <span className="perf-count">{car.count} Bookings</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Dashboard
