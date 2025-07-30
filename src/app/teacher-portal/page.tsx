'use client';
import React, { useEffect, useState } from 'react';
import { auth } from '@/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import {
    getTeacherProfile,
    listenToTeacherClasses,
    listenToTeacherAssignments,
    onCreateAssignment,
    onUpdateAssignment
} from '@/firebase/functions';
import type { Assignment as FirebaseAssignment, Class as FirebaseClass, Teacher as FirebaseTeacher } from '@/firebase/definitions';
import { useProtectedRoute } from './useProtectedRoute'; // Adjust path as needed
import { signOut } from 'firebase/auth';
import { HeroSection } from '@/components/Common/HeroSection';
import { NavigationTabs } from '@/components/Common/NavigationTabs';
import { DashboardContent } from '@/components/TeacherPortalDashboard/DashboardContent';
import { StreamContent } from '@/components/Common/StreamContent';
import { MeetContent } from '@/components/TeacherPortalDashboard/MeetContent';
import { SettingsContent } from '@/components/Common/SettingsContent';
import { MessageAlert } from '@/components/Common/MessageAlert';
import { BookOpen, FileText, Settings, Megaphone, Video } from 'lucide-react';
import AssignmentsTab from '@/components/Common/AssignmentsContent';

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
                handleLogout();
                return;
            }


            try {
                const profile = await getTeacherProfile(user.uid);
                // console.log('User is signed in:', user, profile);
                if (!profile) {
                    setLoading(false);
                    return;
                }
                setTeacher(profile);
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
        if (!teacher?.uid) return;
        setLoading(true);
        const unsubClasses = listenToTeacherClasses(teacher.uid, (cls) => {
            console.log('Classes listened:', cls);
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
    }, [teacher?.uid]);

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
        window.location.href = '/teacher-portal/login';
    };

    const tabs = React.useMemo(() => [
        { key: 'dashboard', label: 'Dashboard', icon: <BookOpen className="w-5 h-5 inline mr-2" /> },
        { key: 'assignments', label: 'Assignments', icon: <FileText className="w-5 h-5 inline mr-2" />, badge: assignments.length },
        { key: 'stream', label: 'Stream', icon: <Megaphone className="w-5 h-5 inline mr-2" /> },
        { key: 'meet', label: 'Meet', icon: <Video className="w-5 h-5 inline mr-2" /> },
        { key: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5 inline mr-2" /> },
    ], [assignments.length]);

    useEffect(() => {
        if (!isClient) return; // Wait for client-side hydration

        const hash = window.location.hash.slice(1);
        const validTabs = tabs.map(tab => tab.key);

        if (hash && validTabs.includes(hash)) {
            setActiveTab(hash);
        }
    }, [isClient, tabs]);


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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
            <HeroSection user={teacher} onLogout={handleLogout} />
            {success && <MessageAlert type="success" message={success} onClose={() => setSuccess('')} />}
            <div className="container mx-auto px-4 pb-8">
                <NavigationTabs
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    tabs={tabs}
                />
                <div className="mb-8">
                    {activeTab === 'dashboard' && <DashboardContent classes={classes} assignments={assignments} />}
                    {activeTab === 'stream' && <StreamContent user={teacher} classes={classes} setSuccess={setSuccess} />}
                    {activeTab === 'assignments' && (
                        <AssignmentsTab
                            assignments={assignments}
                            userRole='teacher'
                            currentUserId={teacher.uid}
                            onCreateAssignment={onCreateAssignment}
                            onUpdateAssignment={onUpdateAssignment}
                        />
                    )}
                    {activeTab === 'meet' && <MeetContent classes={classes} setSuccess={setSuccess} />}
                    {activeTab === 'settings' && <SettingsContent user={teacher} />}
                </div>
            </div>
        </div>
    );
}