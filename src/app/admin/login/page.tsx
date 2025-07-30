'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // If already logged in, redirect to admin dashboard
        if (typeof window !== 'undefined') {
            const isLoggedIn = localStorage.getItem('admin_logged_in');
            if (isLoggedIn === 'true') {
                router.push('/admin');
            }
        }
    }, [router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        // Get credentials from env (in Next.js, must be exposed as NEXT_PUBLIC_ or use process.env at build time)
        const envUsername = process.env.NEXT_PUBLIC_ADMIN_USERNAME || process.env.ADMIN_USERNAME || 'admin';
        const envPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || 'admin';
        if (username === envUsername && password === envPassword) {
            if (typeof window !== 'undefined') {
                localStorage.setItem('admin_logged_in', 'true');
                router.push('/admin');
            }
        } else {
            setError('Invalid username or password');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-primary-white to-blue-50 font-body">
            <div className="flex flex-col items-center mb-8 -mt-16">
                <Image
                    src="/logo.svg"
                    alt="Logo"
                    width={160}
                    height={160}
                    className="mb-4"
                />
                <h1 className="text-4xl font-extrabold text-primary-blue mb-2 tracking-tight">Admin Login</h1>
                <p className="text-lg text-gray-600">Sign in to access the admin dashboard.</p>
            </div>
            <div className="w-full max-w-md bg-primary-white border border-accent-navy shadow-2xl rounded-2xl px-10 py-10">
                <form onSubmit={handleLogin} className="space-y-7">
                    <div>
                        <label htmlFor="username" className="block text-lg font-semibold text-gray-700 mb-2 text-left">Username</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
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
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-accent-navy text-primary-white px-4 py-3 rounded-lg font-heading font-bold shadow-md hover:bg-accent-lightblue transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
}