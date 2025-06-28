'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Interface definitions
interface Assignment {
  title: string;
  dueDate: string;
}

interface Event {
  title: string;
  time: string;
  teacher?: string;
  isExam?: boolean;
}

interface Exam {
  title: string;
  status: 'upcoming' | 'scheduled' | 'completed';
  description?: string;
}

interface CalendarEvent {
  date: number;
  events: {
    title: string;
    time: string;
    teacher?: string;
    isExam?: boolean;
  }[];
}

export default function DashboardPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const router = useRouter();

  const assignments: Assignment[] = [
    { title: "Mathematics HW", dueDate: "11.8.24" },
    { title: "Physics Assignment", dueDate: "12.8.24" },
    { title: "Chemistry Lab Report", dueDate: "13.8.24" },
    { title: "English Essay", dueDate: "15.8.24" }
  ];

  const todayEvents: Event[] = [
    { title: "Mathematics Class", time: "8:00 am", teacher: "Sir ASJ" },
    { title: "Physics Exam", time: "9:00 am", isExam: true },
    { title: "English Class", time: "10:00 am", teacher: "Sir ASJ" },
    { title: "Chemistry Class", time: "11:00 am", teacher: "Sir ASJ" },
    { title: "Biology Class", time: "12:00 pm", teacher: "Sir ASJ" },
    { title: "Quran Class", time: "1:00 pm", teacher: "Sir ASJ" }
  ];

  const exams: Exam[] = [
    { title: "Terminal Exams", status: "upcoming", description: "Syllabus & Schedule Announced Soon" },
    { title: "October Monthly", status: "scheduled" },
    { title: "September Monthly", status: "completed" },
    { title: "August Monthly", status: "completed" }
  ];

  // Calendar data with events for different dates
  const calendarEvents: CalendarEvent[] = [
    {
      date: 29,
      events: [
        { title: "Mathematics", time: "8:00 AM", teacher: "Sir ASJ" },
        { title: "Physics", time: "9:00 AM", teacher: "Dr. Khan" },
        { title: "English", time: "10:00 AM", teacher: "Ms. Ali" }
      ]
    },
    {
      date: 30,
      events: [
        { title: "Chemistry", time: "8:00 AM", teacher: "Sir Ahmed" },
        { title: "Biology Exam", time: "10:00 AM", isExam: true },
        { title: "Quran", time: "1:00 PM", teacher: "Maulana Sahib" }
      ]
    },
    {
      date: 1,
      events: [
        { title: "Mathematics", time: "8:00 AM", teacher: "Sir ASJ" },
        { title: "Physics Lab", time: "9:30 AM", teacher: "Dr. Khan" },
        { title: "English", time: "11:00 AM", teacher: "Ms. Ali" }
      ]
    },
    {
      date: 2,
      events: [
        { title: "Chemistry", time: "8:00 AM", teacher: "Sir Ahmed" },
        { title: "Biology", time: "9:00 AM", teacher: "Dr. Fatima" },
        { title: "Mathematics Test", time: "10:00 AM", isExam: true }
      ]
    }
  ];

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

  const getEventsForDate = (date: number) => {
    const eventData = calendarEvents.find(ce => ce.date === date);
    return eventData ? eventData.events : [];
  };

  const hasEvents = (date: number) => {
    return calendarEvents.some(ce => ce.date === date);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(month - 1);
    } else {
      newDate.setMonth(month + 1);
    }
    setCurrentDate(newDate);
  };

  const handleLogout = async () => {
    try {
      // Logout logic here
      router.push('/student-portal/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 min-h-screen font-sans">
      {/* Compact Hero Section */}
      <section className="relative h-32 md:h-40 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-blue-800 to-purple-900"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex items-center justify-between w-full max-w-7xl px-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border-3 border-white/90 overflow-hidden shadow-xl backdrop-blur-sm">
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center">
                <span className="text-white text-lg font-bold">S</span>
              </div>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">Welcome Back!</h1>
              <p className="text-white/90 text-sm">Your Learning Dashboard</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-white/20 backdrop-blur-md text-white font-medium rounded-full border border-white/30 hover:bg-white/30 transition-all duration-300 shadow-lg text-sm"
          >
            Sign Out
          </button>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Top Row - Attendance and Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
                <p className="text-white/80 text-sm">This Month</p>
              </div>
              <div className="text-right">
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-bold">9</span>
                  <span className="text-xl font-semibold text-white/80">/10</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg p-4 text-white">
            <h3 className="text-lg font-bold mb-1">Pending Tasks</h3>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{assignments.length}</span>
              <span className="text-sm text-white/80">Assignments Due</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg p-4 text-white">
            <h3 className="text-lg font-bold mb-1">Today&apos;s Classes</h3>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{todayEvents.length}</span>
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
                {assignments.map((assignment, index) => (
                  <div key={index} className="group bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl p-3 hover:shadow-md transition-all duration-300">
                    <h3 className="font-semibold text-gray-800 text-sm mb-1">{assignment.title}</h3>
                    <p className="text-xs text-gray-600 mb-2">Due: {assignment.dueDate}</p>
                    <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg py-1.5 text-xs font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300">
                      View Details
                    </button>
                  </div>
                ))}
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
                    onClick={() => navigateMonth('prev')}
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
                    onClick={() => navigateMonth('next')}
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
                      ${day === today ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-blue-500' : 'bg-white hover:bg-blue-50'}
                      ${hasEvents(day || 0) ? 'ring-1 ring-purple-200' : ''}
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
                        {hasEvents(day) && (
                          <div className="absolute bottom-0.5 left-0.5 right-0.5">
                            <div className="flex gap-0.5 flex-wrap">
                              {getEventsForDate(day).slice(0, 3).map((event, i) => (
                                <div
                                  key={i}
                                  className={`w-1.5 h-1.5 rounded-full ${event.isExam ? 'bg-red-500' : 'bg-purple-500'}`}
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

              {/* Event Details */}
              {hoveredDate && hasEvents(hoveredDate) && (
                <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                  <h4 className="font-bold text-gray-800 mb-2 text-sm flex items-center gap-1">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {monthNames[month]} {hoveredDate}
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {getEventsForDate(hoveredDate).map((event, index) => (
                      <div
                        key={index}
                        className={`
                          p-2 rounded-lg border transition-all duration-200 text-xs
                          ${event.isExam 
                            ? 'bg-red-50 border-red-200 text-red-800' 
                            : 'bg-white border-purple-200 text-gray-800'
                          }
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{event.title}</span>
                          <span className="text-xs opacity-70">{event.time}</span>
                        </div>
                        {event.teacher && (
                          <p className="text-xs opacity-60 mt-1">{event.teacher}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Today's Schedule & Exams */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Schedule */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-4">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                Today&apos;s Classes
              </h2>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {todayEvents.map((event, index) => (
                  <div key={index} className={`
                    p-3 rounded-xl border transition-all duration-200
                    ${event.isExam 
                      ? 'bg-red-50 border-red-200 text-red-800' 
                      : 'bg-white border-gray-200 text-gray-800 hover:border-blue-200'
                    }
                  `}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm">{event.title}</h3>
                      <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {event.time}
                      </span>
                    </div>
                    {event.teacher && (
                      <p className="text-xs text-gray-600 mt-1">{event.teacher}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Compact Exams Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-4">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                Exams
              </h2>
              <div className="grid grid-cols-1 gap-3">
                {exams.map((exam, index) => (
                  <div key={index} className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl p-3 hover:shadow-md transition-all duration-200">
                    <h3 className="font-bold text-gray-800 mb-1 text-sm">{exam.title}</h3>
                    {exam.description && (
                      <p className="text-xs text-gray-600 mb-2">{exam.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      {exam.status === 'completed' && (
                        <>
                          <button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg py-1.5 px-3 text-xs font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200">
                            View Results
                          </button>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ Done
                          </span>
                        </>
                      )}
                      {exam.status === 'scheduled' && (
                        <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg py-1.5 px-3 text-xs font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200">
                          View Schedule
                        </button>
                      )}
                      {exam.status === 'upcoming' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 w-full justify-center">
                          📅 Coming Soon
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}