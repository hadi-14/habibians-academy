'use client';
import React, { useState, useEffect } from 'react';
import { Eye, X, CheckCircle, XCircle, Download } from 'lucide-react';
import {
    collection,
    getDocs,
    query,
    orderBy,
    updateDoc,
    doc,
    deleteDoc,
    setDoc
} from 'firebase/firestore';
import { db, storage, auth } from '@/firebase/config';
import Image from "next/image";
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { createUserWithEmailAndPassword } from 'firebase/auth';

// Interfaces for type safety
interface PersonalInfo {
    name: string;
    email: string;
    phoneNo: string;
    gender: string;
}

interface ProgramPreferences {
    desiredClass: string;
    stream: string;
    careerGoals: string;
    reasonForJoining: string;
}

interface AdmissionEntry {
    id: string;
    personalInfo: PersonalInfo;
    applicationStatus: 'pending' | 'approved' | 'rejected';
    applicationDate: {
        seconds: number;
        nanoseconds: number;
    };
    programPreferences: ProgramPreferences;
    documents?: {
        profilePicture?: string;
        characterCertificate?: string;
        previousMarksheets?: string[];
    };
}

interface Question {
    id: string;
    fullName: string;
    contactNumber: string;
    email: string;
    question: string;
    answer?: string;
    status: 'new' | 'in-progress' | 'resolved' | 'closed';
    createdAt: {
        seconds: number;
        nanoseconds: number;
    };
}

