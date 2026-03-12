import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/adminService';
import LoadingSpinner from '../components/LoadingSpinner';
import StatCard from '../components/dashboard/StatCard';
import { FaUsers, FaHotel, FaCalendarAlt, FaDollarSign, FaUserShield } from 'react-icons/fa';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('overview'); // overview, users, hotels
    const [selectedUser, setSelectedUser] = useState(null);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [newRole, setNewRole] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [statsRes, usersRes, hotelsRes] = await Promise.all([
                adminService.getDashboardStats(),
                adminService.getAllUsers({ limit: 50 }),
                adminService.getAllHotels({ limit: 50 })
            ]);

            setStats(statsRes.data);
            setUsers(usersRes.data || []);
            setHotels(hotelsRes.data || []);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleChangeRole = async () => {
        if (!selectedUser || !newRole) return;

        try {
            await adminService.updateUserRole(selectedUser._id, newRole);
            setShowRoleModal(false);
            setSelectedUser(null);
            setNewRole('');
            fetchDashboardData();
        } catch (err) {
            console.error('Error updating role:', err);
            alert(err.response?.data?.message || 'Failed to update role');
        }
    };

    const handleDeactivateUser = async (userId) => {
        if (!window.confirm('Are you sure you want to deactivate this user?')) {
            return;
        }

        try {
            await adminService.deactivateUser(userId);
            fetchDashboardData();
        } catch (err) {
            console.error('Error deactivating user:', err);
            alert(err.response?.data?.message || 'Failed to deactivate user');
        }
    };

    const openRoleModal = (user) => {
        setSelectedUser(user);
        setNewRole(user.role);
        setShowRoleModal(true);
    };

    if (loading) {
        return <LoadingSpinner message="Loading admin dashboard..." />;
    }

    return (
        <div className="admin-dashboard">
            <div className="container">
                <div className="dashboard-header">
                    <div>
                        <h1>Admin Dashboard</h1>
                        <p>System Overview & Management</p>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="stats-grid">
                    <StatCard
                        title="Total Users"
                        value={stats?.totalUsers || 0}
                        icon={FaUsers}
                        color="primary"
                    />
                    <StatCard
                        title="Total Hotels"
                        value={stats?.totalHotels || 0}
                        icon={FaHotel}
                        color="success"
                    />
                    <StatCard
                        title="Total Bookings"
                        value={stats?.totalBookings || 0}
                        icon={FaCalendarAlt}
                        color="warning"
                    />
                    <StatCard
                        title="Total Revenue"
                        value={`₹${stats?.totalRevenue?.toLocaleString() || 0}`}
                        icon={FaDollarSign}
                        color="info"
                    />
                </div>

                {/* Tabs */}
                <div className="admin-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        Users Management
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'hotels' ? 'active' : ''}`}
                        onClick={() => setActiveTab('hotels')}
                    >
                        Hotels Management
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="overview-section">
                        <h2>Recent Bookings</h2>
                        <div className="recent-bookings">
                            {stats?.recentBookings?.length > 0 ? (
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Reference</th>
                                            <th>Hotel</th>
                                            <th>Guest</th>
                                            <th>Check-in</th>
                                            <th>Status</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.recentBookings.map((booking) => (
                                            <tr key={booking._id}>
                                                <td className="mono">{booking.bookingReference}</td>
                                                <td>{booking.hotel?.name}</td>
                                                <td>{booking.user?.name}</td>
                                                <td>{new Date(booking.checkInDate).toLocaleDateString()}</td>
                                                <td>
                                                    <span className={`status-pill status-${booking.status}`}>
                                                        {booking.status}
                                                    </span>
                                                </td>
                                                <td className="price">₹{booking.totalPrice}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="empty-text">No recent bookings</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="users-section">
                        <h2>User Management</h2>
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Auth Provider</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u) => (
                                        <tr key={u._id}>
                                            <td>
                                                <div className="user-cell">
                                                    <img
                                                        src={u.avatar}
                                                        alt={u.name}
                                                        className="user-avatar"
                                                    />
                                                    <span>{u.name}</span>
                                                </div>
                                            </td>
                                            <td>{u.email}</td>
                                            <td>
                                                <span className={`role-badge role-${u.role}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td>{u.authProvider}</td>
                                            <td>
                                                <span className={`status-pill ${u.isActive ? 'status-active' : 'status-inactive'}`}>
                                                    {u.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="btn-icon"
                                                        onClick={() => openRoleModal(u)}
                                                        title="Change Role"
                                                    >
                                                        <FaUserShield />
                                                    </button>
                                                    {u.isActive && (
                                                        <button
                                                            className="btn-icon danger"
                                                            onClick={() => handleDeactivateUser(u._id)}
                                                            title="Deactivate"
                                                        >
                                                            ×
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Hotels Tab */}
                {activeTab === 'hotels' && (
                    <div className="hotels-section">
                        <h2>Hotel Management</h2>
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Location</th>
                                        <th>Manager</th>
                                        <th>Rating</th>
                                        <th>Reviews</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {hotels.map((hotel) => (
                                        <tr key={hotel._id}>
                                            <td>{hotel.name}</td>
                                            <td>{hotel.location?.city}, {hotel.location?.state}</td>
                                            <td>{hotel.manager?.name || 'N/A'}</td>
                                            <td>⭐ {hotel.rating || 'N/A'}</td>
                                            <td>{hotel.totalReviews || 0}</td>
                                            <td>
                                                <span className={`status-pill ${hotel.isActive ? 'status-active' : 'status-inactive'}`}>
                                                    {hotel.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Role Change Modal */}
                {showRoleModal && selectedUser && (
                    <div className="modal-overlay" onClick={() => setShowRoleModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Change User Role</h2>
                                <button
                                    className="modal-close"
                                    onClick={() => setShowRoleModal(false)}
                                >
                                    ×
                                </button>
                            </div>
                            <div className="modal-body">
                                <p>Change role for <strong>{selectedUser.name}</strong></p>
                                <div className="form-group">
                                    <label>Select New Role</label>
                                    <select
                                        value={newRole}
                                        onChange={(e) => setNewRole(e.target.value)}
                                        className="form-select"
                                    >
                                        <option value="user">Customer</option>
                                        <option value="manager">Hotel Manager</option>
                                        <option value="admin">Administrator</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="btn btn-ghost"
                                    onClick={() => setShowRoleModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleChangeRole}
                                >
                                    Update Role
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
