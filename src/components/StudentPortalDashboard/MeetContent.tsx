import type { Class } from '@/firebase/definitions';
import type { Meeting } from '@/firebase/definitions';
import { Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { getMeetings } from '@/firebase/functions';
import { db } from '@/firebase/config';

interface ClassesTabProps {
  classes: Class[];
}

export default function Meet({ classes }: ClassesTabProps) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMeetings() {
      setLoading(true);
      try {
        const data = await getMeetings(db);
        setMeetings(data);
      } finally {
        setLoading(false);
      }
    }
    fetchMeetings();
  }, []);

  // Get class IDs for filtering meetings
  const classIds = classes.map(cls => cls.uid);

  // Filter upcoming meetings for these classes
  const now = Timestamp.now();
  const upcomingMeetings = meetings
    .filter(m => classIds.includes(m.classId) && m.time > now)
    .sort((a, b) => a.time.toMillis() - b.time.toMillis());

  // Helper function to format time
  const formatMeetingTime = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Tomorrow at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays <= 7) {
      return `${date.toLocaleDateString([], { weekday: 'long' })} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleString([], { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  // Helper function to get time until meeting
  const getTimeUntil = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    } else if (diffMinutes > 0) {
      return `in ${diffMinutes} min${diffMinutes > 1 ? 's' : ''}`;
    } else {
      return 'starting soon';
    }
  };

  return (
    <div>
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
        {/* Upcoming Meetings Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg text-gray-800">Upcoming Meetings</h3>
            {!loading && upcomingMeetings.length > 0 && (
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                {upcomingMeetings.length}
              </span>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    </div>
                    <div className="h-8 w-16 bg-gray-300 rounded-lg"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : upcomingMeetings.length === 0 ? (
            <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm font-medium mb-1">No upcoming meetings</p>
              <p className="text-gray-400 text-xs">Your next meetings will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingMeetings.map((meeting, index) => {
                const isFirst = index === 0;
                const timeUntil = getTimeUntil(meeting.time);
                const isUrgent = meeting.time.toMillis() - Date.now() < 60 * 60 * 1000; // Less than 1 hour
                
                return (
                  <div 
                    key={meeting.uid} 
                    className={`group relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                      isFirst 
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-md' 
                        : 'bg-white border border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {isFirst && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                    )}
                    
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900 truncate">
                              {meeting.title || 'No Subject'}
                            </h4>
                            {isFirst && (
                              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                                Next
                              </span>
                            )}
                            {isUrgent && (
                              <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full animate-pulse">
                                Soon
                              </span>
                            )}
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="font-medium">{formatMeetingTime(meeting.time)}</span>
                            </div>
                            
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{timeUntil}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <a
                            href={meeting.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                              isFirst
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg'
                                : 'bg-green-500 hover:bg-green-600 text-white shadow-sm hover:shadow-md'
                            }`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Join
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}