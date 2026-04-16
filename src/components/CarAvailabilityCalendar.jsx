import { useState, useMemo } from 'react'
import { useCarContext } from '../context/CarContext'
import { HiCheckCircle, HiXCircle, HiCalendar } from 'react-icons/hi'
import './CarAvailabilityCalendar.css'

const CarAvailabilityCalendar = ({ carId }) => {
  const { bookings } = useCarContext()
  const [currentDate, setCurrentDate] = useState(new Date())

  // Navigation handlers
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  // Get days in the current month view
  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDayOfMonth = new Date(year, month, 1).getDay()
    const daysInM = new Date(year, month + 1, 0).getDate()
    
    const days = []
    // Add empty slots for the first week
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null)
    }
    // Add actual days
    for (let d = 1; d <= daysInM; d++) {
      days.push(new Date(year, month, d))
    }
    return days
  }, [currentDate])

  const monthYear = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })

  const getBookingForDate = (date) => {
    if (!date) return null
    const checkDate = new Date(date).setHours(0, 0, 0, 0)
    return bookings.find(b => {
      if (b.carId !== carId || b.status === 'Cancelled') return false
      const start = new Date(b.startDate).setHours(0, 0, 0, 0)
      const end = new Date(b.endDate).setHours(0, 0, 0, 0)
      return checkDate >= start && checkDate <= end
    })
  }

  const isToday = (date) => {
    if (!date) return false
    const today = new Date()
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear()
  }

  return (
    <div className="car-avail-calendar">
      <div className="calendar-header">
        <h4>Availability Schedule</h4>
        <div className="calendar-nav">
          <button onClick={prevMonth} type="button">&lt;</button>
          <span>{monthYear}</span>
          <button onClick={nextMonth} type="button">&gt;</button>
        </div>
      </div>

      <div className="calendar-grid">
        <div className="weekdays">
          <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
        </div>
        <div className="days">
          {daysInMonth.map((day, i) => {
            const booking = getBookingForDate(day)
            const today = isToday(day)
            
            return (
              <div 
                key={i} 
                className={`day-slot ${!day ? 'empty' : ''} ${booking ? 'booked' : 'free'} ${today ? 'today' : ''}`}
                title={booking ? `Booked until ${booking.endDate}` : (day ? 'Available' : '')}
              >
                {day?.getDate()}
                {booking && <div className="booked-dot" />}
              </div>
            )
          })}
        </div>
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <span className="dot free" /> Available
        </div>
        <div className="legend-item">
          <span className="dot booked" /> Booked
        </div>
      </div>
    </div>
  )
}

export default CarAvailabilityCalendar
