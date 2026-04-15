import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaUser, FaEnvelope, FaLock, FaShieldAlt, FaCheck, FaTimes } from 'react-icons/fa';
import './ProfilePage.css';

const ProfilePage = () => {
    const { user } = useAuth();
    const [name, setName] = useState('');
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState({ text: '', type: '' });

    // Password change
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changingPw, setChangingPw] = useState(false);

    useEffect(() => {
        if (user) setName(user.name || '');
    }, [user]);

    const showMsg = (text, type = 'success') => {
        setMsg({ text, type });
        setTimeout(() => setMsg({ text: '', type: '' }), 4000);
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        try {
            setSaving(true);
            await api.put('/auth/profile', { name: name.trim() });
            showMsg('Profile updated successfully!');
        } catch (err) {
            showMsg(err.response?.data?.message || 'Failed to update profile', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            return showMsg('Passwords do not match', 'error');
        }
        if (newPassword.length < 6) {
            return showMsg('Password must be at least 6 characters', 'error');
        }
        try {
            setChangingPw(true);
            await api.put('/auth/change-password', { currentPassword, newPassword });
            showMsg('Password changed successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            showMsg(err.response?.data?.message || 'Failed to change password', 'error');
        } finally {
            setChangingPw(false);
        }
    };

    if (!user) return <LoadingSpinner message="Loading profile..." />;

    const isGoogle = user.authProvider === 'google';

    return (
        <div className="profile-page">
            <div className="container">
                <div className="profile-header">
                    <div className="profile-avatar-section">
                        <img src={user.avatar} alt={user.name} className="profile-avatar-lg" />
                        <div>
                            <h1>{user.name}</h1>
                            <p className="profile-email">{user.email}</p>
                            <span className={`role-badge role-${user.role}`}>{user.role}</span>
                        </div>
                    </div>
                </div>

                {msg.text && (
                    <div className={`profile-msg ${msg.type}`}>
                        {msg.type === 'success' ? <FaCheck /> : <FaTimes />}
                        {msg.text}
                    </div>
                )}

                <div className="profile-grid">
                    {/* Profile Info */}
                    <div className="profile-card">
                        <div className="profile-card-header">
                            <FaUser />
                            <h2>Personal Info</h2>
                        </div>
                        <form onSubmit={handleUpdateProfile}>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your name"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <div className="input-readonly">
                                    <FaEnvelope />
                                    <span>{user.email}</span>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Account Type</label>
                                <div className="input-readonly">
                                    <FaShieldAlt />
                                    <span>{isGoogle ? 'Google OAuth' : 'Email/Password'}</span>
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? 'Saving...' : 'Update Profile'}
                            </button>
                        </form>
                    </div>

                    {/* Password Change */}
                    {!isGoogle && (
                        <div className="profile-card">
                            <div className="profile-card-header">
                                <FaLock />
                                <h2>Change Password</h2>
                            </div>
                            <form onSubmit={handleChangePassword}>
                                <div className="form-group">
                                    <label>Current Password</label>
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="Enter current password"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>New Password</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Min. 6 characters"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary" disabled={changingPw}>
                                    {changingPw ? 'Changing...' : 'Change Password'}
                                </button>
                            </form>
                        </div>
                    )}

                    {isGoogle && (
                        <div className="profile-card">
                            <div className="profile-card-header">
                                <FaLock />
                                <h2>Security</h2>
                            </div>
                            <div className="google-auth-info">
                                <p>Your account is managed through Google OAuth.</p>
                                <p>Password management is handled by your Google account.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
