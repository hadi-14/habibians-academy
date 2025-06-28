/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail, setPersistence, browserLocalPersistence, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase/config';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function StudentLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Check auth state on component mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/student-portal'); // Redirect if already logged in
      }
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/student-portal');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to log in.');
    } finally {
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
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email.');
    }
  };

  return (
    <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center font-body bg-primary-white gap-16">
      <div className="container mx-auto px-4 text-center mt-12">
        <h1 className="text-4xl font-bold text-primary-blue mb-4">Student Portal Login</h1>
        <p className="text-lg text-gray-600">Sign in to access your student dashboard.</p>
      </div>
      <div className="container mx-auto px-4 w-full">
        <div className="w-full max-w-md mx-auto bg-primary-white border-accent-navy shadow-xl rounded-xl border">
          <div className="px-8 py-10">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-lg font-medium text-gray-700 mb-2 text-left">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full h-14 bg-gray-200 rounded-lg border-2 border-stone-300 px-6 text-neutral-700 text-lg focus:outline-none focus:ring-2 focus:ring-accent-navy"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-lg font-medium text-gray-700 mb-2 text-left">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full h-14 bg-gray-200 rounded-lg border-2 border-stone-300 px-6 text-neutral-700 text-lg focus:outline-none focus:ring-2 focus:ring-accent-navy"
                />
              </div>
              <div className="flex items-center justify-between">
                <button
                  onClick={handleForgotPassword}
                  className="text-sm text-primary-blue hover:underline"
                  type="button"
                >
                  Forgot Password?
                </button>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {resetSent && <p className="text-green-500 text-sm">Password reset email sent!</p>}
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-accent-navy text-primary-white px-4 py-3 rounded-lg font-heading font-bold shadow-md hover:bg-accent-lightblue transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <Link href="/contact-us" className="text-primary-blue hover:underline">
                  Contact Us
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}