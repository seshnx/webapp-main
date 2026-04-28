// src/components/EDU/EduLogin.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasEduAccess } from '../../utils/eduPermissions';
import { Loader2, GraduationCap, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EduLogin() {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    // Default EDU branding
    const primaryColor = '#4f46e5';
    const schoolName = 'SeshNx EDU';

    // TODO: Migrate to Clerk/Neon - Supabase legacy code
    // @ts-ignore - supabase is global for legacy support
    const supabase = (window as any).supabase;

    useEffect(() => {
        // Check if user is already authenticated
        if (!supabase) return;

        supabase.auth.getSession().then(async ({ data: { session } }: any) => {
            if (session?.user) {
                // Check if user has EDU access
                try {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();

                    if (profile) {
                        const userData = {
                            ...profile,
                            firstName: profile.first_name,
                            lastName: profile.last_name,
                            accountTypes: profile.account_types || ['Fan'],
                            activeProfileRole: profile.active_role || 'Fan',
                            photoURL: profile.avatar_url
                        };
                        if (hasEduAccess(userData)) {
                            // User has EDU access, redirect to EDU dashboard
                            navigate('/edu');
                            return;
                        }
                    }
                } catch (err) {
                    console.error('Error checking EDU access:', err);
                }
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: any, session: any) => {
            if (session?.user) {
                try {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();

                    if (profile) {
                        const userData = {
                            ...profile,
                            firstName: profile.first_name,
                            lastName: profile.last_name,
                            accountTypes: profile.account_types || ['Fan'],
                            activeProfileRole: profile.active_role || 'Fan',
                            photoURL: profile.avatar_url
                        };
                        if (hasEduAccess(userData)) {
                            navigate('/edu');
                        }
                    }
                } catch (err) {
                    console.error('Error checking EDU access:', err);
                }
            }
        });

        return () => subscription.unsubscribe();
    }, [navigate]);

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Please fill in all fields.');
            return;
        }

        if (!supabase) {
            setError('Authentication service unavailable.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (authError) throw authError;
            if (!authData.user) {
                setError('Login failed. Please try again.');
                setLoading(false);
                return;
            }

            // Check if user has EDU access
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authData.user.id)
                .single();

            if (profileError || !profile) {
                setError('User profile not found. Please complete your profile setup first.');
                setLoading(false);
                return;
            }

            const userData = {
                ...profile,
                firstName: profile.first_name,
                lastName: profile.last_name,
                accountTypes: profile.account_types || ['Fan'],
                activeProfileRole: profile.active_role || 'Fan',
                photoURL: profile.avatar_url
            };

            // Check for EDU access (EDUAdmin, EDUStaff, Student, Intern)
            // GAdmin (Global Admin) should use the separate Global Admin App, not EDU login
            if (!hasEduAccess(userData)) {
                setError('You do not have EDU access. Please contact your administrator.');
                await supabase.auth.signOut();
                setLoading(false);
                return;
            }

            // Success - redirect to EDU dashboard
            navigate('/edu');
        } catch (err: any) {
            console.error('Login error:', err);
            if (err.message?.includes('Invalid login credentials') || err.message?.includes('Email not confirmed')) {
                setError('Invalid email or password.');
            } else if (err.message?.includes('email')) {
                setError('Invalid email address.');
            } else {
                setError('Login failed. Please try again.');
            }
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        if (!supabase) {
            setError('Authentication service unavailable.');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const { data: authData, error: authError } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/edu/login`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    }
                }
            });

            if (authError) throw authError;

            // OAuth redirect will happen, so we'll handle the callback in useEffect
            // For now, just show loading state
        } catch (err: any) {
            console.error('Google login error:', err);
            if (err.message?.includes('popup')) {
                setError('Login cancelled.');
            } else {
                setError('Google login failed. Please try again.');
            }
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl p-8 border dark:border-gray-700">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div
                            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: `${primaryColor}20` }}
                        >
                            <GraduationCap
                                size={32}
                                style={{ color: primaryColor }}
                            />
                        </div>
                        <h1 className="text-2xl font-bold dark:text-white mb-2">
                            {schoolName} Login
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Sign in to access your EDU dashboard
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleEmailLogin} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-offset-0 focus:outline-none dark:bg-gray-800 dark:text-white"
                                style={{ focusRingColor: primaryColor }}
                                placeholder="your@email.com"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-offset-0 focus:outline-none dark:bg-gray-800 dark:text-white"
                                style={{ focusRingColor: primaryColor }}
                                placeholder="••••••••"
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 rounded-lg font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            style={{ backgroundColor: primaryColor }}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="my-6 flex items-center">
                        <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
                        <span className="px-4 text-sm text-gray-500 dark:text-gray-400">or</span>
                        <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
                    </div>

                    {/* Google Login */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full py-2.5 rounded-lg font-semibold border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Continue with Google
                    </button>

                    {/* Back to Main App */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => navigate('/')}
                            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 flex items-center justify-center gap-2 mx-auto"
                        >
                            <ArrowLeft size={16} />
                            Back to Main App
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
