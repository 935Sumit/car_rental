import { motion, AnimatePresence } from 'framer-motion'
import { HiX, HiCheck, HiXCircle } from 'react-icons/hi'
import { FaGasPump, FaGear, FaChair } from 'react-icons/fa6'
import './CompareModal.css'

const CompareModal = ({ cars, onClose, onRemove }) => {
    if (cars.length === 0) return null

    const specs = [
        { label: 'Brand', key: 'brand' },
        { label: 'Type', key: 'type' },
        { label: 'Fuel', key: 'fuel', icon: <FaGasPump /> },
        { label: 'Transmission', key: 'transmission', icon: <FaGear /> },
        { label: 'Seats', key: 'seats', icon: <FaChair /> },
        { label: 'Price/Day', key: 'pricePerDay', format: (val) => `₹${val.toLocaleString('en-IN')}` },
        { label: 'Chauffeur', key: 'chauffeurAvailable', format: (val) => val ? <HiCheck className="text-success" /> : <HiXCircle className="text-error" /> },
        { label: 'Location', key: 'city' },
    ]

    return (
        <AnimatePresence>
            <div className="compare-overlay" onClick={onClose}>
                <motion.div
                    className="compare-modal"
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="compare-header">
                        <h2>Compare Cars</h2>
                        <button className="close-btn" onClick={onClose}><HiX /></button>
                    </div>

                    <div className="compare-content">
                        <div className="compare-table">
                            {/* Labels Column */}
                            <div className="compare-col labels-col">
                                <div className="car-header-stub"></div>
                                {specs.map(spec => (
                                    <div key={spec.label} className="spec-label">
                                        {spec.icon && <span className="spec-icon">{spec.icon}</span>}
                                        {spec.label}
                                    </div>
                                ))}
                            </div>

                            {/* Cars Columns */}
                            {cars.map(car => (
                                <div key={car.id} className="compare-col car-col">
                                    <div className="car-header-compare">
                                        <button className="remove-car" onClick={() => onRemove(car)}><HiX /></button>
                                        <div className="car-img-container">
                                            <img src={car.image} alt={car.name} />
                                        </div>
                                        <h4>{car.name}</h4>
                                    </div>
                                    {specs.map(spec => (
                                        <div key={spec.label} className="spec-value">
                                            {spec.format ? spec.format(car[spec.key]) : car[spec.key]}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}

export default CompareModal
