'use client';
import React, { useEffect, useCallback, useState } from 'react';
import { Calendar, Users, BookOpen, Plus, Edit, Trash2, Clock, User, GraduationCap, FileText, Settings, Save, X, Search, Star, TrendingUp, CheckCircle } from 'lucide-react';
import {
    listenToTeacherClasses,
    listenToTeacherAssignments,
    createAssignment,
    createClass,
    deleteAssignment,
    deleteClass,
    getTeacherProfile
} from '@/firebase/teacher-portal';
import { auth } from '@/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import Image from "next/image";
import type { Assignment as FirebaseAssignment, Class as FirebaseClass, Teacher as FirebaseTeacher } from '@/firebase/teacher-portal';
import { useProtectedRoute } from './useProtectedRoute';
import { signOut } from 'firebase/auth';

// Extend Firebase types for UI needs
interface UIAssignment extends FirebaseAssignment {
    status?: string;
    submissions?: number;
    totalStudents?: number;
    points?: number;
}

// Sample data for demo purposes
const SAMPLE_CLASSES = [
    {
        id: 'class1',
        name: 'Mathematics Year 1',
        subject: 'Mathematics',
        schedule: 'Mon, Wed, Fri - 9:00 AM',
        room: 'A1',
        description: 'Algebra, Trigonometry, and Calculus basics.',
        capacity: '30',
        students: 28,
        avgGrade: 85,
        teacherId: 'sample-teacher',
    },
    {
        id: 'class2',
        name: 'Physics Year 2',
        subject: 'Physics',
        schedule: 'Tue, Thu - 11:00 AM',
        room: 'B2',
        description: 'Mechanics, Thermodynamics, and Waves.',
        capacity: '25',
        students: 22,
        avgGrade: 78,
        teacherId: 'sample-teacher',
    },
];
const SAMPLE_ASSIGNMENTS = [
    {
        id: 'asgn1',
        title: 'Algebra Quiz',
        subject: 'Mathematics',
        class: 'Mathematics Year 1',
        description: 'Quiz on Algebraic Expressions and Equations.',
        dueDate: '2025-07-15',
        points: 20,
        priority: 'high' as const,
        material: '',
        teacherId: 'sample-teacher',
        status: 'active',
        submissions: 20,
        totalStudents: 28,
    },
    {
        id: 'asgn2',
        title: 'Thermodynamics Assignment',
        subject: 'Physics',
        class: 'Physics Year 2',
        description: 'Assignment on Laws of Thermodynamics.',
        dueDate: '2025-07-20',
        points: 15,
        priority: 'medium' as const,
        material: '',
        teacherId: 'sample-teacher',
        status: 'active',
        submissions: 15,
        totalStudents: 22,
    },
];

