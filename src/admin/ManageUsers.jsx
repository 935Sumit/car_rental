import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase/supabaseClient'
import './Dashboard.css'
import './ManageCars.css'
import './ManageBookings.css'

const ManageUsers = () => {
    const navigate = useNavigate()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const isAdmin = localStorage.getItem('adminLoggedIn')
        if (isAdmin !== 'true') {
            navigate('/login')
            return
        }
        fetchUsers()
    }, [navigate])

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

    const handleDeleteUser = async (id) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                const { error } = await supabase
                    .from('users')
                    .delete()
                    .eq('id', id)
                
                if (error) throw error
                setUsers(users.filter(user => user.id !== id))
            } catch (error) {
                console.error('Error deleting user:', error)
                alert('Failed to delete user')
            }
        }
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
                                                        onClick={() => alert(`User Details:\nName: ${user.fullName}\nEmail: ${user.email}\nPhone: ${user.phone || 'N/A'}\nStatus: ${user.status || 'Active'}`)}
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
        </div>
    )
}

export default ManageUsers
