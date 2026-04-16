import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCarContext } from '../context/CarContext'
import BookingModal from '../components/BookingModal'
import { HiLocationMarker, HiCheckCircle, HiChartBar, HiBookmark, HiXCircle, HiTrash, HiPencil } from 'react-icons/hi'
import Toast from '../components/Toast'
import { useAuth } from '../context/AuthContext'
import { FaGasPump, FaGear, FaChair, FaStar, FaRegStar } from 'react-icons/fa6'
import './CarDetails.css'

const CarDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { rentals, toggleSaveCar, isCarSaved, reviews, addReview, checkAvailability, deleteReview, updateReview } = useCarContext()
    const { currentUser } = useAuth()
    const [car, setCar] = useState(null)
    const [agreed, setAgreed] = useState(false)
    const [showBookingModal, setShowBookingModal] = useState(false)
    const [toast, setToast] = useState(null)
    const [checkDates, setCheckDates] = useState({ start: '', end: '' })
    const [availabilityResult, setAvailabilityResult] = useState(null)
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' })
    const [submittingReview, setSubmittingReview] = useState(false)
    const [editingReviewId, setEditingReviewId] = useState(null)
    const [editForm, setEditForm] = useState({ rating: 5, comment: '' })
    const [visibleReviewsCount, setVisibleReviewsCount] = useState(5)

    useEffect(() => {
        const foundCar = rentals.find(r => r.id === id)
        if (foundCar) {
            setCar(foundCar)
        }
        setAvailabilityResult(null)
        setCheckDates({ start: '', end: '' })
        window.scrollTo(0, 0)
    }, [id, rentals, navigate])

    if (!car) return <div className="loading">Loading...</div>

    const handleBookNow = () => {
        if (!currentUser) {
            setToast({ message: 'Please login to book a car!', type: 'warning' })
            setTimeout(() => navigate('/login'), 1500)
            return
        }
        setShowBookingModal(true)
    }

    const performCheck = () => {
        if (!checkDates.start || !checkDates.end) {
            setToast({ message: 'Please select both dates', type: 'warning' })
            return
        }
        const available = checkAvailability(car.id, checkDates.start, checkDates.end)
        setAvailabilityResult(available ? 'available' : 'booked')
    }



    const features = [
        'Air Conditioning',
        'Power Steering',
        'Central Locking',
        'Music System',
        'ABS',
        'Airbags'
    ]

    const carReviews = reviews.filter(r => r.car_id === car.id)
    const averageRating = carReviews.length > 0 
        ? (carReviews.reduce((acc, curr) => acc + curr.rating, 0) / carReviews.length).toFixed(1)
        : 0

    const handleSubmitReview = async (e) => {
        e.preventDefault()
        if (!currentUser) {
            setToast({ message: 'Please login to leave a review!', type: 'warning' })
            return
        }
        if (!newReview.comment.trim()) {
            setToast({ message: 'Please write a comment', type: 'warning' })
            return
        }

        setSubmittingReview(true)
        const reviewData = {
            car_id: car.id,
            user_id: currentUser.id,
            user_name: currentUser.fullName || currentUser.username || 'Anonymous User',
            rating: newReview.rating,
            comment: newReview.comment,
            created_at: new Date().toISOString()
        }

        const { error } = await addReview(reviewData)
        if (error) {
            setToast({ message: 'Failed to submit review', type: 'error' })
        } else {
            setToast({ message: 'Review submitted successfully!', type: 'success' })
            setNewReview({ rating: 5, comment: '' })
        }
        setSubmittingReview(false)
    }

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return
        const { error } = await deleteReview(reviewId)
        if (error) {
            setToast({ message: 'Failed to delete review', type: 'error' })
        } else {
            setToast({ message: 'Review deleted', type: 'success' })
        }
    }

    const handleStartEdit = (review) => {
        setEditingReviewId(review.id)
        setEditForm({ rating: review.rating, comment: review.comment })
    }

    const handleUpdateReview = async (e) => {
        e.preventDefault()
        const { error } = await updateReview(editingReviewId, {
            rating: editForm.rating,
            comment: editForm.comment
        })
        if (error) {
            setToast({ message: 'Failed to update review', type: 'error' })
        } else {
            setToast({ message: 'Review updated!', type: 'success' })
            setEditingReviewId(null)
        }
    }

    return (
        <div className="car-details-page">
            <div className="container">
                <div className="details-grid">
                    {/* Left Column: Images */}
                    <div className="details-visual">
                        <motion.div
                            className="main-image-container"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <img src={car.image} alt={car.name} className="main-image" />
                        </motion.div>

                        <div className="features-grid-left">
                            <h3>Key Features</h3>
                            <div className="features-list">
                                {features.map(f => (
                                    <div key={f} className="feature-chip">
                                        <HiCheckCircle className="feature-icon" /> {f}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="quick-check-section">
                            <h3>Quick Availability Check</h3>
                            <div className="check-inputs">
                                <div className="check-group">
                                    <label>From</label>
                                    <input 
                                        type="date" 
                                        value={checkDates.start} 
                                        onChange={(e) => { setCheckDates(prev => ({ ...prev, start: e.target.value })); setAvailabilityResult(null); }}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                <div className="check-group">
                                    <label>To</label>
                                    <input 
                                        type="date" 
                                        value={checkDates.end} 
                                        onChange={(e) => { setCheckDates(prev => ({ ...prev, end: e.target.value })); setAvailabilityResult(null); }}
                                        min={checkDates.start || new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                <button className="btn-check-avail" onClick={performCheck} type="button">
                                    Check
                                </button>
                            </div>
                            {availabilityResult && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={`check-result ${availabilityResult}`}
                                >
                                    {availabilityResult === 'available' ? (
                                        <><HiCheckCircle /> Great news! This car is free for these dates.</>
                                    ) : (
                                        <><HiXCircle /> Sorry, the car is already reserved for this period.</>
                                    )}
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Information */}
                    <div className="details-info">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <div className="details-header">
                                <div className="title-section">
                                    <div className="badge-group">
                                        <span className="brand-tag">{car.brand}</span>
                                        {car.chauffeurAvailable && (
                                            <span className="chauffeur-badge">Chauffeur Available</span>
                                        )}
                                    </div>
                                    <h1>{car.name}</h1>
                                    <p className="location-info">
                                        <HiLocationMarker /> {car.city}, India
                                    </p>
                                </div>
                            </div>

                            <div className="specs-strip">
                                <div className="spec-item">
                                    <span className="spec-icon"><FaGasPump /></span>
                                    <span className="spec-text">{car.fuel}</span>
                                </div>
                                <div className="spec-item">
                                    <span className="spec-icon"><FaGear /></span>
                                    <span className="spec-text">{car.transmission}</span>
                                </div>
                                <div className="spec-item">
                                    <span className="spec-icon"><FaChair /></span>
                                    <span className="spec-text">{car.seats} Seats</span>
                                </div>
                                <div className="spec-item">
                                    <span className="spec-icon"><HiChartBar /></span>
                                    <span className="spec-text">{car.mileage || '18-22'} km/l</span>
                                </div>
                            </div>

                            <div className="price-card">
                                <div className="price-big">₹{car.pricePerDay}</div>
                                <div className="price-label">Per Day Rental</div>
                            </div>

                            <div className="description-section">
                                <h3>About this Car</h3>
                                <p>{car.description}</p>
                            </div>

                            <div className="terms-section">
                                <h3>Terms & Conditions</h3>
                                <ul className="policy-list">
                                    <li>Price does not include state tolls and permits.</li>
                                    <li><strong>Cancellation:</strong> 48+ hours before start → Full refund</li>
                                    <li><strong>Cancellation:</strong> Within 48 hours → No refund</li>
                                    <li>Late return fee: <strong>₹300/hour</strong></li>
                                    <li>Damage liability minimum: <strong>₹10,000</strong></li>
                                    <li>Age limit: <strong>18+</strong> (License compulsory)</li>
                                </ul>

                                 <label className="agreed-checkbox">
                                     <input
                                         type="checkbox"
                                         checked={agreed}
                                         onChange={(e) => setAgreed(e.target.checked)}
                                     />
                                     <span>I agree to the terms & conditions</span>
                                 </label>
                             </div>

                            <div className="action-buttons-group">
                                <button
                                    className="btn-book-now-large"
                                    disabled={!agreed || (car.status ? car.status !== 'available' : car.availability === false)}
                                    onClick={handleBookNow}
                                >
                                    {car.status === 'maintenance' ? 'Under Maintenance' : car.status === 'booked' ? 'Currently Unavailable' : 'Book Now'}
                                </button>
                                <button
                                    className={`btn-save-detail ${isCarSaved(car.id) ? 'saved' : ''}`}
                                    onClick={() => toggleSaveCar(car)}
                                    title={isCarSaved(car.id) ? 'Remove from Saved' : 'Save for Later'}
                                >
                                    <HiBookmark className="save-icon" />
                                    {isCarSaved(car.id) ? 'Saved' : 'Save Car'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="reviews-section">
                    <div className="reviews-header">
                        <h2>Customer Reviews</h2>
                        {carReviews.length > 0 && (
                            <div className="avg-rating-display">
                                <span className="avg-num">{averageRating}</span>
                                <div className="stars">
                                    {[...Array(5)].map((_, i) => (
                                        i < Math.floor(averageRating) ? <FaStar key={i} className="star-filled" /> : <FaRegStar key={i} />
                                    ))}
                                </div>
                                <span className="total-reviews">({carReviews.length} reviews)</span>
                            </div>
                        )}
                    </div>

                    <div className="reviews-container">
                        <div className="reviews-list">
                            {carReviews.length === 0 ? (
                                <div className="no-reviews">
                                    <p>No reviews yet. Be the first to review this car!</p>
                                </div>
                            ) : (
                                <>
                                    {carReviews.slice(0, visibleReviewsCount).map((review, idx) => (
                                        <motion.div 
                                            key={review.id || idx} 
                                            className="review-card"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                        >
                                            <div className="review-user-info">
                                                <div className="user-avatar">
                                                    {review.user_name ? review.user_name.charAt(0).toUpperCase() : 'U'}
                                                </div>
                                                <div className="user-details">
                                                    <div className="user-name">
                                                        {review.user_name}
                                                        {currentUser?.id === review.user_id && <span className="your-review-tag">Your Review</span>}
                                                    </div>
                                                    <div className="review-date">
                                                        {new Date(review.created_at).toLocaleDateString('en-IN', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                    </div>
                                                </div>
                                                <div className="review-rating">
                                                    {[...Array(5)].map((_, i) => (
                                                        i < review.rating ? <FaStar key={i} className="star-filled" /> : <FaRegStar key={i} />
                                                    ))}
                                                </div>
                                                {currentUser?.id === review.user_id && (
                                                    <div className="review-actions">
                                                        <button onClick={() => handleStartEdit(review)} className="btn-icon-edit"><HiPencil title="Edit Review" /></button>
                                                        <button onClick={() => handleDeleteReview(review.id)} className="btn-icon-delete"><HiTrash title="Delete Review" /></button>
                                                    </div>
                                                )}
                                            </div>
                                            {editingReviewId === review.id ? (
                                                <form className="edit-review-inline" onSubmit={handleUpdateReview}>
                                                    <div className="star-picker small">
                                                        {[1, 2, 3, 4, 5].map(star => (
                                                            <button
                                                                key={star}
                                                                type="button"
                                                                onClick={() => setEditForm(prev => ({ ...prev, rating: star }))}
                                                            >
                                                                {editForm.rating >= star ? <FaStar className="star-filled" /> : <FaRegStar />}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <textarea 
                                                        value={editForm.comment}
                                                        onChange={(e) => setEditForm(prev => ({ ...prev, comment: e.target.value }))}
                                                    />
                                                    <div className="edit-actions">
                                                        <button type="submit" className="btn-save-edit">Save Changes</button>
                                                        <button type="button" onClick={() => setEditingReviewId(null)} className="btn-cancel-edit">Cancel</button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <p className="review-comment">{review.comment}</p>
                                            )}
                                        </motion.div>
                                    ))}
                                    
                                    {carReviews.length > visibleReviewsCount && (
                                        <button 
                                            className="btn-show-more-reviews" 
                                            onClick={() => setVisibleReviewsCount(prev => prev + 5)}
                                        >
                                            Show More Reviews ({carReviews.length - visibleReviewsCount} remaining)
                                        </button>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="add-review-form">
                            <h3>Write a Review</h3>
                            {currentUser ? (
                                <form onSubmit={handleSubmitReview}>
                                    <div className="rating-input">
                                        <label>Rating</label>
                                        <div className="star-picker">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                                                    className={newReview.rating >= star ? 'active' : ''}
                                                >
                                                    {newReview.rating >= star ? <FaStar /> : <FaRegStar />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="comment-input">
                                        <label>Comment</label>
                                        <textarea
                                            placeholder="Share your experience with this car..."
                                            value={newReview.comment}
                                            onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                                            rows="4"
                                            required
                                        ></textarea>
                                    </div>
                                    <button 
                                        type="submit" 
                                        className="btn-submit-review"
                                        disabled={submittingReview}
                                    >
                                        {submittingReview ? 'Submitting...' : 'Post Review'}
                                    </button>
                                </form>
                            ) : (
                                <div className="login-to-review">
                                    <p>Please login to share your experience.</p>
                                    <button onClick={() => navigate('/login')} className="btn-small-link">Login Now</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showBookingModal && (
                <BookingModal
                    rental={car}
                    onClose={() => setShowBookingModal(false)}
                />
            )}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    )
}

export default CarDetails
