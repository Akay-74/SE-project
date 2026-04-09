import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaMapMarkerAlt, FaHotel, FaStar, FaShieldAlt } from 'react-icons/fa';
import './Home.css';

// Real Unsplash photos for cities
const CITY_DATA = [
    { name: 'Mumbai', hotels: '1,200+', photo: 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8bXVtYmFpfGVufDB8fDB8fHww' },
    { name: 'Delhi', hotels: '980+', photo: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=400&h=300&auto=format&fit=crop' },
    { name: 'Bangalore', hotels: '850+', photo: 'https://images.unsplash.com/photo-1697130383976-38f28c444292?q=80&w=1026&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { name: 'Chennai', hotels: '620+', photo: 'https://images.unsplash.com/photo-1636006324678-ec581d7db552?q=80&w=400&h=300&auto=format&fit=crop' },
    { name: 'Kolkata', hotels: '540+', photo: 'https://images.unsplash.com/photo-1558431382-27e303142255?q=80&w=400&h=300&auto=format&fit=crop' },
    { name: 'Hyderabad', hotels: '710+', photo: 'https://images.unsplash.com/photo-1551161242-b5af797b7233?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aHlkZXJhYmFkfGVufDB8fDB8fHww' },
    { name: 'Pune', hotels: '480+', photo: 'https://plus.unsplash.com/premium_photo-1691031428827-adf34ee712d4?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { name: 'Jaipur', hotels: '390+', photo: 'https://images.unsplash.com/photo-1635929620316-d34cecc5639b?q=80&w=400&h=300&auto=format&fit=crop' },
    { name: 'Goa', hotels: '650+', photo: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=400&h=300&auto=format&fit=crop' },
    { name: 'Udaipur', hotels: '280+', photo: 'https://images.unsplash.com/photo-1589901164570-f9de6556e1c1?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dWRhaXB1cnxlbnwwfHwwfHx8MA%3D%3D' },
];

const Home = () => {
    const navigate = useNavigate();
    const [searchCity, setSearchCity] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchCity.trim()) {
            navigate(`/search?city=${encodeURIComponent(searchCity)}`);
        }
    };

    return (
        <div className="home">
            {/* ── Hero Section ── */}
            <section className="hero">
                {/* Real hotel photo background */}
                <img
                    className="hero-bg-photo"
                    src="https://images.unsplash.com/photo-1677129667171-92abd8740fa3?q=80&w=1920&auto=format&fit=crop"
                    alt="Luxury hotel lobby"
                />
                {/* Dark overlay for text readability */}
                <div className="hero-overlay-gradient" />
                {/* Floating particles */}
                <div className="hero-particles">
                    <span /><span /><span /><span /><span />
                </div>

                <div className="hero-content">
                    <div className="hero-badge fade-in">
                        <span className="badge-dot" />
                        Trusted by 50,000+ travelers across India
                    </div>

                    <h1 className="hero-title fade-in">
                        Find Your <span className="highlight">Perfect Stay</span><br />
                        Across India
                    </h1>

                    <p className="hero-subtitle fade-in-delay">
                        Book hotels with real-time availability, instant confirmation,
                        and best price guarantee.
                    </p>

                    <form onSubmit={handleSearch} className="search-box fade-in-delay">
                        <div className="search-input-wrapper">
                            <FaMapMarkerAlt className="search-input-icon" />
                            <input
                                type="text"
                                placeholder="Where do you want to go?"
                                value={searchCity}
                                onChange={(e) => setSearchCity(e.target.value)}
                                className="search-input"
                            />
                        </div>
                        <button type="submit" className="search-btn">
                            <FaSearch />
                            Search Hotels
                        </button>
                    </form>

                    <div className="hero-stats fade-in-delay-2">
                        <div className="hero-stat">
                            <div className="hero-stat-value">10K+</div>
                            <div className="hero-stat-label">Hotels</div>
                        </div>
                        <div className="hero-stat-divider" />
                        <div className="hero-stat">
                            <div className="hero-stat-value">50+</div>
                            <div className="hero-stat-label">Cities</div>
                        </div>
                        <div className="hero-stat-divider" />
                        <div className="hero-stat">
                            <div className="hero-stat-value">4.8★</div>
                            <div className="hero-stat-label">Avg Rating</div>
                        </div>
                        <div className="hero-stat-divider" />
                        <div className="hero-stat">
                            <div className="hero-stat-value">24/7</div>
                            <div className="hero-stat-label">Support</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Popular Destinations ── */}
            <section className="popular-cities">
                <div className="container">
                    <div className="section-header">
                        <div className="section-label">
                            <FaMapMarkerAlt /> Popular Destinations
                        </div>
                        <h2 className="section-title">Where do you want to explore?</h2>
                        <p className="section-subtitle">
                            Discover handpicked hotels across India's most sought-after destinations
                        </p>
                    </div>
                    <div className="cities-grid">
                        {CITY_DATA.map((city) => (
                            <button
                                key={city.name}
                                onClick={() => navigate(`/search?city=${city.name}`)}
                                className="city-card"
                            >
                                <div className="city-photo-wrap">
                                    <img
                                        src={city.photo}
                                        alt={city.name}
                                        className="city-photo"
                                        loading="lazy"
                                    />
                                    <div className="city-photo-overlay" />
                                    <div className="city-labels">
                                        <span className="city-name">{city.name}</span>
                                        <span className="city-hotels">{city.hotels} hotels</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Features ── */}
            <section className="features">
                <div className="container">
                    <div className="section-header">
                        <div className="section-label">Why Kamra.com</div>
                        <h2 className="section-title">Everything you need, nothing you don't</h2>
                        <p className="section-subtitle">
                            We've built the smartest hotel booking experience for India
                        </p>
                    </div>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon feature-icon-green"><FaHotel /></div>
                            <h3>Wide Selection</h3>
                            <p>10,000+ verified hotels across 50+ cities — from budget stays to 5-star luxury resorts.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon feature-icon-amber"><FaStar /></div>
                            <h3>Real-Time Availability</h3>
                            <p>Live room availability with instant booking confirmation. No waiting, no double bookings.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon feature-icon-blue"><FaShieldAlt /></div>
                            <h3>Secure & Trusted</h3>
                            <p>SSL encrypted payments, verified partners, and a 100% money-back guarantee on cancellations.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="cta-section">
                <div className="container">
                    <h2>Ready to find your perfect stay?</h2>
                    <p>Join over 50,000 travelers who book with Kamra.com every month</p>
                    <div className="cta-buttons">
                        <button onClick={() => navigate('/search')} className="btn btn-white btn-lg">
                            <FaSearch /> Explore Hotels
                        </button>
                        <button onClick={() => navigate('/signup')} className="btn btn-outline-white btn-lg">
                            Sign Up Free
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
