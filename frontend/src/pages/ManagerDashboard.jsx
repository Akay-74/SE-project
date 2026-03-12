import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { hotelService } from '../services/hotelService';
import { bookingService } from '../services/bookingService';
import LoadingSpinner from '../components/LoadingSpinner';
import StatCard from '../components/dashboard/StatCard';
import { FaHotel, FaDoorOpen, FaCalendarCheck, FaDollarSign, FaPlus } from 'react-icons/fa';
import './ManagerDashboard.css';

const ManagerDashboard = () => {
    const { user } = useAuth();
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showHotelForm, setShowHotelForm] = useState(false);
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [hotelFormData, setHotelFormData] = useState({
        name: '',
        description: '',
        location: {
            address: '',
            city: '',
            state: '',
            pincode: ''
        },
        amenities: []
    });

    // Room management state
    const [showRoomModal, setShowRoomModal] = useState(false);
    const [selectedHotelForRooms, setSelectedHotelForRooms] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [roomFormData, setRoomFormData] = useState({
        roomType: '',
        description: '',
        pricePerNight: '',
        maxOccupancy: '',
        totalRooms: '',
        amenities: []
    });

    useEffect(() => {
        fetchHotels();
    }, []);

    const fetchHotels = async () => {
        try {
            setLoading(true);
            const response = await hotelService.getManagerHotels();
            setHotels(response.data || []);
        } catch (err) {
            console.error('Error fetching hotels:', err);
            setError('Failed to load hotels');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateHotel = async (e) => {
        e.preventDefault();
        try {
            await hotelService.createHotel(hotelFormData);
            setShowHotelForm(false);
            resetForm();
            fetchHotels();
        } catch (err) {
            console.error('Error creating hotel:', err);
            alert(err.response?.data?.message || 'Failed to create hotel');
        }
    };

    const handleUpdateHotel = async (e) => {
        e.preventDefault();
        try {
            await hotelService.updateHotel(selectedHotel._id, hotelFormData);
            setShowHotelForm(false);
            setSelectedHotel(null);
            resetForm();
            fetchHotels();
        } catch (err) {
            console.error('Error updating hotel:', err);
            alert(err.response?.data?.message || 'Failed to update hotel');
        }
    };

    const resetForm = () => {
        setHotelFormData({
            name: '',
            description: '',
            location: {
                address: '',
                city: '',
                state: '',
                pincode: ''
            },
            amenities: []
        });
    };

    const openEditForm = (hotel) => {
        setSelectedHotel(hotel);
        setHotelFormData({
            name: hotel.name,
            description: hotel.description,
            location: hotel.location,
            amenities: hotel.amenities || []
        });
        setShowHotelForm(true);
    };

    // Room management functions
    const openRoomManagement = async (hotel) => {
        setSelectedHotelForRooms(hotel);
        setShowRoomModal(true);
        await fetchRooms(hotel._id);
    };

    const fetchRooms = async (hotelId) => {
        try {
            const response = await hotelService.getRoomsByHotel(hotelId);
            setRooms(response.data || []);
        } catch (err) {
            console.error('Error fetching rooms:', err);
            alert('Failed to load rooms');
        }
    };

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        try {
            await hotelService.createRoom({
                ...roomFormData,
                hotel: selectedHotelForRooms._id,
                pricePerNight: parseFloat(roomFormData.pricePerNight),
                maxOccupancy: parseInt(roomFormData.maxOccupancy),
                totalRooms: parseInt(roomFormData.totalRooms)
            });
            resetRoomForm();
            await fetchRooms(selectedHotelForRooms._id);
            alert('Room created successfully!');
        } catch (err) {
            console.error('Error creating room:', err);
            alert(err.response?.data?.message || 'Failed to create room');
        }
    };

    const handleUpdateRoom = async (e) => {
        e.preventDefault();
        try {
            await hotelService.updateRoom(selectedRoom._id, {
                ...roomFormData,
                pricePerNight: parseFloat(roomFormData.pricePerNight),
                maxOccupancy: parseInt(roomFormData.maxOccupancy),
                totalRooms: parseInt(roomFormData.totalRooms)
            });
            setSelectedRoom(null);
            resetRoomForm();
            await fetchRooms(selectedHotelForRooms._id);
            alert('Room updated successfully!');
        } catch (err) {
            console.error('Error updating room:', err);
            alert(err.response?.data?.message || 'Failed to update room');
        }
    };

    const openEditRoomForm = (room) => {
        setSelectedRoom(room);
        setRoomFormData({
            roomType: room.roomType,
            description: room.description,
            pricePerNight: room.pricePerNight.toString(),
            maxOccupancy: room.maxOccupancy.toString(),
            totalRooms: room.totalRooms.toString(),
            amenities: room.amenities || []
        });
    };

    const resetRoomForm = () => {
        setRoomFormData({
            roomType: '',
            description: '',
            pricePerNight: '',
            maxOccupancy: '',
            totalRooms: '',
            amenities: []
        });
        setSelectedRoom(null);
    };

    const getStats = () => {
        return {
            totalHotels: hotels.length,
            activeHotels: hotels.filter(h => h.isActive).length,
            totalRooms: hotels.reduce((sum, h) => sum + (h.rooms?.length || 0), 0),
            avgRating: hotels.length > 0
                ? (hotels.reduce((sum, h) => sum + (h.rating || 0), 0) / hotels.length).toFixed(1)
                : '0.0'
        };
    };

    if (loading) {
        return <LoadingSpinner message="Loading your hotels..." />;
    }

    const stats = getStats();

    return (
        <div className="manager-dashboard">
            <div className="container">
                <div className="dashboard-header">
                    <div>
                        <h1>Manager Dashboard</h1>
                        <p>Welcome back, {user?.name}!</p>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            setSelectedHotel(null);
                            resetForm();
                            setShowHotelForm(true);
                        }}
                    >
                        <FaPlus /> Add New Hotel
                    </button>
                </div>

                {/* Statistics Cards */}
                <div className="stats-grid">
                    <StatCard
                        title="Total Hotels"
                        value={stats.totalHotels}
                        icon={FaHotel}
                        color="primary"
                    />
                    <StatCard
                        title="Active Hotels"
                        value={stats.activeHotels}
                        icon={FaCalendarCheck}
                        color="success"
                    />
                    <StatCard
                        title="Total Rooms"
                        value={stats.totalRooms}
                        icon={FaDoorOpen}
                        color="warning"
                    />
                    <StatCard
                        title="Avg Rating"
                        value={stats.avgRating}
                        icon={FaDollarSign}
                        color="info"
                    />
                </div>

                {/* Error Message */}
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {/* Hotel Form Modal */}
                {showHotelForm && (
                    <div className="modal-overlay" onClick={() => setShowHotelForm(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>{selectedHotel ? 'Edit Hotel' : 'Add New Hotel'}</h2>
                                <button
                                    className="modal-close"
                                    onClick={() => setShowHotelForm(false)}
                                >
                                    ×
                                </button>
                            </div>
                            <form onSubmit={selectedHotel ? handleUpdateHotel : handleCreateHotel}>
                                <div className="form-group">
                                    <label>Hotel Name</label>
                                    <input
                                        type="text"
                                        value={hotelFormData.name}
                                        onChange={(e) => setHotelFormData({
                                            ...hotelFormData,
                                            name: e.target.value
                                        })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        value={hotelFormData.description}
                                        onChange={(e) => setHotelFormData({
                                            ...hotelFormData,
                                            description: e.target.value
                                        })}
                                        rows="4"
                                        required
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Address</label>
                                        <input
                                            type="text"
                                            value={hotelFormData.location.address}
                                            onChange={(e) => setHotelFormData({
                                                ...hotelFormData,
                                                location: {
                                                    ...hotelFormData.location,
                                                    address: e.target.value
                                                }
                                            })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>City</label>
                                        <input
                                            type="text"
                                            value={hotelFormData.location.city}
                                            onChange={(e) => setHotelFormData({
                                                ...hotelFormData,
                                                location: {
                                                    ...hotelFormData.location,
                                                    city: e.target.value
                                                }
                                            })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>State</label>
                                        <input
                                            type="text"
                                            value={hotelFormData.location.state}
                                            onChange={(e) => setHotelFormData({
                                                ...hotelFormData,
                                                location: {
                                                    ...hotelFormData.location,
                                                    state: e.target.value
                                                }
                                            })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Pincode</label>
                                        <input
                                            type="text"
                                            value={hotelFormData.location.pincode}
                                            onChange={(e) => setHotelFormData({
                                                ...hotelFormData,
                                                location: {
                                                    ...hotelFormData.location,
                                                    pincode: e.target.value
                                                }
                                            })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-ghost"
                                        onClick={() => setShowHotelForm(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        {selectedHotel ? 'Update Hotel' : 'Create Hotel'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Hotels List */}
                <div className="hotels-section">
                    <h2>My Hotels</h2>
                    {hotels.length === 0 ? (
                        <div className="empty-state">
                            <FaHotel className="empty-icon" />
                            <h3>No hotels yet</h3>
                            <p>Start by adding your first hotel property</p>
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowHotelForm(true)}
                            >
                                <FaPlus /> Add Hotel
                            </button>
                        </div>
                    ) : (
                        <div className="hotels-grid">
                            {hotels.map((hotel) => (
                                <div key={hotel._id} className="hotel-card">
                                    <div className="hotel-card-header">
                                        <h3>{hotel.name}</h3>
                                        <span className={`status-badge ${hotel.isActive ? 'active' : 'inactive'}`}>
                                            {hotel.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <p className="hotel-location">
                                        {hotel.location.city}, {hotel.location.state}
                                    </p>
                                    <p className="hotel-description">{hotel.description}</p>
                                    <div className="hotel-stats">
                                        <div className="stat">
                                            <span className="stat-label">Rating</span>
                                            <span className="stat-value">⭐ {hotel.rating || 'N/A'}</span>
                                        </div>
                                        <div className="stat">
                                            <span className="stat-label">Reviews</span>
                                            <span className="stat-value">{hotel.totalReviews || 0}</span>
                                        </div>
                                    </div>
                                    <div className="hotel-card-footer">
                                        <button
                                            className="btn btn-ghost btn-sm"
                                            onClick={() => openEditForm(hotel)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() => openRoomManagement(hotel)}
                                        >
                                            Manage Rooms
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Room Management Modal */}
                {showRoomModal && selectedHotelForRooms && (
                    <div className="modal-overlay" onClick={() => {
                        setShowRoomModal(false);
                        setSelectedHotelForRooms(null);
                        resetRoomForm();
                    }}>
                        <div className="modal-content" style={{ maxWidth: '900px' }} onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Manage Rooms - {selectedHotelForRooms.name}</h2>
                                <button
                                    className="modal-close"
                                    onClick={() => {
                                        setShowRoomModal(false);
                                        setSelectedHotelForRooms(null);
                                        resetRoomForm();
                                    }}
                                >
                                    ×
                                </button>
                            </div>

                            <div style={{ padding: 'var(--spacing-xl)' }}>
                                {/* Room Form */}
                                <form onSubmit={selectedRoom ? handleUpdateRoom : handleCreateRoom} style={{ marginBottom: 'var(--spacing-2xl)' }}>
                                    <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>{selectedRoom ? 'Edit Room' : 'Add New Room'}</h3>

                                    <div className="form-group">
                                        <label>Room Type</label>
                                        <input
                                            type="text"
                                            value={roomFormData.roomType}
                                            onChange={(e) => setRoomFormData({ ...roomFormData, roomType: e.target.value })}
                                            placeholder="e.g., Deluxe Suite, Standard Room"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea
                                            value={roomFormData.description}
                                            onChange={(e) => setRoomFormData({ ...roomFormData, description: e.target.value })}
                                            rows="3"
                                            placeholder="Describe the room features..."
                                            required
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Price Per Night (₹)</label>
                                            <input
                                                type="number"
                                                value={roomFormData.pricePerNight}
                                                onChange={(e) => setRoomFormData({ ...roomFormData, pricePerNight: e.target.value })}
                                                min="0"
                                                step="0.01"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Max Occupancy</label>
                                            <input
                                                type="number"
                                                value={roomFormData.maxOccupancy}
                                                onChange={(e) => setRoomFormData({ ...roomFormData, maxOccupancy: e.target.value })}
                                                min="1"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Total Rooms</label>
                                            <input
                                                type="number"
                                                value={roomFormData.totalRooms}
                                                onChange={(e) => setRoomFormData({ ...roomFormData, totalRooms: e.target.value })}
                                                min="1"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'flex-end' }}>
                                        {selectedRoom && (
                                            <button
                                                type="button"
                                                className="btn btn-ghost"
                                                onClick={resetRoomForm}
                                            >
                                                Cancel Edit
                                            </button>
                                        )}
                                        <button type="submit" className="btn btn-primary">
                                            {selectedRoom ? 'Update Room' : 'Add Room'}
                                        </button>
                                    </div>
                                </form>

                                {/* Rooms List */}
                                <div>
                                    <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Existing Rooms ({rooms.length})</h3>
                                    {rooms.length === 0 ? (
                                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                                            No rooms added yet. Create your first room above.
                                        </p>
                                    ) : (
                                        <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                                            {rooms.map((room) => (
                                                <div key={room._id} style={{
                                                    background: 'var(--bg-secondary)',
                                                    padding: 'var(--spacing-lg)',
                                                    borderRadius: 'var(--radius-lg)',
                                                    border: selectedRoom?._id === room._id ? '2px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.1)'
                                                }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                                        <div style={{ flex: 1 }}>
                                                            <h4 style={{ color: 'var(--text-primary)', marginBottom: 'var(--spacing-sm)' }}>{room.roomType}</h4>
                                                            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-md)' }}>{room.description}</p>
                                                            <div style={{ display: 'flex', gap: 'var(--spacing-lg)', flexWrap: 'wrap' }}>
                                                                <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                                                                    💰 ₹{room.pricePerNight}/night
                                                                </span>
                                                                <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                                                                    👥 Max {room.maxOccupancy} guests
                                                                </span>
                                                                <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                                                                    🚪 {room.totalRooms} rooms available
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <button
                                                            className="btn btn-ghost btn-sm"
                                                            onClick={() => openEditRoomForm(room)}
                                                        >
                                                            Edit
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManagerDashboard;
