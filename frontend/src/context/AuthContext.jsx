import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await api.get('/auth/verify');
            setUser(response.data.data);
        } catch (error) {
            console.error('Auth check failed:', error);
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    const login = (token) => {
        localStorage.setItem('token', token);
        checkAuth();
    };

    const register = async (name, email, password, role = 'user') => {
        const response = await api.post('/auth/register', { name, email, password, role });
        console.log('Register response:', response.data);
        const { token, user: userData } = response.data.data;
        localStorage.setItem('token', token);
        console.log('Setting user data:', userData);
        setUser(userData);
        return response.data;
    };

    const loginWithPassword = async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        console.log('Login response:', response.data);
        const { token, user: userData } = response.data.data;
        localStorage.setItem('token', token);
        console.log('Setting user data:', userData);
        setUser(userData);
        return response.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        window.location.href = '/';
    };

    const hasRole = (role) => {
        return user?.role === role;
    };

    const isManager = () => hasRole('manager');
    const isAdmin = () => hasRole('admin');
    const isUser = () => hasRole('user');

    const value = {
        user,
        loading,
        login,
        register,
        loginWithPassword,
        logout,
        hasRole,
        isManager,
        isAdmin,
        isUser,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
