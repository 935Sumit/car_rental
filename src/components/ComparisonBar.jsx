import { motion, AnimatePresence } from 'framer-motion'
import { useCarContext } from '../context/CarContext'
import { HiX } from 'react-icons/hi'
import './ComparisonBar.css'

const ComparisonBar = ({ onCompare }) => {
    const { compareList, toggleCompare } = useCarContext()

    if (compareList.length === 0) return null

    return (
        <AnimatePresence>
            <motion.div
                className="comparison-bar"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
            >
                <div className="bar-content">
                    <div className="selected-cars">
                        {compareList.map(car => (
                            <div key={car.id} className="selected-car-chip">
                                <img src={car.image} alt={car.name} />
                                <span>{car.name}</span>
                                <button onClick={() => toggleCompare(car)}><HiX /></button>
                            </div>
                        ))}
                        {compareList.length < 3 && (
                            <div className="empty-slot">
                                <span>Add up to 3 cars to compare</span>
                            </div>
                        )}
                    </div>
                    <div className="bar-actions">
                        <button
                            className="btn-compare-now"
                            disabled={compareList.length < 2}
                            onClick={onCompare}
                        >
                            Compare Now ({compareList.length})
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}

export default ComparisonBar
