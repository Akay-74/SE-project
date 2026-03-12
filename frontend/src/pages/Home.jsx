import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaMapMarkerAlt, FaHotel, FaStar } from 'react-icons/fa';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();
    const [searchCity, setSearchCity] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchCity.trim()) {
            navigate(`/search?city=${encodeURIComponent(searchCity)}`);
        }
    };

    const popularCities = [
        'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata',
        'Hyderabad', 'Pune', 'Jaipur', 'Goa', 'Udaipur'
    ];

    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-overlay"></div>
                <div className="container hero-content">
                    <h1 className="hero-title fade-in">
                        Find Your Perfect Stay
                    </h1>
                    <p className="hero-subtitle fade-in">
                        Book hotels across India with real-time availability and instant confirmation
                    </p>

                    <form onSubmit={handleSearch} className="search-form fade-in">
                        <div className="search-input-wrapper">
                            <FaMapMarkerAlt className="search-icon" />
                            <input
                                type="text"
                                placeholder="Where do you want to go?"
                                value={searchCity}
                                onChange={(e) => setSearchCity(e.target.value)}
                                className="search-input"
                            />
                        </div>
                        <button type="submit" className="btn btn-primary btn-lg">
                            <FaSearch /> Search Hotels
                        </button>
                    </form>
                </div>
            </section>

            {/* Popular Cities */}
            <section className="popular-cities">
                <div className="container">
                    <h2 className="section-title">Popular Destinations</h2>
                    <div className="cities-grid">
                        {popularCities.map((city) => (
                            <button
                                key={city}
                                onClick={() => navigate(`/search?city=${city}`)}
                                className="city-card hover-lift"
                            >
                                <FaMapMarkerAlt className="city-icon" />
                                <span>{city}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="features">
                <div className="container">
                    <h2 className="section-title">Why Choose Us</h2>
                    <div className="features-grid">
                        <div className="feature-card card">
                            <div className="feature-icon">
                                <FaHotel />
                            </div>
                            <h3>Wide Selection</h3>
                            <p>Choose from thousands of hotels across India</p>
                        </div>

                        <div className="feature-card card">
                            <div className="feature-icon">
                                <FaStar />
                            </div>
                            <h3>Real-Time Availability</h3>
                            <p>Live updates on room availability and instant booking</p>
                        </div>

                        <div className="feature-card card">
                            <div className="feature-icon">
                                <FaSearch />
                            </div>
                            <h3>Easy Search</h3>
                            <p>Find the perfect hotel with our advanced filters</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
