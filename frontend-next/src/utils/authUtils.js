/**
 * Utility functions for authentication and token management
 */

/**
 * Get the authentication token from either session or localStorage
 * @param {Object} session - The NextAuth session object
 * @returns {string|null} The authentication token or null if not found
 */
export const getAuthToken = (session) => {
    // First try to get token from session (preferred)
    if (session?.backendToken) {
        return session.backendToken;
    }

    // Fallback to localStorage if we're in a browser environment
    if (typeof window !== 'undefined') {
        return localStorage.getItem('backendToken');
    }

    // No token found
    return null;
};

/**
 * Store the authentication token in localStorage
 * @param {string} token - The JWT token to store
 */
export const storeAuthToken = (token) => {
    if (typeof window !== 'undefined' && token) {
        localStorage.setItem('backendToken', token);
    }
};

/**
 * Clear the stored authentication token
 */
export const clearAuthToken = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('backendToken');
    }
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
