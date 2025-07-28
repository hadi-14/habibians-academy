'use client';
import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, onAuthStateChanged, setPersistence, browserSessionPersistence, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '@/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function StudentLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [resetSent, setResetSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [initializing, setInitializing] = useState(true);
    const [isClient, setIsClient] = useState(false);

    // Ensure we're on client side
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Check auth state on mount
    useEffect(() => {
        if (!isClient) return;

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // User is authenticated, redirect to student portal
                router.push('/student-portal');
                return;
            }
            setInitializing(false);
        });
        return () => unsubscribe();
    }, [router, isClient]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            // Set persistence before signing in
            await setPersistence(auth, browserSessionPersistence);
            
            // Sign in user
            const userCred = await signInWithEmailAndPassword(auth, email, password);
            console.log('User signed in:', userCred.user);
            
            // Check teacher profile in 'teachers' collection
            const teacherRef = doc(db, 'teachers', userCred.user.uid);
            const teacherSnap = await getDoc(teacherRef);

            if (teacherSnap.exists()) {
                // Redirect to teacher portal
                router.push('/teacher-portal');
            } else {
                setError('Not authorized as teacher.');
                setLoading(false);
            }
        } catch (err) {
            const errorMsg = (err instanceof Error) ? err.message : 'Login failed';
            setError(errorMsg);
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            setError('Please enter your email address.');
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            setResetSent(true);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Failed to send reset email.');
            }
        }
    };

    // Show loading while checking initial auth state or on server
    if (!isClient || initializing) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-white to-blue-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-navy mx-auto mb-4"></div>
                    <p className="text-gray-600">Checking authentication...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-primary-white to-blue-50 font-body">
            {/* Logo and heading */}
            <div className="flex flex-col items-center mb-8 -mt-16">
                <Image
                    src="/logo.svg"
                    alt="Logo"
                    width={160}
                    height={160}
                    className="mb-4"
                />
                <h1 className="text-4xl font-extrabold text-primary-blue mb-2 tracking-tight">Student Portal Login</h1>
                <p className="text-lg text-gray-600">Sign in to access your student dashboard.</p>
            </div>
            
            {/* Login Card */}
            <div className="w-full max-w-md bg-primary-white border border-accent-navy shadow-2xl rounded-2xl px-10 py-10">
                <form onSubmit={handleLogin} className="space-y-7">
                    <div>
                        <label htmlFor="email" className="block text-lg font-semibold text-gray-700 mb-2 text-left">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            disabled={loading}
                            className="w-full h-14 bg-gray-100 rounded-lg border border-stone-300 px-6 text-neutral-700 text-lg focus:outline-none focus:ring-2 focus:ring-accent-navy transition"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-lg font-semibold text-gray-700 mb-2 text-left">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            disabled={loading}
                            className="w-full h-14 bg-gray-100 rounded-lg border border-stone-300 px-6 text-neutral-700 text-lg focus:outline-none focus:ring-2 focus:ring-accent-navy transition"
                        />
                        <div className="flex items-center justify-between mt-2">
                            <button
                                onClick={handleForgotPassword}
                                className="text-sm text-primary-blue hover:underline"
                                type="button"
                            >
                                Forgot Password?
                            </button>
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    {resetSent && <p className="text-green-500 text-sm">Password reset email sent!</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-accent-navy text-primary-white px-4 py-3 rounded-lg font-heading font-bold shadow-md hover:bg-accent-lightblue transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <div className="mt-2 text-center">
                    <p className="text-sm text-gray-600">
                        Need help?{' '}
                        <Link href="/contact-us" className="text-primary-blue hover:underline font-medium">
                            Contact Us
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}