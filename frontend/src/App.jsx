import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AuthCallback from './pages/AuthCallback';
import SelectRole from './pages/SelectRole';
import UserDashboard from './pages/UserDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Search from './pages/Search';
import HotelDetails from './pages/HotelDetails';
import BookingPage from './pages/BookingPage';
import ProfilePage from './pages/ProfilePage';
import BookingDetail from './pages/BookingDetail';
import './App.css';

function App() {
    return (
        <Router>
            <AuthProvider>
                <SocketProvider>
                    <div className="app">
                        <Header />
                        <main className="main-content">
                            <Routes>
                                {/* Public Routes */}
                                <Route path="/" element={<Home />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/signup" element={<Signup />} />
                                <Route path="/auth/callback" element={<AuthCallback />} />
                                <Route path="/select-role" element={<SelectRole />} />
                                <Route path="/search" element={<Search />} />
                                <Route path="/hotel/:id" element={<HotelDetails />} />

                                {/* Protected User Routes */}
                                <Route
                                    path="/book/:roomId"
                                    element={
                                        <ProtectedRoute>
                                            <BookingPage />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/my-bookings"
                                    element={
                                        <ProtectedRoute>
                                            <UserDashboard />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/dashboard"
                                    element={
                                        <ProtectedRoute>
                                            <UserDashboard />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/booking/:id"
                                    element={
                                        <ProtectedRoute>
                                            <BookingDetail />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/profile"
                                    element={
                                        <ProtectedRoute>
                                            <ProfilePage />
                                        </ProtectedRoute>
                                    }
                                />

                                {/* Protected Manager Routes */}
                                <Route
                                    path="/manager/dashboard"
                                    element={
                                        <ProtectedRoute requiredRole={['manager', 'admin']}>
                                            <ManagerDashboard />
                                        </ProtectedRoute>
                                    }
                                />

                                {/* Protected Admin Routes */}
                                <Route
                                    path="/admin/dashboard"
                                    element={
                                        <ProtectedRoute requiredRole="admin">
                                            <AdminDashboard />
                                        </ProtectedRoute>
                                    }
                                />

                                {/* 404 Route */}
                                <Route path="*" element={<div className="container mt-xl"><h2>404 - Page Not Found</h2></div>} />
                            </Routes>
                        </main>
                        <Footer />
                    </div>
                </SocketProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
