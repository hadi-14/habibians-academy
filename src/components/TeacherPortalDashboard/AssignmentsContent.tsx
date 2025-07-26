import React, { useState, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, BookOpen, Users, GraduationCap, Clock, CheckCircle, Star, Save } from 'lucide-react';
import { createAssignment, deleteAssignment } from '@/firebase/teacher-portal';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import Image from "next/image";
import type { Assignment as FirebaseAssignment, Class, Teacher } from '@/firebase/teacher-portal'; // Adjust import path if needed

const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography'];

interface AssignmentsContentProps {
    assignments: FirebaseAssignment[];
    classes: Class[];
    teacher: Teacher;
    setSuccess: (msg: string) => void;
    setLoading: (loading: boolean) => void;
    setAssignments: React.Dispatch<React.SetStateAction<FirebaseAssignment[]>>; // For update/delete
}

export const AssignmentsContent: React.FC<AssignmentsContentProps> = ({ assignments, classes, teacher, setSuccess, setLoading, setAssignments }) => {
    const [showAssignmentForm, setShowAssignmentForm] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState<FirebaseAssignment | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSubject, setFilterSubject] = useState('');
    const [newAssignment, setNewAssignment] = useState({
        title: '',
        subject: '',
        classId: '',
        description: '',
        dueDate: '',
        dueTime: '',
        points: '',
        priority: 'medium' as 'low' | 'medium' | 'high',
        material: '',
        assignmentType: 'assignment' as 'assignment' | 'quiz' | 'material'
    });
    const [materialFile, setMaterialFile] = useState<File | null>(null);

    const filteredAssignments = assignments.filter(assignment => {
        const cls = classes.find(c => c.uid === assignment.classId);
        const matchesSearch =
            assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            assignment.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (cls?.name && cls.name.toLowerCase().includes(searchTerm.toLowerCase()));
        // const matchesStatus = !filterStatus || assignment.status === filterStatus; // filterStatus not used in state
        return matchesSearch; // && matchesStatus;
    });

    const handleCreateAssignment = useCallback(async () => {
        if (!newAssignment.title || !newAssignment.subject || !newAssignment.classId || !newAssignment.dueDate) {
            alert("Please fill in required fields: Title, Subject, Class, and Due Date.");
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
                    alert("Failed to upload material. Please try again.");
                    setLoading(false);
                    return;
                }
            }
            const selectedClass = classes.find(c => c.uid === newAssignment.classId);
            const assignmentToCreate = {
                ...newAssignment,
                points: Number(newAssignment.points),
                material: materialUrl,
                teacherId: teacher.uid ?? '',
                status: 'active',
                submissions: 0,
                classId: selectedClass?.uid || '',
                dueDate: new Date(newAssignment.dueDate), // Convert string to Date
            };

            await createAssignment(assignmentToCreate);
            setNewAssignment({ title: '', subject: '', classId: '', description: '', dueDate: '', dueTime: '', points: '', priority: 'medium', material: '', assignmentType: 'assignment' });
            setMaterialFile(null);
            setShowAssignmentForm(false);
            setSuccess('Assignment created successfully!');
        } catch (e) {
            console.error('Assignment creation failed:', e);
            alert("Failed to create assignment. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [newAssignment, teacher.uid, classes, materialFile, setLoading, setSuccess]);

    const handleUpdateAssignment = useCallback(async () => {
        if (!editingAssignment) return;
        try {
            setLoading(true);
            // Optimistic update UI
            setAssignments(prev => prev.map(a =>
                a.uid === editingAssignment.uid ? editingAssignment : a
            ));
            // In a real scenario, you'd call an update function here
            // await updateAssignment(editingAssignment.id, editingAssignment);
            setEditingAssignment(null);
            setSuccess('Assignment updated successfully!');
        } catch (e) {
            console.error('Failed to update assignment.', e);
            alert("Failed to update assignment. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [editingAssignment, setLoading, setSuccess, setAssignments]);

    const handleDeleteAssignment = useCallback(async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this assignment?')) return;
        try {
            setLoading(true);
            await deleteAssignment(id);
            setSuccess('Assignment deleted successfully!');
            // Optimistic update UI
            setAssignments(prev => prev.filter(a => a.uid !== id));
        } catch (e) {
            console.error('Failed to delete assignment.', e);
            alert("Failed to delete assignment. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [setLoading, setSuccess, setAssignments]);

    return (
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
                                value={editingAssignment ? editingAssignment.classId : newAssignment.classId}
                                onChange={(e) => editingAssignment
                                    ? setEditingAssignment({ ...editingAssignment, classId: e.target.value })
                                    : setNewAssignment({ ...newAssignment, classId: e.target.value })
                                }
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="">Select Class</option>
                                {classes.map(cls => (
                                    <option key={cls.uid} value={cls.uid}>
                                        {cls.name} - Capacity: {cls.capacity}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="date"
                                value={
                                    editingAssignment
                                        ? typeof editingAssignment.dueDate === 'string'
                                            ? editingAssignment.dueDate
                                            : editingAssignment.dueDate instanceof Date
                                                ? editingAssignment.dueDate.toISOString()
                                                : ''
                                        : newAssignment.dueDate
                                }
                                onChange={(e) => editingAssignment
                                    ? setEditingAssignment({ ...editingAssignment, dueDate: new Date(e.target.value) })
                                    : setNewAssignment({ ...newAssignment, dueDate: e.target.value })
                                }
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                            <input
                                type="time"
                                value={editingAssignment ? editingAssignment.dueTime : newAssignment.dueTime}
                                onChange={(e) => editingAssignment
                                    ? setEditingAssignment({ ...editingAssignment, dueTime: e.target.value })
                                    : setNewAssignment({ ...newAssignment, dueTime: e.target.value })
                                }
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <select
                                value={editingAssignment ? editingAssignment.assignmentType : newAssignment.assignmentType}
                                onChange={(e) => editingAssignment
                                    ? setEditingAssignment({ ...editingAssignment, assignmentType: e.target.value })
                                    : setNewAssignment({ ...newAssignment, assignmentType: e.target.value as 'assignment' | 'quiz' | 'material' })
                                }
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="assignment">Assignment</option>
                                <option value="quiz">Quiz Assignment</option>
                                <option value="material">Material</option>
                            </select>
                            {/* Points Input - moved here for better layout */}
                            <input
                                type="number"
                                placeholder="Points"
                                value={editingAssignment ? editingAssignment.points : newAssignment.points}
                                onChange={(e) => editingAssignment
                                    ? setEditingAssignment({ ...editingAssignment, points: Number(e.target.value) })
                                    : setNewAssignment({ ...newAssignment, points: e.target.value })
                                }
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Assign to students:</label>
                            <div className="space-y-2 max-h-32 overflow-y-auto border rounded-lg p-3">
                                <label className="flex items-center">
                                    <input type="checkbox" className="mr-2" defaultChecked />
                                    All students in selected classes
                                </label>
                                {/* Individual student selection would go here */}
                            </div>
                        </div>
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

                        <div className="flex gap-3">
                            <button
                                onClick={editingAssignment ? handleUpdateAssignment : handleCreateAssignment}
                                disabled={false} // setLoading state should disable the parent form or button
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
                {filteredAssignments.map(assignment => {
                    const cls = classes.find(c => c.uid === assignment.classId);
                    return (
                        <div key={assignment.uid} className="bg-gradient-to-br from-blue-50 via-white to-indigo-100 rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-200">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-xl font-bold text-blue-900">{assignment.title}</h3>
                                        {assignment.priority === 'high' && (
                                            <Star className="w-5 h-5 text-red-500 fill-current" />
                                        )}
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${assignment.status === 'active' ? 'bg-green-100 text-green-800' :
                                            assignment.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                            {assignment.status}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-3 mb-2 text-sm text-gray-700">
                                        <span className="flex items-center gap-1">
                                            <BookOpen className="w-4 h-4" />
                                            {assignment.subject}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Users className="w-4 h-4" />
                                            {cls?.name} ({cls?.capacity} capacity)
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <GraduationCap className="w-4 h-4" />
                                            {cls?.students} students
                                        </span>
                                    </div>
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
                                    <div className="flex flex-wrap gap-6 text-sm text-gray-500 mt-2">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            Due: {assignment.dueDate.toISOString()} {assignment.dueTime && `at ${assignment.dueTime}`}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <CheckCircle className="w-4 h-4" />
                                            {assignment.points} points
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Users className="w-4 h-4" /> {/* Using Users icon for submissions */}
                                            {assignment.submissions}/{cls?.students} submitted
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
                                        onClick={() => assignment.uid && handleDeleteAssignment(assignment.uid)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="mt-2 text-xs text-gray-400">
                                Created: {assignment.createdAt ? assignment.createdAt.toISOString() : 'N/A'}
                            </div>
                        </div>
                    );
                })}
                {filteredAssignments.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No assignments found matching your search criteria.
                    </div>
                )}
            </div>
        </div>
    );
};