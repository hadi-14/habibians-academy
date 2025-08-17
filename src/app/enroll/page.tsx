'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Send, User, Phone, BookOpen, Users, Check, Filter, X, Search } from 'lucide-react';
import { AdmissionEntry, Subject } from '@/firebase/definitions';
import { getSubjects } from '@/firebase/functions';
import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore";

const initialFormData: AdmissionEntry = {
    name: '',
    fatherName: '',
    contact: '',
    email: '',
    residence: '',
    subjects: [], // now an array
    currentEducation: '',
    preferredSchedule: '',
    applicationStatus: 'pending', // default status
    submittedAt: Timestamp.now(), // use Firestore Timestamp
};

interface FilterState {
    board: string;
    level: string;
    year: number | '';
    field: string;
    search: string;
}

const OnlineCoachingForm = () => {
    const [formData, setFormData] = useState<AdmissionEntry>(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
    const [showFilters, setShowFilters] = useState(false);

    const [filters, setFilters] = useState<FilterState>({
        board: '',
        level: '',
        year: '',
        field: '',
        search: ''
    });

    const educationLevels: string[] = [
        "O Level",
        "AKU Matric",
        "Sindh Board",
        "IBDP Class 10",
        "Sindh Board Pre-Engineering",
        "Sindh Board Pre-Medical",
        "Other"
    ];

    const schedules = [
        'Morning (8:00 AM - 12:00 PM)',
        'Afternoon (1:00 PM - 5:00 PM)',
        'Evening (6:00 PM - 10:00 PM)',
        'Weekend Only',
        'Flexible Timing'
    ];

    // Get unique filter options from subjects
    const getFilterOptions = () => {
        const boards = Array.from(new Set(subjects.map(s => s.board).filter(Boolean))).sort();
        const levels = Array.from(new Set(subjects.map(s => s.level).filter(Boolean))).sort();
        const years = Array.from(new Set(subjects.map(s => s.year).filter(Boolean))).sort((a, b) => a - b);
        const fields = Array.from(new Set(subjects.flatMap(s => s.field || []).filter(Boolean))).sort();

        return { boards, levels, years, fields };
    };

    const { boards, levels, years, fields } = getFilterOptions();

    // Filter subjects based on current filters
    const applyFilters = () => {
        let filtered = subjects;

        if (filters.board) {
            filtered = filtered.filter(subject => subject.board === filters.board);
        }

        if (filters.level) {
            filtered = filtered.filter(subject => subject.level === filters.level);
        }

        if (filters.year) {
            filtered = filtered.filter(subject => subject.year === filters.year);
        }

        if (filters.field) {
            filtered = filtered.filter(subject =>
                subject.field && subject.field.includes(filters.field)
            );
        }

        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            filtered = filtered.filter(subject =>
                subject.name.toLowerCase().includes(searchTerm) ||
                (subject.code && subject.code.toLowerCase().includes(searchTerm)) ||
                subject.board.toLowerCase().includes(searchTerm) ||
                subject.level.toLowerCase().includes(searchTerm)
            );
        }

        setFilteredSubjects(filtered);
    };

    // Apply filters whenever filters or subjects change
    useEffect(() => {
        applyFilters();
    });

    const handleInputChange = (field: keyof AdmissionEntry, value: string | string[]) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleFilterChange = (filterKey: keyof FilterState, value: string | number | '') => {
        setFilters(prev => {
            const newFilters = { ...prev };

            // If setting level, clear year
            if (filterKey === 'level' && value !== '') {
                newFilters.year = '';
            }

            // If setting year, clear level
            if (filterKey === 'year' && value !== '') {
                newFilters.level = '';
            }

            // Handle year filter specifically
            if (filterKey === 'year') {
                if (value === '') {
                    newFilters.year = '';
                } else {
                    newFilters.year = typeof value === 'string' ? parseInt(value) : value;
                }
            } else {
                // For all other filters, assign the value directly
                (newFilters as { [key in keyof FilterState]: string | number | '' })[filterKey] = value;
            }
            
            return newFilters;
        });
    };

    const clearFilters = () => {
        setFilters({
            board: '',
            level: '',
            year: '',
            field: '',
            search: ''
        });
    };

    const hasActiveFilters = Object.values(filters).some(value => value !== '');

    // Handle course selection toggle
    const handleSubjectToggle = (subjectUid: string) => {
        setFormData(prev => {
            const currentSubjects = Array.isArray(prev.subjects) ? prev.subjects : [];
            const isSelected = currentSubjects.includes(subjectUid);

            if (isSelected) {
                return {
                    ...prev,
                    subjects: currentSubjects.filter(uid => uid !== subjectUid)
                };
            } else {
                return {
                    ...prev,
                    subjects: [...currentSubjects, subjectUid]
                };
            }
        });
    };

    const validateForm = () => {
        const required = ['name', 'fatherName', 'contact', 'email', 'residence'];
        const allFilled = required.every(field => {
            const value = formData[field as keyof AdmissionEntry];
            return typeof value === 'string' ? value.trim() !== '' : Array.isArray(value) ? value.length > 0 : false;
        });
        const subjectsValid = Array.isArray(formData.subjects) && formData.subjects.length > 0;
        return allFilled && subjectsValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            setNotification({ message: "Please fill in all required fields", type: 'error' });
            return;
        }

        try {
            setIsSubmitting(true);

            // Actually create the admission in Firestore
            const db = getFirestore();
            await addDoc(collection(db, "admissions"), {
                ...formData,
                submittedAt: new Date(),
                applicationStatus: "pending"
            });

            setNotification({ message: "Application submitted successfully! We'll contact you soon.", type: 'success' });
            setFormData(initialFormData);

        } catch {
            setNotification({ message: "Error submitting application. Please try again.", type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Clear notification after 5 seconds
    React.useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    // Fetch subjects
    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const subjects = await getSubjects();
                setSubjects(subjects);
                setFilteredSubjects(subjects);
            } catch {
                setNotification({ message: "Failed to load subjects.", type: 'error' });
            }
        };
        fetchSubjects();
    }, []);

    // Group subjects by level for better organization
    const subjectsByLevel = filteredSubjects.reduce((acc, subject) => {
        const level = subject.level || 'Other';
        if (!acc[level]) {
            acc[level] = [];
        }
        acc[level].push(subject);
        return acc;
    }, {} as Record<string, typeof filteredSubjects>);

    const selectedSubjectCount = Array.isArray(formData.subjects) ? formData.subjects.length : 0;

    return (
        <div className="min-h-screen py-8 px-4">
            {notification && (
                <div className="fixed top-4 right-4 z-50 max-w-md">
                    <Alert className={`${notification.type === 'error' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'} shadow-lg`}>
                        <AlertDescription className={notification.type === 'error' ? 'text-red-800' : 'text-green-800'}>
                            {notification.message}
                        </AlertDescription>
                    </Alert>
                </div>
            )}

            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center mb-4">
                        <Image
                            src="/logo.svg"
                            alt="Logo"
                            width={160}
                            height={160}
                        />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Online Coaching Admission</h1>
                    <p className="text-lg text-gray-600">Join our expert-led online coaching programs</p>
                    <p className="text-sm text-gray-500 mt-1">All fields marked with * are required</p>
                </div>

                <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                        <CardTitle className="text-2xl font-bold text-center">Application Form</CardTitle>
                    </CardHeader>

                    <CardContent className="p-8">
                        <form className="space-y-6" onSubmit={handleSubmit}>

                            {/* Personal Information Section */}
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                                    <User className="w-5 h-5 mr-2 text-blue-600" />
                                    Personal Information
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Full Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            placeholder="Enter your full name"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Father&apos;s Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.fatherName}
                                            onChange={(e) => handleInputChange('fatherName', e.target.value)}
                                            placeholder="Enter father's name"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information Section */}
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                                    <Phone className="w-5 h-5 mr-2 text-green-600" />
                                    Contact Information
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Contact Number <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.contact}
                                            onChange={(e) => handleInputChange('contact', e.target.value)}
                                            placeholder="+92 300 1234567"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Email Address <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            placeholder="your.email@example.com"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                                            required
                                        />
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Residence Address <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={formData.residence}
                                            onChange={(e) => handleInputChange('residence', e.target.value)}
                                            placeholder="Enter your complete address"
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white resize-none"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Academic Information Section */}
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                                    <BookOpen className="w-5 h-5 mr-2 text-purple-600" />
                                    Academic Information
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Current Education Level
                                        </label>
                                        <select
                                            value={formData.currentEducation}
                                            onChange={(e) => handleInputChange('currentEducation', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                                        >
                                            <option value="">Select your current level</option>
                                            {educationLevels.map(level => (
                                                <option key={level} value={level}>{level}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Preferred Schedule
                                        </label>
                                        <select
                                            value={formData.preferredSchedule}
                                            onChange={(e) => handleInputChange('preferredSchedule', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                                        >
                                            <option value="">Select preferred timing</option>
                                            {schedules.map(schedule => (
                                                <option key={schedule} value={schedule}>{schedule}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced Course Selection Section */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                                        <Users className="w-5 h-5 mr-2 text-indigo-600" />
                                        Course Selection
                                    </h3>
                                    <div className="flex items-center gap-4">
                                        {selectedSubjectCount > 0 && (
                                            <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                                                {selectedSubjectCount} selected
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => setShowFilters(!showFilters)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${showFilters || hasActiveFilters
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50'
                                                }`}
                                        >
                                            <Filter className="w-4 h-4" />
                                            Filters
                                            {hasActiveFilters && (
                                                <span className="bg-white text-indigo-600 rounded-full w-5 h-5 text-xs flex items-center justify-center font-medium">
                                                    {Object.values(filters).filter(v => v !== '').length}
                                                </span>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Select Course(s) <span className="text-red-500">*</span>
                                    </label>
                                    <p className="text-sm text-gray-600">Choose one or more subjects you&apos;d like to enroll in</p>
                                </div>

                                {/* Filter Panel */}
                                {showFilters && (
                                    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-lg font-medium text-gray-800">Filter Courses</h4>
                                            {hasActiveFilters && (
                                                <button
                                                    type="button"
                                                    onClick={clearFilters}
                                                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                    Clear all
                                                </button>
                                            )}
                                        </div>

                                        {/* Search Bar */}
                                        <div className="relative">
                                            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Search subjects by name, code, or board..."
                                                value={filters.search}
                                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>

                                        {/* Filter Options */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Board
                                                </label>
                                                <select
                                                    value={filters.board}
                                                    onChange={(e) => handleFilterChange('board', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="">All Boards</option>
                                                    {boards.map(board => (
                                                        <option key={board} value={board}>{board}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Level
                                                </label>
                                                <select
                                                    value={filters.level}
                                                    onChange={(e) => handleFilterChange('level', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    disabled={filters.year !== ''}
                                                >
                                                    <option value="">All Levels</option>
                                                    {levels.map(level => (
                                                        <option key={level} value={level}>{level}</option>
                                                    ))}
                                                </select>
                                                {filters.year !== '' && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Clear year filter to enable level selection
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Year
                                                </label>
                                                <select
                                                    value={filters.year}
                                                    onChange={(e) => handleFilterChange('year', e.target.value === '' ? '' : parseInt(e.target.value))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    disabled={filters.level !== ''}
                                                >
                                                    <option value="">All Years</option>
                                                    {years.map(year => (
                                                        <option key={year} value={year}>Year {year}</option>
                                                    ))}
                                                </select>
                                                {filters.level !== '' && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Clear level filter to enable year selection
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Field
                                                </label>
                                                <select
                                                    value={filters.field}
                                                    onChange={(e) => handleFilterChange('field', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="">All Fields</option>
                                                    {fields.map(field => (
                                                        <option key={field} value={field}>{field}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Active Filters Display */}
                                        {hasActiveFilters && (
                                            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
                                                <span className="text-sm text-gray-600">Active filters:</span>
                                                {filters.search && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm">
                                                        Search: &quot;{filters.search}&quot;
                                                        <button
                                                            type="button"
                                                            onClick={() => handleFilterChange('search', '')}
                                                            className="hover:text-blue-900"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </span>
                                                )}
                                                {filters.board && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-md text-sm">
                                                        Board: {filters.board}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleFilterChange('board', '')}
                                                            className="hover:text-green-900"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </span>
                                                )}
                                                {filters.level && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-md text-sm">
                                                        Level: {filters.level}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleFilterChange('level', '')}
                                                            className="hover:text-purple-900"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </span>
                                                )}
                                                {filters.year && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-md text-sm">
                                                        Year: {filters.year}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleFilterChange('year', '')}
                                                            className="hover:text-orange-900"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </span>
                                                )}
                                                {filters.field && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-pink-100 text-pink-800 rounded-md text-sm">
                                                        Field: {filters.field}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleFilterChange('field', '')}
                                                            className="hover:text-pink-900"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Results Count */}
                                        <div className="text-sm text-gray-600 pt-2 border-t border-gray-200">
                                            Showing {filteredSubjects.length} of {subjects.length} subjects
                                        </div>
                                    </div>
                                )}

                                {/* Subjects Display */}
                                {Object.keys(subjectsByLevel).length > 0 ? (
                                    <div className="space-y-6">
                                        {Object.entries(subjectsByLevel).map(([level, levelSubjects]) => (
                                            <div key={level} className="space-y-3">
                                                {Object.keys(subjectsByLevel).length > 1 && (
                                                    <h4 className="text-lg font-medium text-gray-700 border-b border-gray-300 pb-2">
                                                        {level} ({levelSubjects.length} subjects)
                                                    </h4>
                                                )}
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {levelSubjects.map(subject => {
                                                        const isSelected = Array.isArray(formData.subjects) && formData.subjects.includes(subject.uid || '');
                                                        return (
                                                            <div
                                                                key={subject.uid}
                                                                onClick={() => handleSubjectToggle(subject.uid || '')}
                                                                className={`
                                                                    relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 hover:shadow-md
                                                                    ${isSelected
                                                                        ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                                                                        : 'border-gray-200 bg-white hover:border-indigo-300'
                                                                    }
                                                                `}
                                                            >
                                                                <div className="flex items-start space-x-3">
                                                                    <div className={`
                                                                        flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200
                                                                        ${isSelected
                                                                            ? 'border-indigo-500 bg-indigo-500'
                                                                            : 'border-gray-300 bg-white'
                                                                        }
                                                                    `}>
                                                                        {isSelected && (
                                                                            <Check className="w-3 h-3 text-white" />
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className={`
                                                                            text-sm font-medium leading-5
                                                                            ${isSelected ? 'text-indigo-900' : 'text-gray-900'}
                                                                        `}>
                                                                            {subject.name}
                                                                            {subject.code && (
                                                                                <span className="text-xs text-gray-500 ml-1">
                                                                                    ({subject.code})
                                                                                </span>
                                                                            )}
                                                                        </p>
                                                                        <div className="text-xs text-gray-500 mt-1 space-y-1">
                                                                            <div className="flex items-center justify-between">
                                                                                <span>{subject.board}</span>
                                                                                <span>Year {subject.year}</span>
                                                                            </div>
                                                                            {subject.field && subject.field.length > 0 && (
                                                                                <div className="flex flex-wrap gap-1">
                                                                                    {subject.field.slice(0, 2).map((field, idx) => (
                                                                                        <span
                                                                                            key={idx}
                                                                                            className="inline-block bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs"
                                                                                        >
                                                                                            {field}
                                                                                        </span>
                                                                                    ))}
                                                                                    {subject.field.length > 2 && (
                                                                                        <span className="text-gray-400 text-xs">
                                                                                            +{subject.field.length - 2} more
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Selection indicator */}
                                                                {isSelected && (
                                                                    <div className="absolute top-2 right-2">
                                                                        <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : filteredSubjects.length === 0 && subjects.length > 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                        <h4 className="text-lg font-medium text-gray-600 mb-2">No subjects found</h4>
                                        <p className="text-sm">Try adjusting your filters or search terms</p>
                                        {hasActiveFilters && (
                                            <button
                                                type="button"
                                                onClick={clearFilters}
                                                className="mt-3 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                                            >
                                                Clear all filters
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>Loading subjects...</p>
                                    </div>
                                )}

                                {selectedSubjectCount === 0 && filteredSubjects.length > 0 && (
                                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                        <p className="text-sm text-amber-800">
                                            ⚠️ Please select at least one subject to continue
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold text-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Submitting Application...
                                        </>
                                    ) : (
                                        <>
                                            Submit Application
                                            <Send className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Additional Info */}
                            <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
                                <p>🔒 Your information is secure and will only be used for admission purposes.</p>
                                <p className="mt-1">📞 For any queries, contact us at: <span className="font-medium text-blue-600">habibiansacademy@gmail.com</span></p>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default OnlineCoachingForm;