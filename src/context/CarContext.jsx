import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../supabase/supabaseClient'
import { useAuth } from './AuthContext'

const CarContext = createContext()

export const useCarContext = () => {
  const context = useContext(CarContext)
  if (!context) {
    throw new Error('useCarContext must be used within CarProvider')
  }
  return context
}

export const CarProvider = ({ children }) => {
  // ✅ useAuth called at the very top — FIRST thing!
  const { currentUser } = useAuth()

  const [rentals, setRentals] = useState([])
  const [bookings, setBookings] = useState([])
  const [savedCars, setSavedCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [compareList, setCompareList] = useState([])

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
    const rentalsSubscription = supabase
      .channel('rentals-changes')
      .on('postgres_changes', { event: '*', table: 'rentals' }, () => {
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
        setBookings(data || [])
      }
    }
    fetchBookings()
    const bookingsSubscription = supabase
      .channel('bookings-changes')
      .on('postgres_changes', { event: '*', table: 'bookings' }, () => {
        fetchBookings()
      })
      .subscribe()
    return () => {
      supabase.removeChannel(bookingsSubscription)
    }
  }, [])

  // ✅ Load saved cars — reacts to currentUser changes
  useEffect(() => {
    const loadSavedCars = async () => {
      // No user logged in — clear saved cars
      if (!currentUser?.id) {
        setSavedCars([])
        return
      }
      try {
        const { data, error } = await supabase
          .from('saved_cars')
          .select('*')
          .eq('user_id', currentUser.id)
          
        if (error) {
          console.error('Supabase fetch error:', error)
          return
        }
        if (data) setSavedCars(data.map(row => row.car_data))
      } catch (e) {
        console.error('Error loading saved cars:', e)
      }
    }
    loadSavedCars()
  }, [currentUser]) // ✅ runs every time currentUser changes!

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
      
      if (error) return { error }

      setBookings(prev => {
        if (!prev.find(b => b.id === data[0].id)) {
          return [data[0], ...prev]
        }
        return prev
      })
      return { data: data[0] }
    } catch (e) {
      console.error("Error adding booking:", e)
      return { error: e }
    }
  }

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId)
      if (error) throw error
      setBookings(prev => prev.map(b =>
        b.id === bookingId ? { ...b, status } : b
      ))
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
      setBookings(prev => prev.filter(b => b.id !== bookingId))
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
        .update({ endDate: newEndDate, status: 'Extended' })
        .eq('id', bookingId)
      if (error) throw error
      setBookings(prev => prev.map(b =>
        b.id === bookingId
          ? { ...b, endDate: newEndDate, status: 'Extended' }
          : b
      ))
    } catch (e) {
      console.error("Error extending booking:", e)
      throw e
    }
  }

  // ✅ toggleSaveCar uses currentUser from useAuth directly
  const toggleSaveCar = async (car) => {
    if (!currentUser?.id) {
      console.warn('No user logged in — cannot save car')
      return
    }
    const isSaved = savedCars.some(c => c.id === car.id)
    if (isSaved) {
      setSavedCars(prev => prev.filter(c => c.id !== car.id))
      try {
        const { error } = await supabase
          .from('saved_cars')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('car_id', String(car.id))
          
        if (error) {
          console.error('Supabase error removing car:', error)
          // Revert optimistic update
          setSavedCars(prev => [...prev, car])
        }
      } catch (e) {
        console.error('Error removing saved car:', e)
        setSavedCars(prev => [...prev, car])
      }
    } else {
      setSavedCars(prev => [...prev, car])
      try {
        const { error } = await supabase
          .from('saved_cars')
          .insert([{
            user_id: currentUser.id,
            car_id: String(car.id),
            car_data: car
          }])
          
        if (error) {
          console.error('Supabase error saving car:', error)
          // Revert optimistic update
          setSavedCars(prev => prev.filter(c => c.id !== car.id))
        }
      } catch (e) {
        console.error('Error saving car:', e)
        setSavedCars(prev => prev.filter(c => c.id !== car.id))
      }
    }
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

  const toggleCompare = (car) => {
    setCompareList(prev => {
      const isComparing = prev.find(c => c.id === car.id)
      if (isComparing) {
        return prev.filter(c => c.id !== car.id)
      } else {
        if (prev.length >= 3) {
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