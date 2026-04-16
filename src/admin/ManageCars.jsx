import { useState } from 'react'
import { useCarContext } from '../context/CarContext'
import { supabase } from '../supabase/supabaseClient'
import { HiSearch, HiX } from 'react-icons/hi'
import './Dashboard.css'
import './ManageCars.css'

const ManageCars = () => {
    const { rentals, addCar, deleteCar, updateCar, checkAvailability } = useCarContext()
    const [loading, setLoading] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [currentCarId, setCurrentCarId] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterDate, setFilterDate] = useState('')

    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        pricePerDay: '',
        fuel: 'Petrol',
        type: 'Sedan',
        transmission: 'Manual',
        seats: '5',
        location: 'Anand',
        description: '',
        chauffeurAvailable: true,
        mileage: '18',
        status: 'available'
    })
    const [imageFile, setImageFile] = useState(null)


    const handleInputChange = (e) => {
        const { name, value, files } = e.target
        if (name === 'image') {
            setImageFile(files[0])
        } else {
            setFormData(prev => ({ ...prev, [name]: value }))
        }
    }

    const uploadImage = async (file) => {
        try {
            const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`
            const { data, error } = await supabase.storage
                .from('car-images')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (error) {
                console.error("Supabase Storage Error:", error)
                throw new Error(error.message || "Failed to upload image")
            }

            const { data: publicUrlData } = supabase.storage
                .from('car-images')
                .getPublicUrl(fileName)

            return publicUrlData.publicUrl
        } catch (err) {
            console.error("Upload process failed:", err)
            throw err
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            let finalImageUrl = isEditing ? rentals.find(c => c.id === currentCarId)?.image : ''

            if (imageFile) {
                finalImageUrl = await uploadImage(imageFile)
            }

            const { location, ...restFormData } = formData;
            const carData = {
                ...restFormData,
                image: finalImageUrl,
                pricePerDay: Number(formData.pricePerDay),
                seats: Number(formData.seats),
                city: location,
                status: formData.status || 'available',
                availability: formData.status === 'available'
            }

            if (isEditing) {
                await updateCar(currentCarId, carData)
            } else {
                await addCar(carData)
            }
            setShowModal(false)
            resetForm()
        } catch (error) {
            console.error("Error saving car: ", error)
            alert("Failed to save car. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (car) => {
        setFormData({
            name: car.name,
            brand: car.brand,
            pricePerDay: car.pricePerDay.toString(),
            fuel: car.fuel,
            type: car.type || 'Sedan',
            transmission: car.transmission,
            seats: (car.seats || 5).toString(),
            location: car.city || car.location || 'Anand',
            description: car.description || '',
            chauffeurAvailable: car.chauffeurAvailable ?? true,
            mileage: car.mileage || '18',
            status: car.status || (car.availability ? 'available' : 'booked')
        })
        setImageFile(null)
        setCurrentCarId(car.id)
        setIsEditing(true)
        setShowModal(true)
    }

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this car?')) {
            await deleteCar(id)
        }
    }

    const resetForm = () => {
        setFormData({
            name: '',
            brand: '',
            pricePerDay: '',
            fuel: 'Petrol',
            type: 'Sedan',
            transmission: 'Manual',
            seats: '5',
            location: 'Anand',
            description: '',
            chauffeurAvailable: true,
            mileage: '18',
            status: 'available'
        })
        setImageFile(null)
        setIsEditing(false)
        setCurrentCarId(null)
    }

    const q = searchQuery.toLowerCase()
    const filteredCars = rentals.filter(car => {
        const matchesSearch = !q ||
            car.name?.toLowerCase().includes(q) ||
            car.brand?.toLowerCase().includes(q) ||
            car.fuel?.toLowerCase().includes(q) ||
            car.city?.toLowerCase().includes(q) ||
            car.type?.toLowerCase().includes(q) ||
            car.status?.toLowerCase().includes(q)
        
        let isAvailableOnDate = true
        if (filterDate) {
            isAvailableOnDate = checkAvailability(car.id, filterDate, filterDate)
        }

        return matchesSearch && isAvailableOnDate
    })

    return (
        <div className="admin-dashboard">
            <main className="admin-content">
                <div className="manage-cars-page">
                    <header className="admin-header">
                        <div className="page-header-actions">
                            <div>
                                <h1>Manage Cars</h1>
                                <p>Control your vintage fleet and inventory details.</p>
                            </div>
                            <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
                                + Add New Car
                            </button>
                        </div>
                    </header>

                    {/* ── Search Bar ── */}
                    <div className="admin-controls-row">
                        <div className="admin-search-bar">
                            <HiSearch className="admin-search-icon" />
                            <input
                                type="text"
                                placeholder="Search by car name, brand, fuel or city..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="admin-search-input"
                            />
                            {searchQuery && (
                                <button className="admin-search-clear" onClick={() => setSearchQuery('')}>
                                    <HiX />
                                </button>
                            )}
                        </div>

                        <div className="admin-date-filter">
                            <input
                                type="date"
                                value={filterDate}
                                onChange={e => setFilterDate(e.target.value)}
                                className="admin-date-input"
                                min={new Date().toISOString().split('T')[0]}
                            />
                            {filterDate && (
                                <button className="admin-date-clear" onClick={() => setFilterDate('')}>
                                    <HiX />
                                </button>
                            )}
                            <span className="date-label">Check Availability</span>
                        </div>

                        <span className="admin-search-count">
                            {filteredCars.length} / {rentals.length} cars
                        </span>
                    </div>

                    <div className="admin-table-container fade-in-up">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Name</th>
                                    <th>Brand</th>
                                    <th>Price/Day</th>
                                    <th>Fuel</th>
                                    <th>Seats</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCars.length === 0 ? (
                                    <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                                        {searchQuery ? `No cars found matching "${searchQuery}"` : 'No cars found.'}
                                    </td></tr>
                                ) : (
                                    filteredCars.map(car => (
                                        <tr key={car.id}>
                                            <td><img src={car.image} alt={car.name} className="car-thumb" /></td>
                                            <td>{car.name}</td>
                                            <td>{car.brand}</td>
                                            <td>₹{car.pricePerDay}</td>
                                            <td>{car.fuel}</td>
                                            <td>{car.seats}</td>
                                            <td>
                                                <span className={`status-badge ${car.status === 'available' ? 'status-approved' :
                                                        car.status === 'maintenance' ? 'status-cancelled' : 'status-pending'
                                                    }`}>
                                                    {car.status ? car.status.charAt(0).toUpperCase() + car.status.slice(1) : (car.availability ? 'Available' : 'Booked')}
                                                </span>
                                            </td>
                                            <td className="actions-cell">
                                                <div className="action-btns-row">
                                                    <button className="btn-edit" onClick={() => handleEdit(car)}>Edit</button>
                                                    <button className="btn-delete" onClick={() => handleDelete(car.id)}>Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content fade-in-scale">
                        <div className="modal-header">
                            <h2>{isEditing ? 'Edit Car' : 'Add New Car'}</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="admin-form">
                            <div className="car-form-grid">
                                <div className="form-group">
                                    <label>Car Name</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Brand</label>
                                    <input type="text" name="brand" value={formData.brand} onChange={handleInputChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Price Per Day (₹)</label>
                                    <input type="number" name="pricePerDay" value={formData.pricePerDay} onChange={handleInputChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Fuel Type</label>
                                    <select name="fuel" value={formData.fuel} onChange={handleInputChange}>
                                        <option value="Petrol">Petrol</option>
                                        <option value="Diesel">Diesel</option>
                                        <option value="CNG">CNG</option>
                                        <option value="Electric">Electric</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Transmission</label>
                                    <select name="transmission" value={formData.transmission} onChange={handleInputChange}>
                                        <option value="Manual">Manual</option>
                                        <option value="Automatic">Automatic</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>City/Location</label>
                                    <input type="text" name="location" value={formData.location} onChange={handleInputChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Seats</label>
                                    <input type="number" name="seats" value={formData.seats} onChange={handleInputChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Car Type</label>
                                    <select name="type" value={formData.type} onChange={handleInputChange}>
                                        <option value="Hatchback">Hatchback</option>
                                        <option value="Sedan">Sedan</option>
                                        <option value="SUV">SUV</option>
                                        <option value="Luxury">Luxury</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Mileage (km/l)</label>
                                    <input type="text" name="mileage" value={formData.mileage} onChange={handleInputChange} />
                                </div>
                                <div className="form-group">
                                    <label>Chauffeur Service</label>
                                    <select name="chauffeurAvailable" value={formData.chauffeurAvailable} onChange={handleInputChange}>
                                        <option value={true}>Available</option>
                                        <option value={false}>Not Available</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Car Status</label>
                                    <select name="status" value={formData.status} onChange={handleInputChange}>
                                        <option value="available">Available</option>
                                        <option value="booked">Booked</option>
                                        <option value="maintenance">Maintenance</option>
                                    </select>
                                </div>
                                <div className="form-group full-width">
                                    <label>Description</label>
                                    <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" placeholder="Brief description of the car..."></textarea>
                                </div>
                                <div className="form-group full-width">
                                    <label>Car Image {isEditing ? '(Leave empty to keep current)' : ''}</label>
                                    <input type="file" name="image" onChange={handleInputChange} accept="image/*" required={!isEditing} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Saving...' : (isEditing ? 'Update Car' : 'Save Car')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ManageCars
