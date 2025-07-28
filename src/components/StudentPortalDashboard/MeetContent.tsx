import type { Class } from '@/firebase/definitions';

interface ClassesTabProps {
  classes: Class[];
}

export default function Meet({ classes }: ClassesTabProps) {
  return (
    <div>
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          My Classes
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {classes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No classes enrolled</p>
            </div>
          ) : (
            classes.map((cls, index) => (
              <div key={cls.uid || `class-${index}`} className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                <h3 className="font-bold text-gray-800 mb-1 text-base">{cls.name || 'Unnamed Class'}</h3>
                <p className="text-xs text-gray-600 mb-2">
                  Students: {cls.students || 0} / {cls.capacity || 'No limit'}
                </p>
                <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg py-1.5 px-3 text-xs font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200">
                  View Class
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}