# Room Booking System - Agent Guidance

## Project Structure
- Monorepo with `backend/` and `frontend/` directories
- Backend: Node.js/Express with MongoDB
- Frontend: React 18 with Vite and Tailwind CSS
- Real-time features via Socket.io

## Essential Commands

### Backend
```bash
cd backend
npm install          # Install dependencies
npm run dev          # Start dev server (nodemon)
npm start            # Start production server
npm run seed         # Seed database with sample data
npm run fix-index    # Fix Google ID index issues (run when getting E11000 duplicate key errors)
```

### Frontend
```bash
cd frontend
npm install          # Install dependencies
npm run dev          # Start dev server (Vite)
npm run build        # Build for production
npm run preview      # Preview production build
```

## Environment Setup
1. MongoDB must be running (local or Atlas)
2. Backend requires `.env` file with:
   - PORT=5000
    - MONGODB_URI=mongodb+srv://aayaankhan8310875137_db_user:jKzCu2W4PwP4vf9v@kamracluster.vo3dbtm.mongodb.net/?appName=KamraCluster
   - JWT_SECRET=your-secret
    - FRONTEND_URL=https://your-frontend-domain.com
   - GOOGLE_CLIENT_ID=your-id
   - GOOGLE_CLIENT_SECRET=your-secret
    - GOOGLE_CALLBACK_URL=https://your-backend-domain.com/api/auth/google/callback
   - SESSION_SECRET=your-secret
   - NODE_ENV=development
3. Frontend `.env` (optional):
    - VITE_API_URL=https://your-backend-domain.com/api

## Development Workflow
1. Start MongoDB: `mongod`
2. Start backend: `cd backend && npm run dev`
3. Start frontend: `cd frontend && npm run dev`
4. Access at your-frontend-domain.com

## Important Notes
- Backend runs on port 5000, frontend on 5173
- Authentication: Google OAuth (passport-google-oauth20) + JWT
- Real-time updates: Socket.io for room availability (configured in server.js)
- Role-based access: User/Manager/Admin
- No test suite configured (manual testing only)
- Payment fields exist in schema but not implemented
- Frontend uses Vite with React 18 and Tailwind CSS
- Seed command populates DB with sample hotels, rooms, and users