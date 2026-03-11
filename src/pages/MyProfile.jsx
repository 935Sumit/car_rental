import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useCarContext } from '../context/CarContext'
import { HiCheckCircle, HiUser, HiMail, HiPhone, HiBadgeCheck } from 'react-icons/hi'
import './MyProfile.css'

const MyProfile = () => {
    const { bookings, savedCars } = useCarContext()
    const [user, setUser] = useState(null)
    const [isEditingLicense, setIsEditingLicense] = useState(false)
    const [licenseInput, setLicenseInput] = useState('')

    useEffect(() => {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'))
        if (currentUser) {
            setUser(currentUser)
            setLicenseInput(currentUser.licenseNumber || '')
        }
    }, [])

    const handleSaveLicense = () => {
        const licenseRegex = /^GJ-[0-9]{2}-[0-9]{4}-[0-9]{7}$/

        if (!licenseInput.trim()) {
            alert('Please enter a valid license number')
            return
        }

        if (!licenseRegex.test(licenseInput.trim())) {
            alert('Invalid license format. Use GJ-05-2023-1234567 format.')
            return
        }

        const updatedUser = { ...user, licenseNumber: licenseInput.trim() }
        setUser(updatedUser)
        localStorage.setItem('currentUser', JSON.stringify(updatedUser))

        // Also update in users list to persist across logins
        const users = JSON.parse(localStorage.getItem('users') || '[]')
        const updatedUsers = users.map(u => u.email === updatedUser.email ? updatedUser : u)
        localStorage.setItem('users', JSON.stringify(updatedUsers))

        setIsEditingLicense(false)
    }

    const handleRemoveLicense = () => {
        if (window.confirm('Are you sure you want to remove your driving license? You will not be able to book any cars until you add it back.')) {
            const updatedUser = { ...user, licenseNumber: '' }
            setUser(updatedUser)
            setLicenseInput('')
            localStorage.setItem('currentUser', JSON.stringify(updatedUser))

            const users = JSON.parse(localStorage.getItem('users') || '[]')
            const updatedUsers = users.map(u => u.email === updatedUser.email ? updatedUser : u)
            localStorage.setItem('users', JSON.stringify(updatedUsers))
        }
    }

    if (!user) return <div className="loading">Loading Profile...</div>

    const userBookings = bookings.filter(b => b.userEmail === user.email)
    const firstName = user.fullName ? user.fullName.split(' ')[0] : 'User'

    return (
        <div className="profile-page">
            <div className="container">
                <header className="profile-header">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="profile-avatar-large"
                    >
                        {firstName.charAt(0)}
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {user.fullName}
                    </motion.h1>
                    <p className="profile-subtitle">Member of Vintage Rides Hub</p>
                </header>

                <div className="profile-grid">
                    <motion.section
                        className="profile-section"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h3>Personal Information</h3>
                        <div className="info-item">
                            <span className="info-label"><HiUser /> Full Name</span>
                            <span className="info-value">{user.fullName}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label"><HiMail /> Email Address</span>
                            <span className="info-value">{user.email}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label"><HiPhone /> Phone Number</span>
                            <span className="info-value">{user.phone}</span>
                        </div>
                    </motion.section>

                    <motion.section
                        className="profile-section"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0 }}>Driving Details</h3>
                            {!isEditingLicense && user.licenseNumber && (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="btn-edit-small" onClick={() => setIsEditingLicense(true)}>Edit License</button>
                                    <button className="btn-remove-small" onClick={handleRemoveLicense}>Remove Licence</button>
                                </div>
                            )}
                        </div>

                        {isEditingLicense ? (
                            <div className="license-edit-form">
                                <div className="info-item">
                                    <span className="info-label">License Number</span>
                                    <input
                                        type="text"
                                        className="license-input"
                                        value={licenseInput}
                                        onChange={(e) => setLicenseInput(e.target.value)}
                                        placeholder="GJ-05-2023-1234567"
                                        autoFocus
                                    />
                                </div>
                                <div className="form-actions-row">
                                    <button className="btn btn-primary btn-small" onClick={handleSaveLicense}>Save License</button>
                                    <button className="btn btn-outline btn-small" onClick={() => setIsEditingLicense(false)}>Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <div className="license-display">
                                <div className="info-item">
                                    <span className="info-label">License Number</span>
                                    <span className="info-value">{user.licenseNumber || 'Not added'}</span>
                                </div>

                                {!user.licenseNumber ? (
                                    <div className="license-missing-warning">
                                        <p className="warning-text">You must add a valid driving license to rent a car.</p>
                                        <p className="requirement-text">Age Requirement: 18+</p>
                                        <button className="btn btn-primary btn-small" style={{ marginTop: '15px' }} onClick={() => setIsEditingLicense(true)}>
                                            Add License
                                        </button>
                                    </div>
                                ) : (
                                    <div className="info-notice verified">
                                        <HiBadgeCheck className="notice-icon" />
                                        <div className="notice-text">
                                            <p>Age Requirement: 18+ Verified</p>
                                            <span className="notice-sub">Identification confirmed.</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.section>

                    <motion.section
                        className="profile-section"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0, transition: { delay: 0.1 } }}
                    >
                        <h3>Account Summary</h3>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <span className="stat-count">{userBookings.length}</span>
                                <span className="stat-label">Total Bookings</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-count">{savedCars.length}</span>
                                <span className="stat-label">Saved Cars</span>
                            </div>
                        </div>
                    </motion.section>
                </div>

                <div className="profile-actions">
                    <button className="btn btn-outline" onClick={() => alert('Full profile editing is coming soon!')}>
                        Change Password
                    </button>
                </div>
            </div>
        </div>
    )
}

export default MyProfile
