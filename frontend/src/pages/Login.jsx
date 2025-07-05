import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { toast } from 'react-toastify';
import { Eye, EyeOff, LogIn, Github } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { login, googleLogin, loading, error } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await login(email, password);
            toast.success('Login successful!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            await googleLogin(credentialResponse.credential);
            toast.success('Google login successful!');
            navigate('/dashboard');
        } catch (error) {
            toast.error('Google login failed');
        }
    };

    const handleGoogleError = () => {
        toast.error('Google login failed');
    };

    const handleGoogleOAuthLogin = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

            // First, check if Google OAuth is available
            const response = await fetch(`${apiUrl}/auth/google`, {
                method: 'GET',
                redirect: 'manual' // Don't follow redirects automatically
            });

            if (response.status === 503) {
                toast.error('Google OAuth is not configured on this server');
                return;
            }

            // If we get here, Google OAuth is available, proceed with login
            window.location.href = `${apiUrl}/auth/google`;

        } catch (error) {
            console.error('Google OAuth login error:', error);
            toast.error('Google OAuth is temporarily unavailable');
        }
    };

    const handleGithubLogin = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

            // First, check if GitHub OAuth is available
            const response = await fetch(`${apiUrl}/auth/github`, {
                method: 'GET',
                redirect: 'manual' // Don't follow redirects automatically
            });

            if (response.status === 503) {
                toast.error('GitHub login is not configured on this server');
                return;
            }

            // If we get here, GitHub OAuth is available, proceed with login
            window.location.href = `${apiUrl}/auth/github`;

        } catch (error) {
            console.error('GitHub login error:', error);
            toast.error('GitHub login is temporarily unavailable');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
                    <CardDescription className="text-center">
                        Sign in to your account to continue
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        {error && (
                            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading || isLoading}
                        >
                            {(loading || isLoading) ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    <LogIn className="h-4 w-4 mr-2" />
                                    Sign in
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or continue with
                            </span>
                        </div>
                    </div>                    <div className="grid grid-cols-1 gap-3">
                        <div className="grid grid-cols-2 gap-2">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                                theme="outline"
                                size="large"
                                width="100%"
                                text="continue_with"
                            />

                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleGoogleOAuthLogin}
                                className="flex items-center justify-center"
                            >
                                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Google OAuth
                            </Button>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleGithubLogin}
                            className="w-full"
                        >
                            <Github className="h-4 w-4 mr-2" />
                            Continue with GitHub
                        </Button>
                    </div>

                    <div className="text-center text-sm">
                        Don't have an account?{' '}
                        <Link
                            to="/register"
                            className="text-primary underline-offset-4 hover:underline"
                        >
                            Sign up
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Login;
