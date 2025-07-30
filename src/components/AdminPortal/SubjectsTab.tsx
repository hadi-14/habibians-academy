import React, { useEffect, useState } from 'react';
import { Subject } from '@/firebase/definitions';
import { getAllSubjects, createSubject, updateSubject, deleteSubject } from '@/firebase/functions/subjectFunctions';

const defaultForm: Omit<Subject, 'uid'> = {
    name: '',
    code: '',
    board: '',
    level: '',
    field: '',
    syllabus: '',
    icon: '',
};


const BOARD_OPTIONS = [
    {
        board: 'Cambridge',
        levels: ['O Level', 'A Level', 'AS Level'],
        fields: ['Science', 'Mathematics', 'Languages', 'Humanities', 'Commerce', 'Other'],
    },
    {
        board: 'IB',
        levels: ['IBDP', 'MYP', 'PYP'],
        fields: ['Science', 'Mathematics', 'Languages', 'Humanities', 'Arts', 'Technology', 'Other'],
    },
    {
        board: 'Karachi Board',
        levels: ['Matric', 'Intermediate'],
        fields: ['Science', 'Commerce', 'Humanities', 'Other'],
    },
    {
        board: 'Inter',
        levels: ['FSc', 'FA', 'ICom', 'ICS'],
        fields: ['Pre-Medical', 'Pre-Engineering', 'Commerce', 'Arts', 'Computer Science', 'Other'],
    },
    {
        board: 'Other',
        levels: ['Foundation', 'Higher', 'Other'],
        fields: ['Science', 'Mathematics', 'Languages', 'Humanities', 'Arts', 'Technology', 'Social Sciences', 'Other'],
    },
];

