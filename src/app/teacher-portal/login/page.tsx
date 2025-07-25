'use client';
import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, onAuthStateChanged, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { auth, db } from '@/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function TeacherLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
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
                console.log('User is signed in:', user);
                // Verify user is a teacher
                try {
                    const teacherRef = doc(db, 'teachers', user.uid);
                    const teacherSnap = await getDoc(teacherRef);
                    if (teacherSnap.exists()) {
                        router.push('/teacher-portal');
                        return;
                    }
                } catch (error) {
                    console.error('Error checking teacher status:', error);
                }
            }
            setInitializing(false);
        });
        return () => unsubscribe();
    }, [router, isClient]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            // Set persistence before signing in
            setPersistence(auth, browserSessionPersistence).then(async () => {
                
                // Sign in user
                const userCred = await signInWithEmailAndPassword(auth, email, password);
                console.log('User signed in:', userCred.user);
                
                // Check teacher profile in 'teachers' collection
                const teacherRef = doc(db, 'teachers', userCred.user.uid);
                const teacherSnap = await getDoc(teacherRef);

                if (teacherSnap.exists()) {
                    // Redirect to teacher portal
                    return signInWithEmailAndPassword(auth, email, password);
                } else {
                    setError('Not authorized as teacher.');
                    setLoading(false);
                }

                if (!teacherSnap.exists()) {
                    setError('Not authorized as teacher.');
                    return;
                }
            });
            
            router.push('/teacher-portal');

            
            // Navigation will be handled by onAuthStateChanged
        } catch (err) {
            const errorMsg = (err instanceof Error) ? err.message : 'Login failed';
            setError(errorMsg);
            setLoading(false);
        }
    }

    // Show loading while checking initial auth state or on server
    if (!isClient || initializing) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Checking authentication...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-primary-blue mb-6">Teacher Login</h1>
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-xl p-8 flex flex-col gap-4 w-full max-w-sm">
                <label className="font-heading text-primary-blue font-bold">Email
                    <input 
                        type="email" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        className="mt-1 rounded-lg border border-primary-silver px-4 py-2 font-body focus:outline-none focus:ring-2 focus:ring-accent-lightblue bg-white w-full" 
                        required 
                        disabled={loading}
                    />
                </label>
                <label className="font-heading text-primary-blue font-bold">Password
                    <input 
                        type="password" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        className="mt-1 rounded-lg border border-primary-silver px-4 py-2 font-body focus:outline-none focus:ring-2 focus:ring-accent-lightblue bg-white w-full" 
                        required 
                        disabled={loading}
                    />
                </label>
                {error && <div className="text-red-600 font-bold text-sm">{error}</div>}
                <button 
                    type="submit" 
                    disabled={loading} 
                    className="mt-4 px-8 py-3 rounded-full bg-accent-lightblue text-primary-blue font-heading font-bold text-lg shadow-lg hover:bg-accent-navy hover:text-primary-white transition-colors disabled:opacity-60"
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    );
}