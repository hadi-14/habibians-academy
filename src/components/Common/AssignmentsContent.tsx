import type { Assignment, Submission } from '@/firebase/definitions';
import { Timestamp } from 'firebase/firestore';
import { useState, useMemo } from 'react';
import { onSubmitAssignment as defaultOnSubmitAssignment } from '@/firebase/functions';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

interface AssignmentsTabProps {
  assignments: Assignment[];
  userRole?: 'student' | 'teacher';
  currentUserId?: string;
  onSubmitAssignment?: (assignmentId: string, submission: Partial<Submission>) => Promise<void>;
  onUpdateAssignment?: (assignmentId: string, updates: Partial<Assignment>) => Promise<void>;
  onCreateAssignment?: (assignment: Partial<Assignment>) => Promise<void>;
}

export default function AssignmentsTab({
  assignments,
  userRole = 'student',
  currentUserId,
  onSubmitAssignment = defaultOnSubmitAssignment,
  onUpdateAssignment,
  onCreateAssignment
}: AssignmentsTabProps) {
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [submissionContent, setSubmissionContent] = useState('');
  const [submissionFiles, setSubmissionFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Edit form state
  const [editForm, setEditForm] = useState({
    title: '',
    subject: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    points: '',
    material: ''
  });

  // Create form state
  const [createForm, setCreateForm] = useState({
    title: '',
    subject: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    points: '',
    material: ''
  });

  // Add upload progress state for create/edit forms
  const [createMaterialFile, setCreateMaterialFile] = useState<File | null>(null);
  const [editMaterialFile, setEditMaterialFile] = useState<File | null>(null);

  const isOverdue = (dueDate: Timestamp | string | Date) => {
    try {
      let date: Date;
      if (dueDate instanceof Timestamp) {
        date = dueDate.toDate();
      } else if (typeof dueDate === 'string') {
        date = new Date(dueDate);
      } else if (dueDate instanceof Date) {
        date = dueDate;
      } else {
        return false;
      }
      return date < new Date();
    } catch {
      return false;
    }
  };

  // Filter and search assignments
  const filteredAssignments = useMemo(() => {
    return assignments.filter(assignment => {
      const matchesSearch = searchQuery === '' ||
        assignment.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPriority = filterPriority === 'all' || assignment.priority === filterPriority;

      const assignmentStatus = isOverdue(assignment.dueDate) && assignment.status === 'pending' ? 'overdue' : assignment.status || 'pending';
      const matchesStatus = filterStatus === 'all' || assignmentStatus === filterStatus;

      return matchesSearch && matchesPriority && matchesStatus;
    });
  }, [assignments, searchQuery, filterPriority, filterStatus]);

  // Helper function to format dates properly
  const formatDueDate = (dueDate: Timestamp | string | Date) => {
    try {
      if (!dueDate) return 'No due date';

      let date: Date;
      if (dueDate instanceof Timestamp) {
        date = dueDate.toDate();
      } else if (typeof dueDate === 'string') {
        date = new Date(dueDate);
      } else if (dueDate instanceof Date) {
        date = dueDate;
      } else {
        return 'Invalid date';
      }

      if (isNaN(date.getTime())) return 'Invalid date';

      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  // Format date for input field
  const formatDateForInput = (dueDate: Timestamp | string | Date) => {
    try {
      if (!dueDate) return '';

      let date: Date;
      if (dueDate instanceof Timestamp) {
        date = dueDate.toDate();
      } else if (typeof dueDate === 'string') {
        date = new Date(dueDate);
      } else if (dueDate instanceof Date) {
        date = dueDate;
      } else {
        return '';
      }

      if (isNaN(date.getTime())) return '';

      return date.toISOString().slice(0, 16); // Format for datetime-local input
    } catch (error) {
      console.error('Error formatting date for input:', error);
      return '';
    }
  };

  // Helper function to check if material is a Firebase Storage URL

  // Helper function to extract filename from Firebase Storage URL
  const getFilenameFromUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const segments = pathname.split('/');
      const filename = segments[segments.length - 1];
      return decodeURIComponent(filename.split('?')[0]);
    } catch {
      return 'Download File';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'graded':
        return 'bg-green-100 text-green-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleViewDetails = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setEditForm({
      title: assignment.title || '',
      subject: assignment.subject || '',
      description: assignment.description || '',
      dueDate: formatDateForInput(assignment.dueDate),
      priority: assignment.priority || 'medium',
      points: assignment.points?.toString() || '',
      material: assignment.material || ''
    });
    setIsEditModalOpen(true);
  };

  const handleCreateAssignment = async () => {
    if (!onCreateAssignment) return;

    setIsCreating(true);
    try {
      let materialUrl = '';
      if (createMaterialFile) {
        materialUrl = await uploadMaterialFile(createMaterialFile);
      }

      const newAssignment: Partial<Assignment> = {
        title: createForm.title,
        subject: createForm.subject,
        description: createForm.description,
        dueDate: createForm.dueDate ? Timestamp.fromDate(new Date(createForm.dueDate)) : undefined,
        priority: createForm.priority as 'low' | 'medium' | 'high',
        points: createForm.points ? parseInt(createForm.points) : undefined,
        material: materialUrl,
        status: 'pending',
        createdBy: currentUserId,
        createdAt: Timestamp.now()
      };

      await onCreateAssignment(newAssignment);

      // Reset form
      setCreateForm({
        title: '',
        subject: '',
        description: '',
        dueDate: '',
        priority: 'medium',
        points: '',
        material: ''
      });
      setCreateMaterialFile(null);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating assignment:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditMaterialUpload = async (file: File) => {
    setEditMaterialFile(file);
    try {
      const url = await uploadMaterialFile(file);
      setEditForm(prev => ({ ...prev, material: url }));
    } catch (error) {
      console.error('Material upload failed:', error);
    }
  };

  const handleCreateMaterialUpload = async (file: File) => {
    setCreateMaterialFile(file);
    try {
      const url = await uploadMaterialFile(file);
      setCreateForm(prev => ({ ...prev, material: url }));
    } catch (error) {
      console.error('Material upload failed:', error);
    }
  };

  const handleUpdateAssignment = async () => {
    if (!selectedAssignment || !onUpdateAssignment) return;

    setIsUpdating(true);
    try {
      let materialUrl = editForm.material;
      if (editMaterialFile) {
        materialUrl = await uploadMaterialFile(editMaterialFile);
      }

      const updates: Partial<Assignment> = {
        title: editForm.title,
        subject: editForm.subject,
        description: editForm.description,
        dueDate: editForm.dueDate ? Timestamp.fromDate(new Date(editForm.dueDate)) : selectedAssignment.dueDate,
        priority: editForm.priority as 'low' | 'medium' | 'high',
        points: editForm.points ? parseInt(editForm.points) : undefined,
        material: materialUrl
      };

      await onUpdateAssignment(selectedAssignment.uid!, updates);

      setIsEditModalOpen(false);
      setSelectedAssignment(null);
      setEditMaterialFile(null);
    } catch (error) {
      console.error('Error updating assignment:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSubmitAssignment = async () => {
    if (!selectedAssignment || !onSubmitAssignment || !currentUserId) return;

    setIsSubmitting(true);
    try {
      const submission: Partial<Submission> = {
        assignmentId: selectedAssignment.uid!,
        studentId: currentUserId,
        content: submissionContent,
        submittedAt: Timestamp.now(),
        status: 'submitted'
      };

      await onSubmitAssignment(selectedAssignment.uid!, submission);

      // Reset form
      setSubmissionContent('');
      setSubmissionFiles([]);
      setIsSubmissionModalOpen(false);
      setSelectedAssignment(null);
    } catch (error) {
      console.error('Error submitting assignment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSubmissionFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSubmissionFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getSubmissionButtonText = (assignment: Assignment) => {
    if (assignment.status === 'submitted') {
      return 'Submit Again';
    }
    return 'Submit';
  };

  const getSubmissionButtonColor = (assignment: Assignment) => {
    if (assignment.status === 'submitted') {
      return 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700';
    }
    return 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700';
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterPriority('all');
    setFilterStatus('all');
  };

  // Helper to upload file to Firebase Storage and get URL
  const uploadMaterialFile = async (file: File): Promise<string> => {
    const storage = getStorage();
    const storageRef = ref(storage, `assignment-materials/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (error) => reject(error),
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(url);
        }
      );
    });
  };

  return (
    <div>
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            Assignments ({filteredAssignments.length})
          </h2>

          {userRole === 'teacher' && onCreateAssignment && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg px-4 py-2 font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Create Assignment
            </button>
          )}
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assignments by title, subject, or description..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Priority:</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="all">All</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Status:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="submitted">Submitted</option>
                <option value="graded">Graded</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            {(searchQuery || filterPriority !== 'all' || filterStatus !== 'all') && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                Clear Filters
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {filteredAssignments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm">
                {assignments.length === 0 ? 'No assignments found' : 'No assignments match your search criteria'}
              </p>
              {assignments.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2">
                  Clear filters to see all assignments
                </button>
              )}
            </div>
          ) : (
            filteredAssignments.map((assignment) => (
              <div key={assignment.uid || `assignment-${Math.random()}`}
                className="group bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300">

                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 text-base mb-1">
                      {assignment.title || 'Untitled Assignment'}
                    </h3>
                    <p className="text-xs text-gray-600 mb-1">Subject: {assignment.subject || 'No subject'}</p>
                    <p className="text-xs text-gray-600 mb-2">Due: {formatDueDate(assignment.dueDate)}</p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(assignment.priority)}`}>
                      {assignment.priority} priority
                    </span>
                    {assignment.points && (
                      <span className="text-xs text-gray-500">{assignment.points} pts</span>
                    )}
                  </div>
                </div>

                {assignment.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{assignment.description}</p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewDetails(assignment)}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg px-3 py-1.5 text-xs font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300">
                      View Details
                    </button>

                    {userRole === 'teacher' && (
                      <button
                        onClick={() => handleEditAssignment(assignment)}
                        className="bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg px-3 py-1.5 text-xs font-medium hover:from-purple-700 hover:to-violet-700 transition-all duration-300">
                        Edit
                      </button>
                    )}

                    {userRole === 'student' && assignment.status !== 'graded' && (
                      <button
                        onClick={() => {
                          setSelectedAssignment(assignment);
                          setIsSubmissionModalOpen(true);
                        }}
                        className={`text-white rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-300 ${getSubmissionButtonColor(assignment)}`}>
                        {getSubmissionButtonText(assignment)}
                        {assignment.status === 'submitted' && (
                          <span className="ml-1 text-xs opacity-75">(overwrite)</span>
                        )}
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      isOverdue(assignment.dueDate) && assignment.status === 'pending' ? 'overdue' : assignment.status || 'pending'
                    )}`}>
                      {isOverdue(assignment.dueDate) && assignment.status === 'pending' ? 'overdue' : assignment.status || 'pending'}
                    </span>

                    {userRole === 'teacher' && (
                      <span className="text-xs text-gray-500">
                        {assignment.submissions || 0} submissions
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Assignment Details Modal */}
      {selectedAssignment && !isSubmissionModalOpen && !isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">{selectedAssignment.title}</h3>
                <button
                  onClick={() => setSelectedAssignment(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Subject</label>
                  <p className="text-gray-800">{selectedAssignment.subject}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Due Date</label>
                  <p className="text-gray-800">{formatDueDate(selectedAssignment.dueDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Priority</label>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(selectedAssignment.priority)}`}>
                    {selectedAssignment.priority}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Points</label>
                  <p className="text-gray-800">{selectedAssignment.points || 'Not specified'}</p>
                </div>
              </div>

              {selectedAssignment.description && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Description</label>
                  <p className="text-gray-800 mt-1">{selectedAssignment.description}</p>
                </div>
              )}

              {selectedAssignment.material && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Materials</label>
                  <div className="mt-1">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">
                          {getFilenameFromUrl(selectedAssignment.material)}
                        </p>
                        <p className="text-xs text-gray-500">Assignment Material</p>
                      </div>
                      <a
                        href={selectedAssignment.material}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setSelectedAssignment(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
                Close
              </button>
              {userRole === 'teacher' && (
                <button
                  onClick={() => handleEditAssignment(selectedAssignment)}
                  className="bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg px-4 py-2 font-medium hover:from-purple-700 hover:to-violet-700 transition-all duration-300">
                  Edit Assignment
                </button>
              )}
              {userRole === 'student' && selectedAssignment.status !== 'graded' && (
                <button
                  onClick={() => setIsSubmissionModalOpen(true)}
                  className={`text-white rounded-lg px-4 py-2 font-medium transition-all duration-300 ${getSubmissionButtonColor(selectedAssignment)}`}>
                  {getSubmissionButtonText(selectedAssignment)}
                  {selectedAssignment.status === 'submitted' && (
                    <span className="ml-1 text-sm opacity-75">(overwrite)</span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Assignment Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">Create New Assignment</h3>
                <button
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setCreateForm({
                      title: '',
                      subject: '',
                      description: '',
                      dueDate: '',
                      priority: 'medium',
                      points: '',
                      material: ''
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={createForm.title}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                  <input
                    type="text"
                    value={createForm.subject}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                  <input
                    type="datetime-local"
                    value={createForm.dueDate}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={createForm.priority}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Points</label>
                  <input
                    type="number"
                    value={createForm.points}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, points: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Materials</label>
                <input
                  type="file"
                  accept="*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      await handleCreateMaterialUpload(file);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                {createMaterialFile && (
                  <div className="mt-2 flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-sm text-green-700">{createMaterialFile.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setCreateMaterialFile(null);
                        setCreateForm(prev => ({ ...prev, material: '' }));
                      }}
                      className="text-red-500 hover:text-red-700 transition-colors text-xs"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setCreateForm({
                    title: '',
                    subject: '',
                    description: '',
                    dueDate: '',
                    priority: 'medium',
                    points: '',
                    material: ''
                  });
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleCreateAssignment}
                disabled={!createForm.title.trim() || !createForm.subject.trim() || isCreating}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg px-4 py-2 font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                {isCreating ? 'Creating...' : 'Create Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Assignment Modal */}
      {isEditModalOpen && selectedAssignment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">Edit Assignment</h3>
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedAssignment(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                  <input
                    type="text"
                    value={editForm.subject}
                    onChange={(e) => setEditForm(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                  <input
                    type="datetime-local"
                    value={editForm.dueDate}
                    onChange={(e) => setEditForm(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={editForm.priority}
                    onChange={(e) => setEditForm(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Points</label>
                  <input
                    type="number"
                    value={editForm.points}
                    onChange={(e) => setEditForm(prev => ({ ...prev, points: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Materials</label>
                <input
                  type="file"
                  accept="*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      await handleEditMaterialUpload(file);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {editMaterialFile && (
                  <div className="mt-2 flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-sm text-green-700">{editMaterialFile.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditMaterialFile(null);
                        setEditForm(prev => ({ ...prev, material: '' }));
                      }}
                      className="text-red-500 hover:text-red-700 transition-colors text-xs"
                    >
                      Remove
                    </button>
                  </div>
                )}
                {editForm.material && !editMaterialFile && (
                  <div className="mt-2 flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <span className="text-sm text-blue-700">File uploaded</span>
                    <a
                      href={editForm.material}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 text-white px-2 py-1 rounded text-xs"
                    >
                      Download
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedAssignment(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleUpdateAssignment}
                disabled={!editForm.title.trim() || !editForm.subject.trim() || isUpdating}
                className="bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg px-4 py-2 font-medium hover:from-purple-700 hover:to-violet-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                {isUpdating ? 'Updating...' : 'Update Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submission Modal */}
      {isSubmissionModalOpen && selectedAssignment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {selectedAssignment.status === 'submitted' ? 'Resubmit' : 'Submit'}: {selectedAssignment.title}
                  </h3>
                  {selectedAssignment.status === 'submitted' && (
                    <p className="text-sm text-orange-600 mt-1">
                      Warning: This will overwrite your previous submission
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setIsSubmissionModalOpen(false);
                    setSubmissionContent('');
                    setSubmissionFiles([]);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Submission Content *
                </label>
                <textarea
                  value={submissionContent}
                  onChange={(e) => setSubmissionContent(e.target.value)}
                  placeholder="Enter your assignment submission here..."
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachments (Optional)
                </label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                {submissionFiles.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {submissionFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                        <span className="text-sm text-gray-600">{file.name}</span>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsSubmissionModalOpen(false);
                  setSubmissionContent('');
                  setSubmissionFiles([]);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSubmitAssignment}
                disabled={!submissionContent.trim() || isSubmitting}
                className={`text-white rounded-lg px-4 py-2 font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${getSubmissionButtonColor(selectedAssignment)}`}>
                {isSubmitting ?
                  (selectedAssignment.status === 'submitted' ? 'Resubmitting...' : 'Submitting...') :
                  (selectedAssignment.status === 'submitted' ? 'Resubmit Assignment' : 'Submit Assignment')
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}