'use client';
import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, browserLocalPersistence, setPersistence, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function TeacherLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [redirecting, setRedirecting] = useState(false);

    // Fast redirect before rendering form (no conditional hook call)
    useEffect(() => {
        if (typeof window !== 'undefined' && localStorage.getItem('teacher_logged_in') === 'true') {
            setRedirecting(true);
            router.push('/teacher-portal');
        }
    }, [router]);

    // Auto-redirect if already logged in and session is saved
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user && localStorage.getItem('teacher_logged_in') === 'true') {
                router.push('/teacher-portal');
            }
        });
        return () => unsubscribe();
    }, [router]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await setPersistence(auth, browserLocalPersistence);
            const userCred = await signInWithEmailAndPassword(auth, email, password);
            // Check teacher profile in 'teachers' collection
            const teacherRef = doc(db, 'teachers', userCred.user.uid);
            const teacherSnap = await getDoc(teacherRef);
            if (!teacherSnap.exists()) {
                setError('Not authorized as teacher.');
                setLoading(false);
                return;
            }
            // Save login state to browser for persistence
            localStorage.setItem('teacher_logged_in', 'true');
            router.push('/teacher-portal');
        } catch (err) {
            const errorMsg = (err instanceof Error) ? err.message : 'Login failed';
            setError(errorMsg);
            setLoading(false);
        }
    }

    if (redirecting) return null;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-primary-blue mb-6">Teacher Login</h1>
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-xl p-8 flex flex-col gap-4 w-full max-w-sm">
                <label className="font-heading text-primary-blue font-bold">Email
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 rounded-lg border border-primary-silver px-4 py-2 font-body focus:outline-none focus:ring-2 focus:ring-accent-lightblue bg-white w-full" required />
                </label>
                <label className="font-heading text-primary-blue font-bold">Password
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 rounded-lg border border-primary-silver px-4 py-2 font-body focus:outline-none focus:ring-2 focus:ring-accent-lightblue bg-white w-full" required />
                </label>
                {error && <div className="text-red-600 font-bold text-sm">{error}</div>}
                <button type="submit" disabled={loading} className="mt-4 px-8 py-3 rounded-full bg-accent-lightblue text-primary-blue font-heading font-bold text-lg shadow-lg hover:bg-accent-navy hover:text-primary-white transition-colors disabled:opacity-60">{loading ? 'Logging in...' : 'Login'}</button>
            </form>
        </div>
    );
}
