'use client';
import React, { useState, useEffect } from 'react';
import { AdmissionEntry } from '@/firebase/definitions';
import { updateAdmissionStatus, getSubjectNameById } from '@/firebase/functions';
import { Timestamp } from 'firebase/firestore';

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
    // Map subject IDs to names for all entries
    const [subjectNamesMap, setSubjectNamesMap] = useState<Record<string, string>>({});
    
    // Filter states
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [subjectFilter, setSubjectFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('newest');

    useEffect(() => {
        const allIds = Array.from(
            new Set(
                admissionEntries.flatMap(entry =>
                    Array.isArray(entry.subjects) ? entry.subjects : []
                )
            )
        );
        if (allIds.length === 0) {
            setSubjectNamesMap({});
            return;
        }
        Promise.all(allIds.map(id => getSubjectNameById(id).then(name => [id, name] as [string, string])))
            .then(pairs => {
                const map: Record<string, string> = {};
                pairs.forEach(([id, name]) => { map[id] = name; });
                setSubjectNamesMap(map);
            });
    }, [admissionEntries]);

    // Format Firestore Timestamp or string date
    const formatDate = (timestamp: Timestamp) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate();
        return date.toLocaleString([], {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Accept or reject handler
    const handleStatusChange = async (entry: AdmissionEntry, status: 'accepted' | 'rejected') => {
        await updateAdmissionStatus(entry.uid || '', status);
        setAdmissionEntries(entries =>
            entries.map(e =>
                e.uid === entry.uid
                    ? { ...e, applicationStatus: status }
                    : e
            )
        );
    };

    // Get unique subjects for filter
    const getUniqueSubjects = () => {
        const subjects = new Set<string>();
        admissionEntries.forEach(entry => {
            if (Array.isArray(entry.subjects)) {
                entry.subjects.forEach(id => {
                    const name = subjectNamesMap[id];
                    if (name) subjects.add(name);
                });
            }
        });
        return Array.from(subjects).sort();
    };

    // Filter and sort entries
    const getFilteredEntries = () => {
        const filtered = admissionEntries.filter(entry => {
            // Status filter
            if (statusFilter !== 'all' && entry.applicationStatus !== statusFilter) {
                return false;
            }

            // Search filter
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                const matchesName = entry.name?.toLowerCase().includes(searchLower);
                const matchesEmail = entry.email?.toLowerCase().includes(searchLower);
                const matchesFather = entry.fatherName?.toLowerCase().includes(searchLower);
                const matchesContact = entry.contact?.toLowerCase().includes(searchLower);
                
                if (!matchesName && !matchesEmail && !matchesFather && !matchesContact) {
                    return false;
                }
            }

            // Subject filter
            if (subjectFilter !== 'all') {
                if (Array.isArray(entry.subjects)) {
                    const hasSubject = entry.subjects.some(id => 
                        subjectNamesMap[id] === subjectFilter
                    );
                    if (!hasSubject) return false;
                } else {
                    return false;
                }
            }

            return true;
        });

        // Sort entries
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return b.submittedAt?.toMillis() - a.submittedAt?.toMillis();
                case 'oldest':
                    return a.submittedAt?.toMillis() - b.submittedAt?.toMillis();
                case 'name':
                    return a.name?.localeCompare(b.name || '') || 0;
                case 'status':
                    return a.applicationStatus?.localeCompare(b.applicationStatus || '') || 0;
                default:
                    return 0;
            }
        });

        return filtered;
    };

    const filteredEntries = getFilteredEntries();
    const uniqueSubjects = getUniqueSubjects();

    // Get status badge styling
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'accepted':
                return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
            case 'rejected':
                return 'bg-rose-100 text-rose-800 border border-rose-200';
            case 'pending':
                return 'bg-amber-100 text-amber-800 border border-amber-200';
            default:
                return 'bg-gray-100 text-gray-800 border border-gray-200';
        }
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8">
            <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-indigo-100">
                <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white p-6">
                    <h2 className="text-2xl font-bold">Admission Entries Management</h2>
                    <p className="text-indigo-100 mt-1">Total: {admissionEntries.length} | Filtered: {filteredEntries.length}</p>
                </div>

                {/* Filters Section */}
                <div className="bg-indigo-50 p-4 border-b border-indigo-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Search */}
                        <div>
                            <label className="block text-sm font-medium text-indigo-700 mb-1">Search</label>
                            <input
                                type="text"
                                placeholder="Name, email, contact..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            />
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-indigo-700 mb-1">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="accepted">Accepted</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>

                        {/* Subject Filter */}
                        <div>
                            <label className="block text-sm font-medium text-indigo-700 mb-1">Subject</label>
                            <select
                                value={subjectFilter}
                                onChange={(e) => setSubjectFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            >
                                <option value="all">All Subjects</option>
                                {uniqueSubjects.map(subject => (
                                    <option key={subject} value={subject}>{subject}</option>
                                ))}
                            </select>
                        </div>

                        {/* Sort By */}
                        <div>
                            <label className="block text-sm font-medium text-indigo-700 mb-1">Sort By</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="name">Name A-Z</option>
                                <option value="status">Status</option>
                            </select>
                        </div>
                    </div>

                    {/* Clear Filters */}
                    {(statusFilter !== 'all' || searchTerm || subjectFilter !== 'all' || sortBy !== 'newest') && (
                        <div className="mt-3">
                            <button
                                onClick={() => {
                                    setStatusFilter('all');
                                    setSearchTerm('');
                                    setSubjectFilter('all');
                                    setSortBy('newest');
                                }}
                                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    )}
                </div>

                {/* Responsive Table/Card Section */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        <p className="text-indigo-600 text-lg font-medium mt-4">Loading entries...</p>
                    </div>
                ) : filteredEntries.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <p className="text-gray-500 text-lg">
                            {admissionEntries.length === 0 ? 'No admission entries yet' : 'No entries match your filters'}
                        </p>
                        <p className="text-gray-400 text-sm">
                            {admissionEntries.length === 0 ? 'Applications will appear here when submitted' : 'Try adjusting your search criteria'}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="overflow-x-auto hidden lg:block">
                            <table className="w-full">
                                <thead className="bg-indigo-50">
                                    <tr>
                                        <th className="p-4 text-left text-indigo-700 font-semibold text-sm">Name</th>
                                        <th className="p-4 text-left text-indigo-700 font-semibold text-sm">Father Name</th>
                                        <th className="p-4 text-left text-indigo-700 font-semibold text-sm">Contact</th>
                                        <th className="p-4 text-left text-indigo-700 font-semibold text-sm">Email</th>
                                        <th className="p-4 text-left text-indigo-700 font-semibold text-sm">Residence</th>
                                        <th className="p-4 text-left text-indigo-700 font-semibold text-sm">Course(s)</th>
                                        <th className="p-4 text-left text-indigo-700 font-semibold text-sm">Current Education</th>
                                        <th className="p-4 text-left text-indigo-700 font-semibold text-sm">Preferred Schedule</th>
                                        <th className="p-4 text-left text-indigo-700 font-semibold text-sm">Status</th>
                                        <th className="p-4 text-left text-indigo-700 font-semibold text-sm">Submitted At</th>
                                        <th className="p-4 text-left text-indigo-700 font-semibold text-sm">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEntries.map((entry, idx) => (
                                        <tr key={idx} className="border-b border-indigo-50 hover:bg-indigo-50/50 transition-colors duration-200">
                                            <td className="p-4 text-gray-800 font-medium">{entry.name}</td>
                                            <td className="p-4 text-gray-800">{entry.fatherName}</td>
                                            <td className="p-4 text-gray-800">{entry.contact}</td>
                                            <td className="p-4 text-gray-800">{entry.email}</td>
                                            <td className="p-4 text-gray-800">{entry.residence}</td>
                                            <td className="p-4 text-gray-800">
                                                {Array.isArray(entry.subjects)
                                                    ? entry.subjects.map(id => subjectNamesMap[id] || id).join(', ')
                                                    : entry.subjects || 'N/A'}
                                            </td>
                                            <td className="p-4 text-gray-800">{entry.currentEducation}</td>
                                            <td className="p-4 text-gray-800">{entry.preferredSchedule}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(entry.applicationStatus || 'pending')}`}>
                                                    {entry.applicationStatus || 'pending'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-800">{formatDate(entry.submittedAt)}</td>
                                            <td className="p-4">
                                                {entry.applicationStatus === 'pending' ? (
                                                    <div className="flex gap-2">
                                                        <button
                                                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
                                                            onClick={() => handleStatusChange(entry, 'accepted')}
                                                        >
                                                            Accept
                                                        </button>
                                                        <button
                                                            className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
                                                            onClick={() => handleStatusChange(entry, 'rejected')}
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">No action needed</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="lg:hidden space-y-4 p-4">
                            {filteredEntries.map((entry, idx) => (
                                <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-semibold text-gray-800 text-lg">{entry.name}</h3>
                                            <p className="text-sm text-gray-600">{entry.email}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(entry.applicationStatus || 'pending')}`}>
                                            {entry.applicationStatus || 'pending'}
                                        </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                                        <div>
                                            <span className="text-gray-500 block">Father Name:</span>
                                            <p className="font-medium text-gray-800">{entry.fatherName}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block">Contact:</span>
                                            <p className="font-medium text-gray-800">{entry.contact}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block">Residence:</span>
                                            <p className="font-medium text-gray-800">{entry.residence}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block">Current Education:</span>
                                            <p className="font-medium text-gray-800">{entry.currentEducation}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-gray-500 block">Subject(s):</span>
                                            <p className="font-medium text-gray-800">
                                                {Array.isArray(entry.subjects)
                                                    ? entry.subjects.map(id => subjectNamesMap[id] || id).join(', ')
                                                    : entry.subjects || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block">Preferred Schedule:</span>
                                            <p className="font-medium text-gray-800">{entry.preferredSchedule}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block">Submitted At:</span>
                                            <p className="font-medium text-gray-800">{formatDate(entry.submittedAt)}</p>
                                        </div>
                                    </div>

                                    {entry.applicationStatus === 'pending' && (
                                        <div className="flex gap-2 pt-3 border-t border-gray-100">
                                            <button
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex-1 font-medium transition-colors"
                                                onClick={() => handleStatusChange(entry, 'accepted')}
                                            >
                                                Accept
                                            </button>
                                            <button
                                                className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg flex-1 font-medium transition-colors"
                                                onClick={() => handleStatusChange(entry, 'rejected')}
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdmissionEntriesTab; 