'use client';
import React, { useState } from 'react';
import {
    collection,
    getDocs,
    query,
    orderBy,
    deleteDoc,
    doc,
    setDoc,
    serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import Image from "next/image";
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Teacher } from '@/firebase/definitions';

interface TeachersTabProps {
    teachers: Teacher[];
    setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
}

const TeachersTab: React.FC<TeachersTabProps> = ({ teachers, setTeachers }) => {
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
    const [teacherPhoto, setTeacherPhoto] = useState<File | null>(null);
    const [teacherSubjects, setTeacherSubjects] = useState<string[]>([]);

    const SUBJECTS = [
        "Mathematics", "Physics", "Chemistry", "Biology", "English", "History", "Geography", "Computer Science", "Economics", "Other"
    ];

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
                createdAt: serverTimestamp(),
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
        if (!editingTeacher || !editingTeacher.uid) return;
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
            await setDoc(doc(db, 'teachers', editingTeacher.uid as string), {
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

    return (
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
                                                    <p className="font-mono text-sm text-emerald-600 font-medium">{teacher.uid}</p>
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
                                                onClick={() => teacher.uid && removeTeacher(teacher.uid)}
                                                disabled={!teacher.uid}
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
        </div>
    );
};

export default TeachersTab;