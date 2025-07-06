import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import axios from 'axios'

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
        }),
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                try {
                    const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`, {
                        email: credentials.email,
                        password: credentials.password
                    })

                    if (response.data.success && response.data.user) {
                        return {
                            id: response.data.user.id,
                            email: response.data.user.email,
                            name: response.data.user.name,
                            backendToken: response.data.token
                        }
                    }
                    return null
                } catch (error) {
                    console.error('Login error:', error)
                    return null
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, account }) {
            if (account && user) {
                try {
                    let backendEndpoint = ''
                    let requestData = {}

                    // Handle different OAuth providers
                    if (account.provider === 'google') {
                        backendEndpoint = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/google`
                        requestData = {
                            token: account.id_token,
                            user: {
                                email: user.email,
                                name: user.name,
                                image: user.image
                            }
                        }
                    } else if (account.provider === 'github') {
                        backendEndpoint = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/github`
                        requestData = {
                            accessToken: account.access_token,
                            user: {
                                email: user.email,
                                name: user.name,
                                image: user.image,
                                githubId: user.id
                            }
                        }
                    } else if (account.provider === 'credentials') {
                        // For credentials, we already have the backend token
                        token.backendToken = user.backendToken
                        token.user = {
                            id: user.id,
                            email: user.email,
                            name: user.name
                        }
                        return token
                    }

                    // Send user data to backend for authentication (OAuth only)
                    if (backendEndpoint) {
                        const response = await axios.post(backendEndpoint, requestData)
                        token.backendToken = response.data.token
                        token.user = response.data.user
                    }
                } catch (error) {
                    console.error('Backend authentication error:', error)
                    // Fallback to basic user info
                    token.user = {
                        email: user.email,
                        name: user.name,
                        image: user.image,
                        provider: account.provider
                    }
                }
            }
            return token
        },
        async session({ session, token }) {
            // Add user info from the token to the session
            session.user = token.user || session.user;

            // Add the backend token to the session if it exists
            if (token.backendToken) {
                session.backendToken = token.backendToken;
            } else if (typeof localStorage !== 'undefined') {
                // Try to get token from localStorage as fallback for OAuth flows
                const storedToken = localStorage.getItem('backendToken');
                if (storedToken) {
                    session.backendToken = storedToken;
                }
            }

            return session;
        },
        async redirect({ url, baseUrl }) {
            return url.startsWith(baseUrl) ? url : baseUrl + '/dashboard'
        }
    },
    pages: {
        signIn: '/login',
        signOut: '/login',
        error: '/login',
    },
    session: {
        strategy: 'jwt',
    },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
