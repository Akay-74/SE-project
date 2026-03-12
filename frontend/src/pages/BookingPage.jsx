import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hotelService } from '../services/hotelService';
import { bookingService } from '../services/bookingService';
import LoadingSpinner from '../components/LoadingSpinner';
import {
    FaArrowLeft,
    FaCalendarAlt,
    FaUser,
    FaCheck,
    FaMapMarkerAlt,
    FaBed,
    FaMoon,
    FaCheckCircle,
    FaExclamationTriangle,
    FaCreditCard,
    FaMobileAlt,
    FaUniversity,
    FaWallet,
} from 'react-icons/fa';
import './BookingPage.css';

const STEPS = [
    { id: 1, label: 'Dates' },
    { id: 2, label: 'Guest Info' },
    { id: 3, label: 'Payment' },
    { id: 4, label: 'Confirm' },
];

const PAYMENT_METHODS = [
    { id: 'card', label: 'Credit / Debit Card', icon: FaCreditCard, description: 'Visa, Mastercard, RuPay' },
    { id: 'upi', label: 'UPI', icon: FaMobileAlt, description: 'Google Pay, PhonePe, Paytm' },
    { id: 'netbanking', label: 'Net Banking', icon: FaUniversity, description: 'All major banks' },
    { id: 'wallet', label: 'Wallet', icon: FaWallet, description: 'Paytm, Amazon Pay' },
];

