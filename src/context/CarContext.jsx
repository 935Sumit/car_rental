import { createContext, useContext, useState, useEffect } from 'react'
import { mockRentals } from '../data/mockData'

const CarContext = createContext()

export const useCarContext = () => {
  const context = useContext(CarContext)
  if (!context) {
    throw new Error('useCarContext must be used within CarProvider')
  }
  return context
}

export const CarProvider = ({ children }) => {
  // Initialize rentals from localStorage or mock data
  const [rentals, setRentals] = useState(() => {
    const savedCars = localStorage.getItem('vantage_cars')
    if (savedCars) {
      return JSON.parse(savedCars)
    }
    return mockRentals
  })

  const [bookings, setBookings] = useState(() => {
    const savedBookings = localStorage.getItem('vantage_bookings')
    return savedBookings ? JSON.parse(savedBookings) : []
  })

  const [savedCars, setSavedCars] = useState(() => {
    const saved = localStorage.getItem('saved_cars')
    return saved ? JSON.parse(saved) : []
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')

  // Persist data to localStorage
  useEffect(() => {
    localStorage.setItem('vantage_cars', JSON.stringify(rentals))
  }, [rentals])

  useEffect(() => {
    localStorage.setItem('vantage_bookings', JSON.stringify(bookings))
  }, [bookings])

  useEffect(() => {
    localStorage.setItem('saved_cars', JSON.stringify(savedCars))
  }, [savedCars])

  const addCar = (carData) => {
    const newCar = {
      ...carData,
      id: carData.id || `custom-${Date.now()}`,
      availability: true,
      createdAt: new Date().toISOString()
    }
    setRentals(prev => {
      const exists = prev.find(c => c.id === newCar.id)
      if (exists) {
        return prev.map(c => c.id === newCar.id ? newCar : c)
      }
      return [newCar, ...prev]
    })
    return newCar
  }

  const deleteCar = (carId) => {
    setRentals(prev => prev.filter(c => c.id !== carId))
  }

  const updateCar = (carId, updatedData) => {
    setRentals(prev => prev.map(c => c.id === carId ? { ...c, ...updatedData } : c))
  }

  const checkAvailability = (carId, startDate, endDate) => {
    const newStart = new Date(startDate)
    const newEnd = new Date(endDate)

    const hasOverlap = bookings.some(booking => {
      if (booking.carId !== carId) return false
      if (booking.status === 'Cancelled') return false

      const existingStart = new Date(booking.startDate)
      const existingEnd = new Date(booking.endDate)

      return newStart <= existingEnd && newEnd >= existingStart
    })

    return !hasOverlap
  }

  const addBooking = (bookingData) => {
    const newBooking = {
      ...bookingData,
      id: `book-${Date.now()}`,
      bookingDate: new Date().toISOString(),
      status: 'Pending'
    }
    setBookings(prev => [newBooking, ...prev])
    return newBooking
  }

  const updateBookingStatus = (bookingId, status) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b))
  }

  const deleteBooking = (bookingId) => {
    setBookings(prev => prev.filter(b => b.id !== bookingId))
  }

  const cancelBooking = (bookingId) => {
    updateBookingStatus(bookingId, 'Cancelled')
  }

  const extendBooking = (bookingId, newEndDate, extraDays, extraPayment) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          endDate: newEndDate,
          extraDays: (b.extraDays || 0) + extraDays,
          remainingPayment: (b.remainingPayment || 0) + extraPayment,
          status: 'Extended'
        }
      }
      return b
    }))
  }

  const toggleSaveCar = (car) => {
    setSavedCars(prev => {
      const isSaved = prev.some(c => c.id === car.id)
      if (isSaved) {
        return prev.filter(c => c.id !== car.id)
      } else {
        return [...prev, car]
      }
    })
  }

  const isCarSaved = (carId) => {
    return savedCars.some(c => c.id === carId)
  }

  const filteredRentals = rentals.filter(rental => {
    const matchesSearch = !searchQuery ||
      rental.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rental.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rental.city && rental.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (rental.type && rental.type.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesType = typeFilter === 'All' || rental.type === typeFilter

    return matchesSearch && matchesType
  })

  const [compareList, setCompareList] = useState([])

  const toggleCompare = (car) => {
    setCompareList(prev => {
      const isComparing = prev.find(c => c.id === car.id)
      if (isComparing) {
        return prev.filter(c => c.id !== car.id)
      } else {
        if (prev.length >= 3) {
          alert('You can only compare up to 3 cars at a time.')
          return prev
        }
        return [...prev, car]
      }
    })
  }

  const value = {
    rentals,
    addCar,
    deleteCar,
    updateCar,
    bookings,
    addBooking,
    updateBookingStatus,
    deleteBooking,
    cancelBooking,
    extendBooking,
    savedCars,
    setSavedCars,
    compareList,
    setCompareList,
    toggleCompare,
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    filteredRentals,
    checkAvailability,
    toggleSaveCar,
    isCarSaved,
    loading: false
  }

  return <CarContext.Provider value={value}>{children}</CarContext.Provider>
}
