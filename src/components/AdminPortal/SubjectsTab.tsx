import React, { useEffect, useState } from 'react';
import { Subject } from '@/firebase/definitions';
import { getAllSubjects, createSubject, updateSubject, deleteSubject } from '@/firebase/functions/subjectFunctions';

// Update defaultForm to use string[] for field
const defaultForm: Omit<Subject, 'uid'> & { levelName?: string; yearNo?: number } = {
    name: '',
    code: '',
    board: '',
    field: [''], // string array, initialized with empty string
    syllabus: '',
    level: '',
    year: 0,
    levelName: '',
    yearNo: 0,
};

const BOARD_OPTIONS: {
    board: string;
    levels: Record<string, number>;
    fields: string[];
}[] = [
        {
            board: 'AKU-EB',
            levels: { 'HSSC Part 1': 1, 'HSSC Part 2': 2 },
            fields: ['Compulsory', 'Pre-Medical', 'Pre-Engineering', 'Commerce', 'Other'],
        },
        {
            board: 'Cambridge',
            levels: { 'A Level': 1, 'AS Level': 2 },
            fields: ['Science', 'Languages', 'Humanities', 'Commerce', 'Other'],
        },
        {
            board: 'IB',
            levels: { 'IBDP': 1, 'MYP': 2, 'PYP': 3 },
            fields: ['Science', 'Languages', 'Humanities', 'Arts', 'Technology', 'Other'],
        },
        {
            board: 'Karachi Board',
            levels: { 'Matric': 1, 'Intermediate': 2 },
            fields: ['Science', 'Commerce', 'Humanities', 'Other'],
        },
        {
            board: 'Inter',
            levels: { 'FSc': 1, 'FA': 2, 'ICom': 3, 'ICS': 4 },
            fields: ['Pre-Medical', 'Pre-Engineering', 'Commerce', 'Arts', 'Computer Science', 'Other'],
        },
        {
            board: 'Other',
            levels: { 'Foundation': 1, 'Higher': 2, 'Other': 3 },
            fields: ['Science', 'Mathematics', 'Languages', 'Humanities', 'Arts', 'Technology', 'Social Sciences', 'Other'],
        },
    ];

