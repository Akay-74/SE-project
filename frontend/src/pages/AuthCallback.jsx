import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const AuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        const token = searchParams.get('token');
        const needsRole = searchParams.get('needsRole');

        if (token) {
            // If user needs to select role, redirect to role selection page
            if (needsRole === 'true') {
                // Store token temporarily for role selection page
                localStorage.setItem('tempToken', token);
                navigate('/select-role');
            } else {
                // Normal login flow
                login(token);
                navigate('/');
            }
        } else {
            navigate('/');
        }
    }, [searchParams, login, navigate]);

    return <LoadingSpinner message="Completing authentication..." />;
};

export default AuthCallback;
