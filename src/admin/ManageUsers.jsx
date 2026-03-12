import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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

    const fetchUsers = () => {
        console.log('Fetching users...');
        let savedUsers = [];
        try {
            savedUsers = JSON.parse(localStorage.getItem('vantage_users') || '[]');
        } catch (e) {
            console.error('Error parsing vantage_users:', e);
        }
        
        // Comprehensive fallback for different possible keys
        if (!Array.isArray(savedUsers) || savedUsers.length === 0) {
            console.log('vantage_users empty, checking legacy keys...');
            const possibleKeys = ['users', 'allUsers', 'registered_users', 'vantage_users_list', 'userList'];
            let combinedUsers = [];
            
            possibleKeys.forEach(key => {
                try {
                    const rawData = localStorage.getItem(key);
                    if (rawData) {
                        const data = JSON.parse(rawData);
                        console.log(`Found data in ${key}:`, data);
                        if (Array.isArray(data)) {
                            data.forEach(u => {
                                if (u.email && !combinedUsers.find(cu => cu.email === u.email)) {
                                    combinedUsers.push(u);
                                }
                            });
                        }
                    }
                } catch (e) {
                    console.error(`Error parsing ${key}:`, e);
                }
            });

            if (combinedUsers.length > 0) {
                console.log('Consolidated users from legacy keys:', combinedUsers);
                savedUsers = combinedUsers;
                localStorage.setItem('vantage_users', JSON.stringify(savedUsers));
            } else {
                // If totally empty, add some initial mock users for demonstration
                const mockUsers = [
                    { fullName: 'Sumit Kumar', email: 'sumit@example.com', phone: '9876543210', status: 'active', createdAt: new Date().toISOString() },
                    { fullName: 'Anjali Sharma', email: 'anjali@example.com', phone: '9988776655', status: 'active', createdAt: new Date().toISOString() },
                    { fullName: 'Rahul Verma', email: 'rahul@example.com', phone: '9122334455', status: 'blocked', createdAt: new Date().toISOString() }
                ];
                savedUsers = mockUsers;
                localStorage.setItem('vantage_users', JSON.stringify(savedUsers));
                console.log('Initialized with mock users');
            }
        }
        
        console.log('Final user list to display:', savedUsers);
        setUsers(savedUsers);
        setLoading(false);
    }

    const handleBlockUser = (email) => {
        const updatedUsers = users.map(user => {
            if (user.email === email) {
                return { ...user, status: user.status === 'blocked' ? 'active' : 'blocked' }
            }
            return user
        })
        localStorage.setItem('vantage_users', JSON.stringify(updatedUsers))
        setUsers(updatedUsers)
    }

    const handleDeleteUser = (email) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            const updatedUsers = users.filter(user => user.email !== email)
            localStorage.setItem('vantage_users', JSON.stringify(updatedUsers))
            setUsers(updatedUsers)
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
                                    users.map((user, index) => (
                                        <tr key={index}>
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
                                                        onClick={() => handleBlockUser(user.email)}
                                                        style={{ minWidth: '100px' }}
                                                    >
                                                        {user.status === 'blocked' ? 'Unblock' : 'Block'}
                                                    </button>
                                                    <button 
                                                        className="btn-delete" 
                                                        onClick={() => handleDeleteUser(user.email)}
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
