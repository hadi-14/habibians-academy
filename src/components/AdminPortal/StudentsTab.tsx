'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
    collection,
    getDocs,
    setDoc,
    doc,
    deleteDoc,
    query,
    orderBy,
    serverTimestamp,
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '@/firebase/config';
import { auth } from '@/firebase/config';
import { Student, Class } from '@/firebase/definitions';
import { searchAvailableClasses } from '@/firebase/functions';

interface StudentsTabProps {
    students: Student[];
    setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
}


const StudentsTab: React.FC<StudentsTabProps> = ({ students, setStudents }) => {
    const [studentForm, setStudentForm] = useState({ name: '', email: '', password: '', phone: '', className: '' });
    const [classes, setClasses] = useState<Class[]>([]);
    // Fetch classes from Firestore on mount
    React.useEffect(() => {
        async function fetchClasses() {
            try {
                const fetched = await searchAvailableClasses();
                setClasses(fetched);
            } catch {
                setClasses([]);
            }
        }
        fetchClasses();
    }, []);
    // Edit modal state remains here
    const [regError, setRegError] = useState('');
    const [regSuccess, setRegSuccess] = useState('');
    const [regLoading, setRegLoading] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [editStudentForm, setEditStudentForm] = useState({ name: '', email: '', phone: '', className: '' });
    const [editStudentPhoto, setEditStudentPhoto] = useState<File | null>(null);
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState('');
    const [editSuccess, setEditSuccess] = useState('');
    const [showAddStudentModal, setShowAddStudentModal] = useState(false);
    const [studentPhoto, setStudentPhoto] = useState<File | null>(null);

    async function handleRegisterStudent(e: React.FormEvent) {
        e.preventDefault();
        setRegError('');
        setRegSuccess('');
        setRegLoading(true);
        try {
            const userCred = await createUserWithEmailAndPassword(auth, studentForm.email, studentForm.password);
            const studentId = `S-${userCred.user.uid.slice(0, 8).toUpperCase()}`;
            let photoURL = '';
            if (studentPhoto) {
                const storage = getStorage();
                const fileRef = ref(storage, `student-photos/${userCred.user.uid}-${studentPhoto.name}`);
                await uploadBytes(fileRef, studentPhoto);
                photoURL = await getDownloadURL(fileRef);
            }
            await setDoc(doc(db, 'students', userCred.user.uid), {
                name: studentForm.name,
                email: studentForm.email,
                studentId,
                phone: studentForm.phone,
                enrolledClasses: studentForm.className ? [studentForm.className] : [],
                photoURL,
                createdAt: serverTimestamp(),
                uid: userCred.user.uid
            });
            setRegSuccess('Student registered!');
            setStudentForm({ name: '', email: '', password: '', phone: '', className: '' });
            setStudentPhoto(null);
            // Fetch students from 'students' collection
            const q = query(collection(db, 'students'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            setStudents(querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as Student)));
        } catch (err) {
            setRegError(err instanceof Error ? err.message : 'Registration failed');
        }
        setRegLoading(false);
    }
    // Registration state removed

    const handleEditStudent = (student: Student) => {
        setEditingStudent(student);
        setEditStudentForm({
            name: student.name,
            email: student.email,
            phone: student.phone,
            className: Array.isArray(student.enrolledClasses) && student.enrolledClasses.length > 0 ? student.enrolledClasses[0] : '',
        });
        setEditStudentPhoto(null);
        setEditError('');
        setEditSuccess('');
    };

    async function handleUpdateStudent(e: React.FormEvent) {
        e.preventDefault();
        if (!editingStudent || !editingStudent.uid) return;
        setEditLoading(true);
        setEditError('');
        setEditSuccess('');
        try {
            let photoURL = editingStudent.photoURL || '';
            if (editStudentPhoto) {
                const storage = getStorage();
                const fileRef = ref(storage, `student-photos/${editingStudent.uid}-${editStudentPhoto.name}`);
                await uploadBytes(fileRef, editStudentPhoto);
                photoURL = await getDownloadURL(fileRef);
            }
            await setDoc(doc(db, 'students', editingStudent.uid as string), {
                ...editingStudent,
                name: editStudentForm.name,
                email: editStudentForm.email,
                phone: editStudentForm.phone,
                enrolledClasses: editStudentForm.className ? [editStudentForm.className] : [],
                photoURL,
            }, { merge: true });
            setEditSuccess('Student updated!');
            // Refresh students list
            const q = query(collection(db, 'students'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            setStudents(querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as Student)));
            setEditingStudent(null);
        } catch (err) {
            setEditError(err instanceof Error ? err.message : 'Update failed');
        }
        setEditLoading(false);
    }

    const removeStudent = async (studentUid: string) => {
        if (!window.confirm('Are you sure you want to remove this student?')) return;
        try {
            await deleteDoc(doc(db, 'students', studentUid));
            setStudents(students.filter(s => s.uid !== studentUid));
        } catch (error) {
            alert('Failed to remove student.');
            console.error(error);
        }
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8">
            {/* Student Registration Section */}
            <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-indigo-100 mb-8">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-500 text-white p-6">
                    <h2 className="text-2xl font-bold">Student Management</h2>
                    <p className="text-blue-100 mt-2">Register new students and view all registered students</p>
                </div>
                <div className="p-8">
                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Add Student Button */}
                        <div>
                            <button
                                className="bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-500 transition-colors duration-200 shadow-lg mb-6"
                                onClick={() => setShowAddStudentModal(true)}
                            >
                                + Add Student
                            </button>
                        </div>
                        {/* Student Stats */}
                        <div>
                            <h3 className="text-xl font-bold mb-6 text-blue-800">Student Statistics</h3>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                                    <div className="text-2xl font-bold text-blue-600">{students.length}</div>
                                    <div className="text-sm text-blue-700 font-medium">Total Students</div>
                                </div>
                                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-xl border border-emerald-100">
                                    <div className="text-2xl font-bold text-emerald-600">
                                        {
                                            students.filter(s => {
                                                if (!s.createdAt) return false;
                                                let createdDate: Date;
                                                if (s.createdAt instanceof Date) {
                                                    createdDate = s.createdAt;
                                                } else if ('seconds' in s.createdAt) {
                                                    createdDate = new Date(s.createdAt.seconds * 1000);
                                                } else {
                                                    return false;
                                                }
                                                return createdDate > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                                            }).length
                                        }
                                    </div>
                                    <div className="text-sm text-emerald-700 font-medium">New This Month</div>
                                </div>
                            </div>
                            {/* Recent Activity */}
                            <div className="bg-gray-50 rounded-xl p-4">
                                <h4 className="font-semibold text-gray-800 mb-3">Recent Activity</h4>
                                <div className="space-y-2">
                                    {students.slice(0, 3).map(student => (
                                        <div key={student.uid} className="flex items-center space-x-3 text-sm">
                                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                            <span className="text-gray-700"> registered</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Student Registration Section removed */}

            {/* Students List */}
            <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-indigo-100">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-500 text-white p-6">
                    <h3 className="text-xl font-bold">All Registered Students</h3>
                    <p className="text-blue-100 mt-1">Manage and view all student accounts</p>
                </div>
                <div className="p-6">
                    {students.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13a4 4 0 118 0 4 4 0 01-8 0zm14 7v-2a4 4 0 00-3-3.87" />
                                </svg>
                            </div>
                            <p className="text-gray-500 text-lg">No students registered yet</p>
                            <p className="text-gray-400 text-sm">Use the form above to register your first student</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {students.map(student => (
                                <div key={student.uid} className="border border-gray-200 rounded-xl p-6 hover:bg-gray-50 transition-colors duration-200">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                {student.photoURL ? (
                                                    <Image src={student.photoURL} alt={student.name} width={40} height={40} className="w-10 h-10 rounded-full object-cover border border-blue-200" />
                                                ) : null}
                                                <div>
                                                    <div className="font-semibold text-gray-800">{student.name}</div>
                                                    <div className="text-xs text-gray-500">{student.email}</div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 mt-4">
                                                <div>
                                                    <span className="text-xs text-gray-500 uppercase tracking-wide">Phone</span>
                                                    <p className="text-sm text-gray-700">{student.phone}</p>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-gray-500 uppercase tracking-wide">Class</span>
                                                    <p className="text-sm text-gray-700">
                                                        {Array.isArray(student.enrolledClasses) && classes.length > 0
                                                            ? student.enrolledClasses.map(cid => {
                                                                const found = classes.find(cls => cls.uid === cid);
                                                                return found ? found.name : cid;
                                                            }).join(', ')
                                                            : ''}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                className="text-blue-600 hover:bg-blue-100 p-2 rounded-full transition-colors duration-200"
                                                title="Edit Student"
                                                onClick={() => handleEditStudent(student)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="text-rose-600 hover:bg-rose-100 p-2 rounded-full transition-colors duration-200"
                                                title="Remove Student"
                                                onClick={() => student.uid && removeStudent(student.uid)}
                                                disabled={!student.uid}
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

            {/* Edit Student Modal */}
            {editingStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-opacity duration-300 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative border border-indigo-100 max-h-[70vh] overflow-y-auto animate-fadeIn">
                        <button
                            onClick={() => setEditingStudent(null)}
                            className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 transition-colors duration-200 text-2xl font-bold"
                            aria-label="Close"
                        >
                            &times;
                        </button>
                        <h2 className="text-2xl font-bold mb-6 text-indigo-800 border-b border-indigo-100 pb-3">Edit Student</h2>
                        <form onSubmit={handleUpdateStudent} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={editStudentForm.name}
                                    onChange={e => setEditStudentForm(f => ({ ...f, name: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={editStudentForm.email}
                                    onChange={e => setEditStudentForm(f => ({ ...f, email: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                <input
                                    type="text"
                                    value={editStudentForm.phone}
                                    onChange={e => setEditStudentForm(f => ({ ...f, phone: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                                <select
                                    value={editStudentForm.className}
                                    onChange={e => setEditStudentForm(f => ({ ...f, className: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                                    required
                                >
                                    <option value="">Select Class</option>
                                    {classes.map(cls => (
                                        <option key={cls.uid} value={cls.name}>{cls.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => setEditStudentPhoto(e.target.files?.[0] || null)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                                />
                                {editStudentPhoto && <span className="text-xs text-gray-500 mt-1 block">Selected: {editStudentPhoto.name}</span>}
                            </div>
                            {editError && <div className="bg-rose-50 border border-rose-200 rounded-xl p-4"><p className="text-rose-600 font-medium text-sm">{editError}</p></div>}
                            {editSuccess && <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4"><p className="text-emerald-600 font-medium text-sm">{editSuccess}</p></div>}
                            <button
                                type="submit"
                                disabled={editLoading}
                                className="w-full bg-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-indigo-500 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
                            >
                                {editLoading ? 'Updating...' : 'Update Student'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Student Modal */}
            {showAddStudentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-opacity duration-300 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative border border-blue-100 max-h-[70vh] overflow-y-auto animate-fadeIn">
                        <button
                            onClick={() => setShowAddStudentModal(false)}
                            className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 transition-colors duration-200 text-2xl font-bold"
                            aria-label="Close"
                        >
                            &times;
                        </button>
                        <h3 className="text-xl font-bold mb-6 text-blue-800">Register New Student</h3>
                        <form onSubmit={handleRegisterStudent} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter student's full name"
                                    value={studentForm.name}
                                    onChange={e => setStudentForm(f => ({ ...f, name: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    placeholder="student@example.com"
                                    value={studentForm.email}
                                    onChange={e => setStudentForm(f => ({ ...f, email: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                <input
                                    type="password"
                                    placeholder="Create a secure password"
                                    value={studentForm.password}
                                    onChange={e => setStudentForm(f => ({ ...f, password: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                <input
                                    type="text"
                                    placeholder="+1 (555) 123-4567"
                                    value={studentForm.phone}
                                    onChange={e => setStudentForm(f => ({ ...f, phone: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                                <select
                                    value={studentForm.className}
                                    onChange={e => setStudentForm(f => ({ ...f, className: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                    required
                                >
                                    <option value="">Select Class</option>
                                    {classes.map(cls => (
                                        <option key={cls.uid} value={cls.name}>{cls.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => setStudentPhoto(e.target.files?.[0] || null)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                />
                                {studentPhoto && <span className="text-xs text-gray-500 mt-1 block">Selected: {studentPhoto.name}</span>}
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
                                className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-500 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
                            >
                                {regLoading ? 'Registering Student...' : 'Register Student'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            {/* Add Student Modal removed */}
        </div>
    );
};

export default StudentsTab;
