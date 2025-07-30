'use client';
import React, { useState } from 'react';
import { Eye, X, Download } from 'lucide-react';
import { updateDoc, doc } from 'firebase/firestore';
import { db, storage } from '@/firebase/config';
import { getDownloadURL, ref } from 'firebase/storage';
import Image from "next/image";
import { AdmissionEntry } from '@/firebase/definitions';


interface AdmissionEntriesTabProps {
    admissionEntries: AdmissionEntry[];
    setAdmissionEntries: React.Dispatch<React.SetStateAction<AdmissionEntry[]>>;
    loading: boolean;
}

const AdmissionEntriesTab: React.FC<AdmissionEntriesTabProps> = ({
    admissionEntries,
    setAdmissionEntries,
    loading
}) => {
    const [selectedEntry, setSelectedEntry] = useState<AdmissionEntry | null>(null);
    const [documentViewer, setDocumentViewer] = useState<{
        imageUrl: string;
        title: string;
    } | null>(null);

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

    return (
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
        </div>
    );
};

export default AdmissionEntriesTab;