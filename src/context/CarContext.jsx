import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../supabase/supabaseClient'


const CarContext = createContext()

export const useCarContext = () => {
  const context = useContext(CarContext)
  if (!context) {
    throw new Error('useCarContext must be used within CarProvider')
  }
  return context
}

export const CarProvider = ({ children }) => {
  const [rentals, setRentals] = useState([])
  const [bookings, setBookings] = useState([])
  const [savedCars, setSavedCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')

  // Real-time rentals from Supabase
  useEffect(() => {
    const fetchRentals = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('rentals')
        .select('*')
      
      if (error) {
        console.error("Supabase rentals error:", error)
        setError("Error fetching rentals from Supabase")
      } else {
        setRentals(data || [])
      }
      setLoading(false)
    }

    fetchRentals()

    // Subscribe to changes
    const rentalsSubscription = supabase
      .channel('rentals-changes')
      .on('postgres_changes', { event: '*', table: 'rentals' }, (payload) => {
        fetchRentals()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(rentalsSubscription)
    }
  }, [])

  // Real-time bookings from Supabase
  useEffect(() => {
    const fetchBookings = async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
      
      if (error) {
        console.error("Supabase bookings error:", error)
      } else {
        setBookings(data)
      }
    }

    fetchBookings()

    const bookingsSubscription = supabase
      .channel('bookings-changes')
      .on('postgres_changes', { event: '*', table: 'bookings' }, (payload) => {
        fetchBookings()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(bookingsSubscription)
    }
  }, [])

  // Persist saved cars in localStorage
  useEffect(() => {
    const saved = localStorage.getItem('saved_cars')
    if (saved) setSavedCars(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem('saved_cars', JSON.stringify(savedCars))
  }, [savedCars])

  const seedMockData = async () => {
    // Seeding disabled to prevent duplicates.
    // Use the Admin Dashboard to add new cars manually.
    console.log("Automatic seeding is disabled. Use Admin Dashboard to manage cars.");
  }

  const addCar = async (carData) => {
    try {
      const newCar = {
        ...carData,
        availability: true,
        status: 'available',
        created_at: new Date().toISOString()
      }
      const { data, error } = await supabase
        .from('rentals')
        .insert([newCar])
        .select()

      if (error) throw error
      return data[0]
    } catch (e) {
      console.error("Error adding car:", e)
      throw e
    }
  }

  const deleteCar = async (carId) => {
    try {
      const { error } = await supabase
        .from('rentals')
        .delete()
        .eq('id', carId)
      
      if (error) throw error
    } catch (e) {
      console.error("Error deleting car:", e)
      throw e
    }
  }

  const updateCar = async (carId, updatedData) => {
    try {
      const { error } = await supabase
        .from('rentals')
        .update(updatedData)
        .eq('id', carId)
      
      if (error) throw error
    } catch (e) {
      console.error("Error updating car:", e)
      throw e
    }
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

  const addBooking = async (bookingData) => {
    try {
      const newBooking = {
        ...bookingData,
        booking_date: new Date().toISOString(),
        status: 'Active'
      }
      const { data, error } = await supabase
        .from('bookings')
        .insert([newBooking])
        .select()

      if (error) throw error
      return data[0]
    } catch (e) {
      console.error("Error adding booking:", e)
      throw e
    }
  }

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId)
      
      if (error) throw error
    } catch (e) {
      console.error("Error updating booking status:", e)
      throw e
    }
  }

  const deleteBooking = async (bookingId) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId)
      
      if (error) throw error
    } catch (e) {
      console.error("Error deleting booking:", e)
      throw e
    }
  }

  const cancelBooking = (bookingId) => {
    updateBookingStatus(bookingId, 'Cancelled')
  }

  const extendBooking = async (bookingId, newEndDate, extraDays, extraPayment) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          endDate: newEndDate,
          status: 'Extended'
        })
        .eq('id', bookingId)
      
      if (error) throw error
    } catch (e) {
      console.error("Error extending booking:", e)
      throw e
    }
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

  const filteredRentalsList = rentals.filter(rental => {
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
    filteredRentals: filteredRentalsList,
    checkAvailability,
    toggleSaveCar,
    isCarSaved,
    loading,
    error
  }

  return <CarContext.Provider value={value}>{children}</CarContext.Provider>
}
