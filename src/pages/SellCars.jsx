import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCarContext } from '../context/CarContext'
import { brands, conditions, fuelTypes, transmissions, carTypes } from '../data/mockData'
import './SellCars.css'

const SellCars = () => {
  const navigate = useNavigate()
  const { addCar } = useCarContext()
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    year: '',
    price: '',
    condition: '',
    type: '',
    mileage: '',
    fuelType: '',
    transmission: '',
    color: '',
    description: '',
    images: []
  })
  const [imageUrls, setImageUrls] = useState(['', '', ''])
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleImageUrlChange = (index, value) => {
    const newUrls = [...imageUrls]
    newUrls[index] = value
    setImageUrls(newUrls)
    setFormData({ ...formData, images: newUrls.filter(url => url.trim()) })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const carData = {
      ...formData,
      year: parseInt(formData.year),
      price: parseFloat(formData.price),
      mileage: parseInt(formData.mileage),
      images: formData.images.length > 0 ? formData.images : ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800'],
      features: [],
      seller: {
        name: 'You',
        location: 'Your Location',
        rating: 5.0
      },
      reviews: []
    }
    addCar(carData)
    setSubmitted(true)
    setTimeout(() => {
      navigate('/buy')
    }, 2000)
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i)

  if (submitted) {
    return (
      <div className="sell-cars">
        <div className="submission-success">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="success-content"
          >
            <div className="success-icon">
              <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="white"/>
              </svg>
            </div>
            <h2>Listing Submitted Successfully!</h2>
            <p>Your car has been added to our marketplace.</p>
            <p>Redirecting to browse cars...</p>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="sell-cars">
      <div className="page-header">
        <div className="container">
          <h1>Sell Your Vintage Car</h1>
          <p>List your classic car and connect with passionate buyers</p>
        </div>
      </div>

      <div className="container">
        <div className="sell-form-container">
          <motion.form
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            onSubmit={handleSubmit}
            className="sell-form"
          >
            <div className="form-section">
              <h3>Basic Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Car Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g., 1967 Ford Mustang"
                  />
                </div>
                <div className="form-group">
                  <label>Brand *</label>
                  <select
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Brand</option>
                    {brands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Model *</label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Mustang"
                  />
                </div>
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
              </div>
            </div>

            <div className="form-section">
              <h3>Pricing & Condition</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Price (INR) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="10000"
                    placeholder="500000"
                  />
                </div>
                <div className="form-group">
                  <label>Condition *</label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Condition</option>
                    {conditions.map(condition => (
                      <option key={condition} value={condition}>{condition}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Mileage *</label>
                  <input
                    type="number"
                    name="mileage"
                    value={formData.mileage}
                    onChange={handleChange}
                    required
                    min="0"
                    placeholder="45000"
                  />
                </div>
                <div className="form-group">
                  <label>Type *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Type</option>
                    {carTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Specifications</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Fuel Type *</label>
                  <select
                    name="fuelType"
                    value={formData.fuelType}
                    onChange={handleChange}
                    required
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
                  >
                    <option value="">Select Transmission</option>
                    {transmissions.map(trans => (
                      <option key={trans} value={trans}>{trans}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Color *</label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Red"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Images</h3>
              <p className="form-help">Add image URLs (at least 1 recommended)</p>
              <div className="image-inputs">
                {imageUrls.map((url, index) => (
                  <div key={index} className="form-group">
                    <label>Image {index + 1} URL</label>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => handleImageUrlChange(index, e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="form-section">
              <h3>Description</h3>
              <div className="form-group">
                <label>Detailed Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="6"
                  placeholder="Describe your car's history, condition, features, and any special details..."
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Submit Listing
              </button>
              <button
                type="button"
                onClick={() => navigate('/buy')}
                className="btn btn-outline"
              >
                Cancel
              </button>
            </div>
          </motion.form>
        </div>
      </div>
    </div>
  )
}

export default SellCars

