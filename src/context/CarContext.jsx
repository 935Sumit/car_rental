import { createContext, useContext, useState, useEffect } from 'react'
import { mockCars, mockRentals } from '../data/mockData'

const CarContext = createContext()

export const useCarContext = () => {
  const context = useContext(CarContext)
  if (!context) {
    throw new Error('useCarContext must be used within CarProvider')
  }
  return context
}

export const CarProvider = ({ children }) => {
  const [cars, setCars] = useState([])
  const [rentals, setRentals] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    brand: '',
    year: '',
    condition: '',
    minPrice: '',
    maxPrice: '',
    type: ''
  })

  useEffect(() => {
    // Load mock data
    setCars(mockCars)
    setRentals(mockRentals)
  }, [])

  const addCar = (car) => {
    const newCar = {
      ...car,
      id: Date.now().toString(),
      dateAdded: new Date().toISOString()
    }
    setCars([...cars, newCar])
    return newCar
  }

  const addRental = (rental) => {
    const newRental = {
      ...rental,
      id: Date.now().toString(),
      dateAdded: new Date().toISOString()
    }
    setRentals([...rentals, newRental])
    return newRental
  }

  const getFilteredCars = () => {
    return cars.filter(car => {
      const matchesSearch = !searchQuery || 
        car.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        car.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        car.model.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesBrand = !filters.brand || car.brand === filters.brand
      const matchesYear = !filters.year || car.year === parseInt(filters.year)
      const matchesCondition = !filters.condition || car.condition === filters.condition
      const matchesMinPrice = !filters.minPrice || car.price >= parseFloat(filters.minPrice)
      const matchesMaxPrice = !filters.maxPrice || car.price <= parseFloat(filters.maxPrice)
      const matchesType = !filters.type || car.type === filters.type

      return matchesSearch && matchesBrand && matchesYear && matchesCondition && 
             matchesMinPrice && matchesMaxPrice && matchesType
    })
  }

  const value = {
    cars,
    rentals,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    addCar,
    addRental,
    getFilteredCars
  }

  return <CarContext.Provider value={value}>{children}</CarContext.Provider>
}

