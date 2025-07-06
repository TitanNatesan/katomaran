/**
 * Enhanced utility functions for authentication and token management
 */

// Token storage key
const TOKEN_KEY = 'backendToken';

/**
 * Get a cookie value by name
 * @param {string} name - Cookie name
 * @returns {string|null} Cookie value or null if not found
 */
const getCookie = (name) => {
    if (typeof document === 'undefined') return null;

    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(name + '=')) {
            return cookie.substring(name.length + 1);
        }
    }
    return null;
};

/**
 * Get the authentication token from multiple sources
 * @param {Object} session - The NextAuth session object
 * @returns {string|null} The authentication token or null if not found
 */
export const getAuthToken = (session) => {
    console.log('getAuthToken called with session:', !!session);

    // 1. First try to get token from session (preferred for NextAuth)
    if (session?.backendToken) {
        console.log('Token found in session');
        return session.backendToken;
    }

    // Only try browser storage if in browser environment
    if (typeof window !== 'undefined') {
        // 2. Check localStorage for OAuth redirect tokens
        try {
            const localToken = localStorage.getItem(TOKEN_KEY);
            if (localToken) {
                console.log('Token found in localStorage');
                return localToken;
            }

            // 3. Check session storage as fallback
            const sessionToken = sessionStorage.getItem(TOKEN_KEY);
            if (sessionToken) {
                console.log('Token found in sessionStorage');
                return sessionToken;
            }

            // 4. Check cookies as final fallback
            const cookieToken = getCookie(TOKEN_KEY);
            if (cookieToken) {
                console.log('Token found in cookies, restoring to localStorage');
                // If found in cookie but not in localStorage, restore it
                localStorage.setItem(TOKEN_KEY, cookieToken);
                return cookieToken;
            }
        } catch (error) {
            console.error('Error accessing browser storage:', error);
        }
    }

    console.log('No token found in any storage');
    return null;
};

/**
 * Store the authentication token in both localStorage and sessionStorage
 * @param {string} token - The JWT token to store
 */
export const storeAuthToken = (token) => {
    if (typeof window !== 'undefined' && token) {
        try {
            // Store token in multiple places for redundancy
            localStorage.setItem(TOKEN_KEY, token);
            sessionStorage.setItem(TOKEN_KEY, token);

            // Set a cookie as additional backup (30-day expiry)
            document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=2592000; SameSite=Lax`;

            console.log('Token stored successfully in multiple locations');

            // Trigger custom event for token storage
            window.dispatchEvent(new CustomEvent('tokenStored', { detail: { token } }));
        } catch (error) {
            console.error('Error storing auth token:', error);
        }
    }
};

/**
 * Clear all stored authentication tokens
 */
export const clearAuthToken = () => {
    if (typeof window !== 'undefined') {
        try {
            // Clear from all storage locations
            localStorage.removeItem(TOKEN_KEY);
            sessionStorage.removeItem(TOKEN_KEY);

            // Clear the cookie
            document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;

            console.log('Auth tokens cleared from all locations');

            // Trigger custom event for token clearing
            window.dispatchEvent(new CustomEvent('tokenCleared'));
        } catch (error) {
            console.error('Error clearing auth tokens:', error);
        }
    }
};

/**
 * Check if user is authenticated (has valid token)
 * @param {Object} session - The NextAuth session object
 * @returns {boolean} True if authenticated
 */
export const isAuthenticated = (session) => {
    const token = getAuthToken(session);
    return !!token;
};

/**
 * Get authentication headers for API requests
 * @param {string} token - The JWT token
 * @returns {Object} Headers object with Authorization
 */
export const getAuthHeaders = (token) => {
    return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
};
