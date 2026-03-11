import { motion } from 'framer-motion'
import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import './AnimatedCarCard.css'

const AnimatedCarCard = ({ car, index = 0, linkTo }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const cardRef = useRef(null)

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setMousePosition({ x, y })
  }

  const handleMouseEnter = () => setIsHovered(true)
  const handleMouseLeave = () => {
    setIsHovered(false)
    setMousePosition({ x: 0, y: 0 })
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  }

  const imageVariants = {
    hover: { scale: 1.15, transition: { duration: 0.4 } },
    initial: { scale: 1 }
  }

  return (
    <motion.div
      ref={cardRef}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: isHovered
          ? `perspective(1000px) rotateY(${mousePosition.x * 10}deg) rotateX(${-mousePosition.y * 10}deg)`
          : 'perspective(1000px) rotateY(0deg) rotateX(0deg)',
        transition: 'transform 0.1s ease-out'
      }}
      className="animated-car-card-wrapper"
    >
      <Link to={linkTo || '/rent'} className="animated-car-card">
        <div className="card-glow" style={{
          background: isHovered
            ? `radial-gradient(circle at ${(mousePosition.x + 0.5) * 100}% ${(mousePosition.y + 0.5) * 100}%, rgba(212, 175, 55, 0.3), transparent 50%)`
            : 'none'
        }} />

        <div className="animated-car-image">
          <motion.img
            src={car.images[0]}
            alt={car.name}
            variants={imageVariants}
            animate={isHovered ? 'hover' : 'initial'}
          />
          <div className="image-overlay" />
          <div className="shimmer" />

          <motion.div
            className="car-badge-animated"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            {car.condition}
          </motion.div>

          {car.type && (
            <motion.div
              className="car-type-badge"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              {car.type}
            </motion.div>
          )}
        </div>

        <div className="animated-car-info">
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {car.name}
          </motion.h3>

          <div className="car-meta">
            <span className="meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {car.year}
            </span>
            <span className="meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {car.mileage?.toLocaleString()} km
            </span>
            <span className="meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              {car.transmission}
            </span>
          </div>

          {car.fuelType && (
            <div className="car-specs-animated">
              <span className="spec-tag">{car.fuelType}</span>
              {car.color && <span className="spec-tag">{car.color}</span>}
            </div>
          )}

          <motion.div
            className="animated-car-price"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            {car.price ? (
              <>₹{car.price.toLocaleString('en-IN')}</>
            ) : car.dailyRate ? (
              <span className="rental-price">
                ₹{car.dailyRate.toLocaleString('en-IN')}<small>/day</small>
              </span>
            ) : null}
          </motion.div>

          <motion.div
            className="view-details-btn"
            whileHover={{ x: 5 }}
          >
            View Details
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </motion.div>
        </div>
      </Link>
    </motion.div>
  )
}

export default AnimatedCarCard
