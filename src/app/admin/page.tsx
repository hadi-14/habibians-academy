'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { fetchTeachers, fetchClasses, getAllStudents } from '@/firebase/functions/fetchFunctions';
import { NavigationTabs, NavigationTabOption } from '@/components/Common/NavigationTabs';
import { Teacher, Class, Student, AdmissionEntry, Question } from '@/firebase/definitions';
import AdmissionEntriesTab from '@/components/AdminPortal/AdmissionEntriesTab';
import QuestionsTab from '@/components/AdminPortal/QuestionsTab';
import TeachersTab from '@/components/AdminPortal/TeachersTab';
import ClassesTab from '@/components/AdminPortal/ClassesTab';
import StudentsTab from '@/components/AdminPortal/StudentsTab';
import SubjectsTab from '@/components/AdminPortal/SubjectsTab';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/firebase/config';

const AdminDashboard: React.FC = () => {
    const router = useRouter();
    const [isVerifying, setIsVerifying] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [admissionEntries, setAdmissionEntries] = useState<AdmissionEntry[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('entries');

    // Only check login on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const isLogged = localStorage.getItem('admin_logged_in') === 'true';
            if (!isLogged) {
                router.replace('/admin/login');
            } else {
                setIsLoggedIn(true);
            }
            setIsVerifying(false);
        }
    }, [router]);


    // Only load dashboard data if verified and logged in
    useEffect(() => {
        if (!isVerifying && isLoggedIn) {
            // Fetch students
            const getStudents = async () => {
                try {
                    const students = await getAllStudents();
                    setStudents(students);
                } catch (error) {
                    console.error("Error fetching students:", error);
                }
            };
            getStudents();

            // Fetch admission entries
            const fetchAdmissionEntries = async () => {
                try {
                    const q = query(
                        collection(db, 'admissions'),
                        orderBy('applicationDate', 'desc')
                    );
                    const querySnapshot = await getDocs(q);
                    const entries = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    } as AdmissionEntry));
                    setAdmissionEntries(entries);
                    setLoading(false);
                } catch (error) {
                    console.error("Error fetching admission entries:", error);
                    setLoading(false);
                }
            };
            fetchAdmissionEntries();

            // Fetch questions
            const fetchQuestions = async () => {
                try {
                    const q = query(
                        collection(db, 'queries'),
                        orderBy('createdAt', 'desc')
                    );
                    const querySnapshot = await getDocs(q);
                    const fetchedQuestions = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    } as Question));
                    setQuestions(fetchedQuestions);
                } catch (error) {
                    console.error("Error fetching questions:", error);
                }
            };
            fetchQuestions();

            // Fetch teachers
            const getTeachers = async () => {
                try {
                    const teachers = await fetchTeachers();
                    setTeachers(teachers);
                } catch (error) {
                    console.error("Error fetching teachers:", error);
                }
            };
            getTeachers();

            // Fetch classes
            const getClasses = async () => {
                try {
                    const classes = await fetchClasses();
                    setClasses(classes);
                } catch (error) {
                    console.error("Error fetching classes:", error);
                }
            };
            getClasses();
        }
    }, [isVerifying, isLoggedIn]);


    const TAB_OPTIONS: NavigationTabOption[] = [
        {
            key: 'entries',
            label: 'Admission Entries',
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
            badge: admissionEntries.length
        },
        {
            key: 'questions',
            label: 'Questions',
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
            badge: questions.length
        },
        {
            key: 'teachers',
            label: 'Teachers',
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>,
            badge: teachers.length
        },
        {
            key: 'subjects',
            label: 'Subjects',
            icon: <span role="img" aria-label="Subjects">📚</span>,
            badge: undefined
        },
        {
            key: 'classes',
            label: 'Classes',
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
            badge: classes.length
        },
        {
            key: 'students',
            label: 'Students',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13a4 4 0 118 0 4 4 0 01-8 0zm14 7v-2a4 4 0 00-3-3.87" />
                </svg>
            ),
            badge: students.length
        }
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'entries':
                return (
                    <AdmissionEntriesTab
                        admissionEntries={admissionEntries}
                        setAdmissionEntries={setAdmissionEntries}
                        loading={loading}
                    />
                );
            case 'questions':
                return (
                    <QuestionsTab
                        questions={questions}
                        setQuestions={setQuestions}
                    />
                );
            case 'teachers':
                return (
                    <TeachersTab
                        teachers={teachers}
                        setTeachers={setTeachers}
                    />
                );
            case 'subjects':
                return <SubjectsTab />;
            case 'classes':
                return (
                    <ClassesTab
                        classes={classes}
                        setClasses={setClasses}
                        teachers={teachers}
                    />
                );
            case 'students':
                return (
                    <StudentsTab
                        students={students}
                        setStudents={setStudents}
                    />
                );
            default:
                return null;
        }
    };

    if (isVerifying) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Checking authentication...</p>
                </div>
            </div>
        );
    }
    if (!isLoggedIn) {
        return null;
    }

    return (
        <div className="min-h-screen relative w-full bg-gray-50 pb-16">
            {/* Dashboard Header */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-indigo-800 mb-1">Admin Dashboard</h1>
                        <p className="text-gray-500 text-base md:text-lg">Manage admissions, questions, teachers, and classes in one place</p>
                    </div>
                    <div className="flex items-center gap-2 mt-2 md:mt-0">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">Admin Panel</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-6 pt-12">
                <NavigationTabs
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    tabs={TAB_OPTIONS}
                />
            </div>

            {/* Dashboard Statistics */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                                <p className="text-3xl font-bold text-indigo-600">{admissionEntries.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Approved</p>
                                <p className="text-3xl font-bold text-emerald-600">{admissionEntries.filter(e => e.applicationStatus === 'approved').length}</p>
                            </div>
                            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-emerald-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pending</p>
                                <p className="text-3xl font-bold text-amber-600">{admissionEntries.filter(e => e.applicationStatus === 'pending').length}</p>
                            </div>
                            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Classes</p>
                                <p className="text-3xl font-bold text-blue-600">{classes.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            {renderTabContent()}

            {/* Add fadeIn animation for modal */}
            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.25s ease;
                }
            `}</style>
        </div>
    );
};

export default AdminDashboard;