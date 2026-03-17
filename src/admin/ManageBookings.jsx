import { useState } from 'react'
import { useCarContext } from '../context/CarContext'
import { HiSearch, HiX } from 'react-icons/hi'
import './Dashboard.css'
import './ManageCars.css'
import './ManageBookings.css'

const ManageBookings = () => {
    const { bookings, updateBookingStatus, deleteBooking, loading } = useCarContext()
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('All')

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this booking record?')) {
            deleteBooking(id)
        }
    }

    const getStatusDisplay = (status) => {
        const s = status?.toLowerCase()
        if (s === 'cancelled') return { label: 'Cancelled', class: 'status-cancelled' }
        if (s === 'extended')  return { label: 'Extended',  class: 'status-pending'   }
        return { label: 'Confirmed', class: 'status-approved' }
    }

    const q = searchQuery.toLowerCase()
    const filteredBookings = bookings.filter(b => {
        const matchesSearch = !q ||
            b.id?.toString().toLowerCase().includes(q) ||
            b.userName?.toLowerCase().includes(q) ||
            b.userEmail?.toLowerCase().includes(q) ||
            b.carName?.toLowerCase().includes(q) ||
            b.startDate?.includes(q) ||
            b.paymentMethod?.toLowerCase().includes(q)
        const matchesStatus = statusFilter === 'All' || b.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const statusTabs = ['All', 'Active', 'Extended']

    return (
        <div className="admin-dashboard">
            <main className="admin-content">
                <div className="manage-cars-page">
                    <header className="admin-header">
                        <div>
                            <h1>Manage Bookings <span className="total-badge">{bookings.length}</span></h1>
                            <p>Real-time oversight of all customer reservations and active hire statuses.</p>
                        </div>
                    </header>

                    {/* ── Search Bar + Status Tabs ── */}
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
                        <div className="admin-search-bar" style={{ flex: 1, minWidth: '260px' }}>
                            <HiSearch className="admin-search-icon" />
                            <input
                                type="text"
                                placeholder="Search by ID, name, email or car..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="admin-search-input"
                            />
                            {searchQuery && (
                                <button className="admin-search-clear" onClick={() => setSearchQuery('')}>
                                    <HiX />
                                </button>
                            )}
                            <span className="admin-search-count">
                                {filteredBookings.length} / {bookings.length}
                            </span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                            {statusTabs.map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setStatusFilter(tab)}
                                    style={{
                                        padding: '9px 18px',
                                        borderRadius: '100px',
                                        border: statusFilter === tab ? '2px solid var(--primary-color)' : '2px solid #e5e7eb',
                                        background: statusFilter === tab ? 'var(--primary-color)' : '#fff',
                                        color: statusFilter === tab ? '#fff' : '#4b5563',
                                        fontWeight: '700', fontSize: '13px', cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="admin-table-container fade-in-up">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Booking ID</th>
                                    <th>Customer Name</th>
                                    <th>Customer Email</th>
                                    <th>Car Name</th>
                                    <th>Pickup Date</th>
                                    <th>Return Date</th>
                                    <th>Total Price</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>Loading bookings...</td></tr>
                                ) : filteredBookings.length === 0 ? (
                                    <tr><td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                                        {searchQuery ? `No bookings found matching "${searchQuery}"` : 'No bookings found.'}
                                    </td></tr>
                                ) : (
                                    filteredBookings.map(booking => (
                                        <tr key={booking.id}>
                                            <td><span className="booking-id" title={booking.id}>#{booking.id.toString().slice(-6)}</span></td>
                                            <td>{booking.userName}</td>
                                            <td style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>{booking.userEmail}</td>
                                            <td>{booking.carName}</td>
                                            <td>{booking.startDate}</td>
                                            <td>{booking.endDate}</td>
                                            <td>₹{booking.totalPrice?.toLocaleString('en-IN')}</td>
                                            <td>
                                                <span className={`status-badge ${getStatusDisplay(booking.status).class}`}>
                                                    {getStatusDisplay(booking.status).label}
                                                </span>
                                            </td>
                                            <td className="actions-cell">
                                                <div className="action-btns-row">
                                                    <button className="btn-delete" onClick={() => handleDelete(booking.id)}>Delete</button>
                                                </div>
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

export default ManageBookings
