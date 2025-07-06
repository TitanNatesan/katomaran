/**
 * Enhanced utility functions for authentication and token management
 */

// Token storage key
const TOKEN_KEY = 'backendToken';

/**
 * Get the authentication token from multiple sources
 * @param {Object} session - The NextAuth session object
 * @returns {string|null} The authentication token or null if not found
 */
export const getAuthToken = (session) => {
    // 1. First try to get token from session (preferred for NextAuth)
    if (session?.backendToken) {
        return session.backendToken;
    }

    // 2. Check localStorage for OAuth redirect tokens
    if (typeof window !== 'undefined') {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        if (storedToken) {
            return storedToken;
        }
    }

    // 3. Check session storage as fallback
    if (typeof window !== 'undefined') {
        const sessionToken = sessionStorage.getItem(TOKEN_KEY);
        if (sessionToken) {
            return sessionToken;
        }
    }

    return null;
};

/**
 * Store the authentication token in both localStorage and sessionStorage
 * @param {string} token - The JWT token to store
 */
export const storeAuthToken = (token) => {
    if (typeof window !== 'undefined' && token) {
        localStorage.setItem(TOKEN_KEY, token);
        sessionStorage.setItem(TOKEN_KEY, token);

        // Trigger custom event for token storage
        window.dispatchEvent(new CustomEvent('tokenStored', { detail: { token } }));
    }
};

/**
 * Clear all stored authentication tokens
 */
export const clearAuthToken = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(TOKEN_KEY);

        // Trigger custom event for token clearing
        window.dispatchEvent(new CustomEvent('tokenCleared'));
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
