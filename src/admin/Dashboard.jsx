import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCarContext } from '../context/CarContext'
import { supabase } from '../supabase/supabaseClient'
import { HiCalendar } from 'react-icons/hi'
import './Dashboard.css'

const Dashboard = () => {
    const navigate = useNavigate()
    const { rentals, bookings } = useCarContext()
    const [userCount, setUserCount] = useState(0)

    useEffect(() => {
        const isAdmin = localStorage.getItem('adminLoggedIn')
        if (isAdmin !== 'true') {
            navigate('/login')
        }

        const fetchUserCount = async () => {
            const { count, error } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true })
            
            if (!error) setUserCount(count)
        }
        fetchUserCount()
    }, [navigate])

    const activeBookings = (bookings || []).filter(b => b.status !== 'Cancelled')
    const totalCars = (rentals || []).length
    const totalBookings = activeBookings.length
    const totalRevenue = activeBookings.reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0)

    const stats = [
        { label: 'Total Cars', value: totalCars.toString() },
        { label: 'Total Bookings', value: totalBookings.toString() },
        { label: 'Total Users', value: userCount.toString() },
        { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}` }
    ]

    const recentBookings = [...(bookings || [])]
        .sort((a, b) => new Date(b.booking_date || b.bookingDate) - new Date(a.booking_date || a.bookingDate))
        .reverse()
        .slice(0, 3)

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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <div>
                                <h1>Admin Dashboard</h1>
                                <p className="welcome-text">Greetings, <span className="admin-name">Administrator</span>. Here's your fleet's status at a glance.</p>
                            </div>
                            <Link to="/admin/calendar" className="btn hero-btn-calendar">
                                <HiCalendar style={{ marginRight: '8px' }} /> View Schedule
                            </Link>
                        </div>
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
