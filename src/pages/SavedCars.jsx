import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useCarContext } from '../context/CarContext'
import BookingModal from '../components/BookingModal'
import { useState } from 'react'
import './Home.css' // Reuse grid styles

const SavedCars = () => {
    const navigate = useNavigate()
    const { savedCars, toggleSaveCar, rentals } = useCarContext()
    const [selectedRental, setSelectedRental] = useState(null)
    const [showBookingModal, setShowBookingModal] = useState(false)

    const handleViewDetails = (carId) => {
        navigate(`/car/${carId}`)
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    }

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    }

    return (
        <div className="saved-cars-page" style={{ paddingTop: '140px', minHeight: '80vh', background: 'var(--bg-cream)' }}>
            <div className="container">
                <header style={{ marginBottom: '60px', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '3.5rem', marginBottom: '15px', color: 'var(--primary-color)', fontFamily: "'Cormorant Garamond', serif", fontWeight: '800' }}>Your Saved Cars</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', fontWeight: '500' }}>Cars you've saved for later</p>
                </header>

                {savedCars.length === 0 ? (
                    <div className="empty-state" style={{ textAlign: 'center', padding: '100px 40px', background: '#fff', borderRadius: '24px', border: '1px solid var(--accent-color)', boxShadow: '0 10px 30px rgba(88, 71, 56, 0.05)' }}>
                        <div style={{ fontSize: '5rem', marginBottom: '25px' }}>🔖</div>
                        <h3 style={{ color: 'var(--primary-color)', fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem' }}>No cars saved for later.</h3>
                        <p style={{ marginBottom: '40px', color: 'var(--text-secondary)', fontWeight: '500' }}>Browse our collection and save cars you like!</p>
                        <a href="/" className="btn-book" style={{ display: 'inline-block', width: 'auto', padding: '14px 40px' }}>Browse Cars</a>
                    </div>
                ) : (
                    <motion.div
                        className="rental-cards-grid"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {savedCars.map(carObj => {
                            const car = rentals.find(r => r.id === carObj.id) || carObj
                            return (
                                <motion.div
                                    key={car.id}
                                    variants={cardVariants}
                                    className="rental-card-home"
                                    onClick={() => handleViewDetails(car.id)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="rc-image-wrapper">
                                        <img src={car.image} alt={car.name} className="rc-image" />
                                        <div className={`rc-availability ${car.availability ? 'available' : 'unavailable'}`}>
                                            {car.availability ? 'Available' : 'Booked'}
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

                                        <div className="rc-price-section">
                                            <span className="rc-price">₹{car.pricePerDay}</span>
                                            <span className="rc-label">/ day</span>
                                        </div>

                                        <div className="rc-actions">
                                            <button
                                                className="btn-save-bookmark saved"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    toggleSaveCar(car)
                                                }}
                                                title="Remove from Saved"
                                            >
                                                <svg viewBox="0 0 24 24">
                                                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                                                </svg>
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
                            )
                        })}
                    </motion.div>
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

export default SavedCars