const BookingPage = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Data state
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Form state
    const [step, setStep] = useState(1);
    const [checkInDate, setCheckInDate] = useState('');
    const [checkOutDate, setCheckOutDate] = useState('');
    const [numberOfRooms, setNumberOfRooms] = useState(1);
    const [guestDetails, setGuestDetails] = useState({
        name: '',
        phone: '',
        email: '',
        specialRequests: '',
    });
    const [paymentMethod, setPaymentMethod] = useState('');

    // Availability state
    const [availability, setAvailability] = useState(null);
    const [checkingAvailability, setCheckingAvailability] = useState(false);

    // Booking state
    const [submitting, setSubmitting] = useState(false);
    const [bookingResult, setBookingResult] = useState(null);
    const [bookingError, setBookingError] = useState('');

    // Fetch room details
    useEffect(() => {
        fetchRoomDetails();
    }, [roomId]);

    // Pre-fill guest details from user
    useEffect(() => {
        if (user) {
            setGuestDetails((prev) => ({
                ...prev,
                name: user.name || '',
                email: user.email || '',
            }));
        }
    }, [user]);

    const fetchRoomDetails = async () => {
        try {
            setLoading(true);
            const response = await hotelService.getRoomById(roomId);
            setRoom(response.data);
        } catch (err) {
            console.error('Error fetching room details:', err);
            setError('Failed to load room details. The room may not exist.');
        } finally {
            setLoading(false);
        }
    };

    // Computed values
    const getMinCheckIn = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const getMinCheckOut = () => {
        if (!checkInDate) return getMinCheckIn();
        const nextDay = new Date(checkInDate);
        nextDay.setDate(nextDay.getDate() + 1);
        return nextDay.toISOString().split('T')[0];
    };

    const getNights = () => {
        if (!checkInDate || !checkOutDate) return 0;
        const diffMs = new Date(checkOutDate) - new Date(checkInDate);
        return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    };

    const getTotalPrice = () => {
        if (!room) return 0;
        return room.pricePerNight * getNights() * numberOfRooms;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    // Handlers
    const handleCheckAvailability = async () => {
        if (!checkInDate || !checkOutDate) return;

        try {
            setCheckingAvailability(true);
            const response = await hotelService.checkAvailability(
                roomId,
                checkInDate,
                checkOutDate
            );
            setAvailability(response.data);
        } catch (err) {
            console.error('Error checking availability:', err);
            setAvailability(null);
        } finally {
            setCheckingAvailability(false);
        }
    };

    const handleNextStep = () => {
        if (step === 1) {
            if (!checkInDate || !checkOutDate) return;
            if (!availability || availability.availableRooms < numberOfRooms) return;
            setStep(2);
        } else if (step === 2) {
            if (!guestDetails.name || !guestDetails.phone || !guestDetails.email) return;
            setStep(3);
        } else if (step === 3) {
            if (!paymentMethod) return;
            setStep(4);
        }
    };

    const handlePrevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmitBooking = async () => {
        try {
            setSubmitting(true);
            setBookingError('');

            const bookingData = {
                hotel: room.hotel._id,
                room: room._id,
                checkInDate,
                checkOutDate,
                numberOfRooms,
                guestDetails,
                paymentMethod,
            };

            const response = await bookingService.createBooking(bookingData);
            setBookingResult(response.data);
            setStep(5); // Confirmation step
        } catch (err) {
            console.error('Error creating booking:', err);
            setBookingError(
                err.response?.data?.message || 'Failed to create booking. Please try again.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleGuestChange = (field, value) => {
        setGuestDetails((prev) => ({ ...prev, [field]: value }));
    };

    // Loading & error states
    if (loading) {
        return <LoadingSpinner message="Loading room details..." />;
    }

    if (error || !room) {
        return (
            <div className="booking-page">
                <div className="container">
                    <div className="booking-error">
                        <FaExclamationTriangle className="error-icon" />
                        <h2>Oops!</h2>
                        <p>{error || 'Room not found'}</p>
                        <button className="btn btn-primary" onClick={() => navigate(-1)}>
                            <FaArrowLeft /> Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Confirmation view
    if (step === 5 && bookingResult) {
        return (
            <div className="booking-page">
                <div className="container">
                    <div className="booking-confirmation">
                        <div className="confirmation-icon">
                            <FaCheckCircle />
                        </div>
                        <h2>Booking Confirmed!</h2>
                        <p>Your reservation has been successfully created.</p>

                        <div className="confirmation-details">
                            <h3>Booking Details</h3>
                            <div className="confirmation-row">
                                <span className="label">Booking Reference</span>
                                <span className="value booking-ref">
                                    {bookingResult.bookingReference}
                                </span>
                            </div>
                            <div className="confirmation-row">
                                <span className="label">Hotel</span>
                                <span className="value">{bookingResult.hotel?.name}</span>
                            </div>
                            <div className="confirmation-row">
                                <span className="label">Room Type</span>
                                <span className="value">{bookingResult.room?.roomType}</span>
                            </div>
                            <div className="confirmation-row">
                                <span className="label">Check-in</span>
                                <span className="value">
                                    {formatDate(bookingResult.checkInDate)}
                                </span>
                            </div>
                            <div className="confirmation-row">
                                <span className="label">Check-out</span>
                                <span className="value">
                                    {formatDate(bookingResult.checkOutDate)}
                                </span>
                            </div>
                            <div className="confirmation-row">
                                <span className="label">Rooms</span>
                                <span className="value">{bookingResult.numberOfRooms}</span>
                            </div>
                            <div className="confirmation-row">
                                <span className="label">Total Amount</span>
                                <span className="value">₹{bookingResult.totalPrice?.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="confirmation-row">
                                <span className="label">Status</span>
                                <span className="value" style={{ color: 'var(--success)', textTransform: 'capitalize' }}>
                                    {bookingResult.status}
                                </span>
                            </div>
                        </div>

                        <div className="confirmation-actions">
                            <button
                                className="btn btn-outline"
                                onClick={() => navigate('/')}
                            >
                                Back to Home
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={() => navigate('/my-bookings')}
                            >
                                View My Bookings
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="booking-page">
            <div className="container">
                <button className="btn btn-ghost booking-back-button" onClick={() => navigate(-1)}>
                    <FaArrowLeft /> Back to Hotel
                </button>

                {/* Step Indicator */}
                <div className="booking-steps">
                    {STEPS.map((s, index) => (
                        <div key={s.id} className="booking-step">
                            {index > 0 && (
                                <div
                                    className={`step-connector ${step > s.id - 1 ? 'completed' : ''}`}
                                />
                            )}
                            <div
                                className={`step-number ${step === s.id ? 'active' : step > s.id ? 'completed' : ''
                                    }`}
                            >
                                {step > s.id ? <FaCheck /> : s.id}
                            </div>
                            <span
                                className={`step-label ${step === s.id ? 'active' : step > s.id ? 'completed' : ''
                                    }`}
                            >
                                {s.label}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="booking-layout">
                    {/* Main Form Area */}
                    <div className="booking-form-card">
                        {/* Step 1: Date Selection */}
                        {step === 1 && (
                            <>
                                <h2>
                                    <FaCalendarAlt style={{ marginRight: '8px', color: 'var(--primary)' }} />
                                    Select Your Dates
                                </h2>
                                <p className="booking-form-subtitle">
                                    Choose your check-in and check-out dates
                                </p>

                                <div className="date-grid">
                                    <div className="form-group">
                                        <label className="form-label">Check-in Date</label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            value={checkInDate}
                                            min={getMinCheckIn()}
                                            onChange={(e) => {
                                                setCheckInDate(e.target.value);
                                                setAvailability(null);
                                                if (checkOutDate && e.target.value >= checkOutDate) {
                                                    setCheckOutDate('');
                                                }
                                            }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Check-out Date</label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            value={checkOutDate}
                                            min={getMinCheckOut()}
                                            onChange={(e) => {
                                                setCheckOutDate(e.target.value);
                                                setAvailability(null);
                                            }}
                                            disabled={!checkInDate}
                                        />
                                    </div>
                                </div>

                                <div className="rooms-selector form-group">
                                    <label className="form-label">Number of Rooms</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={numberOfRooms}
                                        min={1}
                                        max={room.totalRooms}
                                        onChange={(e) => {
                                            setNumberOfRooms(parseInt(e.target.value) || 1);
                                            setAvailability(null);
                                        }}
                                    />
                                </div>

                                {checkInDate && checkOutDate && (
                                    <button
                                        className="btn btn-outline"
                                        onClick={handleCheckAvailability}
                                        disabled={checkingAvailability}
                                    >
                                        {checkingAvailability ? 'Checking...' : 'Check Availability'}
                                    </button>
                                )}

                                {availability && (
                                    <div
                                        className={`availability-result ${availability.availableRooms >= numberOfRooms
                                            ? 'available'
                                            : 'unavailable'
                                            }`}
                                    >
                                        {availability.availableRooms >= numberOfRooms ? (
                                            <p>
                                                <FaCheckCircle style={{ marginRight: '8px' }} />
                                                {availability.availableRooms} room(s) available for
                                                your dates!
                                            </p>
                                        ) : (
                                            <p>
                                                <FaExclamationTriangle style={{ marginRight: '8px' }} />
                                                Only {availability.availableRooms} room(s) available.
                                                Please adjust your selection.
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div className="form-actions">
                                    <div />
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleNextStep}
                                        disabled={
                                            !checkInDate ||
                                            !checkOutDate ||
                                            !availability ||
                                            availability.availableRooms < numberOfRooms
                                        }
                                    >
                                        Continue
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Step 2: Guest Details */}
                        {step === 2 && (
                            <>
                                <h2>
                                    <FaUser style={{ marginRight: '8px', color: 'var(--primary)' }} />
                                    Guest Details
                                </h2>
                                <p className="booking-form-subtitle">
                                    Enter the primary guest information
                                </p>

                                <div className="guest-form-grid">
                                    <div className="form-group">
                                        <label className="form-label">Full Name *</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="John Doe"
                                            value={guestDetails.name}
                                            onChange={(e) =>
                                                handleGuestChange('name', e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Phone Number *</label>
                                        <input
                                            type="tel"
                                            className="form-input"
                                            placeholder="+91 98765 43210"
                                            value={guestDetails.phone}
                                            onChange={(e) =>
                                                handleGuestChange('phone', e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Email Address *</label>
                                        <input
                                            type="email"
                                            className="form-input"
                                            placeholder="john@example.com"
                                            value={guestDetails.email}
                                            onChange={(e) =>
                                                handleGuestChange('email', e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Special Requests</label>
                                        <textarea
                                            className="form-textarea"
                                            placeholder="Any special requests? (e.g., early check-in, extra bed, etc.)"
                                            value={guestDetails.specialRequests}
                                            onChange={(e) =>
                                                handleGuestChange('specialRequests', e.target.value)
                                            }
                                            rows={3}
                                        />
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button className="btn btn-ghost" onClick={handlePrevStep}>
                                        <FaArrowLeft /> Back
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleNextStep}
                                        disabled={
                                            !guestDetails.name ||
                                            !guestDetails.phone ||
                                            !guestDetails.email
                                        }
                                    >
                                        Review Booking
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Step 3: Payment */}
                        {step === 3 && (
                            <>
                                <h2>
                                    <FaCreditCard style={{ marginRight: '8px', color: 'var(--primary)' }} />
                                    Payment Method
                                </h2>
                                <p className="booking-form-subtitle">
                                    Select your preferred payment method to complete the booking
                                </p>

                                <div className="payment-methods-grid">
                                    {PAYMENT_METHODS.map((method) => {
                                        const Icon = method.icon;
                                        return (
                                            <div
                                                key={method.id}
                                                className={`payment-method-card ${paymentMethod === method.id ? 'selected' : ''}`}
                                                onClick={() => setPaymentMethod(method.id)}
                                            >
                                                <div className="payment-method-radio">
                                                    <div className={`radio-dot ${paymentMethod === method.id ? 'active' : ''}`} />
                                                </div>
                                                <div className="payment-method-icon">
                                                    <Icon />
                                                </div>
                                                <div className="payment-method-info">
                                                    <span className="payment-method-label">{method.label}</span>
                                                    <span className="payment-method-desc">{method.description}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="payment-note">
                                    <FaExclamationTriangle style={{ marginRight: '8px', color: 'var(--warning)' }} />
                                    <span>Full prepayment is required to confirm your booking. Amount: <strong>₹{getTotalPrice().toLocaleString('en-IN')}</strong></span>
                                </div>

                                <div className="form-actions">
                                    <button className="btn btn-ghost" onClick={handlePrevStep}>
                                        <FaArrowLeft /> Back
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleNextStep}
                                        disabled={!paymentMethod}
                                    >
                                        Proceed to Review
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Step 4: Confirmation */}
                        {step === 4 && (
                            <>
                                <h2>
                                    <FaCheck style={{ marginRight: '8px', color: 'var(--primary)' }} />
                                    Review & Confirm
                                </h2>
                                <p className="booking-form-subtitle">
                                    Please review your booking details before confirming
                                </p>

                                <div className="confirmation-details" style={{ maxWidth: '100%' }}>
                                    <h3>Stay Details</h3>
                                    <div className="confirmation-row">
                                        <span className="label">Check-in</span>
                                        <span className="value">{formatDate(checkInDate)}</span>
                                    </div>
                                    <div className="confirmation-row">
                                        <span className="label">Check-out</span>
                                        <span className="value">{formatDate(checkOutDate)}</span>
                                    </div>
                                    <div className="confirmation-row">
                                        <span className="label">Duration</span>
                                        <span className="value">{getNights()} night(s)</span>
                                    </div>
                                    <div className="confirmation-row">
                                        <span className="label">Room(s)</span>
                                        <span className="value">{numberOfRooms}</span>
                                    </div>
                                </div>

                                <div
                                    className="confirmation-details"
                                    style={{ maxWidth: '100%', marginTop: 'var(--spacing-lg)' }}
                                >
                                    <h3>Guest Information</h3>
                                    <div className="confirmation-row">
                                        <span className="label">Name</span>
                                        <span className="value">{guestDetails.name}</span>
                                    </div>
                                    <div className="confirmation-row">
                                        <span className="label">Phone</span>
                                        <span className="value">{guestDetails.phone}</span>
                                    </div>
                                    <div className="confirmation-row">
                                        <span className="label">Email</span>
                                        <span className="value">{guestDetails.email}</span>
                                    </div>
                                    {guestDetails.specialRequests && (
                                        <div className="confirmation-row">
                                            <span className="label">Special Requests</span>
                                            <span className="value">
                                                {guestDetails.specialRequests}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {bookingError && (
                                    <div
                                        className="availability-result unavailable"
                                        style={{ marginTop: 'var(--spacing-lg)' }}
                                    >
                                        <p>
                                            <FaExclamationTriangle style={{ marginRight: '8px' }} />
                                            {bookingError}
                                        </p>
                                    </div>
                                )}

                                <div className="form-actions">
                                    <button className="btn btn-ghost" onClick={handlePrevStep}>
                                        <FaArrowLeft /> Back
                                    </button>
                                    <button
                                        className="btn btn-primary btn-lg"
                                        onClick={handleSubmitBooking}
                                        disabled={submitting || !paymentMethod}
                                    >
                                        {submitting ? 'Processing Payment...' : `Pay ₹${getTotalPrice().toLocaleString('en-IN')} & Confirm`}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Summary Sidebar */}
                    <div className="booking-summary-card">
                        <div className="summary-header">
                            <div className="summary-image">
                                {room.images && room.images[0] ? (
                                    <img src={room.images[0]} alt={room.roomType} />
                                ) : (
                                    <div className="summary-image-placeholder">
                                        <FaBed />
                                    </div>
                                )}
                            </div>
                            <div className="summary-hotel-info">
                                <h3>{room.hotel?.name}</h3>
                                {room.hotel?.location && (
                                    <p>
                                        <FaMapMarkerAlt
                                            style={{ marginRight: '4px', fontSize: '11px' }}
                                        />
                                        {room.hotel.location.city}
                                        {room.hotel.location.state
                                            ? `, ${room.hotel.location.state}`
                                            : ''}
                                    </p>
                                )}
                                <div className="summary-room-type">{room.roomType}</div>
                            </div>
                        </div>

                        <div className="summary-details">
                            <div className="summary-row">
                                <span className="label">Price per night</span>
                                <span className="value">
                                    ₹{room.pricePerNight?.toLocaleString('en-IN')}
                                </span>
                            </div>
                            {getNights() > 0 && (
                                <>
                                    <div className="summary-row">
                                        <span className="label">
                                            <FaCalendarAlt
                                                style={{ marginRight: '6px', fontSize: '11px' }}
                                            />
                                            Check-in
                                        </span>
                                        <span className="value">{formatDate(checkInDate)}</span>
                                    </div>
                                    <div className="summary-row">
                                        <span className="label">
                                            <FaCalendarAlt
                                                style={{ marginRight: '6px', fontSize: '11px' }}
                                            />
                                            Check-out
                                        </span>
                                        <span className="value">{formatDate(checkOutDate)}</span>
                                    </div>
                                    <div className="summary-row">
                                        <span className="label">
                                            <FaMoon
                                                style={{ marginRight: '6px', fontSize: '11px' }}
                                            />
                                            Nights
                                        </span>
                                        <span className="value">{getNights()}</span>
                                    </div>
                                    <div className="summary-row">
                                        <span className="label">
                                            <FaBed
                                                style={{ marginRight: '6px', fontSize: '11px' }}
                                            />
                                            Rooms
                                        </span>
                                        <span className="value">{numberOfRooms}</span>
                                    </div>
                                    <div className="summary-divider" />
                                    <div className="summary-row">
                                        <span className="label">
                                            ₹{room.pricePerNight?.toLocaleString('en-IN')} ×{' '}
                                            {getNights()} night(s) × {numberOfRooms} room(s)
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>

                        {getNights() > 0 && (
                            <div className="summary-total">
                                <span className="label">Total</span>
                                <span className="value">
                                    ₹{getTotalPrice().toLocaleString('en-IN')}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;
