import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/adminService';
import LoadingSpinner from '../components/LoadingSpinner';
import StatCard from '../components/dashboard/StatCard';
import {
    FaUsers, FaHotel, FaCalendarAlt, FaDollarSign,
    FaUserShield, FaUserPlus, FaKey, FaBan, FaCheck,
    FaTrash, FaBuilding, FaTimes, FaChevronRight
} from 'react-icons/fa';
import './AdminDashboard.css';

const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: 'Users' },
    { id: 'hotels', label: 'Hotels' },
    { id: 'create-manager', label: '+ Create Manager' },
];

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState('overview');

    // Role modal
    const [selectedUser, setSelectedUser] = useState(null);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [newRole, setNewRole] = useState('');
    const [roleHotelIds, setRoleHotelIds] = useState([]);

    // Password reset modal
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordTarget, setPasswordTarget] = useState(null);
    const [newPassword, setNewPassword] = useState('');

    // Create manager form
    const [managerForm, setManagerForm] = useState({ name: '', email: '', password: '', hotelIds: [] });
    const [managerLoading, setManagerLoading] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const showMsg = (msg, isError = false) => {
        if (isError) { setError(msg); setSuccess(''); }
        else { setSuccess(msg); setError(''); }
        setTimeout(() => { setError(''); setSuccess(''); }, 4000);
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [statsRes, usersRes, hotelsRes] = await Promise.all([
                adminService.getDashboardStats(),
                adminService.getAllUsers({ limit: 100 }),
                adminService.getAllHotels({ limit: 100 }),
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

    // ── Role modal ──────────────────────────────────────
    const openRoleModal = (u) => {
        setSelectedUser(u);
        setNewRole(u.role);
        setRoleHotelIds((u.managedHotels || []).map(h => typeof h === 'object' ? h._id : h));
        setShowRoleModal(true);
    };

    const handleChangeRole = async () => {
        if (!selectedUser || !newRole) return;
        try {
            await adminService.updateUserRole(selectedUser._id, newRole);
            if (newRole === 'manager') {
                await adminService.assignManagedHotels(selectedUser._id, roleHotelIds);
            }
            setShowRoleModal(false);
            showMsg(`${selectedUser.name}'s role updated to ${newRole}`);
            fetchDashboardData();
        } catch (err) {
            showMsg(err.response?.data?.message || 'Failed to update role', true);
        }
    };

    // ── Deactivate / Reactivate ──────────────────────────
    const handleToggleActive = async (u) => {
        const action = u.isActive ? 'deactivate' : 'reactivate';
        if (!window.confirm(`Are you sure you want to ${action} ${u.name}?`)) return;
        try {
            if (u.isActive) {
                await adminService.deactivateUser(u._id);
            } else {
                await adminService.reactivateUser(u._id);
            }
            showMsg(`User ${action}d successfully`);
            fetchDashboardData();
        } catch (err) {
            showMsg(err.response?.data?.message || `Failed to ${action} user`, true);
        }
    };

    // ── Password Reset ───────────────────────────────────
    const openPasswordModal = (u) => {
        setPasswordTarget(u);
        setNewPassword('');
        setShowPasswordModal(true);
    };

    const handleResetPassword = async () => {
        if (!passwordTarget || !newPassword) return;
        try {
            await adminService.resetUserPassword(passwordTarget._id, newPassword);
            setShowPasswordModal(false);
            showMsg(`Password reset for ${passwordTarget.name}`);
        } catch (err) {
            showMsg(err.response?.data?.message || 'Failed to reset password', true);
        }
    };

    // ── Delete Hotel ─────────────────────────────────────
    const handleDeleteHotel = async (hotel) => {
        if (!window.confirm(`Deactivate "${hotel.name}"? Users won't be able to book it.`)) return;
        try {
            await adminService.deleteHotel(hotel._id);
            showMsg(`Hotel "${hotel.name}" deactivated`);
            fetchDashboardData();
        } catch (err) {
            showMsg(err.response?.data?.message || 'Failed to deactivate hotel', true);
        }
    };

    // ── Create Manager ───────────────────────────────────
    const handleCreateManager = async (e) => {
        e.preventDefault();
        setManagerLoading(true);
        try {
            await adminService.createManager(managerForm);
            setManagerForm({ name: '', email: '', password: '', hotelIds: [] });
            showMsg('Manager account created successfully!');
            fetchDashboardData();
            setActiveTab('users');
        } catch (err) {
            showMsg(err.response?.data?.message || 'Failed to create manager', true);
        } finally {
            setManagerLoading(false);
        }
    };

    const toggleHotelForManager = (hotelId, field, setter) => {
        setter(prev => ({
            ...prev,
            [field]: prev[field].includes(hotelId)
                ? prev[field].filter(id => id !== hotelId)
                : [...prev[field], hotelId],
        }));
    };

    if (loading) return <LoadingSpinner message="Loading admin dashboard..." />;

    return (
        <div className="admin-dashboard">
            <div className="container">
                {/* Header */}
                <div className="dashboard-header">
                    <div>
                        <h1>Admin Dashboard</h1>
                        <p>System Overview &amp; Management</p>
                    </div>
                    <div className="admin-badge">
                        <FaUserShield /> Super Admin
                    </div>
                </div>

                {/* Notification */}
                {error && <div className="notify notify-error"><FaTimes /> {error}</div>}
                {success && <div className="notify notify-success"><FaCheck /> {success}</div>}

                {/* Stats Cards */}
                <div className="stats-grid">
                    <StatCard title="Total Users" value={stats?.totalUsers || 0} icon={FaUsers} color="primary" />
                    <StatCard title="Hotel Managers" value={stats?.totalManagers || 0} icon={FaBuilding} color="info" />
                    <StatCard title="Active Hotels" value={stats?.totalHotels || 0} icon={FaHotel} color="success" />
                    <StatCard title="Total Bookings" value={stats?.totalBookings || 0} icon={FaCalendarAlt} color="warning" />
                    <StatCard title="Total Revenue" value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`} icon={FaDollarSign} color="success" />
                </div>

                {/* Tabs */}
                <div className="admin-tabs">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            className={`tab-btn ${activeTab === tab.id ? 'active' : ''} ${tab.id === 'create-manager' ? 'tab-btn-special' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="overview-section fade-in">
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
                    <div className="users-section fade-in">
                        <div className="section-title-row">
                            <h2>User Management</h2>
                            <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('create-manager')}>
                                <FaUserPlus /> New Manager
                            </button>
                        </div>
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Auth</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u) => (
                                        <tr key={u._id} className={!u.isActive ? 'row-inactive' : ''}>
                                            <td>
                                                <div className="user-cell">
                                                    <img src={u.avatar} alt={u.name} className="user-avatar" />
                                                    <span>{u.name}</span>
                                                </div>
                                            </td>
                                            <td>{u.email}</td>
                                            <td>
                                                <span className={`role-badge role-${u.role}`}>{u.role}</span>
                                            </td>
                                            <td>
                                                <span className="auth-badge">{u.authProvider}</span>
                                            </td>
                                            <td>
                                                <span className={`status-pill ${u.isActive ? 'status-confirmed' : 'status-cancelled'}`}>
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
                                                    {u.authProvider === 'local' && (
                                                        <button
                                                            className="btn-icon"
                                                            onClick={() => openPasswordModal(u)}
                                                            title="Reset Password"
                                                        >
                                                            <FaKey />
                                                        </button>
                                                    )}
                                                    <button
                                                        className={`btn-icon ${u.isActive ? 'danger' : 'success'}`}
                                                        onClick={() => handleToggleActive(u)}
                                                        title={u.isActive ? 'Deactivate' : 'Reactivate'}
                                                    >
                                                        {u.isActive ? <FaBan /> : <FaCheck />}
                                                    </button>
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
                    <div className="hotels-section fade-in">
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
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {hotels.map((hotel) => (
                                        <tr key={hotel._id} className={!hotel.isActive ? 'row-inactive' : ''}>
                                            <td className="font-semibold">{hotel.name}</td>
                                            <td>{hotel.location?.city}, {hotel.location?.state}</td>
                                            <td>{hotel.manager?.name || <span className="text-muted">Unassigned</span>}</td>
                                            <td>⭐ {hotel.rating || 'N/A'}</td>
                                            <td>{hotel.totalReviews || 0}</td>
                                            <td>
                                                <span className={`status-pill ${hotel.isActive ? 'status-confirmed' : 'status-cancelled'}`}>
                                                    {hotel.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                {hotel.isActive && (
                                                    <button
                                                        className="btn-icon danger"
                                                        onClick={() => handleDeleteHotel(hotel)}
                                                        title="Deactivate Hotel"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Create Manager Tab */}
                {activeTab === 'create-manager' && (
                    <div className="create-manager-section fade-in">
                        <h2>Create Manager Account</h2>
                        <p className="section-desc">Create a hotel manager account and optionally assign them hotels right away.</p>
                        <form className="manager-form" onSubmit={handleCreateManager}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Full Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g. John Smith"
                                        value={managerForm.name}
                                        onChange={e => setManagerForm(p => ({ ...p, name: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email Address</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        placeholder="manager@example.com"
                                        value={managerForm.email}
                                        onChange={e => setManagerForm(p => ({ ...p, email: e.target.value }))}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Initial Password</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="Min. 6 characters"
                                    value={managerForm.password}
                                    onChange={e => setManagerForm(p => ({ ...p, password: e.target.value }))}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Assign Hotels (optional)</label>
                                <div className="hotel-picker">
                                    {hotels.filter(h => h.isActive).map(hotel => (
                                        <label
                                            key={hotel._id}
                                            className={`hotel-pick-item ${managerForm.hotelIds.includes(hotel._id) ? 'selected' : ''}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={managerForm.hotelIds.includes(hotel._id)}
                                                onChange={() => toggleHotelForManager(hotel._id, 'hotelIds', setManagerForm)}
                                            />
                                            <span>
                                                <strong>{hotel.name}</strong>
                                                <small>{hotel.location?.city}</small>
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={managerLoading}
                            >
                                <FaUserPlus />
                                {managerLoading ? 'Creating...' : 'Create Manager'}
                            </button>
                        </form>
                    </div>
                )}
            </div>

            {/* Role Change Modal */}
            {showRoleModal && selectedUser && (
                <div className="modal-overlay" onClick={() => setShowRoleModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Change Role</h2>
                            <button className="modal-close" onClick={() => setShowRoleModal(false)}><FaTimes /></button>
                        </div>
                        <div className="modal-body">
                            <div className="modal-user-info">
                                <img src={selectedUser.avatar} alt={selectedUser.name} />
                                <div>
                                    <strong>{selectedUser.name}</strong>
                                    <small>{selectedUser.email}</small>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Select New Role</label>
                                <select
                                    value={newRole}
                                    onChange={e => setNewRole(e.target.value)}
                                    className="form-select"
                                >
                                    <option value="user">Customer</option>
                                    <option value="manager">Hotel Manager</option>
                                    <option value="admin">Administrator</option>
                                </select>
                            </div>

                            {newRole === 'manager' && (
                                <div className="form-group">
                                    <label className="form-label">Assign Hotels</label>
                                    <div className="hotel-picker">
                                        {hotels.filter(h => h.isActive).map(hotel => (
                                            <label
                                                key={hotel._id}
                                                className={`hotel-pick-item ${roleHotelIds.includes(hotel._id) ? 'selected' : ''}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={roleHotelIds.includes(hotel._id)}
                                                    onChange={() => {
                                                        setRoleHotelIds(prev =>
                                                            prev.includes(hotel._id)
                                                                ? prev.filter(id => id !== hotel._id)
                                                                : [...prev, hotel._id]
                                                        );
                                                    }}
                                                />
                                                <span>
                                                    <strong>{hotel.name}</strong>
                                                    <small>{hotel.location?.city}</small>
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-ghost" onClick={() => setShowRoleModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleChangeRole}>Update Role</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Password Reset Modal */}
            {showPasswordModal && passwordTarget && (
                <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Reset Password</h2>
                            <button className="modal-close" onClick={() => setShowPasswordModal(false)}><FaTimes /></button>
                        </div>
                        <div className="modal-body">
                            <div className="modal-user-info">
                                <img src={passwordTarget.avatar} alt={passwordTarget.name} />
                                <div>
                                    <strong>{passwordTarget.name}</strong>
                                    <small>{passwordTarget.email}</small>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">New Password</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="Min. 6 characters"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-ghost" onClick={() => setShowPasswordModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleResetPassword}>Reset Password</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
