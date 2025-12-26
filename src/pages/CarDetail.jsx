import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCarContext } from '../context/CarContext'
import './CarDetail.css'

const CarDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { cars } = useCarContext()
  const car = cars.find(c => c.id === id)
  const [selectedImage, setSelectedImage] = useState(0)
  const [showInquiryModal, setShowInquiryModal] = useState(false)

  if (!car) {
    return (
      <div className="car-detail">
        <div className="container">
          <div className="not-found">
            <h2>Car Not Found</h2>
            <p>The car you're looking for doesn't exist.</p>
            <Link to="/buy" className="btn btn-primary">Browse Cars</Link>
          </div>
        </div>
      </div>
    )
  }

  const averageRating = car.reviews.length > 0
    ? (car.reviews.reduce((acc, r) => acc + r.rating, 0) / car.reviews.length).toFixed(1)
    : null

  return (
    <div className="car-detail">
      <div className="container">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back
        </button>

        <div className="car-detail-content">
          {/* Image Gallery */}
          <div className="car-images">
            <div className="main-image">
              <img src={car.images[selectedImage] || car.images[0]} alt={car.name} />
            </div>
            {car.images.length > 1 && (
              <div className="image-thumbnails">
                {car.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                  >
                    <img src={img} alt={`${car.name} ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Car Info */}
          <div className="car-info-section">
            <div className="car-header">
              <div>
                <h1>{car.name}</h1>
                <div className="car-meta">
                  <span>{car.year}</span>
                  <span>•</span>
                  <span>{car.brand}</span>
                  <span>•</span>
                  <span>{car.model}</span>
                </div>
              </div>
              <div className="car-price-large">₹{car.price.toLocaleString('en-IN')}</div>
            </div>

            <div className="car-badge-large">{car.condition}</div>

            <div className="car-specs-grid">
              <div className="spec-item">
                <span className="spec-label">Mileage</span>
                <span className="spec-value">{car.mileage.toLocaleString()} miles</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Transmission</span>
                <span className="spec-value">{car.transmission}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Fuel Type</span>
                <span className="spec-value">{car.fuelType}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Color</span>
                <span className="spec-value">{car.color}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Type</span>
                <span className="spec-value">{car.type}</span>
              </div>
            </div>

            <div className="car-description">
              <h3>Description</h3>
              <p>{car.description}</p>
            </div>

            {car.features && car.features.length > 0 && (
              <div className="car-features">
                <h3>Features</h3>
                <div className="features-list">
                  {car.features.map((feature, index) => (
                    <span key={index} className="feature-badge">{feature}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="seller-info">
              <h3>Seller Information</h3>
              <div className="seller-details">
                <div>
                  <strong>{car.seller.name}</strong>
                  <p><span className="location-icon-small"></span> {car.seller.location}</p>
                  {car.seller.rating && (
                    <div className="seller-rating">
                      {'★'.repeat(Math.round(car.seller.rating))} {car.seller.rating}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="car-actions">
              <button onClick={() => setShowInquiryModal(true)} className="btn btn-primary">
                Contact Seller
              </button>
              <Link to="/price-predictor" className="btn btn-outline">
                Get Price Estimate
              </Link>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {car.reviews && car.reviews.length > 0 && (
          <section className="reviews-section">
            <h2>Customer Reviews</h2>
            <div className="reviews-header">
              {averageRating && (
                <div className="average-rating">
                  <div className="rating-large">{averageRating}</div>
                  <div className="rating-stars">{'★'.repeat(Math.round(parseFloat(averageRating)))}</div>
                  <div className="rating-count">{car.reviews.length} review{car.reviews.length !== 1 ? 's' : ''}</div>
                </div>
              )}
            </div>
            <div className="reviews-list">
              {car.reviews.map((review) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="review-card"
                >
                  <div className="review-header">
                    <strong>{review.user}</strong>
                    <div className="review-rating">{'★'.repeat(review.rating)}</div>
                  </div>
                  <p className="review-date">{new Date(review.date).toLocaleDateString()}</p>
                  <p className="review-comment">{review.comment}</p>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {showInquiryModal && (
          <div className="modal-overlay" onClick={() => setShowInquiryModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="inquiry-modal"
            >
              <div className="modal-header">
                <h3>Contact Seller</h3>
                <button onClick={() => setShowInquiryModal(false)} className="close-button">×</button>
              </div>
              <form className="inquiry-form">
                <div className="form-group">
                  <label>Your Name *</label>
                  <input type="text" required />
                </div>
                <div className="form-group">
                  <label>Your Email *</label>
                  <input type="email" required />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" />
                </div>
                <div className="form-group">
                  <label>Message *</label>
                  <textarea rows="5" required placeholder="Ask about the car, schedule a viewing, etc." />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">Send Inquiry</button>
                  <button type="button" onClick={() => setShowInquiryModal(false)} className="btn btn-outline">Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CarDetail

