import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { hotelService } from '../services/hotelService';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaMapMarkerAlt, FaStar, FaSearch, FaFilter } from 'react-icons/fa';
import './Search.css';

const Search = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Search filters
    const [searchCity, setSearchCity] = useState(searchParams.get('city') || '');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [minRating, setMinRating] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const city = searchParams.get('city');
        if (city) {
            setSearchCity(city);
            searchHotels(city);
        }
    }, [searchParams]);

    const searchHotels = async (city, filters = {}) => {
        try {
            setLoading(true);
            setError('');

            const params = {
                city: city || searchCity,
                ...filters
            };

            // Remove empty params
            Object.keys(params).forEach(key => {
                if (!params[key]) delete params[key];
            });

            const response = await hotelService.searchHotels(params);
            setHotels(response.data || []);
        } catch (err) {
            console.error('Error searching hotels:', err);
            setError('Failed to search hotels. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchCity.trim()) {
            setSearchParams({ city: searchCity });
            searchHotels(searchCity, {
                minPrice,
                maxPrice,
                rating: minRating
            });
        }
    };

    const handleApplyFilters = () => {
        searchHotels(searchCity, {
            minPrice,
            maxPrice,
            rating: minRating
        });
    };

    const handleClearFilters = () => {
        setMinPrice('');
        setMaxPrice('');
        setMinRating('');
        searchHotels(searchCity);
    };

    const handleViewHotel = (hotelId) => {
        navigate(`/hotel/${hotelId}`);
    };

    return (
        <div className="search-page">
            <div className="container">
                {/* Search Header */}
                <div className="search-header">
                    <form onSubmit={handleSearch} className="search-bar">
                        <div className="search-input-wrapper">
                            <FaMapMarkerAlt className="input-icon" />
                            <input
                                type="text"
                                placeholder="Search by city..."
                                value={searchCity}
                                onChange={(e) => setSearchCity(e.target.value)}
                                className="search-input"
                            />
                        </div>
                        <button type="submit" className="btn btn-primary">
                            <FaSearch /> Search
                        </button>
                    </form>

                    <button
                        className="btn btn-ghost filter-toggle"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <FaFilter /> Filters
                    </button>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="filters-panel">
                        <div className="filters-grid">
                            <div className="filter-group">
                                <label>Min Price (₹)</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                    min="0"
                                />
                            </div>
                            <div className="filter-group">
                                <label>Max Price (₹)</label>
                                <input
                                    type="number"
                                    placeholder="1000"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    min="0"
                                />
                            </div>
                            <div className="filter-group">
                                <label>Min Rating</label>
                                <select
                                    value={minRating}
                                    onChange={(e) => setMinRating(e.target.value)}
                                >
                                    <option value="">Any</option>
                                    <option value="3">3+ Stars</option>
                                    <option value="4">4+ Stars</option>
                                    <option value="4.5">4.5+ Stars</option>
                                </select>
                            </div>
                        </div>
                        <div className="filter-actions">
                            <button
                                className="btn btn-ghost"
                                onClick={handleClearFilters}
                            >
                                Clear Filters
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleApplyFilters}
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                )}

                {/* Results */}
                {loading ? (
                    <LoadingSpinner message="Searching for hotels..." />
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : (
                    <div className="search-results">
                        <div className="results-header">
                            <h2>
                                {hotels.length} {hotels.length === 1 ? 'Hotel' : 'Hotels'}
                                {searchCity && ` in ${searchCity}`}
                            </h2>
                        </div>

                        {hotels.length === 0 ? (
                            <div className="no-results">
                                <FaMapMarkerAlt className="no-results-icon" />
                                <h3>No hotels found</h3>
                                <p>Try adjusting your search or filters</p>
                            </div>
                        ) : (
                            <div className="hotels-grid">
                                {hotels.map((hotel) => (
                                    <div key={hotel._id} className="hotel-card">
                                        <div className="hotel-image">
                                            {hotel.images && hotel.images[0] ? (
                                                <img src={hotel.images[0]} alt={hotel.name} />
                                            ) : (
                                                <div className="hotel-image-placeholder">
                                                    <FaMapMarkerAlt />
                                                </div>
                                            )}
                                        </div>
                                        <div className="hotel-info">
                                            <div className="hotel-header">
                                                <h3>{hotel.name}</h3>
                                                {hotel.rating > 0 && (
                                                    <div className="hotel-rating">
                                                        <FaStar className="star-icon" />
                                                        <span>{hotel.rating.toFixed(1)}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="hotel-location">
                                                <FaMapMarkerAlt /> {hotel.location.city}, {hotel.location.state}
                                            </p>
                                            <p className="hotel-description">{hotel.description}</p>

                                            {hotel.amenities && hotel.amenities.length > 0 && (
                                                <div className="hotel-amenities">
                                                    {hotel.amenities.slice(0, 3).map((amenity, index) => (
                                                        <span key={index} className="amenity-tag">
                                                            {amenity}
                                                        </span>
                                                    ))}
                                                    {hotel.amenities.length > 3 && (
                                                        <span className="amenity-tag">
                                                            +{hotel.amenities.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            <div className="hotel-footer">
                                                <div className="hotel-reviews">
                                                    {hotel.totalReviews > 0 && (
                                                        <span>{hotel.totalReviews} reviews</span>
                                                    )}
                                                </div>
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={() => handleViewHotel(hotel._id)}
                                                >
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;
