# Room Booking System

A modern, full-stack hotel room booking platform for the Indian market with real-time availability, OAuth authentication, and role-based access control.

## Features

- 🔐 **Google OAuth Authentication** - Secure login with Google
- 🏨 **Hotel Management** - Search, view, and manage hotels
- 🛏️ **Room Booking** - Real-time availability and instant booking
- 👥 **Role-Based Access** - User, Manager, and Admin roles
- ⚡ **Real-Time Updates** - Socket.io for live availability
- 📱 **Responsive Design** - Works on all devices
- 💳 **Payment Ready** - Database schema ready for payment integration

## Tech Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Passport.js (Google OAuth)
- JWT Authentication
- Socket.io (Real-time)

### Frontend
- React 18
- React Router
- Axios
- Socket.io Client
- Vanilla CSS

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Google OAuth credentials

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
6. Copy Client ID and Client Secret

### Installation

1. **Clone the repository**
   ```bash
   cd "c:\Users\aayaa\OneDrive\Desktop\New Codes\SE project"
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Create backend .env file**
   ```bash
   copy .env.example .env
   ```

4. **Edit backend/.env with your credentials:**
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/room-booking
   JWT_SECRET=your-super-secret-jwt-key-change-this
   FRONTEND_URL=http://localhost:5173
   
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
   
   SESSION_SECRET=your-session-secret
   NODE_ENV=development
   ```

5. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

6. **Create frontend .env file** (optional)
   ```bash
   # frontend/.env
   VITE_API_URL=http://localhost:5000/api
   ```

### Running the Application

1. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

2. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   Server will run on http://localhost:5000

3. **Start Frontend** (in a new terminal)
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on http://localhost:5173

4. **Access the application**
   Open http://localhost:5173 in your browser

## Project Structure

```
SE project/
├── backend/
│   ├── config/
│   │   ├── database.js
│   │   └── passport.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── hotelController.js
│   │   ├── roomController.js
│   │   ├── bookingController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Hotel.js
│   │   ├── Room.js
│   │   └── Booking.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── hotels.js
│   │   ├── rooms.js
│   │   ├── bookings.js
│   │   └── admin.js
│   ├── sockets/
│   │   └── availabilitySocket.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## User Roles

### Regular User
- Search and view hotels
- Book rooms
- View booking history
- Cancel bookings

### Hotel Manager
- All user permissions
- Add/edit hotels
- Manage room types
- View hotel bookings

### Admin
- All permissions
- Manage users and roles
- View all bookings
- Generate reports

## API Endpoints

### Authentication
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - OAuth callback
- `GET /api/auth/profile` - Get user profile
- `GET /api/auth/verify` - Verify token
- `POST /api/auth/logout` - Logout

### Hotels
- `GET /api/hotels/search` - Search hotels
- `GET /api/hotels/:id` - Get hotel details
- `POST /api/hotels` - Create hotel (Manager/Admin)
- `PUT /api/hotels/:id` - Update hotel (Manager/Admin)
- `GET /api/hotels/manager/my-hotels` - Get manager's hotels

### Rooms
- `GET /api/rooms/hotel/:hotelId` - Get hotel rooms
- `GET /api/rooms/:id/availability` - Check availability
- `POST /api/rooms` - Create room (Manager/Admin)
- `PUT /api/rooms/:id` - Update room (Manager/Admin)

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my-bookings` - Get user bookings
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id/cancel` - Cancel booking
- `GET /api/bookings/hotel/:hotelId` - Get hotel bookings (Manager)
- `GET /api/bookings/admin/all` - Get all bookings (Admin)

### Admin
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/role` - Update user role
- `GET /api/admin/hotels` - Get all hotels
- `GET /api/admin/reports/bookings` - Generate booking reports
- `GET /api/admin/stats` - Get dashboard statistics

## Real-Time Features

The application uses Socket.io for real-time updates:

- **Room Availability**: Live updates when rooms are booked
- **Booking Notifications**: Instant notifications for new bookings
- **Concurrent Booking Prevention**: Prevents double-booking with optimistic locking

## Payment Integration (Future)

The database schema includes payment-ready fields:
- `paymentStatus`: pending, completed, failed, refunded
- `paymentMethod`: cash, card, upi, netbanking, wallet
- `transactionId`: For payment gateway reference

To integrate payment (e.g., Razorpay):
1. Add Razorpay SDK to backend
2. Create payment order before booking
3. Update booking with transaction details
4. Add webhook for payment verification

## Development

### Backend Development
```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

### Frontend Development
```bash
cd frontend
npm run dev  # Vite dev server with HMR
```

### Building for Production

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## Testing

### Manual Testing Checklist

- [ ] Google OAuth login works
- [ ] Search hotels by location
- [ ] View hotel details
- [ ] Check room availability
- [ ] Create booking
- [ ] View booking history
- [ ] Cancel booking
- [ ] Manager can add hotels
- [ ] Manager can add rooms
- [ ] Admin can view all bookings
- [ ] Real-time availability updates

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check MONGODB_URI in .env
- Verify network connectivity

### OAuth Not Working
- Verify Google OAuth credentials
- Check redirect URI matches exactly
- Ensure Google+ API is enabled

### Socket.io Connection Failed
- Check CORS settings
- Verify backend URL in frontend
- Check firewall settings

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - feel free to use this project for learning or commercial purposes.

## Support

For issues or questions, please create an issue in the repository.

---

**Built with ❤️ for the Indian hotel industry**
