import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaHotel, FaUser, FaSignOutAlt, FaCog } from 'react-icons/fa';
import './Header.css';

const Header = () => {
    const { user, isAuthenticated, logout, isManager, isAdmin } = useAuth();

    console.log('Header - isAuthenticated:', isAuthenticated, 'user:', user);

    // Generate fallback avatar URL if user.avatar is empty or undefined
    const getAvatarUrl = () => {
        if (!user) return '';
        if (user.avatar && user.avatar.trim() !== '') {
            return user.avatar;
        }
        // Fallback to ui-avatars.com with user's name
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff&size=128`;
    };

    return (
        <header className="header">
            <div className="container">
                <div className="header-content">
                    <Link to="/" className="logo">
                        <FaHotel className="logo-icon" />
                        <span>Kamra.com</span>
                    </Link>

                    <nav className="nav">
                        <Link to="/" className="nav-link">Home</Link>
                        <Link to="/search" className="nav-link">Search Hotels</Link>

                        {isAuthenticated && (
                            <>
                                <Link to="/my-bookings" className="nav-link">My Bookings</Link>

                                {isManager() && (
                                    <Link to="/manager/dashboard" className="nav-link">Manager</Link>
                                )}

                                {isAdmin() && (
                                    <Link to="/admin/dashboard" className="nav-link">Admin</Link>
                                )}
                            </>
                        )}
                    </nav>

                    <div className="header-actions">
                        {isAuthenticated ? (
                            <div className="user-menu">
                                <div className="user-info">
                                    <img
                                        src={getAvatarUrl()}
                                        alt={user.name}
                                        className="user-avatar"
                                        onError={(e) => {
                                            // Fallback if image fails to load
                                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff&size=128`;
                                        }}
                                    />
                                    <span className="user-name">{user.name}</span>
                                </div>
                                <button onClick={logout} className="btn btn-ghost btn-sm">
                                    <FaSignOutAlt /> Logout
                                </button>
                            </div>
                        ) : (
                            <div className="auth-buttons">
                                <Link to="/login" className="btn btn-ghost">
                                    <FaUser /> Login
                                </Link>
                                <Link to="/signup" className="btn btn-primary">
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