const SubjectsTab: React.FC = () => {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [form, setForm] = useState<Omit<Subject, 'id'>>(defaultForm);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        setLoading(true);
        try {
            const data = await getAllSubjects();
            setSubjects(data);
        } catch {
            setError('Failed to fetch subjects');
        }
        setLoading(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        let fieldValue: string | boolean | number = value;
        if (type === 'checkbox') {
            fieldValue = (e.target as HTMLInputElement).checked;
        } else if (type === 'number') {
            fieldValue = parseInt(value) || 0;
        }
        setForm(prev => ({
            ...prev,
            [name]: fieldValue,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            if (editingId) {
                await updateSubject(editingId, form);
                setSuccess('Subject updated successfully!');
            } else {
                await createSubject(form);
                setSuccess('Subject created successfully!');
            }
            setForm(defaultForm);
            setEditingId(null);
            setShowAddModal(false);
            fetchSubjects();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Operation failed');
        }
        setLoading(false);
    };

    const handleEdit = (subject: Subject) => {
        setForm({ ...subject });
        setEditingId(subject.uid!);
        setShowAddModal(true);
        setError('');
        setSuccess('');
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this subject?')) {
            setLoading(true);
            try {
                await deleteSubject(id);
                setSuccess('Subject deleted successfully!');
                fetchSubjects();
            } catch {
                setError('Failed to delete subject');
            }
            setLoading(false);
        }
    };

    const resetForm = () => {
        setForm(defaultForm);
        setEditingId(null);
        setShowAddModal(false);
        setError('');
        setSuccess('');
    };

    // Get dynamic options for selected board
    const selectedBoard = BOARD_OPTIONS.find(b => b.board === form.board);
    const levelOptions = selectedBoard ? selectedBoard.levels : [];
    const fieldOptions = selectedBoard ? selectedBoard.fields : [];

    // Filter and sort state
    const [filterBoard, setFilterBoard] = useState('');
    const [filterLevel, setFilterLevel] = useState('');
    const [filterField, setFilterField] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'code'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // Filtered and sorted subjects
    const filteredSubjects = subjects
        .filter(s => !filterBoard || s.board === filterBoard)
        .filter(s => !filterLevel || s.level === filterLevel)
        .filter(s => !filterField || s.field === filterField)
        .sort((a, b) => {
            let cmp = 0;
            if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
            else if (sortBy === 'code') cmp = a.code.localeCompare(b.code);
            return sortOrder === 'asc' ? cmp : -cmp;
        });

    // Unique filter options
    const allBoards = Array.from(new Set(subjects.map(s => s.board)));
    const allLevels = Array.from(new Set(subjects.map(s => s.level)));
    const allFields = Array.from(new Set(subjects.map(s => s.field)));

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8">
            {/* Subject Management Header */}
            <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-indigo-100 mb-8">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                    <h2 className="text-2xl font-bold">Subject Management</h2>
                    <p className="text-blue-100 mt-2">Manage academic subjects and their details</p>
                </div>
                <div className="p-8">
                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Add Subject Button */}
                        <div>
                            <button
                                className="bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-500 transition-colors duration-200 shadow-lg mb-6"
                                onClick={() => setShowAddModal(true)}
                            >
                                + Add Subject
                            </button>
                        </div>
                        {/* Subject Stats */}
                        <div>
                            <h3 className="text-xl font-bold mb-6 text-blue-800">Subject Statistics</h3>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                                    <div className="text-2xl font-bold text-blue-600">{subjects.length}</div>
                                    <div className="text-sm text-blue-700 font-medium">Total Subjects</div>
                                </div>
                            </div>
                            {/* Subject Fields Overview */}
                            <div className="bg-gray-50 rounded-xl p-4">
                                <h4 className="font-semibold text-gray-800 mb-3">Subject Fields</h4>
                                <div className="space-y-2">
                                    {Array.from(new Set(subjects.map(s => s.field))).slice(0, 3).map(field => (
                                        <div key={field} className="flex items-center space-x-3 text-sm">
                                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                            <span className="text-gray-700">{field} ({subjects.filter(s => s.field === field).length})</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success/Error Messages */}
            {success && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
                    <p className="text-emerald-600 font-medium text-sm">{success}</p>
                </div>
            )}
            {error && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-6">
                    <p className="text-rose-600 font-medium text-sm">{error}</p>
                </div>
            )}

            {/* Subjects Filters & Sorting */}
            <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-indigo-100">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                    <h3 className="text-xl font-bold">All Subjects</h3>
                    <p className="text-blue-100 mt-1">View and manage all academic subjects</p>
                </div>
                <div className="p-6">
                    {/* Filters & Sorting Controls */}
                    <div className="flex flex-wrap gap-4 mb-6 items-end">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Board</label>
                            <select value={filterBoard} onChange={e => setFilterBoard(e.target.value)} className="border rounded px-3 py-2">
                                <option value="">All</option>
                                {allBoards.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Level</label>
                            <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)} className="border rounded px-3 py-2">
                                <option value="">All</option>
                                {allLevels.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Field</label>
                            <select value={filterField} onChange={e => setFilterField(e.target.value)} className="border rounded px-3 py-2">
                                <option value="">All</option>
                                {allFields.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Sort By</label>
                            <select value={sortBy} onChange={e => setSortBy(e.target.value as 'name' | 'code')} className="border rounded px-3 py-2">
                                <option value="name">Name</option>
                                <option value="code">Code</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Order</label>
                            <select value={sortOrder} onChange={e => setSortOrder(e.target.value as 'asc' | 'desc')} className="border rounded px-3 py-2">
                                <option value="asc">Ascending</option>
                                <option value="desc">Descending</option>
                            </select>
                        </div>
                        {(filterBoard || filterLevel || filterField) && (
                            <button className="ml-2 text-xs text-blue-600 underline" onClick={() => { setFilterBoard(''); setFilterLevel(''); setFilterField(''); }}>Clear Filters</button>
                        )}
                    </div>
                    {/* Subjects List */}
                    {filteredSubjects.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <p className="text-gray-500 text-lg">No subjects added yet</p>
                            <p className="text-gray-400 text-sm">Create your first subject to get started</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {filteredSubjects.map(subject => (
                                <div key={subject.uid} className="border border-gray-200 rounded-xl p-6 hover:bg-gray-50 transition-colors duration-200">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <span className="text-2xl">{subject.icon || '📚'}</span>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-800 text-lg">{subject.name}</h4>
                                                    <p className="text-sm text-gray-500 font-mono">{subject.code}</p>
                                                </div>
                                                {/* isCompulsory removed */}
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                                                <div>
                                                    <span className="text-xs text-gray-500 uppercase tracking-wide">Board</span>
                                                    <p className="text-sm text-gray-700 font-medium">{subject.board}</p>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-gray-500 uppercase tracking-wide">Level</span>
                                                    <p className="text-sm text-gray-700 font-medium">{subject.level}</p>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-gray-500 uppercase tracking-wide">Field</span>
                                                    <p className="text-sm text-gray-700 font-medium">{subject.field}</p>
                                                </div>
                                            </div>
                                            {subject.syllabus && (
                                                <div className="mt-2">
                                                    <a
                                                        href={subject.syllabus}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
                                                    >
                                                        View Syllabus
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                className="text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-full transition-colors duration-200 text-sm font-medium"
                                                onClick={() => handleEdit(subject)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="text-rose-600 hover:bg-rose-100 px-3 py-1 rounded-full transition-colors duration-200 text-sm font-medium"
                                                onClick={() => handleDelete(subject.uid!)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Subject Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-opacity duration-300 backdrop-blur-sm bg-black bg-opacity-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 relative border border-blue-100 max-h-[80vh] overflow-y-auto animate-fadeIn">
                        <button
                            onClick={resetForm}
                            className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 transition-colors duration-200 text-2xl font-bold"
                            aria-label="Close"
                        >
                            &times;
                        </button>
                        <h2 className="text-2xl font-bold mb-6 text-blue-800 border-b border-blue-100 pb-3">
                            {editingId ? 'Edit Subject' : 'Add New Subject'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="e.g., Mathematics"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject Code *</label>
                                    <input
                                        type="text"
                                        name="code"
                                        value={form.code}
                                        onChange={handleChange}
                                        placeholder="e.g., MATH101"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Board *</label>
                                    <select
                                        name="board"
                                        value={form.board}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                        required
                                    >
                                        <option value="">Select Board</option>
                                        {BOARD_OPTIONS.map(b => (
                                            <option key={b.board} value={b.board}>{b.board}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Level *</label>
                                    <select
                                        name="level"
                                        value={form.level}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                        required
                                    >
                                        <option value="">Select Level</option>
                                        {levelOptions.map(level => (
                                            <option key={level} value={level}>{level}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Field *</label>
                                    <select
                                        name="field"
                                        value={form.field}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                        required
                                    >
                                        <option value="">Select Field</option>
                                        {fieldOptions.map(field => (
                                            <option key={field} value={field}>{field}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                                    <input
                                        type="text"
                                        name="icon"
                                        value={form.icon}
                                        onChange={handleChange}
                                        placeholder="📚 (emoji)"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Syllabus URL</label>
                                    <input
                                        type="url"
                                        name="syllabus"
                                        value={form.syllabus}
                                        onChange={handleChange}
                                        placeholder="https://..."
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                    />
                                </div>
                            </div>
                            {/* isCompulsory removed from form */}
                            {error && (
                                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
                                    <p className="text-rose-600 font-medium text-sm">{error}</p>
                                </div>
                            )}
                            {success && (
                                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                                    <p className="text-emerald-600 font-medium text-sm">{success}</p>
                                </div>
                            )}
                            <div className="flex space-x-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-500 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
                                >
                                    {loading ? (editingId ? 'Updating...' : 'Adding...') : (editingId ? 'Update Subject' : 'Add Subject')}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubjectsTab;