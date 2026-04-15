import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Signup.css';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'user',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { register } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleRoleChange = (role) => {
        setFormData({ ...formData, role });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);
        try {
            await register(formData.name, formData.email, formData.password, formData.role);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = `${import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '')}/api/auth/google`;
    };

    return (
        <div className="signup-page">
            <div className="signup-layout">
                {/* ── Form Column ── */}
                <div className="signup-form-col">
                    <div className="signup-heading">
                        <h1>Create your<br />Kamra account</h1>
                        <p>
                            Join our curated collection of extraordinary stays
                            and personalized concierge services.
                        </p>
                    </div>

                    {error && <div className="signup-error">{error}</div>}

                    {/* Account type */}
                    <div>
                        <label className="account-type-label">Select Account Type</label>
                        <div className="account-type-toggle">
                            <button
                                type="button"
                                className={`toggle-btn${formData.role === 'user' ? ' active' : ''}`}
                                onClick={() => handleRoleChange('user')}
                            >
                                Customer
                            </button>
                            <button
                                type="button"
                                className={`toggle-btn${formData.role === 'manager' ? ' active' : ''}`}
                                onClick={() => handleRoleChange('manager')}
                            >
                                Hotel Manager
                            </button>
                        </div>
                    </div>

                    <form className="signup-form" onSubmit={handleSubmit}>
                        {/* Name + Email row */}
                        <div className="form-row-grid">
                            <div className="signup-field">
                                <label className="signup-field-label" htmlFor="name">Full Name</label>
                                <input
                                    className="signup-input"
                                    type="text"
                                    id="name"
                                    name="name"
                                    placeholder="Julianne Moore"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="signup-field">
                                <label className="signup-field-label" htmlFor="email">Email</label>
                                <input
                                    className="signup-input"
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="julianne@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="signup-field">
                            <label className="signup-field-label" htmlFor="password">Password</label>
                            <input
                                className="signup-input"
                                type="password"
                                id="password"
                                name="password"
                                placeholder="••••••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="signup-field">
                            <label className="signup-field-label" htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                className="signup-input"
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                placeholder="••••••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="signup-actions">
                            <button
                                type="submit"
                                className="signup-submit-btn"
                                disabled={loading}
                            >
                                {loading ? 'Creating account…' : 'Sign Up'}
                                {!loading && (
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                )}
                            </button>

                            <div className="signup-divider">
                                <div className="signup-divider-line"></div>
                                <span className="signup-divider-text">or continue with</span>
                                <div className="signup-divider-line"></div>
                            </div>

                            <button
                                type="button"
                                className="google-btn"
                                onClick={handleGoogleLogin}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335" />
                                </svg>
                                Sign in with Google
                            </button>

                            <p className="signup-signin-link">
                                Already have an account?{' '}
                                <Link to="/login">Sign In</Link>
                            </p>
                        </div>
                    </form>
                </div>

                {/* ── Editorial Image Column (desktop only) ── */}
                <div className="signup-image-col">
                    <div className="signup-image-frame">
                        <img
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCp2zGKMj1z3Getz8RdF-X6eLQQ8wHu3DVwmZt3z8CqehTu57PuJB-b2EXukViCCEHOeNyyMs-K3nfHsJZosbJgExZHvEZl1c5e7Ni9dRhRPwuOqrdHMxWvMXYY_pvCGd3s854Ix9iU-wZoHYf5tuNLqEPXpis1njerQrE-TtcspsNUF3ekHjkhZR-z_syi_t8_v32PPfC8nMohGnuKjj88ARZcjAjk26G_jL1306YvqBKIu9Xs4irirwZV_lO2Iy0iDOeztKh0n3c"
                            alt="Luxury hotel interior — emerald velvet sofa, minimalist architecture"
                        />

                        <div className="editorial-caption">
                            <span className="editorial-caption-label">Digital Concierge</span>
                            <h3>Designed for the Discerning.</h3>
                            <p>
                                Experience a new era of travel where luxury is quiet,
                                personal, and effortlessly curated for your unique journey.
                            </p>
                        </div>

                        <div className="image-accent">
                            <span className="material-symbols-outlined">star</span>
                        </div>
                    </div>

                    <div className="corner-tl"></div>
                    <div className="corner-br"></div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
