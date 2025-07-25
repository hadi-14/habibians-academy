'use client';
import React, { useEffect, useState } from 'react';
import { auth } from '@/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { getTeacherProfile, listenToTeacherClasses, listenToTeacherAssignments } from '@/firebase/teacher-portal';
import type { Assignment as FirebaseAssignment, Class as FirebaseClass, Teacher as FirebaseTeacher } from '@/firebase/teacher-portal';
import { useProtectedRoute } from './useProtectedRoute'; // Adjust path as needed
import { signOut } from 'firebase/auth';
import { HeroSection } from '@/components/TeacherPortalDashboard/HeroSection';
import { NavigationTabs } from '@/components/TeacherPortalDashboard/NavigationTabs';
import { DashboardContent } from '@/components/TeacherPortalDashboard/DashboardContent';
import { AssignmentsContent } from '@/components/TeacherPortalDashboard/AssignmentsContent';
import { StreamContent } from '@/components/TeacherPortalDashboard/StreamContent';
import { MeetContent } from '@/components/TeacherPortalDashboard/MeetContent';
import { SettingsContent } from '@/components/TeacherPortalDashboard/SettingsContent';
import { MessageAlert } from '@/components/TeacherPortalDashboard/MessageAlert';


export default function TeacherPortalDashboardPage() {
    useProtectedRoute();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [assignments, setAssignments] = useState<FirebaseAssignment[]>([]);
    const [classes, setClasses] = useState<FirebaseClass[]>([]);
    const [teacher, setTeacher] = useState<FirebaseTeacher | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState('');
    const [isClient, setIsClient] = useState(false);

    // Ensure we're on client side for hydration safety
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Auth and teacher profile - HYDRATION-SAFE VERSION
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                setLoading(false);
                return;
            }


            try {
                const profile = await getTeacherProfile(user.uid);
                console.log('User is signed in:', user, profile);
                if (!profile) {
                    setLoading(false);
                    return;
                }
                setTeacher(profile);
                if (typeof window !== 'undefined') {
                    localStorage.setItem('teacher_profile', JSON.stringify(profile));
                }
            } catch (error) {
                console.error('Error loading teacher profile:', error);
            } finally {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, [isClient]);

    // Real-time classes and assignments from Firebase
    useEffect(() => {
        if (!teacher) return;
        setLoading(true);
        const unsubClasses = listenToTeacherClasses(teacher.uid, (cls) => {
            setClasses(
                cls.map((c) => ({
                    ...c,
                    capacity: c.capacity ?? '',
                    students: c.students ?? 0,
                }))
            );
            setLoading(false);
        });
        const unsubAssignments = listenToTeacherAssignments(teacher.uid, (asgn) => {
            setAssignments(asgn);
            setLoading(false);
        });
        return () => {
            unsubClasses();
            unsubAssignments();
        };
    }, [teacher]);

    // Clear messages after 3 seconds
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                setSuccess('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    // Logout handler
    const handleLogout = async () => {
        await signOut(auth);
        if (typeof window !== 'undefined') {
            localStorage.removeItem('teacher_profile');
        }
        window.location.href = '/teacher-portal/login';
    };

    if (loading && !teacher) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading teacher portal...</p>
                </div>
            </div>
        );
    }

    if (!teacher) {
        // Handle case where teacher is not found after auth state change
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <p className="text-gray-600">Unable to load teacher profile.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <HeroSection teacher={teacher} onLogout={handleLogout} />
            {success && <MessageAlert type="success" message={success} onClose={() => setSuccess('')} />}
            <div className="container mx-auto px-4 pb-8">
                <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} assignmentsCount={assignments.length} />
                <div className="mb-8">
                    {activeTab === 'dashboard' && <DashboardContent classes={classes} assignments={assignments} />}
                    {activeTab === 'stream' && <StreamContent teacher={teacher} classes={classes} setSuccess={setSuccess} />}
                    {activeTab === 'assignments' && (
                        <AssignmentsContent
                            assignments={assignments}
                            classes={classes}
                            teacher={teacher}
                            setSuccess={setSuccess}
                            setLoading={setLoading}
                            setAssignments={setAssignments} // For update/delete
                        />
                    )}
                    {activeTab === 'meet' && <MeetContent classes={classes} setSuccess={setSuccess} />}
                    {activeTab === 'settings' && <SettingsContent teacher={teacher} />}
                </div>
            </div>
        </div>
    );
}