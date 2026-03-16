import { useCarContext } from '../context/CarContext'
import './Dashboard.css'
import './ManageCars.css'
import './ManageBookings.css'

const ManageBookings = () => {
    const { bookings, updateBookingStatus, deleteBooking, loading } = useCarContext()

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this booking record?')) {
            deleteBooking(id)
        }
    }

    const getStatusDisplay = (status) => {
        if (status?.toLowerCase() === 'cancelled') {
            return { label: 'Cancelled', class: 'status-cancelled' }
        }
        return { label: 'Confirmed', class: 'status-approved' }
    }

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
                                    <tr><td colSpan="9" style={{ textAlign: 'center' }}>Loading bookings...</td></tr>
                                ) : bookings.length === 0 ? (
                                    <tr><td colSpan="9" style={{ textAlign: 'center' }}>No bookings found.</td></tr>
                                ) : (
                                    bookings.map(booking => (
                                        <tr key={booking.id}>
                                            <td><span className="booking-id" title={booking.id}>#{booking.id.toString().slice(-6)}</span></td>
                                            <td>{booking.userName}</td>
                                            <td style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>{booking.userEmail}</td>
                                            <td>{booking.carName}</td>
                                            <td>{booking.startDate}</td>
                                            <td>{booking.endDate}</td>
                                            <td>₹{booking.totalPrice}</td>
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
