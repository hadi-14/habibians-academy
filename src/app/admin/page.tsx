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
    deleteDoc
} from 'firebase/firestore';
import { db, storage } from '@/firebase/config';
import Image from "next/image";
import { getDownloadURL, ref } from 'firebase/storage';

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
    const [activeTab, setActiveTab] = useState<'entries' | 'questions'>('entries');
    const [documentViewer, setDocumentViewer] = useState<{
        imageUrl: string;
        title: string;
    } | null>(null);

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
                                    className="text-indigo Um-600 hover:bg-indigo-100 p-2 rounded-full transition-colors duration-200"
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
                <div className="fixed inset-0 bg-opacity-60 flex items-center justify-center z-50 p-4 sm:p-6 transition-opacity duration-300">
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
        <div className="min-h-screen relative w-full bg-gray-50">
            {/* Hero Section */}
            <div className="relative h-56 bg-cover bg-center" style={{ backgroundImage: "url('/top_header_bg.jpg')" }}>
                <div className="w-full h-full bg-indigo-900/80 absolute inset-0" />
                <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-6">
                    <div className="bg-white rounded-xl border border-indigo-100/20 px-8 py-4 shadow-xl">
                        <h1 className="text-2xl md:text-4xl font-bold text-indigo-800">Admin Dashboard</h1>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-6 pt-12">
                <div className="flex flex-wrap gap-3">
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
                </div>
            </div>

            {/* Main Content */}
            {activeTab === 'entries' ? (
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                    <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-indigo-100">
                        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white p-6">
                            <h2 className="text-2xl font-bold">Admission Entries Management</h2>
                        </div>
                        {loading ? (
                            <div className="text-center py-12">
                                <p className="text-indigo-600 text-lg font-medium">Loading entries...</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-indigo-50">
                                        <tr>
                                            {['Name', 'Email', 'Class', 'Stream', 'Status', 'Applied On', 'Actions'].map((header) => (
                                                <th key={header} className="p-4 text-left text-indigo-700 font-semibold text-sm sm:text-base">
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
                        )}
                    </div>
                </div>
            ) : (
                renderQuestionsSection()
            )}

            {/* Details Modal */}
            {selectedEntry && (
                <div className="fixed inset-0 bg-opacity-60 flex items-center justify-center z-50 p-4 sm:p-6 transition-opacity duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto border border-indigo-100 transform transition-all duration-300 scale-100">
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
                <div className="fixed inset-0 bg-opacity-60 flex items-center justify-center z-50 p-4 sm:p-6 transition-opacity duration-300">
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
        </div>
    );
};

export default AdminDashboard;