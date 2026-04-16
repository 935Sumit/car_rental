import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useCarContext } from '../context/CarContext'
import SearchBar from '../components/SearchBar'

import ComparisonBar from '../components/ComparisonBar'
import CompareModal from '../components/CompareModal'
import { HiLocationMarker, HiBookmark } from 'react-icons/hi'
import { MdWavingHand, MdCompareArrows } from 'react-icons/md'
import { useAuth } from '../context/AuthContext'
import './Home.css'

const Home = () => {
  const navigate = useNavigate()
  const { 
    filteredRentals, 
    searchQuery, 
    setSearchQuery, 
    typeFilter, 
    setTypeFilter, 
    rentals, 
    toggleSaveCar, 
    isCarSaved, 
    compareList, 
    toggleCompare,
    filterDate,
    setFilterDate,
    filterEndDate,
    setFilterEndDate,
    loading,
    error: contextError
  } = useCarContext()
  const { isLoggedIn } = useAuth()
  const [showCompareModal, setShowCompareModal] = useState(false)
  const [error] = useState('')

  const carTypes = ['All', 'Hatchback', 'Sedan', 'SUV', 'Luxury']

  const handleViewDetails = (carId) => {
    navigate(`/car/${carId}`)
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  }

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          {localStorage.getItem('currentUser') && (() => {
            const user = JSON.parse(localStorage.getItem('currentUser'));
            const firstName = user.fullName ? user.fullName.split(' ')[0] : 'User';
            return (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="user-greeting"
                style={{ marginBottom: '10px', fontWeight: '700', color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                Hello, {firstName} <MdWavingHand />
              </motion.p>
            );
          })()}
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Find Your <span className="gradient-text">Perfect Ride</span> in Anand
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Explore our curated collection of premium rental cars. From city hatchbacks to luxury sedans, we have it all.
          </motion.p>

          <div className="hero-search-container">
            <div className="unified-search-bar">
              <div className="search-input-group">
                <input
                  type="text"
                  placeholder="Search brand, model or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="date-input-group">
                <div className="date-field">
                  <label>Pickup</label>
                  <input 
                    type="date" 
                    value={filterDate} 
                    onChange={(e) => setFilterDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="date-separator">→</div>
                <div className="date-field">
                  <label>Return</label>
                  <input 
                    type="date" 
                    value={filterEndDate} 
                    onChange={(e) => setFilterEndDate(e.target.value)}
                    min={filterDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              <div className="search-actions">
                <button className="btn-hero-search">Search Car</button>
              </div>
            </div>
            {(filterDate || filterEndDate || searchQuery) && (
              <button className="clear-all-home" onClick={() => { setFilterDate(''); setFilterEndDate(''); setSearchQuery(''); }}>
                Reset Filters
              </button>
            )}
          </div>

          {error && (
            <motion.div
              className="global-error-banner"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}
        </div>
      </section>

      {/* Filter Chips */}
      <section className="filters-section">
        <div className="container">
          <div className="filter-chips">
            {carTypes.map(type => (
              <button
                key={type}
                className={`filter-chip ${typeFilter === type ? 'active' : ''}`}
                onClick={() => setTypeFilter(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Car Grid */}
      <section className="car-listing" id="rentals">
        <div className="container">
          {contextError && <div className="error-banner">{contextError}</div>}
          
          {loading ? (
            <div className="loading-state">
              <div className="loader"></div>
              <p>Fetching your fleet...</p>
            </div>
          ) : (
            <>
              <motion.div
                className="rental-cards-grid"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {filteredRentals.map(car => (
                  <motion.div
                    key={car.id}
                    variants={cardVariants}
                    className="rental-card-home"
                    onClick={() => handleViewDetails(car.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="rc-image-wrapper">
                      <img src={car.image} alt={car.name} className="rc-image" />
                      <div className={`rc-availability ${car.status === 'available' || (!car.status && car.availability) ? 'available' : 'unavailable'}`}>
                        {car.status === 'maintenance' ? 'Under Maintenance' : (car.status === 'booked' || (!car.status && !car.availability)) ? 'Not Available' : 'Available'}
                      </div>
                      <div className="rc-type-badge">{car.type}</div>
                    </div>

                    <div className="rc-body">
                      <div className="rc-header">
                        <h3 className="rc-name">{car.name}</h3>
                        <div className="rc-specs">
                          {car.fuel && <span>{car.fuel}</span>}
                          {car.fuel && (car.transmission || car.seats) && <span className="separator">•</span>}
                          {car.transmission && <span>{car.transmission}</span>}
                          {car.transmission && car.seats && <span className="separator">•</span>}
                          {car.seats && <span>{car.seats} Seater</span>}
                        </div>
                        <span className="rc-brand">{car.brand}</span>
                      </div>

                      <div className="rc-info">
                        <div className="rc-location">
                          <HiLocationMarker />
                          {car.city}
                        </div>
                      </div>

                      <div className="rc-price-section">
                        <span className="rc-price">₹{car.pricePerDay}</span>
                        <span className="rc-label">/ day</span>
                      </div>

                      <div className="rc-actions">
                        {isLoggedIn && (
                          <button
                            className={`btn-save-bookmark ${isCarSaved(car.id) ? 'saved' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleSaveCar(car)
                            }}
                            title={isCarSaved(car.id) ? 'Remove from Saved' : 'Save for Later'}
                          >
                            <HiBookmark />
                          </button>
                        )}
                        <button
                          className={`btn-compare-card ${compareList.some(c => c.id === car.id) ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleCompare(car)
                          }}
                          title="Compare this car"
                        >
                          <MdCompareArrows />
                        </button>
                        <button
                          className="btn-book"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewDetails(car.id)
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {filteredRentals.length === 0 && (
                <div className="no-results">
                  <h3>No cars found matching your search.</h3>
                  <p>Try searching for a different brand or type.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>



      <ComparisonBar onCompare={() => setShowCompareModal(true)} />

      {showCompareModal && (
        <CompareModal
          cars={compareList}
          onClose={() => setShowCompareModal(false)}
          onRemove={toggleCompare}
        />
      )}
    </div>
  )
}

export default Home
