import { useState } from 'react'
import { motion } from 'framer-motion'
import { useCarContext } from '../context/CarContext'
import BookingModal from '../components/BookingModal'
import './RentCars.css'

const RentCars = () => {
  const { rentals } = useCarContext()
  const [selectedRental, setSelectedRental] = useState(null)
  const [showBookingModal, setShowBookingModal] = useState(false)

  const handleBookNow = (rental) => {
    setSelectedRental(rental)
    setShowBookingModal(true)
  }

  return (
    <div className="rent-cars">
      <div className="page-header">
        <div className="container">
          <h1>Rent Vintage Cars</h1>
          <p>Make your special occasion unforgettable with our classic car rentals</p>
        </div>
      </div>

      <div className="container">
        <div className="rental-info-section">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="info-card"
          >
            <h3>Why Rent from Us?</h3>
            <ul>
              <li><span className="check-icon"></span> Fully insured vehicles</li>
              <li><span className="check-icon"></span> Professional drivers available</li>
              <li><span className="check-icon"></span> Perfect for weddings, photo shoots, and events</li>
              <li><span className="check-icon"></span> Flexible rental periods</li>
              <li><span className="check-icon"></span> Competitive pricing</li>
            </ul>
          </motion.div>
        </div>

        <div className="rentals-grid">
          {rentals.map((rental, index) => (
            <motion.div
              key={rental.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="rental-card"
            >
              <div className="rental-image">
                <img src={rental.images[0]} alt={rental.name} />
                <div className={`rental-badge ${rental.availability ? 'available' : 'unavailable'}`}>
                  {rental.availability ? 'Available' : 'Unavailable'}
                </div>
              </div>
              <div className="rental-info">
                <h3>{rental.name}</h3>
                <div className="rental-details">
                  <span>{rental.year}</span>
                  <span>•</span>
                  <span>{rental.type}</span>
                  <span>•</span>
                  <span>{rental.color}</span>
                </div>
                <p className="rental-description">{rental.description}</p>
                <div className="rental-features">
                  {rental.features.map((feature, idx) => (
                    <span key={idx} className="feature-tag">{feature}</span>
                  ))}
                </div>
                <div className="rental-rates">
                  <div className="rate-item">
                    <span className="rate-label">Daily Rate</span>
                    <span className="rate-value">₹{rental.dailyRate}/day</span>
                  </div>
                  <div className="rate-item">
                    <span className="rate-label">Weekly Rate</span>
                    <span className="rate-value">₹{rental.weeklyRate}/week</span>
                  </div>
                </div>
                <div className="rental-location">
                  <span className="location-icon-small"></span> {rental.location}
                </div>
                {rental.reviews.length > 0 && (
                  <div className="rental-reviews-preview">
                    <div className="rating">
                      {'★'.repeat(Math.round(rental.reviews.reduce((acc, r) => acc + r.rating, 0) / rental.reviews.length))}
                    </div>
                    <span>{rental.reviews.length} review{rental.reviews.length !== 1 ? 's' : ''}</span>
                  </div>
                )}
                <button
                  onClick={() => handleBookNow(rental)}
                  className="btn btn-primary"
                  disabled={!rental.availability}
                >
                  {rental.availability ? 'Book Now' : 'Unavailable'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {rentals.length === 0 && (
          <div className="no-rentals">
            <p>No rental cars available at the moment.</p>
            <p>Check back soon for new listings!</p>
          </div>
        )}
      </div>

      {showBookingModal && selectedRental && (
        <BookingModal
          rental={selectedRental}
          onClose={() => {
            setShowBookingModal(false)
            setSelectedRental(null)
          }}
        />
      )}
    </div>
  )
}

export default RentCars

