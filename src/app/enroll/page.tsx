"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChevronLeft, ChevronRight, Save, Send } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/firebase/config';

interface FormData {
    personalInfo: {
        name: string;
        fatherName: string;
        fatherOccupation: string;
        fatherContact: string;
        motherName: string;
        motherOccupation: string;
        motherContact: string;
        gender: string;
        dateOfBirth: string;
        email: string;
        phoneNo: string;
        whatsappNo: string;
        address: string;
        country: string;
        city: string;
        nationality: string;
    };
    academicHistory: {
        previousSchools: {
            schoolName: string;
            fromYear: string;
            toYear: string;
            grade: string;
            board: string;
            percentage: string;
        }[];
        currentlyEnrolled: boolean;
        currentInstitution?: string;
        lastCompletedGrade: string;
        achievements: string[];
        extracurriculars: string[];
    };
    programPreferences: {
        desiredProgram: string;
        desiredClass: string;
        stream: string;
        subjects: string[];
        reasonForJoining: string;
        careerGoals: string;
    };
    documents: {
        profilePicture: File | null;
        previousMarksheets: File[] | null;
        characterCertificate: File | null;
        identityProof: File | null;
        residenceProof: File | null;
    };
    emergencyContact: {
        name: string;
        relationship: string;
        phoneNo: string;
        address: string;
    };
}

const initialFormData: FormData = {
    personalInfo: {
        name: '',
        fatherName: '',
        fatherOccupation: '',
        fatherContact: '',
        motherName: '',
        motherOccupation: '',
        motherContact: '',
        gender: '',
        dateOfBirth: '',
        email: '',
        phoneNo: '',
        whatsappNo: '',
        address: '',
        country: '',
        city: '',
        nationality: ''
    },
    academicHistory: {
        previousSchools: [{
            schoolName: '',
            fromYear: '',
            toYear: '',
            grade: '',
            board: '',
            percentage: ''
        }],
        currentlyEnrolled: false,
        lastCompletedGrade: '',
        achievements: [],
        extracurriculars: []
    },
    programPreferences: {
        desiredProgram: '',
        desiredClass: '',
        stream: '',
        subjects: [],
        reasonForJoining: '',
        careerGoals: ''
    },
    documents: {
        profilePicture: null,
        previousMarksheets: null,
        characterCertificate: null,
        identityProof: null,
        residenceProof: null
    },
    emergencyContact: {
        name: '',
        relationship: '',
        phoneNo: '',
        address: ''
    }
};

