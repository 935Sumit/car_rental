import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCarContext } from '../context/CarContext'
import SearchBar from '../components/SearchBar'
import './Home.css'

const Home = () => {
  const { cars, rentals } = useCarContext()
  const featuredCars = cars.slice(0, 6)
  const featuredRentals = rentals.slice(0, 3)

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="hero-text"
          >
            <div className="hero-badge">
              <span>Trusted by 10,000+ customers</span>
            </div>
            <h1>Find Your Perfect Ride</h1>
            <p>Discover premium used cars from trusted sellers across India. Quality assured, transparent pricing, and hassle-free ownership transfer.</p>
            <div className="hero-buttons">
              <Link to="/buy" className="btn btn-primary">Browse Collection</Link>
              <Link to="/sell" className="btn btn-outline">Sell Your Car</Link>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <strong>500+</strong>
                <span>Quality Cars</span>
              </div>
              <div className="stat-item">
                <strong>50+</strong>
                <span>Brands Available</span>
              </div>
              <div className="stat-item">
                <strong>24/7</strong>
                <span>Customer Support</span>
              </div>
            </div>
          </motion.div>
        </div>
        <div className="hero-search">
          <SearchBar />
        </div>
      </section>



      {/* Featured Cars Section */}
      <section className="section featured-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="section-header"
          >
            <h2>Featured Models</h2>
            <p>Handpicked cars that offer great value and quality</p>
          </motion.div>
          <div className="cars-grid">
            {featuredCars.map((car, index) => (
              <motion.div
                key={car.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
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
                    <div className="car-price">₹{car.price.toLocaleString('en-IN')}</div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          <div className="section-footer">
            <Link to="/buy" className="btn btn-primary">View All Cars</Link>
          </div>
        </div>
      </section>

      {/* Rental Section */}
      <section className="section rental-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="section-header"
          >
            <h2>Rent for Special Occasions</h2>
            <p>Make your event unforgettable with our classic car rentals</p>
          </motion.div>
          <div className="rentals-grid">
            {featuredRentals.map((rental, index) => (
              <motion.div
                key={rental.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <Link to={`/rent`} className="rental-card">
                  <div className="rental-image">
                    <img src={rental.images[0]} alt={rental.name} />
                    <div className="rental-badge">Available</div>
                  </div>
                  <div className="rental-info">
                    <h3>{rental.name}</h3>
                    <div className="rental-details">
                      <span>{rental.year}</span>
                      <span>•</span>
                      <span>{rental.type}</span>
                    </div>
                    <div className="rental-rates">
                      <span>₹{rental.dailyRate}/day</span>
                      <span>₹{rental.weeklyRate}/week</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          <div className="section-footer">
            <Link to="/rent" className="btn btn-primary">View All Rentals</Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="cta-content"
          >
            <h2>Know Your Car's Value</h2>
            <p>Use our AI-powered price predictor to get an instant valuation</p>
            <Link to="/price-predictor" className="btn btn-primary">Get Price Estimate</Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Home

