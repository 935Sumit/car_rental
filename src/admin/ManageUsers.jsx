import { useState, useEffect } from 'react'
import { supabase } from '../supabase/supabaseClient'
import './Dashboard.css'
import './ManageCars.css'
import './ManageBookings.css'
import Toast from '../components/Toast'
import ConfirmModal from '../components/ConfirmModal'

const ManageUsers = () => {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [toast, setToast] = useState(null)
    const [confirmModal, setConfirmModal] = useState(null)

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false })
            
            if (error) throw error
            setUsers(data || [])
        } catch (error) {
            console.error('Error fetching users:', error)
            alert('Failed to load users from Supabase')
        } finally {
            setLoading(false)
        }
    }

    const handleBlockUser = async (id, currentStatus) => {
        try {
            const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked'
            const { error } = await supabase
                .from('users')
                .update({ status: newStatus })
                .eq('id', id)
            
            if (error) throw error
            
            setUsers(users.map(user => 
                user.id === id ? { ...user, status: newStatus } : user
            ))
        } catch (error) {
            console.error('Error updating user status:', error)
            alert('Failed to update user status')
        }
    }

    const handleDeleteUser = (id) => {
        setConfirmModal({
            message: 'Delete this user?',
            subMessage: 'This action cannot be undone. All their data will be permanently removed.',
            confirmText: 'Yes, Delete User',
            cancelText: 'No, Keep User',
            type: 'danger',
            onConfirm: async () => {
                try {
                    const { error } = await supabase
                        .from('users')
                        .delete()
                        .eq('id', id)
                    if (error) throw error
                    setUsers(users.filter(user => user.id !== id))
                    setConfirmModal(null)
                    setToast({ message: 'User deleted successfully!', type: 'success' })
                } catch (error) {
                    console.error('Error deleting user:', error)
                    setConfirmModal(null)
                    setToast({ message: 'Failed to delete user. Try again.', type: 'error' })
                }
            },
            onCancel: () => setConfirmModal(null)
        })
    }

    return (
        <div className="admin-dashboard">
            <main className="admin-content">
                <div className="manage-cars-page">
                    <header className="admin-header">
                        <div>
                            <h1>Manage Users <span className="total-badge">{users.length}</span></h1>
                            <p>View, manage and control access for all registered premium members.</p>
                        </div>
                        <button className="btn-edit" onClick={fetchUsers} style={{ height: 'fit-content' }}>
                            Refresh Data
                        </button>
                    </header>

                    <div className="admin-table-container fade-in-up">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>User Name</th>
                                    <th>Email</th>
                                    <th>Phone Number</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" style={{ textAlign: 'center' }}>Loading users...</td></tr>
                                ) : users.length === 0 ? (
                                    <tr><td colSpan="5" style={{ textAlign: 'center' }}>No users found.</td></tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user.id}>
                                            <td style={{ fontWeight: '700', color: 'var(--primary-color)' }}>{user.fullName}</td>
                                            <td>{user.email}</td>
                                            <td style={{ fontStyle: 'italic' }}>{user.phone || 'N/A'}</td>
                                            <td>
                                                <span className={`status-badge ${user.status === 'blocked' ? 'status-cancelled' : 'status-approved'}`}>
                                                    {user.status || 'Active'}
                                                </span>
                                            </td>
                                            <td className="actions-cell">
                                                <div className="action-btns-row">
                                                    <button 
                                                        className="btn-edit" 
                                                        onClick={() => setToast({ message: `${user.fullName} • ${user.email} • ${user.phone || 'N/A'}`, type: 'info' })}
                                                    >
                                                        View
                                                    </button>
                                                    <button 
                                                        className={`btn-cancel ${user.status === 'blocked' ? 'btn-approve' : ''}`} 
                                                        onClick={() => handleBlockUser(user.id, user.status)}
                                                        style={{ minWidth: '100px' }}
                                                    >
                                                        {user.status === 'blocked' ? 'Unblock' : 'Block'}
                                                    </button>
                                                    <button 
                                                        className="btn-delete" 
                                                        onClick={() => handleDeleteUser(user.id)}
                                                    >
                                                        Delete
                                                    </button>
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

export default ManageUsers