const AdmissionForm = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [formData, setFormData] = useState<FormData>(initialFormData);

    // Load saved form data from localStorage on initial render
    useEffect(() => {
        const savedData = localStorage.getItem('admissionFormData');
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                // Reset file fields as they can't be stored in localStorage
                parsedData.documents = initialFormData.documents;
                setFormData(parsedData);
            } catch (error) {
                console.error('Error parsing saved form data:', error);
                localStorage.removeItem('admissionFormData');
            }
        }
    }, []);

    // Save form data to localStorage whenever it changes
    useEffect(() => {
        const dataToSave = {
            ...formData,
            documents: null // Don't store file data in localStorage
        };
        localStorage.setItem('admissionFormData', JSON.stringify(dataToSave));
    }, [formData]);

    // Clear notification after 5 seconds
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                setNotification(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleInputChange = (section: keyof FormData, field: string, value: string | { schoolName: string; fromYear: string; toYear: string; grade: string; board: string; percentage: string; }[] | File | File[] | null) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    // const handleSchoolChange = (index: number, field: string, value: string) => {
    //   const newSchools = [...formData.academicHistory.previousSchools];
    //   newSchools[index] = {
    //     ...newSchools[index],
    //     [field]: value
    //   };
    //   handleInputChange('academicHistory', 'previousSchools', newSchools);
    // };

    const handleFileUpload = async (file: File, path: string): Promise<string> => {
        if (!file) return '';
        const storageRef = ref(storage, `admissions/${path}/${Date.now()}-${file.name}`);
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
    };

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);

            // Upload documents and get URLs
            const documentsUrls: Record<string, string | string[]> = {};

            if (formData.documents.profilePicture) {
                documentsUrls.profilePicture = await handleFileUpload(
                    formData.documents.profilePicture,
                    'profile-pictures'
                );
            }

            if (formData.documents.previousMarksheets) {
                const marksheetPromises = Array.from(formData.documents.previousMarksheets).map(
                    file => handleFileUpload(file, 'marksheets')
                );
                documentsUrls.previousMarksheets = await Promise.all(marksheetPromises);
            }

            // Upload other documents
            for (const docType of ['characterCertificate', 'identityProof', 'residenceProof'] as const) {
                if (formData.documents[docType]) {
                    documentsUrls[docType] = await handleFileUpload(
                        formData.documents[docType]!,
                        docType.toLowerCase()
                    );
                }
            }

            // Prepare data for Firestore
            const admissionData = {
                ...formData,
                documents: documentsUrls,
                applicationStatus: 'pending',
                applicationDate: serverTimestamp(),
                lastUpdated: serverTimestamp()
            };

            // Save to Firestore
            await addDoc(collection(db, 'admissions'), admissionData);

            // Clear form and local storage
            localStorage.removeItem('admissionFormData');
            setFormData(initialFormData);
            setCurrentStep(1);

            setNotification({ message: "Application submitted successfully!", type: 'success' });

        } catch (error) {
            console.error('Error submitting form:', error);
            setNotification({ message: "Error submitting application. Please try again.", type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderPersonalInfoSection = () => (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Full Name"
                        className="w-full h-16 bg-gray-200 rounded-lg border-2 border-stone-300 px-6 text-neutral-700 text-xl"
                        value={formData.personalInfo.name}
                        onChange={(e) => handleInputChange('personalInfo', 'name', e.target.value)}
                    />
                    <input
                        type="date"
                        placeholder="Date of Birth"
                        className="w-full h-16 bg-gray-200 rounded-lg border-2 border-stone-300 px-6 text-neutral-700 text-xl"
                        value={formData.personalInfo.dateOfBirth}
                        onChange={(e) => handleInputChange('personalInfo', 'dateOfBirth', e.target.value)}
                    />
                    <select
                        className="w-full h-16 bg-gray-200 rounded-lg border-2 border-stone-300 px-6 text-neutral-700 text-xl"
                        value={formData.personalInfo.gender}
                        onChange={(e) => handleInputChange('personalInfo', 'gender', e.target.value)}
                    >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <div className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email Address"
                        className="w-full h-16 bg-gray-200 rounded-lg border-2 border-stone-300 px-6 text-neutral-700 text-xl"
                        value={formData.personalInfo.email}
                        onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                    />
                    <input
                        type="tel"
                        placeholder="Phone Number"
                        className="w-full h-16 bg-gray-200 rounded-lg border-2 border-stone-300 px-6 text-neutral-700 text-xl"
                        value={formData.personalInfo.phoneNo}
                        onChange={(e) => handleInputChange('personalInfo', 'phoneNo', e.target.value)}
                    />
                    <input
                        type="tel"
                        placeholder="WhatsApp Number"
                        className="w-full h-16 bg-gray-200 rounded-lg border-2 border-stone-300 px-6 text-neutral-700 text-xl"
                        value={formData.personalInfo.whatsappNo}
                        onChange={(e) => handleInputChange('personalInfo', 'whatsappNo', e.target.value)}
                    />
                </div>

                {/* Parent Information */}
                <div className="col-span-2">
                    <h4 className="text-lg font-medium mb-4">Parent/Guardian Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Father's Name"
                                className="w-full h-16 bg-gray-200 rounded-lg border-2 border-stone-300 px-6 text-neutral-700 text-xl"
                                value={formData.personalInfo.fatherName}
                                onChange={(e) => handleInputChange('personalInfo', 'fatherName', e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Father's Occupation"
                                className="w-full h-16 bg-gray-200 rounded-lg border-2 border-stone-300 px-6 text-neutral-700 text-xl"
                                value={formData.personalInfo.fatherOccupation}
                                onChange={(e) => handleInputChange('personalInfo', 'fatherOccupation', e.target.value)}
                            />
                            <input
                                type="tel"
                                placeholder="Father's Contact"
                                className="w-full h-16 bg-gray-200 rounded-lg border-2 border-stone-300 px-6 text-neutral-700 text-xl"
                                value={formData.personalInfo.fatherContact}
                                onChange={(e) => handleInputChange('personalInfo', 'fatherContact', e.target.value)}
                            />
                        </div>
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Mother's Name"
                                className="w-full h-16 bg-gray-200 rounded-lg border-2 border-stone-300 px-6 text-neutral-700 text-xl"
                                value={formData.personalInfo.motherName}
                                onChange={(e) => handleInputChange('personalInfo', 'motherName', e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Mother's Occupation"
                                className="w-full h-16 bg-gray-200 rounded-lg border-2 border-stone-300 px-6 text-neutral-700 text-xl"
                                value={formData.personalInfo.motherOccupation}
                                onChange={(e) => handleInputChange('personalInfo', 'motherOccupation', e.target.value)}
                            />
                            <input
                                type="tel"
                                placeholder="Mother's Contact"
                                className="w-full h-16 bg-gray-200 rounded-lg border-2 border-stone-300 px-6 text-neutral-700 text-xl"
                                value={formData.personalInfo.motherContact}
                                onChange={(e) => handleInputChange('personalInfo', 'motherContact', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderAcademicHistorySection = () => (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">Academic History</h3>
            {formData.academicHistory.previousSchools.map((school, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                    <input
                        type="text"
                        placeholder="School Name"
                        className="w-full h-16 bg-gray-200 rounded-lg border-2 border-stone-300 px-6 text-neutral-700 text-xl"
                        value={school.schoolName}
                        onChange={(e) => {
                            const newSchools = [...formData.academicHistory.previousSchools];
                            newSchools[index].schoolName = e.target.value;
                            handleInputChange('academicHistory', 'previousSchools', newSchools);
                        }}
                    />
                    <input
                        type="text"
                        placeholder="Board/University"
                        className="w-full h-16 bg-gray-200 rounded-lg border-2 border-stone-300 px-6 text-neutral-700 text-xl"
                        value={school.board}
                        onChange={(e) => {
                            const newSchools = [...formData.academicHistory.previousSchools];
                            newSchools[index].board = e.target.value;
                            handleInputChange('academicHistory', 'previousSchools', newSchools);
                        }}
                    />
                    <input
                        type="text"
                        placeholder="Grade/Percentage"
                        className="w-full h-16 bg-gray-200 rounded-lg border-2 border-stone-300 px-6 text-neutral-700 text-xl"
                        value={school.percentage}
                        onChange={(e) => {
                            const newSchools = [...formData.academicHistory.previousSchools];
                            newSchools[index].percentage = e.target.value;
                            handleInputChange('academicHistory', 'previousSchools', newSchools);
                        }}
                    />
                </div>
            ))}
            <button
                onClick={() => {
                    const newSchools = [...formData.academicHistory.previousSchools, {
                        schoolName: '',
                        fromYear: '',
                        toYear: '',
                        grade: '',
                        board: '',
                        percentage: ''
                    }];
                    handleInputChange('academicHistory', 'previousSchools', newSchools);
                }}
                className="px-4 py-2 bg-accent-navy text-white rounded-lg"
            >
                Add Another School
            </button>
        </div>
    );

    const renderProgramPreferencesSection = () => (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">Program Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                    className="w-full h-16 bg-gray-200 rounded-lg border-2 border-stone-300 px-6 text-neutral-700 text-xl"
                    value={formData.programPreferences.stream}
                    onChange={(e) => handleInputChange('programPreferences', 'stream', e.target.value)}
                >
                    <option value="">Select Stream</option>
                    <option value="science">Science</option>
                    <option value="commerce">Commerce</option>
                    <option value="arts">Arts</option>
                </select>
                <select
                    className="w-full h-16 bg-gray-200 rounded-lg border-2 border-stone-300 px-6 text-neutral-700 text-xl"
                    value={formData.programPreferences.desiredClass}
                    onChange={(e) => handleInputChange('programPreferences', 'desiredClass', e.target.value)}
                >
                    <option value="">Select Class</option>
                    <option value="9">Class 9</option>
                    <option value="10">Class 10</option>
                    <option value="11">Class 11</option>
                    <option value="12">Class 12</option>
                </select>
                <div className="col-span-2">
                    <textarea
                        placeholder="Why do you want to join our institution?"
                        className="w-full h-32 bg-gray-200 rounded-lg border-2 border-stone-300 px-6 py-4 text-neutral-700 text-xl"
                        value={formData.programPreferences.reasonForJoining}
                        onChange={(e) => handleInputChange('programPreferences', 'reasonForJoining', e.target.value)}
                    />
                </div>
                <div className="col-span-2">
                    <textarea
                        placeholder="What are your career goals?"
                        className="w-full h-32 bg-gray-200 rounded-lg border-2 border-stone-300 px-6 py-4 text-neutral-700 text-xl"
                        value={formData.programPreferences.careerGoals}
                        onChange={(e) => handleInputChange('programPreferences', 'careerGoals', e.target.value)}
                    />
                </div>
            </div>
        </div>
    );

    const renderDocumentsSection = () => (
        <div className="space-y-8">
            <h3 className="text-xl font-semibold mb-6">Required Documents</h3>

            <div className="grid grid-cols-1 gap-8">
                {/* Profile Picture Upload */}
                <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-300 hover:border-violet-500 transition-colors">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="flex items-center space-x-2">
                                <span className="text-lg font-medium text-gray-700">Profile Picture</span>
                                <span className="text-red-500">*</span>
                            </label>
                            {formData.documents.profilePicture && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    File Selected
                                </span>
                            )}
                        </div>

                        <div className="relative">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    handleInputChange('documents', 'profilePicture', file);
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="flex flex-col items-center justify-center p-6 border-2 border-gray-300 border-dashed rounded-lg bg-white">
                                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="mt-2 text-sm text-gray-600">
                                    Drag and drop your profile picture here, or click to select
                                </p>
                                <p className="mt-1 text-xs text-gray-500">PNG, JPG up to 5MB</p>
                            </div>
                        </div>

                        {formData.documents.profilePicture && (
                            <div className="flex items-center mt-2 text-sm text-gray-600">
                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                                </svg>
                                {formData.documents.profilePicture.name}
                            </div>
                        )}
                    </div>
                </div>

                {/* Previous Marksheets Upload */}
                <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-300 hover:border-violet-500 transition-colors">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="flex items-center space-x-2">
                                <span className="text-lg font-medium text-gray-700">Previous Marksheets</span>
                                <span className="text-red-500">*</span>
                            </label>
                            {formData.documents.previousMarksheets && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                    {formData.documents.previousMarksheets.length} files selected
                                </span>
                            )}
                        </div>

                        <div className="relative">
                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                multiple
                                onChange={(e) => {
                                    const files = e.target.files ? Array.from(e.target.files) : null;
                                    handleInputChange('documents', 'previousMarksheets', files);
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="flex flex-col items-center justify-center p-6 border-2 border-gray-300 border-dashed rounded-lg bg-white">
                                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="mt-2 text-sm text-gray-600">
                                    Drag and drop your marksheets here, or click to select
                                </p>
                                <p className="mt-1 text-xs text-gray-500">PDF, PNG, JPG up to 5MB each</p>
                            </div>
                        </div>

                        {formData.documents.previousMarksheets && (
                            <div className="space-y-2">
                                {Array.from(formData.documents.previousMarksheets).map((file, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                                            </svg>
                                            {file.name}
                                        </div>
                                        <button
                                            onClick={() => {
                                                const newFiles = formData.documents.previousMarksheets?.filter((_, i) => i !== index) || null;
                                                handleInputChange('documents', 'previousMarksheets', newFiles);
                                            }}
                                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Required Documents Group */}
                {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> */}
                {/* Character Certificate Upload */}
                <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-300 hover:border-violet-500 transition-colors">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="flex items-center space-x-2">
                                <span className="text-lg font-medium text-gray-700">Character Certificate</span>
                                <span className="text-red-500">*</span>
                            </label>
                        </div>

                        <div className="relative">
                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    handleInputChange('documents', 'characterCertificate', file);
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="flex flex-col items-center justify-center p-4 border-2 border-gray-300 border-dashed rounded-lg bg-white">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <p className="mt-2 text-sm text-gray-600">Click to upload</p>
                            </div>
                        </div>

                        {formData.documents.characterCertificate && (
                            <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200">
                                <div className="flex items-center text-sm text-gray-600">
                                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                                    </svg>
                                    {formData.documents.characterCertificate.name}
                                </div>
                                <button
                                    onClick={() => handleInputChange('documents', 'characterCertificate', null)}
                                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-8">
                    {/* <h3 className="text-xl font-semibold mb-6">Identity Verification</h3> */}

                    <div className="grid grid-cols-1 gap-8">
                        {/* ID Card Upload */}
                        <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-300 hover:border-violet-500 transition-colors">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center space-x-2">
                                        <span className="text-lg font-medium text-gray-700">ID Card Photo</span>
                                        <span className="text-red-500">*</span>
                                    </label>
                                    {formData.documents.identityProof && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            File Selected
                                        </span>
                                    )}
                                </div>

                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0] || null;
                                            handleInputChange('documents', 'idCard', file);
                                        }}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="flex flex-col items-center justify-center p-6 border-2 border-gray-300 border-dashed rounded-lg bg-white">
                                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                                        </svg>
                                        <p className="mt-2 text-sm text-gray-600">
                                            Drag and drop your ID card photo here, or click to select
                                        </p>
                                        <p className="mt-1 text-xs text-gray-500">PNG, JPG up to 5MB</p>
                                    </div>
                                </div>

                                {formData.documents.identityProof && (
                                    <div className="flex items-center mt-2 text-sm text-gray-600">
                                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                                        </svg>
                                        {formData.documents.identityProof.name}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Residence Proof Photo */}
                        <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-300 hover:border-violet-500 transition-colors">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center space-x-2">
                                        <span className="text-lg font-medium text-gray-700">Residence Proof</span>
                                        <span className="text-red-500">*</span>
                                    </label>
                                    {formData.documents.residenceProof && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            File Selected
                                        </span>
                                    )}
                                </div>

                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0] || null;
                                            handleInputChange('documents', 'matchPhoto', file);
                                        }}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="flex flex-col items-center justify-center p-6 border-2 border-gray-300 border-dashed rounded-lg bg-white">
                                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <p className="mt-2 text-sm text-gray-600">
                                            Take a selfie or upload a recent photo
                                        </p>
                                        <p className="mt-1 text-xs text-gray-500">PNG, JPG up to 5MB</p>
                                    </div>
                                </div>

                                {formData.documents.residenceProof && (
                                    <div className="flex items-center mt-2 text-sm text-gray-600">
                                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                                        </svg>
                                        {formData.documents.residenceProof.name}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="text-sm text-gray-500 mt-4">
                            <p>* Required photos</p>
                            <p>- Accepted file formats: JPG, JPEG, PNG</p>
                            <p>- Maximum file size: 5MB per photo</p>
                            <p>- Please ensure your match photo is well-lit and clearly shows your face</p>
                            <p>- Your match photo will be compared with your ID card photo for verification</p>
                        </div>
                    </div>
                </div>
                {/* </div> */}
            </div>
        </div>
    );

    const renderEmergencyContactSection = () => (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Full Name"
                        className="w-full h-16 bg-gray-200 rounded-lg border-2 border-stone-300 px-6 text-neutral-700 text-xl"
                        value={formData.emergencyContact.name}
                        onChange={(e) => handleInputChange('emergencyContact', 'name', e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Relationship"
                        className="w-full h-16 bg-gray-200 rounded-lg border-2 border-stone-300 px-6 text-neutral-700 text-xl"
                        value={formData.emergencyContact.relationship}
                        onChange={(e) => handleInputChange('emergencyContact', 'relationship', e.target.value)}
                    />
                </div>
                <div className="space-y-4">
                    <input
                        type="tel"
                        placeholder="Phone Number"
                        className="w-full h-16 bg-gray-200 rounded-lg border-2 border-stone-300 px-6 text-neutral-700 text-xl"
                        value={formData.emergencyContact.phoneNo}
                        onChange={(e) => handleInputChange('emergencyContact', 'phoneNo', e.target.value)}
                    />
                    <textarea
                        placeholder="Address"
                        className="w-full h-16 bg-gray-200 rounded-lg border-2 border-stone-300 px-6 py-4 text-neutral-700 text-xl resize-none"
                        value={formData.emergencyContact.address}
                        onChange={(e) => handleInputChange('emergencyContact', 'address', e.target.value)}
                    />
                </div>
            </div>
        </div>
    );

    return (
        <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center font-body bg-primary-white gap-16">
            {notification && (
                <div className="fixed top-4 right-4 z-50 max-w-md">
                    <Alert className={notification.type === 'error' ? 'bg-red-100' : 'bg-green-200'}>
                        <AlertDescription>{notification.message}</AlertDescription>
                    </Alert>
                </div>
            )}

            {/* Hero Section */}
            <div className="container mx-auto px-4 text-center mt-12">
                <h1 className="text-4xl font-bold text-primary-blue mb-4">Admission Form</h1>
                <p className="text-lg text-gray-600">Please fill out the form below to apply for admission.</p> 
                <p className="text-sm text-gray-500 mt-2">All fields marked with * are required.</p>
            </div>

            {/* Form Section */}
            <div className="container mx-auto px-4 w-full">
                <Card className="w-full max-w-4xl mx-auto bg-primary-white border-accent-navy shadow-xl">
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            <span>Step {currentStep} of 5</span>
                            <div className="flex items-center gap-2">
                                <Save className="w-5 h-5" />
                                <span className="text-sm text-gray-500">Auto-saving...</span>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {currentStep === 1 && renderPersonalInfoSection()}
                        {currentStep === 2 && renderAcademicHistorySection()}
                        {currentStep === 3 && renderProgramPreferencesSection()}
                        {currentStep === 4 && renderDocumentsSection()}
                        {currentStep === 5 && renderEmergencyContactSection()}

                        <div className="flex justify-between mt-8">
                            <button
                                onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
                                disabled={currentStep === 1}
                                className="flex items-center gap-2 px-6 py-2 bg-accent-lightblue text-primary-blue rounded-lg disabled:opacity-50 font-heading font-bold shadow-md"
                            >
                                <ChevronLeft className="w-5 h-5" /> Previous
                            </button>

                            {currentStep < 5 ? (
                                <button
                                    onClick={() => setCurrentStep(prev => Math.min(prev + 1, 5))}
                                    className="flex items-center gap-2 px-6 py-2 bg-accent-lightblue text-primary-blue rounded-lg font-heading font-bold shadow-md"
                                >
                                    Next <ChevronRight className="w-5 h-5" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2 px-6 py-2 bg-accent-navy text-primary-white rounded-lg disabled:opacity-50 font-heading font-bold shadow-md"
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit'} <Send className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdmissionForm;