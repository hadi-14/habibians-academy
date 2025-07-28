import type { Assignment } from '@/firebase/definitions';
import { Timestamp } from 'firebase/firestore';

interface AssignmentsTabProps {
  assignments: Assignment[];
}

export default function AssignmentsTab({ assignments }: AssignmentsTabProps) {
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
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  return (
    <div>
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          Assignments
        </h2>
        <div className="space-y-4">
          {assignments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No assignments found</p>
            </div>
          ) : (
            assignments.map((assignment) => (
              <div key={assignment.uid || `assignment-${Math.random()}`} className="group bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300">
                <h3 className="font-semibold text-gray-800 text-base mb-1">{assignment.title || 'Untitled Assignment'}</h3>
                <p className="text-xs text-gray-600 mb-1">Subject: {assignment.subject || 'No subject'}</p>
                <p className="text-xs text-gray-600 mb-2">Due: {formatDueDate(assignment.dueDate)}</p>
                <div className="flex items-center gap-2">
                  <button className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg py-1.5 text-xs font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300">
                    View Details
                  </button>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${assignment.status === 'completed' || assignment.status === 'graded'
                    ? 'bg-green-100 text-green-800'
                    : assignment.status === 'submitted'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {assignment.status || 'pending'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}