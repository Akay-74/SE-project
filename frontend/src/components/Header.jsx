import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaHotel, FaUser, FaSignOutAlt, FaSearch, FaBars, FaUserShield } from 'react-icons/fa';
import './Header.css';

const Header = () => {
    const { user, isAuthenticated, logout, isManager, isAdmin } = useAuth();

    const getAvatarUrl = () => {
        if (!user) return '';
        if (user.avatar && user.avatar.trim() !== '') return user.avatar;
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=059669&color=fff&size=128`;
    };

    return (
        <header className="header">
            <div className="container">
                <div className="header-content">
                    {/* Logo */}
                    <Link to="/" className="logo">
                        <div className="logo-icon">
                            <FaHotel />
                        </div>
                        <span>Kamra<em>.com</em></span>
                    </Link> 

                    {/* Nav */}
                    <nav className="nav">
                        <Link to="/" className="nav-link">Home</Link>
                        <Link to="/search" className="nav-link">
                             Search Hotels
                        </Link>
                        {isAuthenticated && (
                            <>
                                <Link to="/my-bookings" className="nav-link">My Bookings</Link>
                                {isManager() && (
                                    <Link to="/manager/dashboard" className="nav-link">Manager</Link>
                                )}
                                {isAdmin() && (
                                    <Link to="/admin/dashboard" className="nav-link nav-admin">
                                        <FaUserShield /> Admin
                                    </Link>
                                )}
                            </>
                        )}
                    </nav>

                    {/* Actions */}
                    <div className="header-actions">
                        {isAuthenticated ? (
                            <div className="user-menu">
                                <div className="user-info">
                                    <img
                                        src={getAvatarUrl()}
                                        alt={user.name}
                                        className="user-avatar"
                                        onError={(e) => {
                                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=059669&color=fff&size=128`;
                                        }}
                                    />
                                    <span className="user-name">{user.name}</span>
                                </div>
                                <button onClick={logout} className="btn btn-outline btn-sm">
                                    <FaSignOutAlt /> Logout
                                </button>
                            </div>
                        ) : (
                            <div className="auth-buttons">
                                <Link to="/login" className="btn btn-ghost btn-sm">
                                    <FaUser /> Login
                                </Link>
                                <Link to="/signup" className="btn btn-primary btn-sm">
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    <button className="nav-toggle" aria-label="Menu">
                        <FaBars />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
