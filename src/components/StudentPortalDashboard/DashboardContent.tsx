import { Student, Assignment, Class, Meeting } from '@/firebase/definitions';
import { Timestamp } from 'firebase/firestore';
import { useState } from 'react';

interface DashboardTabProps {
  student: Student;
  assignments: Assignment[];
  classes: Class[];
  todayMeetings: Meeting[];
  calendarMeetings: { date: number, meetings: Meeting[] }[];
  attendance: { present: number, total: number };
  teacherNames: { [id: string]: string };
  currentDate: Date;
  onNavigateMonth: (direction: 'prev' | 'next') => void;
}

export default function DashboardTab({
  assignments = [],
  classes = [],
  todayMeetings = [],
  calendarMeetings = [],
  attendance = { present: 85, total: 100 },
  teacherNames = {},
  currentDate = new Date(),
  onNavigateMonth = () => { }
}: Partial<DashboardTabProps>) {
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  // Use only props for data
  const displayAssignments = assignments;
  const displayClasses = classes;
  const displayTodayMeetings = todayMeetings;
  const displayCalendarMeetings = calendarMeetings;

  // Helper function to format dates properly
  const formatTime = (timestamp: Timestamp) => {
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

  // Get pending assignments count
  const pendingAssignments = displayAssignments.filter(a =>
    a.status === 'pending' || a.status === 'assigned' || a.status === 'active'
  ).length;

  // Get current month info
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date().getDate();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Generate calendar days
  const calendarDays = [];

  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarDays.push(null);
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const getMeetingsForDate = (date: number) => {
    const meetingData = displayCalendarMeetings.find(cm => cm.date === date);
    return meetingData ? meetingData.meetings : [];
  };

  const hasMeetings = (date: number) => {
    return displayCalendarMeetings.some(cm => cm.date === date);
  };

  const handleDateClick = (day: number) => {
    if (hasMeetings(day)) {
      setSelectedDate(selectedDate === day ? null : day);
    }
  };

  const handleJoinMeeting = (link: string) => {
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      {/* Top Row - Attendance and Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Attendance Card */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-4 text-white transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                Attendance
              </h3>
              <p className="text-white/90 text-sm">This Month</p>
            </div>
            <div className="text-right">
              <div className="flex items-end gap-1">
                <span className="text-3xl font-bold">{attendance.present}</span>
                <span className="text-xl font-semibold text-white/80">/{attendance.total || '0'}</span>
              </div>
              <div className="text-xs text-white/70 mt-1">
                {Math.round((attendance.present / (attendance.total || 1)) * 100)}%
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg p-4 text-white transform hover:scale-105 transition-all duration-300">
          <h3 className="text-lg font-bold mb-1">Pending Tasks</h3>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{pendingAssignments}</span>
            <span className="text-sm text-white/80">Assignments Due</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg p-4 text-white transform hover:scale-105 transition-all duration-300">
          <h3 className="text-lg font-bold mb-1">My Classes</h3>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{displayClasses.length}</span>
            <span className="text-sm text-white/80">Enrolled</span>
          </div>
        </div>

        {/* Meetings Stat */}
        <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl shadow-lg p-4 text-white transform hover:scale-105 transition-all duration-300">
          <h3 className="text-lg font-bold mb-1">Today&apos;s Meetings</h3>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{displayTodayMeetings.length}</span>
            <span className="text-sm text-white/80">Scheduled</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left Column - Assignments */}
        <div className="lg:col-span-1">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-4">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              Assignments
            </h2>
            <div className="space-y-3">
              {displayAssignments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No assignments found</p>
                </div>
              ) : (
                displayAssignments.slice(0, 4).map((assignment) => (
                  <div key={assignment.uid} className="group bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl p-3 hover:shadow-lg hover:border-blue-300 transition-all duration-300">
                    <h3 className="font-semibold text-gray-800 text-sm mb-1">{assignment.title}</h3>
                    <p className="text-xs text-gray-600 mb-1">Subject: {assignment.subject}</p>
                    <p className="text-xs text-gray-600 mb-2">Due: {formatTime(assignment.dueDate)}</p>
                    <div className="flex items-center gap-2">
                      <button className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg py-1.5 text-xs font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105">
                        View Details
                      </button>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${assignment.status === 'completed' || assignment.status === 'graded'
                          ? 'bg-green-100 text-green-800'
                          : assignment.status === 'submitted'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {assignment.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Middle Column - Calendar */}
        <div className="lg:col-span-2">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                Schedule
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigateMonth('prev')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors hover:scale-110"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h3 className="text-sm font-semibold text-gray-700 min-w-[120px] text-center">
                  {monthNames[month]} {year}
                </h3>
                <button
                  onClick={() => onNavigateMonth('next')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors hover:scale-110"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map(day => (
                <div key={day} className="text-center font-medium text-gray-600 py-2 text-xs">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 mb-4">
              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  className={`
                    relative h-12 rounded-lg transition-all duration-200 cursor-pointer text-xs flex flex-col items-center justify-center
                    ${day === null ? '' : 'border border-gray-200 hover:border-blue-300'}
                    ${day === today && month === new Date().getMonth() && year === new Date().getFullYear()
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-blue-500 font-bold'
                      : 'bg-white hover:bg-blue-50'}
                    ${hasMeetings(day || 0) ? 'ring-2 ring-purple-300 bg-purple-50' : ''}
                    ${hasMeetings(day || 0) ? 'hover:scale-105 hover:shadow-md' : ''}
                  `}
                  onClick={() => day && handleDateClick(day)}
                >
                  {day && (
                    <>
                      <div className="font-medium text-sm">
                        {day}
                      </div>
                      {hasMeetings(day) && (
                        <div className="flex gap-1 mt-1">
                          {getMeetingsForDate(day).slice(0, 3).map((_, i) => (
                            <div
                              key={i}
                              className={`w-1.5 h-1.5 rounded-full ${selectedDate === day ? 'bg-blue-600' : 'bg-purple-500'
                                }`}
                            />
                          ))}
                          {getMeetingsForDate(day).length > 3 && (
                            <div className="text-xs text-purple-600 font-bold">+</div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Selected Date Meeting Details - Persistent */}
            {selectedDate && hasMeetings(selectedDate) && (
              <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-300 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {monthNames[month]} {selectedDate} - Meetings
                  </h4>
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="p-1 hover:bg-white/50 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-3">
                  {getMeetingsForDate(selectedDate).map((meeting, index) => (
                    <div
                      key={meeting.uid || `meeting-${index}`}
                      className="p-3 rounded-lg border bg-white border-purple-200 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-800 text-sm">{meeting.title}</h5>
                          <p className="text-xs text-gray-600 mt-1">
                            <span className="inline-flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {formatTime(meeting.time)}
                            </span>
                          </p>
                          {meeting.CreatedBy && teacherNames[meeting.CreatedBy] && (
                            <p className="text-xs text-gray-600 mt-1">
                              <span className="inline-flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                {teacherNames[meeting.CreatedBy]}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                      {meeting.description && (
                        <p className="text-xs text-gray-600 mb-3 bg-gray-50 p-2 rounded">{meeting.description}</p>
                      )}
                      {meeting.link && (
                        <button
                          onClick={() => handleJoinMeeting(meeting.link!)}
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg py-2 px-3 text-sm font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A2 2 0 0021 6.382V5a2 2 0 00-2-2H5a2 2 0 00-2 2v1.382a2 2 0 001.447 1.342L9 10m6 0v10m-6-10v10m6 0H9" />
                          </svg>
                          Join Meeting
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hint text */}
            <div className="text-xs text-gray-500 text-center mt-2 flex items-center justify-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Click on dates with dots to view meeting details
            </div>
          </div>
        </div>

        {/* Right Column - Today's Meetings & Classes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Meetings */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-4">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A2 2 0 0021 6.382V5a2 2 0 00-2-2H5a2 2 0 00-2 2v1.382a2 2 0 001.447 1.342L9 10m6 0v10m-6-10v10m6 0H9" />
                </svg>
              </div>
              Today&apos;s Meetings
            </h2>
            <div className="space-y-3">
              {displayTodayMeetings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm">No meetings scheduled for today</p>
                </div>
              ) : (
                displayTodayMeetings.map((meeting) => (
                  <div key={meeting.uid} className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-blue-300 transition-all duration-300">
                    <h3 className="font-bold text-gray-800 mb-2 text-sm">{meeting.title}</h3>
                    <div className="space-y-1 mb-3">
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatTime(meeting.time)}
                      </p>
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {teacherNames[meeting.CreatedBy] || meeting.CreatedBy || 'Unknown'}
                      </p>
                    </div>
                    {meeting.description && (
                      <p className="text-xs text-gray-500 mb-3 bg-gray-50 p-2 rounded">{meeting.description}</p>
                    )}
                    {meeting.link && (
                      <button
                        onClick={() => handleJoinMeeting(meeting.link!)}
                        className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg py-2 px-3 text-sm font-medium hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A2 2 0 0021 6.382V5a2 2 0 00-2-2H5a2 2 0 00-2 2v1.382a2 2 0 001.447 1.342L9 10m6 0v10m-6-10v10m6 0H9" />
                        </svg>
                        Join Meeting
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Enrolled Classes */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-4">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              My Classes
            </h2>
            <div className="space-y-3">
              {displayClasses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <p className="text-sm">No classes enrolled</p>
                </div>
              ) : (
                displayClasses.slice(0, 3).map((cls) => (
                  <div key={cls.uid} className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-green-300 transition-all duration-300">
                    <h3 className="font-bold text-gray-800 mb-2 text-sm">{cls.name}</h3>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {cls.students} / {cls.capacity} Students
                      </p>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((Number(cls.students) / Number(cls.capacity || 1)) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg py-2 px-3 text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 hover:scale-105">
                      View Class
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Floating Button */}
      <div className="fixed bottom-6 right-6">
        <button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group">
          <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  );
}