import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './AvailabilityCalendar.css'

const AvailabilityCalendar = ({ bookings, carId, onRangeSelect, selectedRange }) => {
    const [currentDate, setCurrentDate] = useState(new Date())
    const { startDate, endDate } = selectedRange

    // Get booked dates for this car
    const bookedDateRanges = useMemo(() => {
        return bookings
            .filter(b => b.carId === carId)
            .map(b => ({
                id: b.id,
                start: new Date(b.startDate),
                end: new Date(b.endDate)
            }))
    }, [bookings, carId])

    const isBooked = (date) => {
        date.setHours(0, 0, 0, 0)
        return bookedDateRanges.some(range => {
            const start = new Date(range.start)
            start.setHours(0, 0, 0, 0)
            const end = new Date(range.end)
            end.setHours(0, 0, 0, 0)
            return date >= start && date <= end
        })
    }

    const isToday = (date) => {
        const today = new Date()
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
    }

    const isSelected = (date) => {
        if (!startDate) return false
        date.setHours(0, 0, 0, 0)
        const start = new Date(startDate)
        start.setHours(0, 0, 0, 0)

        if (endDate) {
            const end = new Date(endDate)
            end.setHours(0, 0, 0, 0)
            return date >= start && date <= end
        }

        return date.getTime() === start.getTime()
    }

    const handleDateClick = (date) => {
        if (isBooked(date)) {
            alert('This date is already booked.')
            return
        }

        const today = new Date()
        today.setHours(0, 0, 0, 0)
        if (date < today) {
            alert('Cannot select past dates.')
            return
        }

        if (!startDate || (startDate && endDate)) {
            onRangeSelect(date, null)
        } else {
            // Check if there is any booking between startDate and this date
            const start = new Date(startDate)
            const end = new Date(date)

            if (end < start) {
                onRangeSelect(date, null)
                return
            }

            // Verify no overlap in the middle
            let current = new Date(start)
            while (current <= end) {
                if (isBooked(new Date(current))) {
                    alert('The selected range overlaps with an existing booking.')
                    return
                }
                current.setDate(current.getDate() + 1)
            }

            onRangeSelect(startDate, date)
        }
    }

    const renderHeader = () => {
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        return (
            <div className="calendar-header">
                <button type="button" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}>&lt;</button>
                <h3>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
                <button type="button" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}>&gt;</button>
            </div>
        )
    }

    const renderDays = () => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        return (
            <div className="calendar-days">
                {days.map(day => <div key={day} className="day-name">{day}</div>)}
            </div>
        )
    }

    const renderCells = () => {
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
        const startDateMonth = new Date(monthStart)
        startDateMonth.setDate(startDateMonth.getDate() - startDateMonth.getDay())

        const endDateMonth = new Date(monthEnd)
        endDateMonth.setDate(endDateMonth.getDate() + (6 - endDateMonth.getDay()))

        const rows = []
        let days = []
        let day = new Date(startDateMonth)

        while (day <= endDateMonth) {
            for (let i = 0; i < 7; i++) {
                const formattedDate = new Date(day)
                const isCurrentMonth = day.getMonth() === currentDate.getMonth()
                const booked = isBooked(new Date(day))
                const selected = isSelected(new Date(day))
                const past = day < new Date().setHours(0, 0, 0, 0)

                days.push(
                    <div
                        key={day.getTime()}
                        className={`calendar-cell ${!isCurrentMonth ? 'disabled' : ''} ${booked ? 'booked' : ''} ${selected ? 'selected' : ''} ${isToday(day) ? 'today' : ''} ${past ? 'past' : ''}`}
                        onClick={() => isCurrentMonth && !past && handleDateClick(formattedDate)}
                    >
                        <span>{day.getDate()}</span>
                    </div>
                )
                day.setDate(day.getDate() + 1)
            }
            rows.push(<div key={day.getTime()} className="calendar-row">{days}</div>)
            days = []
        }
        return <div className="calendar-body">{rows}</div>
    }

    return (
        <div className="availability-calendar">
            {renderHeader()}
            {renderDays()}
            {renderCells()}
            <div className="calendar-legend">
                <div className="legend-item"><span className="legend-color available"></span> Available</div>
                <div className="legend-item"><span className="legend-color booked"></span> Booked</div>
                <div className="legend-item"><span className="legend-color selected"></span> Selected</div>
            </div>
        </div>
    )
}

export default AvailabilityCalendar
