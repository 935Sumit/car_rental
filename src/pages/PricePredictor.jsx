import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { conditions, carTypes } from '../data/mockData'
import './PricePredictor.css'

const API_BASE_URL = 'http://localhost:5000/api'

const PricePredictor = () => {
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    mileage: '',
    fuelType: '',
    transmission: '',
    location: 'Mumbai',
    ownerType: 'First',
    mileageKmpl: '',
    engine: '',
    power: '',
    seats: '5'
  })
  const [predictedPrice, setPredictedPrice] = useState(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState(null)
  const [brands, setBrands] = useState([])
  const [models, setModels] = useState([])
  const [fuelTypes, setFuelTypes] = useState([])
  const [transmissions, setTransmissions] = useState([])
  const [loadingData, setLoadingData] = useState(true)

  // Fetch brands, fuel types, and transmissions from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [brandsRes, fuelTypesRes, transmissionsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/brands`),
          fetch(`${API_BASE_URL}/fuel-types`),
          fetch(`${API_BASE_URL}/transmissions`)
        ])
        
        const brandsData = await brandsRes.json()
        const fuelTypesData = await fuelTypesRes.json()
        const transmissionsData = await transmissionsRes.json()
        
        setBrands(brandsData.brands || [])
        setFuelTypes(fuelTypesData.fuel_types || [])
        setTransmissions(transmissionsData.transmissions || [])
        setLoadingData(false)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load form data. Please ensure the backend API is running.')
        setLoadingData(false)
      }
    }
    
    fetchData()
  }, [])

  // Fetch models when brand changes
  useEffect(() => {
    const fetchModels = async () => {
      if (formData.brand) {
        try {
          const response = await fetch(`${API_BASE_URL}/models/${encodeURIComponent(formData.brand)}`)
          const data = await response.json()
          setModels(data.models || [])
          // Reset model when brand changes
          setFormData(prev => ({ ...prev, model: '' }))
        } catch (err) {
          console.error('Error fetching models:', err)
          setModels([])
        }
      } else {
        setModels([])
      }
    }
    
    fetchModels()
  }, [formData.brand])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    setError(null)
  }

  // Call the real ML model API
  const predictPrice = async () => {
    setIsCalculating(true)
    setError(null)
    setPredictedPrice(null)
    
    try {
      const requestData = {
        brand: formData.brand,
        model: formData.model,
        model_year: parseInt(formData.year),
        milage: formData.mileage.toString(),
        fuel_type: formData.fuelType,
        transmission: formData.transmission,
        location: formData.location || 'Mumbai',
        owner_type: formData.ownerType || 'First',
        mileage_kmpl: formData.mileageKmpl || '15 kmpl',
        engine: formData.engine || '1500 CC',
        power: formData.power || '100 bhp',
        seats: parseInt(formData.seats) || 5
      }
      
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        // Server returned an error status
        const errorMsg = data.error || data.message || `Server error (${response.status})`
        console.error('Prediction API error:', errorMsg, data)
        setError(errorMsg)
        return
      }
      
      if (data.success) {
        setPredictedPrice(data.predicted_price)
      } else {
        setError(data.error || 'Failed to get prediction. Please try again.')
      }
    } catch (err) {
      console.error('Prediction error:', err)
      setError(`Failed to connect to prediction service: ${err.message}. Please ensure the backend API is running on http://localhost:5000`)
    } finally {
      setIsCalculating(false)
    }
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i)

  const isFormValid = formData.brand && formData.model && formData.year && 
                      formData.mileage && formData.fuelType && 
                      formData.transmission

  const locations = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Chennai', 'Kolkata', 'Hyderabad', 'Ahmedabad', 'Kochi', 'Jaipur', 'Coimbatore']
  const ownerTypes = ['First', 'Second', 'Third', 'Fourth & Above']

  return (
    <div className="price-predictor">
      <div className="page-header">
        <div className="container">
          <h1>AI Price Predictor</h1>
          <p>Get an instant valuation for your car using our machine learning model trained on Indian car market data</p>
        </div>
      </div>

      <div className="container">
        <div className="predictor-content">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="predictor-form-section"
          >
            <div className="form-card">
              <h2>Car Details</h2>
              {error && (
                <div className="error-message">
                  ⚠️ {error}
                </div>
              )}
              <form className="predictor-form" onSubmit={(e) => { e.preventDefault(); predictPrice(); }}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Brand *</label>
                    <select
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      required
                      disabled={loadingData}
                    >
                      <option value="">Select Brand</option>
                      {brands.map(brand => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Model *</label>
                    <select
                      name="model"
                      value={formData.model}
                      onChange={handleChange}
                      required
                      disabled={!formData.brand || loadingData}
                    >
                      <option value="">Select Model</option>
                      {models.map(model => (
                        <option key={model} value={model}>{model}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Year *</label>
                    <select
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Year</option>
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Kilometers Driven *</label>
                    <input
                      type="number"
                      name="mileage"
                      value={formData.mileage}
                      onChange={handleChange}
                      required
                      min="0"
                      placeholder="50000"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Fuel Type *</label>
                    <select
                      name="fuelType"
                      value={formData.fuelType}
                      onChange={handleChange}
                      required
                      disabled={loadingData}
                    >
                      <option value="">Select Fuel Type</option>
                      {fuelTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Transmission *</label>
                    <select
                      name="transmission"
                      value={formData.transmission}
                      onChange={handleChange}
                      required
                      disabled={loadingData}
                    >
                      <option value="">Select Transmission</option>
                      {transmissions.map(trans => (
                        <option key={trans} value={trans}>{trans}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Location</label>
                    <select
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                    >
                      {locations.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Owner Type</label>
                    <select
                      name="ownerType"
                      value={formData.ownerType}
                      onChange={handleChange}
                    >
                      {ownerTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Mileage (kmpl)</label>
                    <input
                      type="text"
                      name="mileageKmpl"
                      value={formData.mileageKmpl}
                      onChange={handleChange}
                      placeholder="e.g., 15 kmpl"
                    />
                  </div>
                  <div className="form-group">
                    <label>Engine (CC)</label>
                    <input
                      type="text"
                      name="engine"
                      value={formData.engine}
                      onChange={handleChange}
                      placeholder="e.g., 1500 CC"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Power (bhp)</label>
                    <input
                      type="text"
                      name="power"
                      value={formData.power}
                      onChange={handleChange}
                      placeholder="e.g., 100 bhp"
                    />
                  </div>
                  <div className="form-group">
                    <label>Seats</label>
                    <select
                      name="seats"
                      value={formData.seats}
                      onChange={handleChange}
                    >
                      <option value="2">2</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                      <option value="6">6</option>
                      <option value="7">7</option>
                      <option value="8">8</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!isFormValid || isCalculating || loadingData}
                  className="btn btn-primary predict-button"
                >
                  {isCalculating ? 'Calculating...' : loadingData ? 'Loading...' : 'Predict Price'}
                </button>
              </form>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="prediction-result-section"
          >
            <div className="result-card">
              <h2>Predicted Value</h2>
              {predictedPrice ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="prediction-result"
                >
                  <div className="predicted-price">
                    ₹{predictedPrice.toLocaleString('en-IN')}
                  </div>
                  <p className="prediction-note">
                    This is an estimated value based on machine learning analysis. 
                    Actual market value may vary based on additional factors such as 
                    location, demand, and specific vehicle history.
                  </p>
                  <div className="prediction-factors">
                    <h3>Key Factors Considered:</h3>
                    <ul>
                      <li><span className="check-icon"></span> Vehicle age and condition</li>
                      <li><span className="check-icon"></span> Kilometers driven</li>
                      <li><span className="check-icon"></span> Owner type</li>
                      <li><span className="check-icon"></span> Brand and model popularity</li>
                      <li><span className="check-icon"></span> Fuel efficiency</li>
                      <li><span className="check-icon"></span> Location and market trends</li>
                    </ul>
                  </div>
                </motion.div>
              ) : (
                <div className="no-prediction">
                  <div className="placeholder-icon">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="rgba(212, 175, 55, 0.3)"/>
                    </svg>
                  </div>
                  <p>Fill in the car details and click "Predict Price" to get an AI-powered valuation.</p>
                </div>
              )}
            </div>

            <div className="info-card">
              <h3>How It Works</h3>
              <p>
                Our machine learning model analyzes thousands of Indian car sales to provide 
                accurate price predictions. The model considers multiple factors including age, 
                condition, kilometers driven, owner type, brand, location, and market trends.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default PricePredictor

