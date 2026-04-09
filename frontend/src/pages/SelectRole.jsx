import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaBriefcase, FaArrowRight, FaCheck } from 'react-icons/fa';
import api from '../services/api';
import './SelectRole.css';

const ROLES = [
    {
        id: 'user',
        label: 'Guest',
        tagline: 'Explore & book hotels',
        description: 'Browse thousands of hotels, make reservations, manage bookings, and write reviews.',
        icon: FaUser,
        color: 'teal',
        perks: ['Browse & search hotels', 'Make reservations', 'Manage your bookings', 'Leave reviews'],
    },
    {
        id: 'manager',
        label: 'Hotel Manager',
        tagline: 'List & manage properties',
        description: 'List your hotel, manage room availability, track reservations, and respond to guests.',
        icon: FaBriefcase,
        color: 'blue',
        perks: ['List your hotel', 'Manage rooms & pricing', 'Track reservations', 'View analytics'],
    },
];

const SelectRole = () => {
    const [selectedRole, setSelectedRole] = useState('user');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        const fetchUserData = async () => {
            const tempToken = localStorage.getItem('tempToken');
            if (!tempToken) {
                navigate('/login');
                return;
            }
            try {
                const response = await api.get('/auth/verify', {
                    headers: { Authorization: `Bearer ${tempToken}` },
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
            await api.patch('/auth/role', { role: selectedRole }, {
                headers: { Authorization: `Bearer ${tempToken}` },
            });
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
            <div className="sr-page">
                <div className="sr-loading">
                    <div className="sr-spinner" />
                    <p>Loading your profile…</p>
                </div>
            </div>
        );
    }

    const activeRole = ROLES.find(r => r.id === selectedRole);

    return (
        <div className="sr-page">
            {/* Background blobs */}
            <div className="sr-blob sr-blob-1" />
            <div className="sr-blob sr-blob-2" />

            <div className="sr-container">
                {/* Welcome card */}
                <div className="sr-welcome">
                    <img
                        src={userData.avatar}
                        alt={userData.name}
                        className="sr-avatar"
                    />
                    <div>
                        <h1 className="sr-greeting">Welcome, <span>{userData.name}!</span></h1>
                        <p className="sr-subtitle">How would you like to use Kamra.com?</p>
                    </div>
                </div>

                {/* Role cards */}
                <div className="sr-roles">
                    {ROLES.map((role) => {
                        const Icon = role.icon;
                        const selected = selectedRole === role.id;
                        return (
                            <button
                                key={role.id}
                                type="button"
                                className={`sr-role-card sr-color-${role.color} ${selected ? 'sr-role-selected' : ''}`}
                                onClick={() => setSelectedRole(role.id)}
                            >
                                <div className="sr-role-header">
                                    <div className={`sr-role-icon sr-icon-${role.color}`}>
                                        <Icon />
                                    </div>
                                    <div className="sr-role-title-group">
                                        <span className="sr-role-label">{role.label}</span>
                                        <span className="sr-role-tagline">{role.tagline}</span>
                                    </div>
                                    <div className={`sr-checkmark ${selected ? 'sr-checkmark-active' : ''}`}>
                                        <FaCheck />
                                    </div>
                                </div>

                                <p className="sr-role-desc">{role.description}</p>

                                <ul className="sr-perks">
                                    {role.perks.map((perk) => (
                                        <li key={perk}>
                                            <span className="sr-perk-dot" />
                                            {perk}
                                        </li>
                                    ))}
                                </ul>
                            </button>
                        );
                    })}
                </div>

                {/* Error */}
                {error && <div className="sr-error">{error}</div>}

                {/* CTA */}
                <form onSubmit={handleSubmit} className="sr-cta">
                    <div className="sr-selected-info">
                        <span>Continuing as</span>
                        <strong>{activeRole.label}</strong>
                    </div>
                    <button
                        type="submit"
                        className="sr-btn"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="sr-btn-spinner" />
                                Setting up your account…
                            </>
                        ) : (
                            <>
                                Get Started
                                <FaArrowRight />
                            </>
                        )}
                    </button>
                </form>

                <p className="sr-disclaimer">
                    You can always change your role later from your profile settings.
                </p>
            </div>
        </div>
    );
};

export default SelectRole;