export default function TeacherPortalDashboard() {
    useProtectedRoute();

    const [activeTab, setActiveTab] = useState('dashboard');
    const [assignments, setAssignments] = useState<UIAssignment[]>(SAMPLE_ASSIGNMENTS);
    const [classes, setClasses] = useState<FirebaseClass[]>(SAMPLE_CLASSES);
    const [teacher, setTeacher] = useState<FirebaseTeacher | null>(null);
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState('');

    // Form states
    const [showAssignmentForm, setShowAssignmentForm] = useState(false);
    const [showClassForm, setShowClassForm] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState<UIAssignment | null>(null);
    const [editingClass, setEditingClass] = useState<FirebaseClass | null>(null);

    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSubject, setFilterSubject] = useState('');
    const [filterStatus] = useState('');

    const [newAssignment, setNewAssignment] = useState({
        title: '',
        subject: '',
        class: '',
        description: '',
        dueDate: '',
        points: '',
        priority: 'medium',
        material: '' // Add material field
    });

    const [newClass, setNewClass] = useState({
        name: '',
        subject: '',
        schedule: '',
        room: '',
        description: '',
        capacity: ''
    });

    // File upload state for assignment material
    const [materialFile, setMaterialFile] = useState<File | null>(null);

    // Clear messages after 3 seconds
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                setSuccess('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    // Auth and teacher profile
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                setLoading(false);
                return;
            }
            const profile = await getTeacherProfile(user.uid);
            if (!profile) {
                setLoading(false);
                return;
            }
            setTeacher(profile);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    // Real-time classes and assignments
    useEffect(() => {
        if (!teacher) return;
        setLoading(true);
        const unsubClasses = listenToTeacherClasses(teacher.uid, (cls) => {
            setClasses(
                cls.map((c) => ({
                    ...c,
                    subject: c.subject ?? '',
                    schedule: c.schedule ?? '',
                    room: c.room ?? '',
                    description: c.description ?? '',
                    capacity: c.capacity ?? '',
                    students: c.students ?? 0,
                    avgGrade: c.avgGrade ?? 0,
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

    // CRUD Handlers for Assignments
    const handleCreateAssignment = useCallback(async () => {
        if (!newAssignment.title || !newAssignment.subject || !newAssignment.class || !newAssignment.dueDate) {
            return;
        }
        try {
            setLoading(true);
            let materialUrl = '';
            if (materialFile) {
                try {
                    const storage = getStorage();
                    const fileRef = storageRef(storage, `assignment-materials/${Date.now()}-${materialFile.name}`);
                    await uploadBytes(fileRef, materialFile);
                    materialUrl = await getDownloadURL(fileRef);
                } catch (uploadErr) {
                    console.error('Material upload failed:', uploadErr);
                    return;
                }
            }
            await createAssignment({
                ...newAssignment,
                points: Number(newAssignment.points),
                material: materialUrl,
                teacherId: teacher?.uid || '',
                status: 'active',
                submissions: 0,
                totalStudents: classes.find(c => c.name === newAssignment.class)?.students || 0
            } as UIAssignment);
            setNewAssignment({ title: '', subject: '', class: '', description: '', dueDate: '', points: '', priority: 'medium', material: '' });
            setMaterialFile(null);
            setShowAssignmentForm(false);
            setSuccess('Assignment created successfully!');
        } catch (e) {
            console.error('Assignment creation failed:', e);
        } finally {
            setLoading(false);
        }
    }, [newAssignment, teacher, classes, materialFile]);

    const handleUpdateAssignment = useCallback(async () => {
        if (!editingAssignment) return;

        try {
            setLoading(true);
            setAssignments(prev => prev.map(a =>
                a.id === editingAssignment.id ? editingAssignment : a
            ));
            setEditingAssignment(null);
            setSuccess('Assignment updated successfully!');
        } catch (e) {
            console.error('Failed to update assignment.', e);
        } finally {
            setLoading(false);
        }
    }, [editingAssignment]);

    const handleDeleteAssignment = useCallback(async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this assignment?')) return;

        try {
            setLoading(true);
            await deleteAssignment(id);
            setSuccess('Assignment deleted successfully!');
        } catch (e) {
            console.error('Failed to delete assignment.', e);
        } finally {
            setLoading(false);
        }
    }, []);

    // CRUD Handlers for Classes
    const handleCreateClass = useCallback(async () => {
        if (!newClass.name || !newClass.subject || !newClass.schedule || !newClass.room) {
            return;
        }

        try {
            setLoading(true);
            if (!teacher) {
                setLoading(false);
                return;
            }
            await createClass({
                ...newClass,
                teacherId: teacher?.uid || '',
                students: 0,
                avgGrade: 0
            });
            setNewClass({ name: '', subject: '', schedule: '', room: '', description: '', capacity: '' });
            setShowClassForm(false);
            setSuccess('Class created successfully!');
        } catch (e) {
            console.error('Failed to create class.', e);
        } finally {
            setLoading(false);
        }
    }, [newClass, teacher]);

    const handleUpdateClass = useCallback(async () => {
        if (!editingClass) return;

        try {
            setLoading(true);
            setClasses(prev => prev.map(c =>
                c.id === editingClass.id ? editingClass : c
            ));
            setEditingClass(null);
            setSuccess('Class updated successfully!');
        } catch (e) {
            console.error('Failed to update class.', e);
        } finally {
            setLoading(false);
        }
    }, [editingClass]);

    const handleDeleteClass = useCallback(async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this class?')) return;

        try {
            setLoading(true);
            await deleteClass(id);
            setSuccess('Class deleted successfully!');
        } catch (e) {
            console.error('Failed to delete class.', e);
        } finally {
            setLoading(false);
        }
    }, []);

    // Filter functions
    const filteredAssignments = assignments.filter(assignment => {
        const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            assignment.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            assignment.class.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSubject = !filterSubject || assignment.subject === filterSubject;
        const matchesStatus = !filterStatus || assignment.status === filterStatus;
        return matchesSearch && matchesSubject && matchesStatus;
    });

    const filteredClasses = classes.filter(cls => {
        const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cls.subject.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSubject = !filterSubject || cls.subject === filterSubject;
        return matchesSearch && matchesSubject;
    });

    const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography'];

    // Message Component
    const MessageAlert: React.FC<{ type: 'error' | 'success'; message: string; onClose: () => void }> = ({ type, message, onClose }) => (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
            'bg-green-100 text-green-800 border border-green-200'
            }`}>
            <div className="flex items-center gap-2">
                <span>{message}</span>
                <button onClick={onClose} className="ml-2">
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );

    const renderDashboard = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Total Classes</h3>
                            <p className="text-3xl font-bold text-blue-600 mt-2">{classes.length}</p>
                        </div>
                        <Users className="w-12 h-12 text-blue-500" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Active Assignments</h3>
                            <p className="text-3xl font-bold text-green-600 mt-2">
                                {assignments.filter(a => a.status === 'active').length}
                            </p>
                        </div>
                        <FileText className="w-12 h-12 text-green-500" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Total Students</h3>
                            <p className="text-3xl font-bold text-purple-600 mt-2">
                                {classes.reduce((sum, cls) => sum + (cls.students ?? 0), 0)}
                            </p>
                        </div>
                        <GraduationCap className="w-12 h-12 text-purple-500" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Avg Grade</h3>
                            <p className="text-3xl font-bold text-orange-600 mt-2">
                                {classes.length > 0 ? Math.round(classes.reduce((sum, cls) => sum + (cls.avgGrade ?? 0), 0) / classes.length) : 0}%
                            </p>
                        </div>
                        <TrendingUp className="w-12 h-12 text-orange-500" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Assignments</h3>
                    <div className="space-y-3">
                        {assignments.slice(0, 4).map(assignment => (
                            <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-medium text-gray-800">{assignment.title}</h4>
                                        {assignment.priority === 'high' && (
                                            <Star className="w-4 h-4 text-red-500 fill-current" />
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600">{assignment.class}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600">{assignment.submissions}/{assignment.totalStudents}</p>
                                    <p className="text-xs text-gray-500">submissions</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Class Performance</h3>
                    <div className="space-y-3">
                        {classes.slice(0, 4).map(cls => (
                            <div key={cls.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-800">{cls.name}</h4>
                                    <p className="text-sm text-gray-600">{cls.schedule} • {cls.room}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-800">{cls.avgGrade}%</p>
                                    <p className="text-xs text-gray-500">{cls.students} students</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderAssignments = () => (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Assignments</h2>
                <div className="flex flex-wrap gap-2">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search assignments..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={filterSubject}
                        onChange={(e) => setFilterSubject(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">All Subjects</option>
                        {subjects.map(subject => (
                            <option key={subject} value={subject}>{subject}</option>
                        ))}
                    </select>
                    <button
                        onClick={() => setShowAssignmentForm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Create Assignment
                    </button>
                </div>
            </div>

            {(showAssignmentForm || editingAssignment) && (
                <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        {editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
                    </h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Assignment Title"
                                value={editingAssignment ? editingAssignment.title : newAssignment.title}
                                onChange={(e) => editingAssignment
                                    ? setEditingAssignment({ ...editingAssignment, title: e.target.value })
                                    : setNewAssignment({ ...newAssignment, title: e.target.value })
                                }
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                            <select
                                value={editingAssignment ? editingAssignment.subject : newAssignment.subject}
                                onChange={(e) => editingAssignment
                                    ? setEditingAssignment({ ...editingAssignment, subject: e.target.value })
                                    : setNewAssignment({ ...newAssignment, subject: e.target.value })
                                }
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="">Select Subject</option>
                                {subjects.map(subject => (
                                    <option key={subject} value={subject}>{subject}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <select
                                value={editingAssignment ? editingAssignment.class : newAssignment.class}
                                onChange={(e) => editingAssignment
                                    ? setEditingAssignment({ ...editingAssignment, class: e.target.value })
                                    : setNewAssignment({ ...newAssignment, class: e.target.value })
                                }
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="">Select Year</option>
                                <option value="Year 1">Year 1</option>
                                <option value="Year 2">Year 2</option>
                            </select>
                            <input
                                type="date"
                                value={editingAssignment ? editingAssignment.dueDate : newAssignment.dueDate}
                                onChange={(e) => editingAssignment
                                    ? setEditingAssignment({ ...editingAssignment, dueDate: e.target.value })
                                    : setNewAssignment({ ...newAssignment, dueDate: e.target.value })
                                }
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                            <select
                                value={editingAssignment ? editingAssignment.priority : newAssignment.priority}
                                onChange={(e) => editingAssignment
                                    ? setEditingAssignment({ ...editingAssignment, priority: e.target.value as 'low' | 'medium' | 'high' })
                                    : setNewAssignment({ ...newAssignment, priority: e.target.value as 'low' | 'medium' | 'high' })
                                }
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="low">Low Priority</option>
                                <option value="medium">Medium Priority</option>
                                <option value="high">High Priority</option>
                            </select>
                        </div>
                        {/* Material upload field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Material (photo/video)</label>
                            <input
                                type="file"
                                accept="image/*,video/*"
                                onChange={e => {
                                    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                                    setMaterialFile(file);
                                }}
                                className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {materialFile && <span className="text-xs text-gray-500 mt-1 block">Selected: {materialFile.name}</span>}
                        </div>
                        <textarea
                            placeholder="Assignment Description"
                            value={editingAssignment ? editingAssignment.description : newAssignment.description}
                            onChange={(e) => editingAssignment
                                ? setEditingAssignment({ ...editingAssignment, description: e.target.value })
                                : setNewAssignment({ ...newAssignment, description: e.target.value })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={3}
                        />
                        <input
                            type="number"
                            placeholder="Points"
                            value={editingAssignment ? editingAssignment.points : newAssignment.points}
                            onChange={(e) => editingAssignment
                                ? setEditingAssignment({ ...editingAssignment, points: Number(e.target.value) })
                                : setNewAssignment({ ...newAssignment, points: e.target.value })
                            }
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-32"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={editingAssignment ? handleUpdateAssignment : handleCreateAssignment}
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                {editingAssignment ? 'Update Assignment' : 'Create Assignment'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowAssignmentForm(false);
                                    setEditingAssignment(null);
                                }}
                                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid gap-4">
                {filteredAssignments.map(assignment => (
                    <div key={assignment.id} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="text-lg font-semibold text-gray-800">{assignment.title}</h3>
                                    {assignment.priority === 'high' && (
                                        <Star className="w-5 h-5 text-red-500 fill-current" />
                                    )}
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${assignment.status === 'active' ? 'bg-green-100 text-green-800' :
                                        assignment.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                        {assignment.status}
                                    </span>
                                </div>
                                <p className="text-gray-600 mb-2">{assignment.subject} • {assignment.class}</p>
                                {assignment.description && (
                                    <p className="text-sm text-gray-500 mb-3">{assignment.description}</p>
                                )}
                                {/* Show material if present */}
                                {assignment.material && (
                                    <div className="mb-3">
                                        {assignment.material.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                            <Image src={assignment.material} alt="Material" width={320} height={160} className="rounded-lg max-h-40 border mb-2 object-contain" />
                                        ) : assignment.material.match(/\.(mp4|webm|ogg)$/i) ? (
                                            <video controls src={assignment.material} className="rounded-lg max-h-40 border mb-2" />
                                        ) : (
                                            <a href={assignment.material} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View Material</a>
                                        )}
                                    </div>
                                )}
                                <div className="flex items-center gap-6 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        Due: {assignment.dueDate}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <User className="w-4 h-4" />
                                        {assignment.submissions}/{assignment.totalStudents} submitted
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <CheckCircle className="w-4 h-4" />
                                        {assignment.points} points
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                                <button
                                    onClick={() => setEditingAssignment(assignment)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => assignment.id && handleDeleteAssignment(assignment.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredAssignments.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No assignments found matching your search criteria.
                    </div>
                )}
            </div>
        </div>
    );

    const renderClasses = () => (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Classes</h2>
                <div className="flex flex-wrap gap-2">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search classes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={filterSubject}
                        onChange={(e) => setFilterSubject(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                        <option value="">All Subjects</option>
                        {subjects.map(subject => (
                            <option key={subject} value={subject}>{subject}</option>
                        ))}
                    </select>
                    <button
                        onClick={() => setShowClassForm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Create Class
                    </button>
                </div>
            </div>

            {(showClassForm || editingClass) && (
                <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        {editingClass ? 'Edit Class' : 'Create New Class'}
                    </h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Class Name"
                                value={editingClass ? editingClass.name : newClass.name}
                                onChange={(e) => editingClass
                                    ? setEditingClass({ ...editingClass, name: e.target.value })
                                    : setNewClass({ ...newClass, name: e.target.value })
                                }
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                            />
                            <select
                                value={editingClass ? editingClass.subject : newClass.subject}
                                onChange={(e) => editingClass
                                    ? setEditingClass({ ...editingClass, subject: e.target.value })
                                    : setNewClass({ ...newClass, subject: e.target.value })
                                }
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                            >
                                <option value="">Select Subject</option>
                                {subjects.map(subject => (
                                    <option key={subject} value={subject}>{subject}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input
                                type="text"
                                placeholder="Schedule (e.g., Mon, Wed, Fri - 9:00 AM)"
                                value={editingClass ? editingClass.schedule : newClass.schedule}
                                onChange={(e) => editingClass
                                    ? setEditingClass({ ...editingClass, schedule: e.target.value })
                                    : setNewClass({ ...newClass, schedule: e.target.value })
                                }
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Room Number"
                                value={editingClass ? editingClass.room : newClass.room}
                                onChange={(e) => editingClass
                                    ? setEditingClass({ ...editingClass, room: e.target.value })
                                    : setNewClass({ ...newClass, room: e.target.value })
                                }
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                            />
                            <input
                                type="number"
                                placeholder="Capacity"
                                value={editingClass ? editingClass.capacity : newClass.capacity}
                                onChange={(e) => editingClass
                                    ? setEditingClass({ ...editingClass, capacity: e.target.value })
                                    : setNewClass({ ...newClass, capacity: e.target.value })
                                }
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                        <textarea
                            placeholder="Class Description"
                            value={editingClass ? editingClass.description : newClass.description}
                            onChange={(e) => editingClass
                                ? setEditingClass({ ...editingClass, description: e.target.value })
                                : setNewClass({ ...newClass, description: e.target.value })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            rows={3}
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={editingClass ? handleUpdateClass : handleCreateClass}
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                {editingClass ? 'Update Class' : 'Create Class'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowClassForm(false);
                                    setEditingClass(null);
                                }}
                                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid gap-4">
                {filteredClasses.map(cls => (
                    <div key={cls.id} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-semibold text-gray-800">{cls.name}</h3>
                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                        {cls.subject}
                                    </span>
                                </div>
                                {cls.description && (
                                    <p className="text-sm text-gray-600 mb-3">{cls.description}</p>
                                )}
                                <div className="flex items-center gap-6 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {cls.schedule}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Users className="w-4 h-4" />
                                        {cls.students} students
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <TrendingUp className="w-4 h-4" />
                                        {cls.avgGrade}% avg
                                    </span>
                                    <span>{cls.room}</span>
                                </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                                <button
                                    onClick={() => setEditingClass(cls)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => cls.id && handleDeleteClass(cls.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredClasses.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No classes found matching your search criteria.
                    </div>
                )}
            </div>
        </div>
    );

    const renderSettings = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Settings</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile Information</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                            <input
                                type="text"
                                value={teacher ? teacher.name : ''}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                readOnly
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input
                                type="email"
                                value={teacher ? teacher.email : ''}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                readOnly
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                            <input
                                type="text"
                                value={teacher ? teacher.department : ''}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                readOnly
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Preferences</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium text-gray-800">Email Notifications</h4>
                                <p className="text-sm text-gray-600">Receive email notifications for new submissions</p>
                            </div>
                            <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium text-gray-800">Assignment Reminders</h4>
                                <p className="text-sm text-gray-600">Send reminders before assignment due dates</p>
                            </div>
                            <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium text-gray-800">Weekly Reports</h4>
                                <p className="text-sm text-gray-600">Receive weekly class performance reports</p>
                            </div>
                            <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <FileText className="w-6 h-6 text-blue-600" />
                        <div className="text-left">
                            <h4 className="font-medium text-gray-800">Export Data</h4>
                            <p className="text-sm text-gray-600">Download class and assignment data</p>
                        </div>
                    </button>
                    <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <Users className="w-6 h-6 text-green-600" />
                        <div className="text-left">
                            <h4 className="font-medium text-gray-800">Bulk Import</h4>
                            <p className="text-sm text-gray-600">Import student data from CSV</p>
                        </div>
                    </button>
                    <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <Settings className="w-6 h-6 text-purple-600" />
                        <div className="text-left">
                            <h4 className="font-medium text-gray-800">Advanced Settings</h4>
                            <p className="text-sm text-gray-600">Configure grading and policies</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );

    // Logout handler
    const handleLogout = async () => {
        await signOut(auth);
        localStorage.removeItem('teacher_logged_in');
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Hero Section - Beautiful Top Bar */}
            <section className="relative h-32 md:h-40 flex items-center justify-center overflow-hidden mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-blue-800 to-purple-900"></div>
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10 flex items-center justify-between w-full max-w-7xl px-6 mx-auto">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full border-3 border-white/90 overflow-hidden shadow-xl backdrop-blur-sm">
                            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center">
                                <span className="text-white text-lg font-bold">
                                    {teacher?.name ? teacher.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'TP'}
                                </span>
                            </div>
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">Welcome Back{teacher?.name ? `, ${teacher.name.split(' ')[0]}` : ''}!</h1>
                            <p className="text-white/90 text-sm">Teacher Portal Dashboard</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-6 py-2 bg-white/20 backdrop-blur-md text-white font-medium rounded-full border border-white/30 hover:bg-white/30 transition-all duration-300 shadow-lg text-sm"
                    >
                        Logout
                    </button>
                </div>
            </section>

            {success && <MessageAlert type="success" message={success} onClose={() => setSuccess('')} />}

            <div className="container mx-auto px-4 pb-8">
                <div className="flex justify-center mb-8">
                    <div className="flex flex-wrap gap-2 px-2 py-2 rounded-2xl bg-white/30 backdrop-blur-md border border-white/40 shadow-lg mx-auto relative w-full">
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-200 text-base focus:outline-none
                            ${activeTab === 'dashboard'
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl scale-105 border-2 border-blue-400'
                                    : 'bg-white/60 text-gray-700 hover:bg-blue-50/80 border border-transparent'}
                        `}
                            style={{ boxShadow: activeTab === 'dashboard' ? '0 4px 24px 0 rgba(59,130,246,0.15)' : undefined }}
                        >
                            <BookOpen className="w-5 h-5 inline mr-2" />
                            Dashboard
                        </button>
                        <button
                            onClick={() => setActiveTab('assignments')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-200 text-base focus:outline-none
                            ${activeTab === 'assignments'
                                    ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-xl scale-105 border-2 border-green-400'
                                    : 'bg-white/60 text-gray-700 hover:bg-green-50/80 border border-transparent'}
                        `}
                            style={{ boxShadow: activeTab === 'assignments' ? '0 4px 24px 0 rgba(16,185,129,0.15)' : undefined }}
                        >
                            <FileText className="w-5 h-5 inline mr-2" />
                            Assignments ({assignments.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('classes')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-200 text-base focus:outline-none
                            ${activeTab === 'classes'
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xl scale-105 border-2 border-purple-400'
                                    : 'bg-white/60 text-gray-700 hover:bg-purple-50/80 border border-transparent'}
                        `}
                            style={{ boxShadow: activeTab === 'classes' ? '0 4px 24px 0 rgba(168,85,247,0.15)' : undefined }}
                        >
                            <Users className="w-5 h-5 inline mr-2" />
                            Classes ({classes.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-200 text-base focus:outline-none
                            ${activeTab === 'settings'
                                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-xl scale-105 border-2 border-yellow-400'
                                    : 'bg-white/60 text-gray-700 hover:bg-yellow-50/80 border border-transparent'}
                        `}
                            style={{ boxShadow: activeTab === 'settings' ? '0 4px 24px 0 rgba(251,191,36,0.15)' : undefined }}
                        >
                            <Settings className="w-5 h-5 inline mr-2" />
                            Settings
                        </button>
                    </div>
                </div>

                <div className="mb-8">
                    {activeTab === 'dashboard' && renderDashboard()}
                    {activeTab === 'assignments' && renderAssignments()}
                    {activeTab === 'classes' && renderClasses()}
                    {activeTab === 'settings' && renderSettings()}
                </div>
            </div>
        </div>
    );
}