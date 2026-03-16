import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCarContext } from '../context/CarContext'
import BookingModal from '../components/BookingModal'
import { HiLocationMarker, HiCheckCircle, HiChartBar, HiBookmark } from 'react-icons/hi'
import Toast from '../components/Toast'
import { useAuth } from '../context/AuthContext'
import { FaGasPump, FaGear, FaChair } from 'react-icons/fa6'
import './CarDetails.css'

const CarDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { rentals, toggleSaveCar, isCarSaved } = useCarContext()
    const { currentUser } = useAuth()
    const [car, setCar] = useState(null)
    const [agreed, setAgreed] = useState(false)
    const [showBookingModal, setShowBookingModal] = useState(false)
    const [toast, setToast] = useState(null)

    useEffect(() => {
        const foundCar = rentals.find(r => r.id === id)
        if (foundCar) {
            setCar(foundCar)
        }
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



    const features = [
        'Air Conditioning',
        'Power Steering',
        'Central Locking',
        'Music System',
        'ABS',
        'Airbags'
    ]

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
