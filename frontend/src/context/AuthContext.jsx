import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN_START':
            return {
                ...state,
                loading: true,
                error: null,
            };
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                loading: false,
                isAuthenticated: true,
                user: action.payload.user,
                token: action.payload.token,
                error: null,
            };
        case 'LOGIN_FAILURE':
            return {
                ...state,
                loading: false,
                isAuthenticated: false,
                user: null,
                token: null,
                error: action.payload,
            };
        case 'LOGOUT':
            return {
                ...state,
                isAuthenticated: false,
                user: null,
                token: null,
                error: null,
            };
        case 'SET_LOADING':
            return {
                ...state,
                loading: action.payload,
            };
        default:
            return state;
    }
};

const initialState = {
    isAuthenticated: false,
    user: null,
    token: localStorage.getItem('token'),
    loading: false,
    error: null,
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Verify token on app load
            verifyToken(token);
        }
    }, []);

    const verifyToken = async (token) => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            const user = await authService.getCurrentUser();
            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: { user, token },
            });
        } catch (error) {
            localStorage.removeItem('token');
            dispatch({ type: 'LOGIN_FAILURE', payload: error.message });
        }
    };

    const login = async (email, password) => {
        try {
            dispatch({ type: 'LOGIN_START' });
            const data = await authService.login(email, password);
            localStorage.setItem('token', data.token);
            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: data,
            });
            return data;
        } catch (error) {
            dispatch({
                type: 'LOGIN_FAILURE',
                payload: error.response?.data?.message || 'Login failed',
            });
            throw error;
        }
    };

    const register = async (name, email, password) => {
        try {
            dispatch({ type: 'LOGIN_START' });
            const data = await authService.register(name, email, password);
            localStorage.setItem('token', data.token);
            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: data,
            });
            return data;
        } catch (error) {
            dispatch({
                type: 'LOGIN_FAILURE',
                payload: error.response?.data?.message || 'Registration failed',
            });
            throw error;
        }
    };

    const googleLogin = async (credential) => {
        try {
            dispatch({ type: 'LOGIN_START' });
            const data = await authService.googleLogin(credential);
            localStorage.setItem('token', data.token);
            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: data,
            });
            return data;
        } catch (error) {
            dispatch({
                type: 'LOGIN_FAILURE',
                payload: error.response?.data?.message || 'Google login failed',
            });
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        dispatch({ type: 'LOGOUT' });
    };

    const value = {
        ...state,
        login,
        register,
        googleLogin,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
