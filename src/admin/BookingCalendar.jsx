import { useState, useMemo } from 'react'
import { useCarContext } from '../context/CarContext'
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi'
import './BookingCalendar.css'

const BookingCalendar = () => {
    const { rentals, bookings } = useCarContext()
    
    // Date navigation state
    const [currentDate, setCurrentDate] = useState(new Date())

    // Month navigation handlers
    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    }
    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    }

    // Helper to get days in month
    const daysInMonth = useMemo(() => {
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth()
        const date = new Date(year, month, 1)
        const days = []
        while (date.getMonth() === month) {
            days.push(new Date(date))
            date.setDate(date.getDate() + 1)
        }
        return days
    }, [currentDate])

    // Format month/year for display
    const monthYear = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })

    // Check if a car is booked on a specific date
    const getBookingForDate = (carId, date) => {
        const checkDate = new Date(date).setHours(0,0,0,0)
        return bookings.find(b => {
            if (b.carId !== carId || b.status === 'Cancelled') return false
            const start = new Date(b.startDate).setHours(0,0,0,0)
            const end = new Date(b.endDate).setHours(0,0,0,0)
            return checkDate >= start && checkDate <= end
        })
    }

    return (
        <div className="admin-dashboard">
            <main className="admin-content">
                <div className="booking-calendar-page">
                    <header className="admin-header">
                        <div className="page-header-actions">
                            <div>
                                <h1>Availability Matrix</h1>
                                <p>Visual schedule of your entire vintage fleet.</p>
                            </div>
                            <div className="calendar-nav-controls">
                                <button className="nav-btn" onClick={prevMonth}><HiChevronLeft /></button>
                                <span className="current-month-label">{monthYear}</span>
                                <button className="nav-btn" onClick={nextMonth}><HiChevronRight /></button>
                            </div>
                        </div>
                    </header>

                    <div className="matrix-container fade-in-up">
                        <div className="matrix-wrapper">
                            <table className="availability-matrix">
                                <thead>
                                    <tr>
                                        <th className="sticky-col car-info-th">Car Fleet</th>
                                        {daysInMonth.map(day => (
                                            <th key={day.toString()} className={day.getDay() === 0 || day.getDay() === 6 ? 'weekend' : ''}>
                                                <div className="day-name">{day.toLocaleString('default', { weekday: 'short' })}</div>
                                                <div className="day-number">{day.getDate()}</div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {rentals.map(car => (
                                        <tr key={car.id}>
                                            <td className="sticky-col car-cell">
                                                <div className="car-mini-info">
                                                    <img src={car.image} alt={car.name} className="matrix-thumb" />
                                                    <div className="car-labels">
                                                        <span className="car-m-name">{car.name}</span>
                                                        <span className="car-m-brand">{car.brand}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            {daysInMonth.map(day => {
                                                const booking = getBookingForDate(car.id, day)
                                                return (
                                                    <td 
                                                        key={day.toString()} 
                                                        className={`matrix-slot ${booking ? 'is-booked' : ''} ${day.getDay() === 0 || day.getDay() === 6 ? 'weekend-cell' : ''}`}
                                                    >
                                                        {booking && (
                                                            <div className="booking-indicator" title={`${booking.userName} (${booking.startDate} to ${booking.endDate})`}>
                                                                <div className="booking-tag">Booked</div>
                                                            </div>
                                                        )}
                                                    </td>
                                                )
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="calendar-legend">
                        <div className="legend-item">
                            <span className="color-box available"></span>
                            <span>Available</span>
                        </div>
                        <div className="legend-item">
                            <span className="color-box booked"></span>
                            <span>Booked</span>
                        </div>
                        <div className="legend-item">
                            <span className="color-box weekend"></span>
                            <span>Weekend</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default BookingCalendar
