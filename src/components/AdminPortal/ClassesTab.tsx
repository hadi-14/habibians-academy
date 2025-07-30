'use client';
import React, { useState, useEffect } from 'react';
import { X, Users, UserPlus, Trash2, BookOpen } from 'lucide-react';
import {
    collection,
    getDocs,
    query,
    orderBy,
    deleteDoc,
    doc,
    updateDoc,
    Timestamp
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { createClass } from '@/firebase/functions';
import { Class, Teacher } from '@/firebase/definitions';

interface ClassesTabProps {
    classes: Class[];
    setClasses: React.Dispatch<React.SetStateAction<Class[]>>;
    teachers: Teacher[];
}

const ClassesTab: React.FC<ClassesTabProps> = ({ classes, setClasses, teachers }) => {
    const [newClassName, setNewClassName] = useState('');
    const [newClassCapacity, setNewClassCapacity] = useState('');
    const [creatingClass, setCreatingClass] = useState(false);
    const [classSuccess, setClassSuccess] = useState('');
    const [selectedClass, setSelectedClass] = useState<Class | null>(null);
    const [assigningTeachers, setAssigningTeachers] = useState(false);
    const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);

    // Initialize selected teachers when modal opens
    useEffect(() => {
        if (selectedClass) {
            setSelectedTeachers(selectedClass.teacherIdList || []);
        }
    }, [selectedClass]);

    const handleCreateClass = async () => {
        if (!newClassName) return;
        setCreatingClass(true);
        try {
            const createdClass = await createClass({
                name: newClassName,
                capacity: newClassCapacity,
                students: 0,
                teacherIdList: []
            });
            setClassSuccess(`Class created successfully! UID: ${createdClass.uid}`);
            setNewClassName('');
            setNewClassCapacity('');
            
            // Refresh classes list
            const q = query(collection(db, 'classes'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            setClasses(querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as Class)));
        } catch (error) {
            setClassSuccess(`Failed to create class. ${error instanceof Error ? error.message : ''}`);
        } finally {
            setCreatingClass(false);
            setTimeout(() => setClassSuccess(''), 3000);
        }
    };

    const handleDeleteClass = async (classUid: string) => {
        if (!window.confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
            return;
        }

        try {
            await deleteDoc(doc(db, 'classes', classUid));
            setClasses(classes.filter(c => c.uid !== classUid));
        } catch (error) {
            console.error('Error deleting class:', error);
            alert('Failed to delete class. Please try again.');
        }
    };

    const handleAssignTeachers = async () => {
        if (!selectedClass || !selectedClass.uid) return;
        
        setAssigningTeachers(true);
        try {
            await updateDoc(doc(db, 'classes', selectedClass.uid), {
                teacherIdList: selectedTeachers
            });

            // Update local state
            setClasses(classes.map(c => 
                c.uid === selectedClass.uid 
                    ? { ...c, teacherIdList: selectedTeachers }
                    : c
            ));

            setSelectedClass(null);
            setSelectedTeachers([]);
        } catch (error) {
            console.error('Error assigning teachers:', error);
            alert('Failed to assign teachers. Please try again.');
        } finally {
            setAssigningTeachers(false);
        }
    };

    const getTeacherName = (teacherId: string) => {
        const teacher = teachers.find(t => t.uid === teacherId);
        return teacher ? teacher.name : teacherId;
    };

    const toggleTeacherSelection = (teacherId: string) => {
        setSelectedTeachers(prev => 
            prev.includes(teacherId)
                ? prev.filter(id => id !== teacherId)
                : [...prev, teacherId]
        );
    };

    const formatDate = (timestamp?: Timestamp) => {
        if (!timestamp) return 'N/A';
        let date: Date;
        if (timestamp instanceof Date) {
            date = timestamp;
        } else if ((timestamp as Timestamp).seconds) {
            date = new Date((timestamp as Timestamp).seconds * 1000);
        } else {
            return 'N/A';
        }
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8">
            {/* Create Class Section */}
            <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-indigo-100 mb-8">
                <div className="bg-gradient-to-r from-purple-600 to-blue-500 text-white p-6">
                    <h2 className="text-2xl font-bold">Class Management</h2>
                    <p className="text-purple-100 mt-2">Create and manage classes for your institution</p>
                </div>
                <div className="p-8">
                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Create Class Form */}
                        <div>
                            <h3 className="text-xl font-bold mb-6 text-purple-800">Create New Class</h3>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Class Name (e.g. Class 1, Grade 10A)"
                                    value={newClassName}
                                    onChange={e => setNewClassName(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200"
                                />
                                <input
                                    type="number"
                                    placeholder="Class Capacity"
                                    value={newClassCapacity}
                                    onChange={e => setNewClassCapacity(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200"
                                />
                                <button
                                    onClick={handleCreateClass}
                                    disabled={creatingClass || !newClassName}
                                    className="w-full bg-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-purple-500 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
                                >
                                    {creatingClass ? 'Creating Class...' : 'Create Class'}
                                </button>
                                {classSuccess && (
                                    <div className={`mt-4 p-4 rounded-xl font-medium text-sm ${
                                        classSuccess.startsWith('Class created') 
                                            ? 'bg-emerald-50 border border-emerald-200 text-emerald-600'
                                            : 'bg-rose-50 border border-rose-200 text-rose-600'
                                    }`}>
                                        {classSuccess}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Class Statistics */}
                        <div>
                            <h3 className="text-xl font-bold mb-6 text-purple-800">Class Statistics</h3>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-100">
                                    <div className="text-2xl font-bold text-purple-600">{classes.length}</div>
                                    <div className="text-sm text-purple-700 font-medium">Total Classes</div>
                                </div>
                                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-xl border border-emerald-100">
                                    <div className="text-2xl font-bold text-emerald-600">
                                        {classes.reduce((sum, c) => sum + (typeof c.capacity === 'number' ? c.capacity : parseInt(c.capacity) || 0), 0)}
                                    </div>
                                    <div className="text-sm text-emerald-700 font-medium">Total Capacity</div>
                                </div>
                            </div>
                            
                            {/* Quick Stats */}
                            <div className="bg-gray-50 rounded-xl p-4">
                                <h4 className="font-semibold text-gray-800 mb-3">Quick Overview</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Classes with Teachers:</span>
                                        <span className="font-medium">{classes.filter(c => c.teacherIdList && c.teacherIdList.length > 0).length}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Average Capacity:</span>
                                        <span className="font-medium">
                                            {classes.length > 0 
                                                ? Math.round(classes.reduce((sum, c) => sum + (typeof c.capacity === 'number' ? c.capacity : parseInt(c.capacity) || 0), 0) / classes.length)
                                                : 0
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Classes List */}
            <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-indigo-100">
                <div className="bg-gradient-to-r from-purple-600 to-blue-500 text-white p-6">
                    <h3 className="text-xl font-bold">All Classes</h3>
                    <p className="text-purple-100 mt-1">View and manage all created classes</p>
                </div>
                <div className="p-6">
                    {classes.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <BookOpen className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500 text-lg">No classes created yet</p>
                            <p className="text-gray-400 text-sm">Use the form above to create your first class</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {classes.map(classItem => (
                                <div key={classItem.uid} className="border border-gray-200 rounded-xl p-6 hover:bg-gray-50 transition-colors duration-200">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                                    <Users className="w-6 h-6 text-purple-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-800 text-lg">{classItem.name}</h4>
                                                    <p className="text-sm text-gray-500">Class ID: {classItem.uid}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                                <div>
                                                    <span className="text-xs text-gray-500 uppercase tracking-wide">Capacity</span>
                                                    <p className="text-lg font-semibold text-purple-600">{classItem.capacity}</p>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-gray-500 uppercase tracking-wide">Students</span>
                                                    <p className="text-lg font-semibold text-emerald-600">{classItem.students || 0}</p>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-gray-500 uppercase tracking-wide">Teachers</span>
                                                    <p className="text-lg font-semibold text-blue-600">
                                                        {classItem.teacherIdList ? classItem.teacherIdList.length : 0}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-gray-500 uppercase tracking-wide">Created</span>
                                                    <p className="text-sm text-gray-600">{formatDate(classItem.createdAt)}</p>
                                                </div>
                                            </div>

                                            {/* Assigned Teachers */}
                                            {classItem.teacherIdList && classItem.teacherIdList.length > 0 && (
                                                <div className="mt-4">
                                                    <span className="text-xs text-gray-500 uppercase tracking-wide">Assigned Teachers</span>
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {classItem.teacherIdList.map(teacherId => (
                                                            <span 
                                                                key={teacherId}
                                                                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                                                            >
                                                                {getTeacherName(teacherId)}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="flex items-center space-x-2 ml-4">
                                            <button
                                                onClick={() => setSelectedClass(classItem)}
                                                className="text-blue-600 hover:bg-blue-100 p-2 rounded-full transition-colors duration-200 flex items-center gap-2"
                                                title="Assign Teachers"
                                            >
                                                <UserPlus size={20} />
                                                <span className="hidden sm:inline text-sm">Assign</span>
                                            </button>
                                            <button
                                                onClick={() => classItem.uid && handleDeleteClass(classItem.uid)}
                                                className="text-rose-600 hover:bg-rose-100 p-2 rounded-full transition-colors duration-200 flex items-center gap-2"
                                                title="Delete Class"
                                                disabled={!classItem.uid}
                                            >
                                                <Trash2 size={20} />
                                                <span className="hidden sm:inline text-sm">Delete</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Assign Teachers Modal */}
            {selectedClass && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 sm:p-6 transition-opacity duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 relative transform transition-all duration-300 scale-100 max-h-[80vh] overflow-y-auto">
                        <button
                            onClick={() => {
                                setSelectedClass(null);
                                setSelectedTeachers([]);
                            }}
                            className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                        >
                            <X size={24} />
                        </button>
                        
                        <h2 className="text-2xl font-bold mb-6 text-purple-800 border-b border-purple-100 pb-3">
                            Assign Teachers to {selectedClass.name}
                        </h2>

                        <div className="space-y-6">
                            {/* Current Assignment */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Current Assignment</h3>
                                {selectedClass.teacherIdList && selectedClass.teacherIdList.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {selectedClass.teacherIdList.map(teacherId => (
                                            <span 
                                                key={teacherId}
                                                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                                            >
                                                {getTeacherName(teacherId)}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm">No teachers assigned yet</p>
                                )}
                            </div>

                            {/* Teacher Selection */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Available Teachers</h3>
                                {teachers.length === 0 ? (
                                    <p className="text-gray-500 text-sm">No teachers available. Please register teachers first.</p>
                                ) : (
                                    <div className="space-y-3 max-h-60 overflow-y-auto">
                                        {teachers.map(teacher => (
                                            <div
                                                key={teacher.uid}
                                                className={`flex items-center space-x-3 p-3 rounded-xl border cursor-pointer transition-colors duration-200 ${
                                                    selectedTeachers.includes(teacher.uid || '')
                                                        ? 'bg-purple-50 border-purple-200'
                                                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                                }`}
                                                onClick={() => teacher.uid && toggleTeacherSelection(teacher.uid)}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedTeachers.includes(teacher.uid || '')}
                                                    onChange={() => teacher.uid && toggleTeacherSelection(teacher.uid)}
                                                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                                />
                                                <div className="flex-1">
                                                    <div className="font-medium text-gray-800">{teacher.name}</div>
                                                    <div className="text-sm text-gray-500">{teacher.email}</div>
                                                    {teacher.subjects && teacher.subjects.length > 0 && (
                                                        <div className="text-xs text-gray-400 mt-1">
                                                            Subjects: {teacher.subjects.join(', ')}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-4 border-t border-gray-100 pt-4">
                                <button
                                    onClick={() => {
                                        setSelectedClass(null);
                                        setSelectedTeachers([]);
                                    }}
                                    className="px-6 py-2 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAssignTeachers}
                                    disabled={assigningTeachers}
                                    className="px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-500 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {assigningTeachers ? 'Assigning...' : 'Assign Teachers'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClassesTab;