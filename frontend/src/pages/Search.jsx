import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { hotelService } from '../services/hotelService';
import { FaMapMarkerAlt, FaStar, FaSearch, FaFilter, FaWifi, FaSwimmingPool, FaParking, FaUtensils, FaTimes } from 'react-icons/fa';
import './Search.css';

const Search = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchCity, setSearchCity] = useState(searchParams.get('city') || '');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('10000');
    const [minRating, setMinRating] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState('rating');

    useEffect(() => {
        const city = searchParams.get('city');
        if (city) {
            setSearchCity(city);
            searchHotels(city);
        } else {
            searchHotels('');
        }
    }, [searchParams]);

    const searchHotels = async (city, filters = {}) => {
        try {
            setLoading(true);
            setError('');
            const params = { city: city || searchCity, ...filters };
            Object.keys(params).forEach(key => { if (!params[key]) delete params[key]; });
            const response = await hotelService.searchHotels(params);
            setHotels(response.data || []);
        } catch (err) {
            setError('Failed to search hotels. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchCity.trim()) {
            setSearchParams({ city: searchCity });
            searchHotels(searchCity, { minPrice, maxPrice, rating: minRating });
        }
    };

    const handleApplyFilters = () => {
        searchHotels(searchCity, { minPrice, maxPrice, rating: minRating });
    };

    const handleClearFilters = () => {
        setMinPrice('');
        setMaxPrice('10000');
        setMinRating('');
        searchHotels(searchCity);
    };

    const getAmenityIcon = (a) => {
        const l = a.toLowerCase();
        if (l.includes('wifi')) return <FaWifi />;
        if (l.includes('pool')) return <FaSwimmingPool />;
        if (l.includes('parking')) return <FaParking />;
        if (l.includes('restaurant') || l.includes('dining')) return <FaUtensils />;
        return null;
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <FaStar key={i} style={{ color: i < Math.round(rating) ? '#f59e0b' : '#e2e8f0' }} />
        ));
    };

    return (
        <div className="search-page">
            {/* Sticky Search Bar */}
            <div className="search-header">
                <div className="container">
                    <form onSubmit={handleSearch} className="search-bar">
                        <div className="search-bar-input-wrap">
                            <FaMapMarkerAlt className="search-bar-icon" />
                            <input
                                type="text"
                                placeholder="Search by city (e.g. Mumbai, Goa, Delhi)..."
                                value={searchCity}
                                onChange={(e) => setSearchCity(e.target.value)}
                                className="search-bar-input"
                            />
                        </div>
                        <button type="submit" className="btn btn-primary">
                            <FaSearch /> Search
                        </button>
                        <button
                            type="button"
                            className={`btn btn-outline btn-sm ${showFilters ? 'active' : ''}`}
                            onClick={() => setShowFilters(f => !f)}
                        >
                            <FaFilter /> Filters
                        </button>
                    </form>
                </div>
            </div>

            <div className="container">
                <div className="search-layout">
                    {/* Sidebar Filters */}
                    <aside className={`filters-panel ${showFilters ? 'filters-open' : ''}`} style={{ display: 'block' }}>
                        <div className="filters-header">
                            <h3>Filters</h3>
                            <button className="btn btn-ghost btn-sm" onClick={handleClearFilters}>
                                Clear all
                            </button>
                        </div>
                        <div className="filters-body">
                            {/* Price Range */}
                            <div className="filter-section">
                                <h4>Price per night</h4>
                                <div className="price-range-display">
                                    <span>₹{minPrice || 0}</span>
                                    <span>₹{maxPrice || 10000}</span>
                                </div>
                                <input
                                    type="range"
                                    className="range-input"
                                    min="0" max="20000" step="500"
                                    value={maxPrice || 10000}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                />
                                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                    <input
                                        type="number"
                                        className="form-input"
                                        placeholder="Min ₹"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                        style={{ padding: '6px 10px', fontSize: '13px' }}
                                    />
                                    <input
                                        type="number"
                                        className="form-input"
                                        placeholder="Max ₹"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                        style={{ padding: '6px 10px', fontSize: '13px' }}
                                    />
                                </div>
                            </div>

                            {/* Star Rating */}
                            <div className="filter-section">
                                <h4>Star Rating</h4>
                                <div className="star-options">
                                    {['', '3', '4', '4.5'].map((val, i) => (
                                        <label key={i} className="star-option">
                                            <input
                                                type="radio"
                                                name="rating"
                                                checked={minRating === val}
                                                onChange={() => setMinRating(val)}
                                            />
                                            <span className="star-option-label">
                                                {val ? (
                                                    <>
                                                        <span className="stars-display">{'★'.repeat(Math.floor(parseFloat(val)))}</span>
                                                        {val}+ Stars
                                                    </>
                                                ) : 'Any Rating'}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleApplyFilters}>
                                Apply Filters
                            </button>
                        </div>
                    </aside>

                    {/* Results */}
                    <div className="results-area">
                        {loading ? (
                            <div className="search-loading">
                                <div className="spinner" />
                                <p>Searching for hotels...</p>
                            </div>
                        ) : error ? (
                            <div className="alert alert-error">{error}</div>
                        ) : (
                            <>
                                <div className="results-header">
                                    <p className="results-count">
                                        <strong>{hotels.length}</strong> {hotels.length === 1 ? 'hotel' : 'hotels'}
                                        {searchCity && ` found in ${searchCity}`}
                                    </p>
                                    <select
                                        className="sort-select"
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                    >
                                        <option value="rating">Top Rated</option>
                                        <option value="price_asc">Price: Low to High</option>
                                        <option value="price_desc">Price: High to Low</option>
                                    </select>
                                </div>

                                {hotels.length === 0 ? (
                                    <div className="empty-state">
                                        <div className="empty-state-icon">🏨</div>
                                        <h3>No hotels found</h3>
                                        <p>Try a different city or adjust your filters</p>
                                    </div>
                                ) : (
                                    <div className="hotel-list">
                                        {hotels.map((hotel) => (
                                            <div
                                                key={hotel._id}
                                                className="hotel-card"
                                                onClick={() => navigate(`/hotel/${hotel._id}`)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div className="hotel-card-image">
                                                    {hotel.images?.[0] ? (
                                                        <img src={hotel.images[0]} alt={hotel.name} />
                                                    ) : (
                                                        <div style={{
                                                            width: '100%', height: '100%', minHeight: 220,
                                                            background: 'linear-gradient(135deg,#ecfdf5,#d1fae5)',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontSize: '3rem'
                                                        }}>🏨</div>
                                                    )}
                                                    {hotel.featured && (
                                                        <div className="hotel-card-badge">
                                                            <span className="badge badge-primary">Featured</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="hotel-card-body">
                                                    <div className="hotel-card-header">
                                                        <div>
                                                            <h3 className="hotel-card-name">{hotel.name}</h3>
                                                            <p className="hotel-card-location">
                                                                <FaMapMarkerAlt />
                                                                {hotel.location?.city}, {hotel.location?.state}
                                                            </p>
                                                        </div>
                                                        {hotel.rating > 0 && (
                                                            <div className="hotel-card-rating">
                                                                <span className="stars">{renderStars(hotel.rating)}</span>
                                                                <span>{hotel.rating.toFixed(1)}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                        {hotel.description}
                                                    </p>

                                                    {hotel.amenities?.length > 0 && (
                                                        <div className="hotel-card-amenities">
                                                            {hotel.amenities.slice(0, 4).map((a, i) => (
                                                                <span key={i} className="amenity-chip">
                                                                    {getAmenityIcon(a)} {a}
                                                                </span>
                                                            ))}
                                                            {hotel.amenities.length > 4 && (
                                                                <span className="amenity-chip">+{hotel.amenities.length - 4}</span>
                                                            )}
                                                        </div>
                                                    )}

                                                    <div className="hotel-card-footer">
                                                        <div className="hotel-card-price-group">
                                                            {hotel.rooms?.[0] ? (
                                                                <>
                                                                    <p className="hotel-card-price">
                                                                        ₹{hotel.rooms[0].pricePerNight}
                                                                        <span>/night</span>
                                                                    </p>
                                                                    <p className="hotel-card-price-note">Starting price</p>
                                                                </>
                                                            ) : (
                                                                <p className="hotel-card-price" style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Price on request</p>
                                                            )}
                                                        </div>
                                                        <button
                                                            className="btn btn-primary btn-sm"
                                                            onClick={(e) => { e.stopPropagation(); navigate(`/hotel/${hotel._id}`); }}
                                                        >
                                                            View Details
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Search;
