import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useCarContext } from '../context/CarContext'
import { supabase } from '../supabase/supabaseClient'
import { HiUser, HiMail, HiPhone, HiBadgeCheck } from 'react-icons/hi'
import { useAuth } from '../context/AuthContext'
import Toast from '../components/Toast'
import ConfirmModal from '../components/ConfirmModal'
import './MyProfile.css'

const MyProfile = () => {
    const { bookings, savedCars } = useCarContext()
    const { currentUser } = useAuth()
    const [user, setUser] = useState(null)
    const [isEditingLicense, setIsEditingLicense] = useState(false)
    const [licenseInput, setLicenseInput] = useState('')
    const [isUpdating, setIsUpdating] = useState(false)
    const [toast, setToast] = useState(null)
    const [confirmModal, setConfirmModal] = useState(null)

    useEffect(() => {
        if (currentUser) {
            setUser(currentUser)
            setLicenseInput(currentUser.licenseNumber || '')
        }
    }, [currentUser])

    const handleSaveLicense = async () => {
        const licenseRegex = /^GJ-[0-9]{2}-[0-9]{4}-[0-9]{7}$/

        if (!licenseInput.trim()) {
            setToast({ message: 'Please enter a valid license number!', type: 'warning' })
            return
        }

        if (!licenseRegex.test(licenseInput.trim())) {
            setToast({ message: 'Invalid format. Use GJ-05-2023-1234567 format.', type: 'error' })
            return
        }

        setIsUpdating(true)
        try {
            const updatedLicense = licenseInput.trim()
            const { error } = await supabase
                .from('users')
                .update({ licenseNumber: updatedLicense })
                .eq('id', user.id)
            
            if (error) throw error

            const updatedUser = { ...user, licenseNumber: updatedLicense }
            setUser(updatedUser)
            localStorage.setItem('currentUser', JSON.stringify(updatedUser))
            setIsEditingLicense(false)
            setToast({ message: 'License saved successfully!', type: 'success' })
        } catch (error) {
            console.error('Error saving license:', error)
            setToast({ message: 'Failed to save license. Try again.', type: 'error' })
        } finally {
            setIsUpdating(false)
        }
    }

    const handleRemoveLicense = () => {
        setConfirmModal({
            message: 'Remove your driving license?',
            subMessage: 'You will not be able to book any cars until you add it back.',
            confirmText: 'Yes, Remove',
            cancelText: 'No, Keep It',
            type: 'warning',
            onConfirm: async () => {
                setIsUpdating(true)
                try {
                    const { error } = await supabase
                        .from('users')
                        .update({ licenseNumber: null })
                        .eq('id', user.id)
                    if (error) throw error
                    const updatedUser = { ...user, licenseNumber: '' }
                    setUser(updatedUser)
                    setLicenseInput('')
                    localStorage.setItem('currentUser', JSON.stringify(updatedUser))
                    setConfirmModal(null)
                    setToast({ message: 'License removed successfully.', type: 'success' })
                } catch (error) {
                    console.error('Error removing license:', error)
                    setConfirmModal(null)
                    setToast({ message: 'Failed to remove license. Try again.', type: 'error' })
                } finally {
                    setIsUpdating(false)
                }
            },
            onCancel: () => setConfirmModal(null)
        })
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
                                    <button className="btn-remove-small" onClick={handleRemoveLicense} disabled={isUpdating}>Remove Licence</button>
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
                                    <button className="btn btn-primary btn-small" onClick={handleSaveLicense} disabled={isUpdating}>
                                        {isUpdating ? 'Saving...' : 'Save License'}
                                    </button>
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
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
            {confirmModal && (
                <ConfirmModal
                    message={confirmModal.message}
                    subMessage={confirmModal.subMessage}
                    confirmText={confirmModal.confirmText}
                    cancelText={confirmModal.cancelText}
                    type={confirmModal.type}
                    onConfirm={confirmModal.onConfirm}
                    onCancel={confirmModal.onCancel}
                />
            )}
        </div>
    )
}

export default MyProfile
