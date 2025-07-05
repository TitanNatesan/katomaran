import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const AuthCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { login } = useAuth();

    useEffect(() => {
        const handleCallback = async () => {
            const token = searchParams.get('token');
            const error = searchParams.get('error');

            if (error) {
                toast.error('Authentication failed. Please try again.');
                navigate('/login');
                return;
            }

            if (token) {
                try {
                    // Store the token temporarily
                    localStorage.setItem('token', token);

                    // Get user info with the token
                    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        const userData = await response.json();

                        // Update auth context manually since we already have the token and user data
                        localStorage.setItem('user', JSON.stringify(userData.user));

                        // Force a page reload to update the auth context
                        toast.success('Successfully logged in with GitHub!');
                        window.location.href = '/dashboard';
                    } else {
                        throw new Error('Failed to get user information');
                    }
                } catch (error) {
                    console.error('Auth callback error:', error);
                    localStorage.removeItem('token');
                    toast.error('Authentication failed. Please try again.');
                    navigate('/login');
                }
            } else {
                toast.error('No authentication token received.');
                navigate('/login');
            }
        };

        handleCallback();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="text-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-lg text-gray-600">Completing your sign-in...</p>
            </div>
        </div>
    );
};

export default AuthCallback;
