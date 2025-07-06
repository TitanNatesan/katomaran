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
            console.log('Clearing all auth tokens and session data');

            // 1. Clear from localStorage
            const localStorageKeys = [
                // Backend token
                TOKEN_KEY,
                // NextAuth related
                'next-auth.session-token',
                'next-auth.callback-url',
                'next-auth.csrf-token',
                // Additional keys that might be used
                '__Secure-next-auth.session-token',
                '__Host-next-auth.csrf-token',
                'next-auth.state',
                // Legacy keys
                'token',
                'auth',
                'user'
            ];

            localStorageKeys.forEach(key => {
                try {
                    localStorage.removeItem(key);
                } catch (e) {
                    console.warn(`Failed to remove ${key} from localStorage:`, e);
                }
            });

            // 2. Clear from sessionStorage
            const sessionStorageKeys = [
                // Backend token
                TOKEN_KEY,
                // NextAuth related
                'next-auth.session-token',
                'next-auth.callback-url',
                'next-auth.csrf-token',
                // Additional keys that might be used
                '__Secure-next-auth.session-token',
                '__Host-next-auth.csrf-token',
                'next-auth.state',
                // Legacy keys
                'token',
                'auth',
                'user'
            ];

            sessionStorageKeys.forEach(key => {
                try {
                    sessionStorage.removeItem(key);
                } catch (e) {
                    console.warn(`Failed to remove ${key} from sessionStorage:`, e);
                }
            });

            // 3. Clear all cookies
            const cookieKeys = [
                // Backend token
                TOKEN_KEY,
                // NextAuth related
                'next-auth.session-token',
                'next-auth.callback-url',
                'next-auth.csrf-token',
                // Additional keys that might be used
                '__Secure-next-auth.session-token',
                '__Host-next-auth.csrf-token',
                'next-auth.pkce.code_verifier',
                'next-auth.state'
            ];

            cookieKeys.forEach(key => {
                try {
                    // Clear the cookie with different path options to ensure complete removal
                    document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
                    document.cookie = `${key}=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
                    // Also try with secure flag for HTTPS
                    if (window.location.protocol === 'https:') {
                        document.cookie = `${key}=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure`;
                    }
                } catch (e) {
                    console.warn(`Failed to remove ${key} cookie:`, e);
                }
            });

            console.log('All auth tokens and session data cleared');

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
