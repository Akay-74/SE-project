import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaBriefcase } from 'react-icons/fa';
import api from '../services/api';
import './Login.css';

const SelectRole = () => {
    const [selectedRole, setSelectedRole] = useState('user');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        // Get the temporary token and fetch user data
        const fetchUserData = async () => {
            const tempToken = localStorage.getItem('tempToken');

            if (!tempToken) {
                navigate('/login');
                return;
            }

            try {
                // Set the token temporarily to fetch user data
                const response = await api.get('/auth/verify', {
                    headers: {
                        Authorization: `Bearer ${tempToken}`
                    }
                });
                setUserData(response.data.data);
            } catch (err) {
                console.error('Error fetching user data:', err);
                navigate('/login');
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const tempToken = localStorage.getItem('tempToken');

            // Update user role
            await api.patch('/auth/role',
                { role: selectedRole },
                {
                    headers: {
                        Authorization: `Bearer ${tempToken}`
                    }
                }
            );

            // Remove temp token and complete login
            localStorage.removeItem('tempToken');
            login(tempToken);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to set role. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!userData) {
        return (
            <div className="auth-page">
                <div className="auth-container">
                    <div className="auth-card">
                        <p>Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <img
                            src={userData.avatar}
                            alt={userData.name}
                            style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                margin: '0 auto var(--spacing-md)',
                                display: 'block'
                            }}
                        />
                        <h1>Welcome, {userData.name}!</h1>
                        <p>Please select your account type to continue</p>
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label>
                                <FaBriefcase /> Account Type
                            </label>
                            <div className="role-selection">
                                <label className={`role-option ${selectedRole === 'user' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="role"
                                        value="user"
                                        checked={selectedRole === 'user'}
                                        onChange={(e) => setSelectedRole(e.target.value)}
                                    />
                                    <div className="role-content">
                                        <div className="role-title">
                                            <FaUser className="role-icon" />
                                            <span>Customer</span>
                                        </div>
                                        <p className="role-description">Book and manage your hotel reservations</p>
                                    </div>
                                </label>

                                <label className={`role-option ${selectedRole === 'manager' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="role"
                                        value="manager"
                                        checked={selectedRole === 'manager'}
                                        onChange={(e) => setSelectedRole(e.target.value)}
                                    />
                                    <div className="role-content">
                                        <div className="role-title">
                                            <FaBriefcase className="role-icon" />
                                            <span>Hotel Manager</span>
                                        </div>
                                        <p className="role-description">Manage your hotel properties and bookings</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-block"
                            disabled={loading}
                        >
                            {loading ? 'Setting up your account...' : 'Continue'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SelectRole;