const SubjectsTab: React.FC = () => {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [form, setForm] = useState<Omit<Subject, 'uid'> & { levelName?: string; yearNo?: number }>(defaultForm);
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

    // Get dynamic options for selected board
    const selectedBoard = BOARD_OPTIONS.find(b => b.board === form.board);
    const levelOptions: Record<string, number> = selectedBoard ? selectedBoard.levels : {};
    const fieldOptions = selectedBoard ? selectedBoard.fields : [];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        let fieldValue: string | boolean | number | string[] = value;
        if (type === 'checkbox') {
            fieldValue = (e.target as HTMLInputElement).checked;
        } else if (type === 'number') {
            fieldValue = parseInt(value) || 0;
        }
        // Special handling for level selection
        if (name === 'levelName') {
            const yearNo = levelOptions[value] || 0;
            setForm(prev => ({
                ...prev,
                levelName: value,
                level: value,
                year: yearNo,
                yearNo: yearNo,
            }));
        } else {
            setForm(prev => ({
                ...prev,
                [name]: fieldValue,
            }));
        }
    };

    // Handle field selection (checkbox-based multi-select)
    const handleFieldChange = (fieldValue: string, checked: boolean) => {
        setForm(prev => {
            const currentFields: string[] = Array.isArray(prev.field) ? prev.field : [prev.field as string];
            let newFields: string[];
            
            if (checked) {
                // Add field if not present
                if (!currentFields.includes(fieldValue)) {
                    newFields = [...currentFields.filter(f => f), fieldValue];
                } else {
                    newFields = currentFields;
                }
            } else {
                // Remove field
                newFields = currentFields.filter(f => f !== fieldValue);
                // Ensure at least one element (empty string if none selected)
                if (newFields.length === 0) {
                    newFields = [''];
                }
            }
            
            return {
                ...prev,
                field: newFields,
            };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Ensure required fields are not empty
            const validFields = Array.isArray(form.field) ? form.field.filter(f => f) : [];
            if (!form.levelName || !form.board || validFields.length === 0 || !form.name) {
                setError('Please fill in all required fields and select at least one field');
                setLoading(false);
                return;
            }

            // Create subject data with proper types
            const subjectData: Omit<Subject, 'uid'> = {
                name: form.name,
                board: form.board,
                field: validFields,
                syllabus: form.syllabus,
                level: form.levelName,
                year: levelOptions[form.levelName] || 0,
                ...(form.code ? { code: form.code } : {}),
            };

            if (editingId) {
                await updateSubject(editingId, subjectData);
                setSuccess('Subject updated successfully!');
            } else {
                await createSubject(subjectData);
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
        setForm({
            ...subject,
            levelName: subject.level,
            yearNo: subject.year,
        });
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
        .filter(s => !filterField || (
            Array.isArray(s.field)
                ? s.field.includes(filterField)
                : s.field === filterField
        ))
        .sort((a, b) => {
            let cmp = 0;
            if (sortBy === 'name') {
                cmp = (a.name ?? '').localeCompare(b.name ?? '');
            } else if (sortBy === 'code') {
                cmp = (a.code ?? '').localeCompare(b.code ?? '');
            }
            return sortOrder === 'asc' ? cmp : -cmp;
        });

    // Unique filter options - handle both array and string fields for backward compatibility
    const allBoards = Array.from(new Set(subjects.map(s => s.board)));
    const allLevels = Array.from(new Set(subjects.map(s => s.level)));
    const allFields = Array.from(new Set(
        subjects.flatMap(s => Array.isArray(s.field) ? s.field : [s.field as string])
    )).filter(f => f);

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-6">
            {/* Subject Management Header - More Compact */}
            <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-indigo-100 mb-6">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
                    <h2 className="text-xl font-bold">Subject Management</h2>
                    <p className="text-blue-100 text-sm mt-1">Manage academic subjects and their details</p>
                </div>
                <div className="p-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        {/* Add Subject Button */}
                        <button
                            className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-500 transition-colors duration-200 shadow-md text-sm"
                            onClick={() => setShowAddModal(true)}
                        >
                            + Add Subject
                        </button>

                        {/* Compact Stats */}
                        <div className="flex items-center gap-6 text-sm">
                            <div className="text-center">
                                <div className="text-lg font-bold text-blue-600">{subjects.length}</div>
                                <div className="text-xs text-gray-600">Total Subjects</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-indigo-600">{allBoards.length}</div>
                                <div className="text-xs text-gray-600">Boards</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-purple-600">{allFields.length}</div>
                                <div className="text-xs text-gray-600">Fields</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success/Error Messages - More Compact */}
            {success && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4">
                    <p className="text-emerald-600 font-medium text-sm">{success}</p>
                </div>
            )}
            {error && (
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 mb-4">
                    <p className="text-rose-600 font-medium text-sm">{error}</p>
                </div>
            )}

            {/* Subjects Filters & List - More Compact */}
            <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-indigo-100">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
                    <h3 className="text-lg font-bold">All Subjects ({filteredSubjects.length})</h3>
                </div>
                <div className="p-4">
                    {/* Compact Filters & Sorting Controls */}
                    <div className="flex flex-wrap gap-2 mb-4 items-center text-sm">
                        <select value={filterBoard} onChange={e => setFilterBoard(e.target.value)} className="border rounded px-2 py-1 text-xs">
                            <option value="">All Boards</option>
                            {allBoards.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                        <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)} className="border rounded px-2 py-1 text-xs">
                            <option value="">All Levels</option>
                            {allLevels.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                        <select value={filterField} onChange={e => setFilterField(e.target.value)} className="border rounded px-2 py-1 text-xs">
                            <option value="">All Fields</option>
                            {allFields.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                        <select value={sortBy} onChange={e => setSortBy(e.target.value as 'name' | 'code')} className="border rounded px-2 py-1 text-xs">
                            <option value="name">Sort by Name</option>
                            <option value="code">Sort by Code</option>
                        </select>
                        <select value={sortOrder} onChange={e => setSortOrder(e.target.value as 'asc' | 'desc')} className="border rounded px-2 py-1 text-xs">
                            <option value="asc">↑ Asc</option>
                            <option value="desc">↓ Desc</option>
                        </select>
                        {(filterBoard || filterLevel || filterField) && (
                            <button className="text-xs text-blue-600 underline hover:text-blue-800" onClick={() => { setFilterBoard(''); setFilterLevel(''); setFilterField(''); }}>Clear</button>
                        )}
                    </div>

                    {/* Compact Subjects List */}
                    {filteredSubjects.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <p className="text-gray-500">No subjects found</p>
                            <p className="text-gray-400 text-sm">Create your first subject to get started</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredSubjects.map(subject => (
                                <div key={subject.uid} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors duration-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-gray-800 truncate">{subject.name}</h4>
                                                    {subject.code && (
                                                        <p className="text-xs text-gray-500 font-mono">{subject.code}</p>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 text-xs text-gray-600">
                                                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">{subject.board}</span>
                                                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded font-medium">{subject.level}</span>
                                                    {typeof subject.year === 'number' && subject.year > 0 && (
                                                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded font-medium">Year {subject.year}</span>
                                                    )}
                                                    <div className="flex flex-wrap gap-1">
                                                        {(Array.isArray(subject.field) ? subject.field : [subject.field as string]).filter(f => f).map((field, index) => (
                                                            <span key={index} className="bg-purple-100 text-purple-700 px-2 py-1 rounded font-medium">{field}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                {subject.syllabus && (
                                                    <a
                                                        href={subject.syllabus}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-800 text-xs underline flex-shrink-0"
                                                    >
                                                        Syllabus
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 ml-3">
                                            <button
                                                className="text-blue-600 hover:bg-blue-100 px-2 py-1 rounded text-xs font-medium transition-colors duration-200"
                                                onClick={() => handleEdit(subject)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="text-rose-600 hover:bg-rose-100 px-2 py-1 rounded text-xs font-medium transition-colors duration-200"
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
                        <div className="space-y-4">
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject Code</label>
                                    <input
                                        type="text"
                                        name="code"
                                        value={form.code}
                                        onChange={handleChange}
                                        placeholder="e.g., MATH101"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
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
                                        name="levelName"
                                        value={form.levelName || ''}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                        required
                                        disabled={!form.board}
                                    >
                                        <option value="">Select Level</option>
                                        {Object.keys(levelOptions).map(level => (
                                            <option key={level} value={level}>{level}</option>
                                        ))}
                                    </select>
                                    {form.levelName && levelOptions[form.levelName] && (
                                        <div className="mt-1 text-xs text-gray-500">
                                            Year No: {levelOptions[form.levelName]}
                                        </div>
                                    )}
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Fields * (Select multiple)</label>
                                    <div className="grid grid-cols-2 gap-2 p-4 border border-gray-200 rounded-xl bg-gray-50 max-h-40 overflow-y-auto">
                                        {fieldOptions.map(field => (
                                            <label key={field} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-2 rounded">
                                                <input
                                                    type="checkbox"
                                                    checked={Array.isArray(form.field) ? form.field.includes(field) : form.field === field}
                                                    onChange={(e) => handleFieldChange(field, e.target.checked)}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-gray-700">{field}</span>
                                            </label>
                                        ))}
                                    </div>
                                    {Array.isArray(form.field) && form.field.filter(f => f).length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            {form.field.filter(f => f).map((field, index) => (
                                                <span key={index} className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-medium">
                                                    {field}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    {!form.board && (
                                        <p className="text-xs text-gray-500 mt-1">Please select a board first to see available fields</p>
                                    )}
                                </div>
                                <div className="md:col-span-2">
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
                                    type="button"
                                    onClick={handleSubmit}
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
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubjectsTab;