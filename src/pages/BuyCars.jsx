import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCarContext } from '../context/CarContext'
import { brands, conditions, fuelTypes, transmissions, carTypes } from '../data/mockData'
import './BuyCars.css'

const BuyCars = () => {
  const { filters, setFilters, getFilteredCars, searchQuery, setSearchQuery } = useCarContext()
  const [showFilters, setShowFilters] = useState(false)
  const filteredCars = getFilteredCars()

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    setFilters({
      brand: '',
      year: '',
      condition: '',
      minPrice: '',
      maxPrice: '',
      type: ''
    })
    setSearchQuery('')
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i)

  return (
    <div className="buy-cars">
      <div className="page-header">
        <div className="container">
          <h1>Buy Used Cars</h1>
          <p>Discover your dream car from our curated collection</p>
        </div>
      </div>

      <div className="container">
        <div className="buy-cars-content">
          {/* Filters Sidebar */}
          <aside className={`filters-sidebar ${showFilters ? 'open' : ''}`}>
            <div className="filters-header">
              <h3>Filters</h3>
              <button onClick={clearFilters} className="clear-filters">Clear All</button>
            </div>

            <div className="filter-group">
              <label>Search</label>
              <input
                type="text"
                placeholder="Search cars..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label>Brand</label>
              <select
                value={filters.brand}
                onChange={(e) => handleFilterChange('brand', e.target.value)}
                className="filter-select"
              >
                <option value="">All Brands</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Year</label>
              <select
                value={filters.year}
                onChange={(e) => handleFilterChange('year', e.target.value)}
                className="filter-select"
              >
                <option value="">All Years</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Condition</label>
              <select
                value={filters.condition}
                onChange={(e) => handleFilterChange('condition', e.target.value)}
                className="filter-select"
              >
                <option value="">All Conditions</option>
                {conditions.map(condition => (
                  <option key={condition} value={condition}>{condition}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="filter-select"
              >
                <option value="">All Types</option>
                {carTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Price Range</label>
              <div className="price-range">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="filter-input"
                />
                <span>to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="filter-input"
                />
              </div>
            </div>
          </aside>

          {/* Results */}
          <main className="results-section">
            <div className="results-header">
              <h2>{filteredCars.length} Cars Found</h2>
              <button
                className="mobile-filter-toggle"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? 'Hide' : 'Show'} Filters
              </button>
            </div>

            {filteredCars.length === 0 ? (
              <div className="no-results">
                <p>No cars found matching your criteria.</p>
                <button onClick={clearFilters} className="btn btn-primary">Clear Filters</button>
              </div>
            ) : (
              <div className="cars-grid">
                {filteredCars.map((car, index) => (
                  <motion.div
                    key={car.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -10 }}
                  >
                    <Link to={`/car/${car.id}`} className="car-card">
                      <div className="car-image">
                        <img src={car.images[0]} alt={car.name} />
                        <div className="car-badge">{car.condition}</div>
                      </div>
                      <div className="car-info">
                        <h3>{car.name}</h3>
                        <div className="car-details">
                          <span>{car.year}</span>
                          <span>•</span>
                          <span>{car.mileage.toLocaleString()} miles</span>
                          <span>•</span>
                          <span>{car.transmission}</span>
                        </div>
                        <div className="car-specs">
                          <span>{car.fuelType}</span>
                          <span>•</span>
                          <span>{car.color}</span>
                        </div>
                        <div className="car-price">₹{car.price.toLocaleString('en-IN')}</div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default BuyCars

