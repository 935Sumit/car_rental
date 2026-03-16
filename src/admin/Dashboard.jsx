import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useCarContext } from '../context/CarContext'
import { supabase } from '../supabase/supabaseClient'
import { HiCalendar, HiTrendingUp, HiCurrencyRupee } from 'react-icons/hi'
import './Dashboard.css'

const Dashboard = () => {
    const { rentals, bookings } = useCarContext()
    const [userCount, setUserCount] = useState(0)
    const [loginLogs, setLoginLogs] = useState([])

    useEffect(() => {
        const fetchUserCount = async () => {
            const { count, error } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true })
            if (!error) setUserCount(count)
        }
        fetchUserCount()

        const fetchLoginLogs = async () => {
            const { data, error } = await supabase
                .from('login_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10)
            if (!error) setLoginLogs(data || [])
        }
        fetchLoginLogs()
    }, [])

    const activeBookings = (bookings || []).filter(b => b.status !== 'Cancelled')
    const totalCars = (rentals || []).length
    const totalBookings = activeBookings.length
    const totalRevenue = activeBookings.reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0)

    const stats = [
        { label: 'Total Cars', value: totalCars.toString(), icon: '🚗' },
        { label: 'Total Bookings', value: totalBookings.toString(), icon: '📅' },
        { label: 'Total Users', value: userCount.toString(), icon: '👤' },
        { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: '💰' }
    ]

    // ── Revenue by Month Chart Data ──
    const revenueByMonth = useMemo(() => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const data = months.map(m => ({ month: m, revenue: 0, count: 0 }))

        activeBookings.forEach(b => {
            const date = new Date(b.booking_date || b.startDate)
            if (!isNaN(date)) {
                const monthIndex = date.getMonth()
                data[monthIndex].revenue += Number(b.totalPrice) || 0
                data[monthIndex].count += 1
            }
        })

        // Only show months that have data or current month
        const currentMonth = new Date().getMonth()
        return data.filter((_, i) => i <= currentMonth)
    }, [activeBookings])

    const maxRevenue = Math.max(...revenueByMonth.map(m => m.revenue), 1)

    // ── Payment Method Chart Data ──
    const paymentMethods = useMemo(() => {
        const methods = {}
        activeBookings.forEach(b => {
            const method = b.paymentMethod || 'Cash on Delivery'
            methods[method] = (methods[method] || 0) + 1
        })
        return Object.entries(methods).map(([name, count]) => ({
            name,
            count,
            percent: totalBookings > 0 ? Math.round((count / totalBookings) * 100) : 0
        }))
    }, [activeBookings, totalBookings])

    // ── Top Cars ──
    const carBookingCounts = activeBookings.reduce((acc, b) => {
        if (b.carName) acc[b.carName] = (acc[b.carName] || 0) + 1
        return acc
    }, {})

    const topCars = Object.entries(carBookingCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 4)
        .map(([name, count]) => ({ name, count }))

    // ── Recent Bookings ──
    const recentBookings = [...(bookings || [])]
        .sort((a, b) => new Date(b.booking_date || b.bookingDate) - new Date(a.booking_date || a.bookingDate))
        .slice(0, 3)

    const paymentColors = {
        'Cash on Delivery': '#059669',
        'Card Payment': '#2563eb',
        'UPI Payment': '#7c3aed'
    }

    const paymentIcons = {
        'Cash on Delivery': '💵',
        'Card Payment': '💳',
        'UPI Payment': '📱'
    }

    return (
        <div className="admin-dashboard">
            <main className="admin-content">
                {/* Header */}
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

                {/* Stats Grid */}
                <div className="stats-grid">
                    {stats.map((stat, index) => (
                        <div key={index} className="stat-card fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                            <span style={{ fontSize: '28px' }}>{stat.icon}</span>
                            <span className="stat-label">{stat.label}</span>
                            <span className="stat-value">{stat.value}</span>
                        </div>
                    ))}
                </div>

                {/* ── REVENUE CHART ── */}
                <div className="dashboard-card fade-in-up" style={{ marginTop: '40px', padding: '30px' }}>
                    <div className="card-header">
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <HiTrendingUp style={{ color: 'var(--primary-color)' }} />
                            Revenue by Month
                        </h2>
                        <span style={{
                            background: '#f0fdf4', color: '#059669',
                            padding: '4px 12px', borderRadius: '50px',
                            fontSize: '12px', fontWeight: '700'
                        }}>
                            Total: ₹{totalRevenue.toLocaleString('en-IN')}
                        </span>
                    </div>

                    {revenueByMonth.every(m => m.revenue === 0) ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                            <p style={{ fontSize: '40px' }}>📊</p>
                            <p>Revenue chart will appear as bookings come in!</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'flex-end',
                                gap: '12px',
                                height: '220px',
                                padding: '20px 10px 0',
                                minWidth: '400px',
                                borderBottom: '2px solid var(--bg-cream)',
                                borderLeft: '2px solid var(--bg-cream)',
                                position: 'relative'
                            }}>
                                {/* Y axis labels */}
                                {[0, 25, 50, 75, 100].map(pct => (
                                    <div key={pct} style={{
                                        position: 'absolute',
                                        left: '-50px',
                                        bottom: `${pct}%`,
                                        fontSize: '10px',
                                        color: '#999',
                                        width: '45px',
                                        textAlign: 'right'
                                    }}>
                                        ₹{Math.round(maxRevenue * pct / 100).toLocaleString()}
                                    </div>
                                ))}

                                {revenueByMonth.map((month, i) => {
                                    const heightPct = maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0
                                    return (
                                        <div key={i} style={{
                                            flex: 1,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            height: '100%',
                                            justifyContent: 'flex-end',
                                            gap: '6px',
                                            minWidth: '400px'
                                        }}>
                                            {/* Revenue label on top of bar */}
                                            {month.revenue > 0 && (
                                                <span style={{
                                                    fontSize: '10px',
                                                    fontWeight: '700',
                                                    color: 'var(--primary-color)',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    ₹{month.revenue.toLocaleString()}
                                                </span>
                                            )}
                                            {/* Bar */}
                                            <div style={{
                                                width: '100%',
                                                height: `${heightPct}%`,
                                                background: heightPct > 0
                                                    ? 'linear-gradient(to top, var(--primary-color), #b08850)'
                                                    : 'var(--bg-cream)',
                                                borderRadius: '6px 6px 0 0',
                                                transition: 'height 0.5s ease',
                                                minHeight: '4px',
                                                position: 'relative',
                                                cursor: 'pointer'
                                            }}
                                                title={`${month.month}: ₹${month.revenue.toLocaleString()} (${month.count} bookings)`}
                                            />
                                            {/* Month label */}
                                            <span style={{
                                                fontSize: '11px',
                                                fontWeight: '700',
                                                color: '#666',
                                                marginTop: '6px'
                                            }}>{month.month}</span>
                                            {/* Booking count */}
                                            {month.count > 0 && (
                                                <span style={{
                                                    fontSize: '10px',
                                                    color: '#999'
                                                }}>{month.count} bookings</span>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── PAYMENT METHODS + TOP CARS ── */}
                <div className="dashboard-grid fade-in-up" style={{ marginTop: '30px', animationDelay: '0.3s' }}>

                    {/* Payment Methods */}
                    <div className="dashboard-card">
                        <div className="card-header">
                            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <HiCurrencyRupee style={{ color: 'var(--primary-color)' }} />
                                Payment Methods
                            </h2>
                        </div>
                        {paymentMethods.length === 0 ? (
                            <p className="no-data">No payment data yet.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {paymentMethods.map((method, i) => (
                                    <div key={i}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            marginBottom: '6px'
                                        }}>
                                            <span style={{ fontWeight: '700', fontSize: '13px' }}>
                                                {paymentIcons[method.name] || '💳'} {method.name}
                                            </span>
                                            <span style={{ fontSize: '13px', color: '#888' }}>
                                                {method.count} bookings ({method.percent}%)
                                            </span>
                                        </div>
                                        <div style={{
                                            height: '10px',
                                            background: '#f3f4f6',
                                            borderRadius: '10px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                height: '100%',
                                                width: `${method.percent}%`,
                                                background: paymentColors[method.name] || '#888',
                                                borderRadius: '10px',
                                                transition: 'width 0.8s ease'
                                            }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Top Cars */}
                    <div className="dashboard-card top-cars">
                        <div className="card-header">
                            <h2>🏆 Top Performing Fleet</h2>
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
                                                />
                                            </div>
                                        </div>
                                        <span className="perf-count">{car.count} Bookings</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* ── RECENT BOOKINGS ── */}
                <div className="dashboard-card recent-bookings fade-in-up" style={{ marginTop: '30px' }}>
                    <div className="card-header">
                        <h2>📋 Recent Bookings</h2>
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
                                        <span className={`status-dot ${booking.status?.toLowerCase() || 'pending'}`} />
                                        <span className="booking-price">₹{Number(booking.totalPrice).toLocaleString('en-IN')}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* ── LOGIN LOGS ── */}
                <div className="dashboard-section" style={{ marginTop: '40px' }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '20px', color: 'var(--primary-color)' }}>
                        🔐 Recent Login Activity
                    </h2>
                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Email</th>
                                    <th>Name</th>
                                    <th>Status</th>
                                    <th>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loginLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                                            No login activity yet
                                        </td>
                                    </tr>
                                ) : (
                                    loginLogs.map((log, index) => (
                                        <tr key={index}>
                                            <td>{log.user_email}</td>
                                            <td>{log.user_name}</td>
                                            <td>
                                                <span style={{
                                                    padding: '4px 12px',
                                                    borderRadius: '50px',
                                                    fontSize: '12px',
                                                    fontWeight: '700',
                                                    background: log.status === 'success' ? '#d1fae5' : '#fee2e2',
                                                    color: log.status === 'success' ? '#065f46' : '#991b1b'
                                                }}>
                                                    {log.status === 'success' ? '✅ Success' : '❌ Failed'}
                                                </span>
                                            </td>
                                            <td style={{ fontSize: '0.85rem', color: '#888' }}>
                                                {new Date(log.created_at).toLocaleString('en-IN', {
                                                    day: '2-digit', month: 'short',
                                                    hour: '2-digit', minute: '2-digit'
                                                })}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </main>
        </div>
    )
}

export default Dashboard