const AdminDashboard: React.FC = () => {
    const [admissionEntries, setAdmissionEntries] = useState<AdmissionEntry[]>([]);
    const [selectedEntry, setSelectedEntry] = useState<AdmissionEntry | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'entries' | 'questions' | 'teachers'>('entries');
    const [documentViewer, setDocumentViewer] = useState<{
        imageUrl: string;
        title: string;
    } | null>(null);
    const [teacherForm, setTeacherForm] = useState({ name: '', email: '', password: '', phone: '' });
    const [regError, setRegError] = useState('');
    const [regSuccess, setRegSuccess] = useState('');
    const [regLoading, setRegLoading] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
    const [editTeacherForm, setEditTeacherForm] = useState({ name: '', email: '', phone: '', subjects: [] as string[] });
    const [editTeacherPhoto, setEditTeacherPhoto] = useState<File | null>(null);
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState('');
    const [editSuccess, setEditSuccess] = useState('');
    const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
    const SUBJECTS = [
        "Mathematics", "Physics", "Chemistry", "Biology", "English", "History", "Geography", "Computer Science", "Economics", "Other"
    ];
    const [teacherPhoto, setTeacherPhoto] = useState<File | null>(null);
    const [teacherSubjects, setTeacherSubjects] = useState<string[]>([]);
    interface Teacher {
        uid: string;
        name: string;
        email: string;
        teacherId: string;
        phone: string;
        subjects: string[];
        photoURL?: string;
        createdAt?: { seconds: number; nanoseconds: number } | Date;
    }

    const [teachers, setTeachers] = useState<Teacher[]>([]);

    // Fetch admission entries
    useEffect(() => {
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
    }, []);

    // Fetch questions
    useEffect(() => {
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
    }, []);

    // Fetch teachers
    useEffect(() => {
        const fetchTeachers = async () => {
            const q = query(collection(db, 'teachers'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            setTeachers(querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as Teacher)));
        };
        fetchTeachers();
    }, []);

    // Utility functions
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-amber-100 text-amber-800';
            case 'approved': return 'bg-emerald-100 text-emerald-800';
            case 'rejected': return 'bg-rose-100 text-rose-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (timestamp: { seconds: number, nanoseconds: number }) => {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp.seconds * 1000);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getQuestionStatusColor = (status: string) => {
        switch (status) {
            case 'new': return 'bg-amber-100 text-amber-800';
            case 'in-progress': return 'bg-blue-100 text-blue-800';
            case 'resolved': return 'bg-emerald-100 text-emerald-800';
            case 'closed': return 'bg-rose-100 text-rose-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Question Management Functions
    const updateQuestionStatus = async (questionId: string, status: 'new' | 'in-progress' | 'resolved' | 'closed', answer?: string) => {
        if (!questionId) return;

        try {
            const questionRef = doc(db, 'queries', questionId);
            const updateData: { status: string, answer?: string } = { status };
            if (answer) updateData.answer = answer;

            await updateDoc(questionRef, updateData);

            setQuestions(questions.map(q =>
                q.id === questionId ? { ...q, status, ...(answer ? { answer } : {}) } : q
            ));

            setSelectedQuestion(null);
        } catch (error) {
            console.error("Error updating question status:", error);
        }
    };

    const deleteQuestion = async (questionId: string) => {
        if (!questionId) return;

        try {
            await deleteDoc(doc(db, 'queries', questionId));
            setQuestions(questions.filter(q => q.id !== questionId));
        } catch (error) {
            console.error("Error deleting question:", error);
        }
    };

    const openDetailsModal = (entry: AdmissionEntry) => {
        setSelectedEntry(entry);
    };

    const closeDetailsModal = () => {
        setSelectedEntry(null);
    };

    const downloadDocument = async (storageReference: string, documentName: string) => {
        getDownloadURL(ref(storage, storageReference))
            .then((url) => {
                const xhr = new XMLHttpRequest();
                xhr.responseType = 'blob';
                xhr.onload = () => {
                    const blob = xhr.response;
                    const link = document.createElement('a');
                    link.href = window.URL.createObjectURL(blob);
                    link.target = '_blank';
                    link.download = documentName;
                    link.click();
                };
                xhr.open('GET', url);
                xhr.send();
            })
            .catch((error) => console.error(error));
    };

    async function handleRegisterTeacher(e: React.FormEvent) {
        e.preventDefault();
        setRegError('');
        setRegSuccess('');
        setRegLoading(true);
        try {
            const userCred = await createUserWithEmailAndPassword(auth, teacherForm.email, teacherForm.password);
            const teacherId = `T-${userCred.user.uid.slice(0, 8).toUpperCase()}`;
            let photoURL = '';
            if (teacherPhoto) {
                const storage = getStorage();
                const fileRef = ref(storage, `teacher-photos/${userCred.user.uid}-${teacherPhoto.name}`);
                await uploadBytes(fileRef, teacherPhoto);
                photoURL = await getDownloadURL(fileRef);
            }
            await setDoc(doc(db, 'teachers', userCred.user.uid), {
                name: teacherForm.name,
                email: teacherForm.email,
                teacherId,
                phone: teacherForm.phone,
                subjects: teacherSubjects,
                photoURL,
                createdAt: new Date(),
                uid: userCred.user.uid
            });
            setRegSuccess('Teacher registered!');
            setTeacherForm({ name: '', email: '', password: '', phone: '' });
            setTeacherPhoto(null);
            setTeacherSubjects([]);
            // Fetch teachers from 'teachers' collection
            const q = query(collection(db, 'teachers'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            setTeachers(querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as Teacher)));
        } catch (err) {
            setRegError(err instanceof Error ? err.message : 'Registration failed');
        }
        setRegLoading(false);
    }

    const handleEditTeacher = (teacher: Teacher) => {
        setEditingTeacher(teacher);
        setEditTeacherForm({
            name: teacher.name,
            email: teacher.email,
            phone: teacher.phone,
            subjects: teacher.subjects || [],
        });
        setEditTeacherPhoto(null);
        setEditError('');
        setEditSuccess('');
    };

    async function handleUpdateTeacher(e: React.FormEvent) {
        e.preventDefault();
        if (!editingTeacher) return;
        setEditLoading(true);
        setEditError('');
        setEditSuccess('');
        try {
            let photoURL = editingTeacher.photoURL || '';
            if (editTeacherPhoto) {
                const storage = getStorage();
                const fileRef = ref(storage, `teacher-photos/${editingTeacher.uid}-${editTeacherPhoto.name}`);
                await uploadBytes(fileRef, editTeacherPhoto);
                photoURL = await getDownloadURL(fileRef);
            }
            await setDoc(doc(db, 'teachers', editingTeacher.uid), {
                ...editingTeacher,
                name: editTeacherForm.name,
                email: editTeacherForm.email,
                phone: editTeacherForm.phone,
                subjects: editTeacherForm.subjects,
                photoURL,
            }, { merge: true });
            setEditSuccess('Teacher updated!');
            // Refresh teachers list
            const q = query(collection(db, 'teachers'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            setTeachers(querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as Teacher)));
            setEditingTeacher(null);
        } catch (err) {
            setEditError(err instanceof Error ? err.message : 'Update failed');
        }
        setEditLoading(false);
    }

    // Remove teacher function
    const removeTeacher = async (teacherUid: string) => {
        if (!window.confirm('Are you sure you want to remove this teacher?')) return;
        try {
            await deleteDoc(doc(db, 'teachers', teacherUid));
            setTeachers(teachers.filter(t => t.uid !== teacherUid));
        } catch (error) {
            alert('Failed to remove teacher.');
            console.error(error);
        }
    };

    const renderQuestionsSection = () => (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8">
            <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white p-6">
                    <h2 className="text-2xl font-bold">Admission Questions</h2>
                </div>
                <div className="p-6">
                    {questions.map((q) => (
                        <div
                            key={q.id}
                            className="border-b border-indigo-50 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-indigo-50/50 transition-colors duration-200"
                        >
                            <div className="flex-grow pr-0 sm:pr-4 mb-4 sm:mb-0">
                                <p className="font-medium text-gray-800">{q.question}</p>
                                <p className="text-sm text-gray-600 mt-1">
                                    From: {q.fullName} ({q.email})
                                </p>
                                <span
                                    className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${getQuestionStatusColor(q.status)}`}
                                >
                                    {q.status}
                                </span>
                                <p className="text-sm text-gray-500 mt-1">
                                    Submitted on: {formatDate(q.createdAt)}
                                </p>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setSelectedQuestion(q)}
                                    className="text-indigo-600 hover:bg-indigo-100 p-2 rounded-full transition-colors duration-200"
                                    title="Manage Question"
                                >
                                    <Eye size={20} />
                                </button>
                                <button
                                    onClick={() => deleteQuestion(q.id)}
                                    className="text-rose-600 hover:bg-rose-100 p-2 rounded-full transition-colors duration-200"
                                    title="Delete Question"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {/* Question Management Modal */}
            {selectedQuestion && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 sm:p-6 transition-opacity duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 relative transform transition-all duration-300 scale-100">
                        <button
                            onClick={() => setSelectedQuestion(null)}
                            className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                        >
                            <X size={24} />
                        </button>
                        <h2 className="text-2xl font-bold mb-6 text-indigo-800 border-b border-indigo-100 pb-3">
                            Question Management
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <p className="font-medium text-lg text-gray-800">{selectedQuestion.question}</p>
                                <p className="text-sm text-gray-600 mt-2">
                                    From: {selectedQuestion.fullName} ({selectedQuestion.email})
                                </p>
                                <p className="text-sm text-gray-600">
                                    Contact: {selectedQuestion.contactNumber}
                                </p>
                                <span
                                    className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${getQuestionStatusColor(selectedQuestion.status)}`}
                                >
                                    Current Status: {selectedQuestion.status}
                                </span>
                            </div>

                            <div>
                                <label className="block mb-2 font-medium text-gray-700">Answer</label>
                                <textarea
                                    id="answer"
                                    rows={5}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                                    placeholder="Enter your answer here..."
                                    defaultValue={selectedQuestion.answer || ''}
                                />
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => {
                                        const answerTextarea = document.getElementById('answer') as HTMLTextAreaElement;
                                        updateQuestionStatus(selectedQuestion.id, 'resolved', answerTextarea.value);
                                    }}
                                    className="bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-500 transition-colors duration-200 flex items-center font-medium"
                                >
                                    <CheckCircle className="mr-2" size={20} /> Mark as Resolved
                                </button>
                                <button
                                    onClick={() => {
                                        const answerTextarea = document.getElementById('answer') as HTMLTextAreaElement;
                                        updateQuestionStatus(selectedQuestion.id, 'in-progress', answerTextarea.value);
                                    }}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-500 transition-colors duration-200 flex items-center font-medium"
                                >
                                    In Progress
                                </button>
                                <button
                                    onClick={() => updateQuestionStatus(selectedQuestion.id, 'closed')}
                                    className="bg-rose-600 text-white px-4 py-2 rounded-xl hover:bg-rose-500 transition-colors duration-200 flex items-center font-medium"
                                >
                                    <XCircle className="mr-2" size={20} /> Close Question
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen relative w-full bg-gray-50 pb-16">
            {/* Dashboard Header */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-indigo-800 mb-1">Admin Dashboard</h1>
                        <p className="text-gray-500 text-base md:text-lg">Manage admissions, questions, and teachers in one place</p>
                    </div>
                    <div className="flex items-center gap-2 mt-2 md:mt-0">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">Admin Panel</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-6 pt-12">
                <div className="flex flex-wrap gap-3 mb-8">
                    <button
                        onClick={() => setActiveTab('entries')}
                        className={`px-6 py-3 rounded-xl font-semibold shadow-sm border transition-all duration-300 text-sm sm:text-base
                            ${activeTab === 'entries'
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'}
                        `}
                    >
                        Admission Entries
                    </button>
                    <button
                        onClick={() => setActiveTab('questions')}
                        className={`px-6 py-3 rounded-xl font-semibold shadow-sm border transition-all duration-300 text-sm sm:text-base
                            ${activeTab === 'questions'
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'}
                        `}
                    >
                        Questions
                    </button>
                    <button
                        onClick={() => setActiveTab('teachers')}
                        className={`px-6 py-3 rounded-xl font-semibold shadow-sm border transition-all duration-300 text-sm sm:text-base
                            ${activeTab === 'teachers'
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'}
                        `}
                    >
                        Teachers
                    </button>
                </div>
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
                                <p className="text-sm font-medium text-gray-600">Questions</p>
                                <p className="text-3xl font-bold text-blue-600">{questions.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            {activeTab === 'entries' ? (
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                    <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-indigo-100">
                        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white p-6">
                            <h2 className="text-2xl font-bold">Admission Entries Management</h2>
                        </div>
                        {/* Responsive Table/Card Section */}
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                <p className="text-indigo-600 text-lg font-medium mt-4">Loading entries...</p>
                            </div>
                        ) : admissionEntries.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <p className="text-gray-500 text-lg">No admission entries yet</p>
                                <p className="text-gray-400 text-sm">Applications will appear here when submitted</p>
                            </div>
                        ) : (
                            <>
                                {/* Desktop Table View */}
                                <div className="hidden lg:block overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-indigo-50">
                                            <tr>
                                                {['Name', 'Email', 'Class', 'Stream', 'Status', 'Applied On', 'Actions'].map((header) => (
                                                    <th key={header} className="p-4 text-left text-indigo-700 font-semibold text-sm">
                                                        {header}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {admissionEntries.map((entry) => (
                                                <tr key={entry.id} className="border-b border-indigo-50 hover:bg-indigo-50/50 transition-colors duration-200">
                                                    <td className="p-4 text-gray-800">{entry.personalInfo?.name || 'N/A'}</td>
                                                    <td className="p-4 text-gray-800">{entry.personalInfo?.email || 'N/A'}</td>
                                                    <td className="p-4 text-gray-800">{entry.programPreferences?.desiredClass || 'N/A'}</td>
                                                    <td className="p-4 text-gray-800">{entry.programPreferences?.stream || 'N/A'}</td>
                                                    <td className="p-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(entry.applicationStatus)}`}>
                                                            {entry.applicationStatus}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-gray-800">{formatDate(entry.applicationDate)}</td>
                                                    <td className="p-4">
                                                        <button
                                                            onClick={() => openDetailsModal(entry)}
                                                            className="text-indigo-600 hover:bg-indigo-100 p-2 rounded-full transition-colors duration-200"
                                                            title="View Details"
                                                        >
                                                            <Eye size={20} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Mobile Card View */}
                                <div className="lg:hidden space-y-4 p-4">
                                    {admissionEntries.map((entry) => (
                                        <div key={entry.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h3 className="font-semibold text-gray-800">{entry.personalInfo?.name || 'N/A'}</h3>
                                                    <p className="text-sm text-gray-600">{entry.personalInfo?.email || 'N/A'}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(entry.applicationStatus)}`}>
                                                    {entry.applicationStatus}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                                                <div>
                                                    <span className="text-gray-500">Class:</span>
                                                    <p className="font-medium">{entry.programPreferences?.desiredClass || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Stream:</span>
                                                    <p className="font-medium">{entry.programPreferences?.stream || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                                <span className="text-xs text-gray-500">Applied: {formatDate(entry.applicationDate)}</span>
                                                <button
                                                    onClick={() => openDetailsModal(entry)}
                                                    className="text-indigo-600 hover:bg-indigo-100 p-2 rounded-full transition-colors duration-200"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            ) : activeTab === 'questions' ? (
                renderQuestionsSection()
            ) : (
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                    {/* Teacher Registration Section */}
                    <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-indigo-100 mb-8">
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white p-6">
                            <h2 className="text-2xl font-bold">Teacher Management</h2>
                            <p className="text-emerald-100 mt-2">Register new teachers and view all registered teachers</p>
                        </div>
                        <div className="p-8">
                            <div className="grid lg:grid-cols-2 gap-8">
                                {/* Add Teacher Button */}
                                <div>
                                    <button
                                        className="bg-emerald-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-emerald-500 transition-colors duration-200 shadow-lg mb-6"
                                        onClick={() => setShowAddTeacherModal(true)}
                                    >
                                        + Add Teacher
                                    </button>
                                </div>
                                {/* Teacher Stats */}
                                <div>
                                    <h3 className="text-xl font-bold mb-6 text-emerald-800">Teacher Statistics</h3>
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-xl border border-emerald-100">
                                            <div className="text-2xl font-bold text-emerald-600">{teachers.length}</div>
                                            <div className="text-sm text-emerald-700 font-medium">Total Teachers</div>
                                        </div>
                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                                            <div className="text-2xl font-bold text-blue-600">
                                                {
                                                    teachers.filter(t => {
                                                        if (!t.createdAt) return false;
                                                        let createdDate: Date;
                                                        if (t.createdAt instanceof Date) {
                                                            createdDate = t.createdAt;
                                                        } else if ('seconds' in t.createdAt) {
                                                            createdDate = new Date(t.createdAt.seconds * 1000);
                                                        } else {
                                                            return false;
                                                        }
                                                        return createdDate > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                                                    }).length
                                                }
                                            </div>
                                            <div className="text-sm text-blue-700 font-medium">New This Month</div>
                                        </div>
                                    </div>
                                    {/* Recent Activity */}
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <h4 className="font-semibold text-gray-800 mb-3">Recent Activity</h4>
                                        <div className="space-y-2">
                                            {teachers.slice(0, 3).map(teacher => (
                                                <div key={teacher.uid} className="flex items-center space-x-3 text-sm">
                                                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                                                    <span className="text-gray-700">{teacher.name} registered</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Teachers List */}
                    <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-indigo-100">
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white p-6">
                            <h3 className="text-xl font-bold">All Registered Teachers</h3>
                            <p className="text-emerald-100 mt-1">Manage and view all teacher accounts</p>
                        </div>
                        <div className="p-6">
                            {teachers.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-500 text-lg">No teachers registered yet</p>
                                    <p className="text-gray-400 text-sm">Use the form above to register your first teacher</p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {teachers.map(teacher => (
                                        <div key={teacher.uid} className="border border-gray-200 rounded-xl p-6 hover:bg-gray-50 transition-colors duration-200">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        {teacher.photoURL ? (
                                                            <Image src={teacher.photoURL} alt={teacher.name} width={40} height={40} className="w-10 h-10 rounded-full object-cover border border-emerald-200" />
                                                        ) : (
                                                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                                                <span className="text-emerald-600 font-semibold text-lg">
                                                                    {teacher.name.charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div>
                                                            <h4 className="font-semibold text-gray-800">{teacher.name}</h4>
                                                            <p className="text-sm text-gray-500">{teacher.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                                        <div>
                                                            <span className="text-xs text-gray-500 uppercase tracking-wide">Teacher ID</span>
                                                            <p className="font-mono text-sm text-emerald-600 font-medium">{teacher.teacherId}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-xs text-gray-500 uppercase tracking-wide">Phone</span>
                                                            <p className="text-sm text-gray-700">{teacher.phone}</p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-2">
                                                        <span className="text-xs text-gray-500 uppercase tracking-wide">Subjects</span>
                                                        <p className="text-sm text-gray-700">{Array.isArray(teacher.subjects) ? teacher.subjects.join(', ') : ''}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        className="text-blue-600 hover:bg-blue-100 p-2 rounded-full transition-colors duration-200"
                                                        title="Edit Teacher"
                                                        onClick={() => handleEditTeacher(teacher)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="text-rose-600 hover:bg-rose-100 p-2 rounded-full transition-colors duration-200"
                                                        title="Remove Teacher"
                                                        onClick={() => removeTeacher(teacher.uid)}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Details Modal */}
            {selectedEntry && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 sm:p-6 transition-opacity duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 sm:p-8 relative max-h-[70vh] overflow-y-auto border border-indigo-100 transform transition-all duration-300 scale-100">
                        <button
                            onClick={closeDetailsModal}
                            className="absolute top-4 right-4 text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                        >
                            <X size={24} />
                        </button>
                        <h2 className="text-2xl font-bold mb-6 text-indigo-800 border-b border-indigo-100 pb-3">
                            Admission Entry Details
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Personal Information Section */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4 text-indigo-800">Personal Information</h3>
                                <div className="space-y-3">
                                    <p><strong className="text-gray-700">Name:</strong> {selectedEntry.personalInfo?.name || 'N/A'}</p>
                                    <p><strong className="text-gray-700">Email:</strong> {selectedEntry.personalInfo?.email || 'N/A'}</p>
                                    <p><strong className="text-gray-700">Phone:</strong> {selectedEntry.personalInfo?.phoneNo || 'N/A'}</p>
                                    <p><strong className="text-gray-700">Gender:</strong> {selectedEntry.personalInfo?.gender || 'N/A'}</p>
                                </div>
                            </div>
                            {/* Program Preferences Section */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4 text-indigo-800">Program Details</h3>
                                <div className="space-y-3">
                                    <p><strong className="text-gray-700">Desired Class:</strong> {selectedEntry.programPreferences?.desiredClass || 'N/A'}</p>
                                    <p><strong className="text-gray-700">Stream:</strong> {selectedEntry.programPreferences?.stream || 'N/A'}</p>
                                    <p><strong className="text-gray-700">Career Goals:</strong> {selectedEntry.programPreferences?.careerGoals || 'N/A'}</p>
                                    <p><strong className="text-gray-700">Reason for Joining:</strong> {selectedEntry.programPreferences?.reasonForJoining || 'N/A'}</p>
                                    <p><strong className="text-gray-700">Application Status:</strong>
                                        <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedEntry.applicationStatus)}`}>
                                            {selectedEntry.applicationStatus}
                                        </span>
                                    </p>
                                    <p><strong className="text-gray-700">Applied On:</strong> {formatDate(selectedEntry.applicationDate)}</p>
                                </div>
                            </div>
                            {/* Documents Section */}
                            <div className="col-span-2 mt-6">
                                <h3 className="text-lg font-semibold mb-4 text-indigo-800">Uploaded Documents</h3>
                                <div className="grid md:grid-cols-3 gap-4">
                                    {selectedEntry.documents?.profilePicture && (
                                        <div>
                                            <p className="font-medium mb-2 text-gray-700">Profile Picture</p>
                                            <div className="relative group">
                                                <Image
                                                    src={selectedEntry.documents.profilePicture}
                                                    alt="Profile"
                                                    width={192}
                                                    height={192}
                                                    className="w-full h-48 object-cover rounded-xl border border-indigo-100 transition-transform duration-200 group-hover:scale-105"
                                                    onClick={() => setDocumentViewer({
                                                        imageUrl: selectedEntry.documents?.profilePicture || '',
                                                        title: 'Profile Picture'
                                                    })}
                                                />
                                                <button
                                                    onClick={() => downloadDocument(
                                                        selectedEntry.documents?.profilePicture || '',
                                                        'Profile Picture'
                                                    )}
                                                    className="absolute top-2 right-2 bg-white/90 border border-indigo-100 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-indigo-50"
                                                    title="Download"
                                                >
                                                    <Download size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {selectedEntry.documents?.characterCertificate && (
                                        <div>
                                            <p className="font-medium mb-2 text-gray-700">Character Certificate</p>
                                            <div className="relative group">
                                                <Image
                                                    src={selectedEntry.documents.characterCertificate}
                                                    alt="Character Certificate"
                                                    width={192}
                                                    height={192}
                                                    className="w-full h-48 object-cover rounded-xl border border-indigo-100 transition-transform duration-200 group-hover:scale-105"
                                                    onClick={() => setDocumentViewer({
                                                        imageUrl: selectedEntry.documents?.characterCertificate || '',
                                                        title: 'Character Certificate'
                                                    })}
                                                />
                                                <button
                                                    onClick={() => downloadDocument(
                                                        selectedEntry.documents?.characterCertificate || '',
                                                        'Character Certificate'
                                                    )}
                                                    className="absolute top-2 right-2 bg-white/90 border border-indigo-100 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-indigo-50"
                                                    title="Download"
                                                >
                                                    <Download size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {selectedEntry.documents?.previousMarksheets && (
                                        <div>
                                            <p className="font-medium mb-2 text-gray-700">Previous Marksheets</p>
                                            {selectedEntry.documents.previousMarksheets.map((marksheet, index) => (
                                                <div key={index} className="relative group mb-2">
                                                    <Image
                                                        src={marksheet}
                                                        alt={`Marksheet ${index + 1}`}
                                                        width={192}
                                                        height={192}
                                                        className="w-full h-48 object-cover rounded-xl border border-indigo-100 transition-transform duration-200 group-hover:scale-105"
                                                        onClick={() => setDocumentViewer({
                                                            imageUrl: marksheet,
                                                            title: `Marksheet ${index + 1}`
                                                        })}
                                                    />
                                                    <button
                                                        onClick={() => downloadDocument(
                                                            marksheet,
                                                            `Marksheet ${index + 1}`
                                                        )}
                                                        className="absolute top-2 right-2 bg-white/90 border border-indigo-100 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-indigo-50"
                                                        title="Download"
                                                    >
                                                        <Download size={20} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* Action Buttons */}
                            <div className="col-span-2 mt-6 flex justify-end space-x-4 border-t border-indigo-100 pt-4">
                                <button
                                    onClick={() => {
                                        const updatedStatus: 'approved' | 'rejected' | 'pending' =
                                            selectedEntry.applicationStatus === 'pending' ? 'approved' : 'pending';
                                        const entryRef = doc(db, 'admissions', selectedEntry.id);
                                        updateDoc(entryRef, { applicationStatus: updatedStatus })
                                            .then(() => {
                                                setAdmissionEntries(entries =>
                                                    entries.map(entry =>
                                                        entry.id === selectedEntry.id
                                                            ? { ...entry, applicationStatus: updatedStatus }
                                                            : entry
                                                    )
                                                );
                                                setSelectedEntry(prev => prev ? { ...prev, applicationStatus: updatedStatus } : null);
                                            })
                                            .catch(error => {
                                                console.error("Error updating application status:", error);
                                            });
                                    }}
                                    className={`
                                        ${selectedEntry.applicationStatus === 'pending'
                                            ? 'bg-indigo-600 hover:bg-indigo-500'
                                            : 'bg-amber-500 hover:bg-amber-400'
                                        } 
                                        text-white px-6 py-2 rounded-xl transition-colors duration-200 font-semibold shadow-sm
                                    `}
                                >
                                    {selectedEntry.applicationStatus === 'pending'
                                        ? 'Approve Application'
                                        : 'Reset Status'}
                                </button>
                                <button
                                    onClick={() => {
                                        const updatedStatus: 'rejected' | 'pending' =
                                            selectedEntry.applicationStatus !== 'rejected' ? 'rejected' : 'pending';
                                        const entryRef = doc(db, 'admissions', selectedEntry.id);
                                        updateDoc(entryRef, { applicationStatus: updatedStatus })
                                            .then(() => {
                                                setAdmissionEntries(entries =>
                                                    entries.map(entry =>
                                                        entry.id === selectedEntry.id
                                                            ? { ...entry, applicationStatus: updatedStatus }
                                                            : entry
                                                    )
                                                );
                                                setSelectedEntry(prev => prev ? { ...prev, applicationStatus: updatedStatus } : null);
                                            })
                                            .catch(error => {
                                                console.error("Error updating application status:", error);
                                            });
                                    }}
                                    className={`
                                        ${selectedEntry.applicationStatus !== 'rejected'
                                            ? 'bg-rose-600 hover:bg-rose-500'
                                            : 'bg-amber-500 hover:bg-amber-400'
                                        } 
                                        text-white px-6 py-2 rounded-xl transition-colors duration-200 font-semibold shadow-sm
                                    `}
                                >
                                    {selectedEntry.applicationStatus !== 'rejected'
                                        ? 'Reject Application'
                                        : 'Reset Status'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Document Viewer Modal */}
            {documentViewer && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 sm:p-6 transition-opacity duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-6 sm:p-8 relative border border-indigo-100 transform transition-all duration-300 scale-100">
                        <button
                            onClick={() => setDocumentViewer(null)}
                            className="absolute top-4 right-4 text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                            aria-label="Close Viewer"
                        >
                            <X size={24} />
                        </button>
                        <h2 className="text-2xl font-bold mb-6 text-indigo-800 border-b border-indigo-100 pb-3">
                            {documentViewer.title}
                        </h2>
                        <div className="flex items-center justify-center h-[70vh] mb-4">
                            <Image
                                src={documentViewer.imageUrl}
                                alt="Document"
                                className="object-contain max-h-full max-w-full"
                                priority
                                fill
                            />
                        </div>
                        <button
                            onClick={() => downloadDocument(documentViewer.imageUrl, documentViewer.title)}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-500 transition-colors duration-200 flex items-center absolute bottom-4 right-4 font-semibold shadow-sm"
                        >
                            <Download className="mr-2" size={20} /> Download Document
                        </button>
                    </div>
                </div>
            )}

            {/* Edit Teacher Modal */}
            {editingTeacher && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-opacity duration-300 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative border border-indigo-100 max-h-[70vh] overflow-y-auto animate-fadeIn">
                        <button
                            onClick={() => setEditingTeacher(null)}
                            className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 transition-colors duration-200 text-2xl font-bold"
                            aria-label="Close"
                        >
                            &times;
                        </button>
                        <h2 className="text-2xl font-bold mb-6 text-indigo-800 border-b border-indigo-100 pb-3">Edit Teacher</h2>
                        <form onSubmit={handleUpdateTeacher} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={editTeacherForm.name}
                                    onChange={e => setEditTeacherForm(f => ({ ...f, name: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={editTeacherForm.email}
                                    onChange={e => setEditTeacherForm(f => ({ ...f, email: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                <input
                                    type="text"
                                    value={editTeacherForm.phone}
                                    onChange={e => setEditTeacherForm(f => ({ ...f, phone: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Subjects</label>
                                <div className="flex flex-wrap gap-2">
                                    {SUBJECTS.map(subj => (
                                        <label key={subj} className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-indigo-50 px-3 py-1 rounded-lg cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={editTeacherForm.subjects.includes(subj)}
                                                onChange={e => {
                                                    if (e.target.checked) {
                                                        setEditTeacherForm(f => ({ ...f, subjects: [...f.subjects, subj] }));
                                                    } else {
                                                        setEditTeacherForm(f => ({ ...f, subjects: f.subjects.filter(s => s !== subj) }));
                                                    }
                                                }}
                                            />
                                            {subj}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => setEditTeacherPhoto(e.target.files?.[0] || null)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                                />
                                {editTeacherPhoto && <span className="text-xs text-gray-500 mt-1 block">Selected: {editTeacherPhoto.name}</span>}
                            </div>
                            {editError && <div className="bg-rose-50 border border-rose-200 rounded-xl p-4"><p className="text-rose-600 font-medium text-sm">{editError}</p></div>}
                            {editSuccess && <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4"><p className="text-emerald-600 font-medium text-sm">{editSuccess}</p></div>}
                            <button
                                type="submit"
                                disabled={editLoading}
                                className="w-full bg-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-indigo-500 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
                            >
                                {editLoading ? 'Updating...' : 'Update Teacher'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Teacher Modal */}
            {showAddTeacherModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-opacity duration-300 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative border border-emerald-100 max-h-[70vh] overflow-y-auto animate-fadeIn">
                        <button
                            onClick={() => setShowAddTeacherModal(false)}
                            className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 transition-colors duration-200 text-2xl font-bold"
                            aria-label="Close"
                        >
                            &times;
                        </button>
                        <h3 className="text-xl font-bold mb-6 text-emerald-800">Register New Teacher</h3>
                        <form onSubmit={handleRegisterTeacher} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter teacher's full name"
                                    value={teacherForm.name}
                                    onChange={e => setTeacherForm(f => ({ ...f, name: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors duration-200"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    placeholder="teacher@example.com"
                                    value={teacherForm.email}
                                    onChange={e => setTeacherForm(f => ({ ...f, email: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors duration-200"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                <input
                                    type="password"
                                    placeholder="Create a secure password"
                                    value={teacherForm.password}
                                    onChange={e => setTeacherForm(f => ({ ...f, password: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors duration-200"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                <input
                                    type="text"
                                    placeholder="+1 (555) 123-4567"
                                    value={teacherForm.phone}
                                    onChange={e => setTeacherForm(f => ({ ...f, phone: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors duration-200"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Subjects</label>
                                <div className="flex flex-wrap gap-2">
                                    {SUBJECTS.map(subj => (
                                        <label key={subj} className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-emerald-50 px-3 py-1 rounded-lg cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={teacherSubjects.includes(subj)}
                                                onChange={e => {
                                                    if (e.target.checked) {
                                                        setTeacherSubjects([...teacherSubjects, subj]);
                                                    } else {
                                                        setTeacherSubjects(teacherSubjects.filter(s => s !== subj));
                                                    }
                                                }}
                                            />
                                            {subj}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => setTeacherPhoto(e.target.files?.[0] || null)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors duration-200"
                                />
                                {teacherPhoto && <span className="text-xs text-gray-500 mt-1 block">Selected: {teacherPhoto.name}</span>}
                            </div>
                            {regError && (
                                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
                                    <p className="text-rose-600 font-medium text-sm">{regError}</p>
                                </div>
                            )}
                            {regSuccess && (
                                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                                    <p className="text-emerald-600 font-medium text-sm">{regSuccess}</p>
                                </div>
                            )}
                            <button
                                type="submit"
                                disabled={regLoading}
                                className="w-full bg-emerald-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-emerald-500 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
                            >
                                {regLoading ? 'Registering Teacher...' : 'Register Teacher'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            {/* Add fadeIn animation for modal */
}
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