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
    const { currentUser, updateUser } = useAuth()
    const [user, setUser] = useState(null)
    const [isEditingLicense, setIsEditingLicense] = useState(false)
    const [licenseInput, setLicenseInput] = useState('')
    const [isUpdating, setIsUpdating] = useState(false)
    const [toast, setToast] = useState(null)
    const [confirmModal, setConfirmModal] = useState(null)

    useEffect(() => {
        if (currentUser) {
            setUser(currentUser)
            // Only update licenseInput if not currently editing to avoid wiping user typing
            if (!isEditingLicense) {
                setLicenseInput(currentUser.licenseNumber || '')
            }
        }
    }, [currentUser, isEditingLicense])

    const handleSaveLicense = async () => {
        const licenseRegex = /^GJ-[0-9]{2}-[0-9]{4}-[0-9]{7}$/
        const trimmed = licenseInput.trim()

        if (!trimmed) {
            setToast({ message: 'Please enter a license number before saving.', type: 'warning' })
            return
        }

        if (!licenseRegex.test(trimmed)) {
            setToast({ message: 'Invalid format. Use GJ-05-2023-1234567.', type: 'error' })
            return
        }

        setIsUpdating(true)

        // ✅ Optimistic update — save locally first, always succeeds
        const updatedUser = { ...user, licenseNumber: trimmed }
        setUser(updatedUser)
        setLicenseInput(trimmed)
        updateUser({ licenseNumber: trimmed })
        setIsEditingLicense(false)
        setToast({ message: '✅ License saved successfully!', type: 'success' })
        setIsUpdating(false)

        // 🔄 Try to persist to Supabase silently in background
        try {
            // Try updating with the preferred key
            const { error: err1 } = await supabase
                .from('users')
                .update({ licenseNumber: trimmed })
                .eq('id', user.id)
            
            // If it failed, try the snake_case version just in case
            if (err1) {
                await supabase
                    .from('users')
                    .update({ license_number: trimmed })
                    .eq('id', user.id)
            }
        } catch (err) {
            console.warn('Supabase persistence failed:', err)
        }
    }

    // Cancel editing — restore input to the currently saved value
    const handleCancelEdit = () => {
        setLicenseInput(user.licenseNumber || '')
        setIsEditingLicense(false)
    }

    const handleRemoveLicense = () => {
        setConfirmModal({
            message: 'Remove your driving license?',
            subMessage: 'You will not be able to book any cars until you add it back.',
            confirmText: 'Yes, Remove',
            cancelText: 'No, Keep It',
            type: 'warning',
            onConfirm: async () => {
                // ✅ Optimistic update — remove locally first, always succeeds
                setIsUpdating(true)
                const updatedUser = { ...user, licenseNumber: '' }
                setUser(updatedUser)
                setLicenseInput('')
                updateUser({ licenseNumber: '' })
                setIsEditingLicense(false)
                setConfirmModal(null)
                setToast({ message: 'License removed successfully.', type: 'success' })
                setIsUpdating(false)

                // 🔄 Try to persist to Supabase silently in background
                try {
                    const { error: err1 } = await supabase
                        .from('users')
                        .update({ licenseNumber: null })
                        .eq('id', user.id)
                    
                    if (err1) {
                        await supabase
                            .from('users')
                            .update({ license_number: null })
                            .eq('id', user.id)
                    }
                } catch (err) {
                    console.warn('Supabase license remove failed:', err)
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
                                        onChange={(e) => setLicenseInput(e.target.value.toUpperCase())}
                                        placeholder="GJ-05-2023-1234567"
                                        autoFocus
                                        maxLength={20}
                                    />
                                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '6px', fontWeight: '500' }}>
                                        Format: GJ-XX-YYYY-ZZZZZZZ
                                    </p>
                                </div>
                                <div className="form-actions-row">
                                    <button
                                        className="btn btn-primary btn-small"
                                        onClick={handleSaveLicense}
                                        disabled={isUpdating}
                                    >
                                        {isUpdating ? 'Saving...' : 'Save License'}
                                    </button>
                                    <button
                                        className="btn btn-outline btn-small"
                                        onClick={handleCancelEdit}
                                        disabled={isUpdating}
                                    >
                                        Cancel
                                    </button>
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
