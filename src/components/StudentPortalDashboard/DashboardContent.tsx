import { useState } from 'react';
import type { Assignment, Class, Student, Meeting } from '@/firebase/definitions';
import { Timestamp } from 'firebase/firestore';

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
  assignments,
  classes,
  todayMeetings,
  calendarMeetings,
  attendance,
  teacherNames,
  currentDate,
  onNavigateMonth
}: DashboardTabProps) {
  const [hoveredDate, setHoveredDate] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

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

  // Helper function to format meeting time
  const formatMeetingTime = (time: Timestamp | string | Date) => {
    try {
      if (!time) return 'No time set';

      let date: Date;
      if (time instanceof Timestamp) {
        date = time.toDate();
      } else if (typeof time === 'string') {
        date = new Date(time);
      } else if (time instanceof Date) {
        date = time;
      } else {
        return 'Invalid time';
      }

      if (isNaN(date.getTime())) return 'Invalid time';

      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Invalid time';
    }
  };

  // Get pending assignments count
  const pendingAssignments = assignments.filter(a =>
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
    const meetingData = calendarMeetings.find(cm => cm.date === date);
    return meetingData ? meetingData.meetings : [];
  };

  const hasMeetings = (date: number) => {
    return calendarMeetings.some(cm => cm.date === date);
  };

  return (
    <div>
      {/* Top Row - Attendance and Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Attendance Card */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-4 text-white">
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
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg p-4 text-white">
          <h3 className="text-lg font-bold mb-1">Pending Tasks</h3>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{pendingAssignments}</span>
            <span className="text-sm text-white/80">Assignments Due</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg p-4 text-white">
          <h3 className="text-lg font-bold mb-1">My Classes</h3>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{classes.length}</span>
            <span className="text-sm text-white/80">Enrolled</span>
          </div>
        </div>

        {/* Meetings Stat */}
        <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl shadow-lg p-4 text-white">
          <h3 className="text-lg font-bold mb-1">Today&apos;s Meetings</h3>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{todayMeetings.length}</span>
            <span className="text-sm text-white/80">Scheduled</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left Column - Assignments */}
        <div className="lg:col-span-1">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-4">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              Assignments
            </h2>
            <div className="space-y-3">
              {assignments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No assignments found</p>
                </div>
              ) : (
                assignments.slice(0, 4).map((assignment) => (
                  <div key={assignment.uid || `assignment-${Math.random()}`} className="group bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl p-3 hover:shadow-md transition-all duration-300">
                    <h3 className="font-semibold text-gray-800 text-sm mb-1">{assignment.title || 'Untitled Assignment'}</h3>
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

        {/* Middle Column - Calendar */}
        <div className="lg:col-span-2">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-4">
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
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
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
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
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
                <div key={day} className="text-center font-medium text-gray-600 py-1 text-xs">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  className={`
                    relative h-10 rounded-lg transition-all duration-200 cursor-pointer text-xs
                    ${day === null ? '' : 'border border-gray-200 hover:border-blue-300'}
                    ${day === today && month === new Date().getMonth() && year === new Date().getFullYear()
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-blue-500'
                      : 'bg-white hover:bg-blue-50'}
                    ${hasMeetings(day || 0) ? 'ring-1 ring-purple-200' : ''}
                    ${hoveredDate === day ? 'scale-105 shadow-md z-10' : ''}
                  `}
                  onMouseEnter={() => day && setHoveredDate(day)}
                  onMouseLeave={() => setHoveredDate(null)}
                  onClick={() => day && setSelectedDate(selectedDate === day ? null : day)}
                >
                  {day && (
                    <>
                      <div className="absolute top-1 left-1 font-medium text-xs">
                        {day}
                      </div>
                      {hasMeetings(day) && (
                        <div className="absolute bottom-0.5 left-0.5 right-0.5">
                          <div className="flex gap-0.5 flex-wrap">
                            {getMeetingsForDate(day).slice(0, 3).map((meeting, i) => (
                              <div
                                key={i}
                                className="w-1.5 h-1.5 rounded-full bg-purple-500"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Meeting Details */}
            {hoveredDate && hasMeetings(hoveredDate) && (
              <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                <h4 className="font-bold text-gray-800 mb-2 text-sm flex items-center gap-1">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {monthNames[month]} {hoveredDate}
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {getMeetingsForDate(hoveredDate).map((meeting, index) => (
                    <div
                      key={meeting.uid || `meeting-${index}`}
                      className="p-2 rounded-lg border transition-all duration-200 text-xs bg-white border-purple-200 text-gray-800"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{meeting.title || 'Untitled Meeting'}</span>
                        <span className="text-xs opacity-70">
                          {formatMeetingTime(meeting.time)}
                        </span>
                      </div>
                      {(meeting.CreatedBy && teacherNames[meeting.CreatedBy]) && (
                        <p className="text-xs opacity-60 mt-1">{teacherNames[meeting.CreatedBy]}</p>
                      )}
                      {meeting.link && (
                        <a href={meeting.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline mt-1 block">
                          Join Meeting
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Today's Meetings & Classes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Meetings */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-4">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A2 2 0 0021 6.382V5a2 2 0 00-2-2H5a2 2 0 00-2 2v1.382a2 2 0 001.447 1.342L9 10m6 0v10m-6-10v10m6 0H9" />
                </svg>
              </div>
              Today&apos;s Meetings
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {todayMeetings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No meetings scheduled for today</p>
                </div>
              ) : (
                todayMeetings.map((meeting, index) => (
                  <div key={meeting.uid || `today-meeting-${index}`} className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl p-3 hover:shadow-md transition-all duration-200">
                    <h3 className="font-bold text-gray-800 mb-1 text-sm">{meeting.title || 'Untitled Meeting'}</h3>
                    <p className="text-xs text-gray-600 mb-2">Time: {formatMeetingTime(meeting.time)}</p>
                    <p className="text-xs text-gray-600 mb-2">Teacher: {teacherNames[meeting.CreatedBy] || meeting.CreatedBy || 'Unknown'}</p>
                    {meeting.link && (
                      <a href={meeting.link} target="_blank" rel="noopener noreferrer" className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg py-1.5 px-3 text-xs font-medium hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 block text-center mb-2">
                        Join Meeting
                      </a>
                    )}
                    {meeting.description && (
                      <p className="text-xs text-gray-500 mt-1">{meeting.description}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Enrolled Classes */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-4">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              My Classes
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {classes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No classes enrolled</p>
                </div>
              ) : (
                classes.slice(0, 3).map((cls, index) => (
                  <div key={cls.uid || `class-${index}`} className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl p-3 hover:shadow-md transition-all duration-200">
                    <h3 className="font-bold text-gray-800 mb-1 text-sm">{cls.name || 'Unnamed Class'}</h3>
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
      </div>
    </div>
  );
}