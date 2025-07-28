'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/firebase/config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { getStudentProfile, listenToStudentAssignments, listenToStudentClasses, getMeetings } from '@/firebase/functions';
import type { Assignment as FirebaseAssignment, Class as FirebaseClass, Student as FirebaseStudent, Meeting } from '@/firebase/definitions';
import { db } from '@/firebase/config';
import { getDoc, doc } from "firebase/firestore";
import AssignmentsTab from '@/components/StudentPortalDashboard/AssignmentsContent';
import DashboardTab from '@/components/StudentPortalDashboard/DashboardContent';
import { HeroSection } from '@/components/Common/HeroSection';
import { NavigationTabs } from '@/components/Common/NavigationTabs';
import { BookOpen, FileText, Megaphone, Settings } from 'lucide-react';
import React from 'react';
import { StreamContent } from '@/components/Common/StreamContent';
import { SettingsContent } from '@/components/Common/SettingsContent';


export default function DashboardPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [student, setStudent] = useState<FirebaseStudent | undefined>(undefined);
  const [assignments, setAssignments] = useState<FirebaseAssignment[]>([]);
  const [classes, setClasses] = useState<FirebaseClass[]>([]);
  const [todayMeetings, setTodayMeetings] = useState<Meeting[]>([]);
  const [calendarMeetings, setCalendarMeetings] = useState<{ date: number, meetings: Meeting[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState({ present: 0, total: 0 });
  const [isClient, setIsClient] = useState(false);
  const [teacherNames, setTeacherNames] = useState<{ [id: string]: string }>({});
  const [activeTab, setActiveTab] = useState('dashboard');
  const router = useRouter();

  // Ensure we're on client side for hydration safety
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Auth and student profile
  useEffect(() => {
    if (!isClient) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        router.push('/student-portal/login');
        return;
      }

      try {
        const profile = await getStudentProfile(user.uid);
        if (!profile) {
          setLoading(false);
          router.push('/student-portal/login');
          return;
        }
        setStudent(profile);

        // Calculate attendance from profile data if available
        if (profile.attendance) {
          const totalDays = profile.attendance.totalDays || 0;
          const presentDays = profile.attendance.presentDays || 0;
          setAttendance({ present: presentDays, total: totalDays });
        }
      } catch (error) {
        console.error('Error loading student profile:', error);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [isClient, router]);

  // Load assignments and classes from Firebase
  useEffect(() => {
    if (!student?.uid) return;

    setLoading(true);

    // Listen to student's assignments
    const unsubAssignments = listenToStudentAssignments(student.uid, (firebaseAssignments: FirebaseAssignment[]) => {
      setAssignments(firebaseAssignments);
      setLoading(false);
    });

    // Listen to student's classes
    const unsubClasses = listenToStudentClasses(student.uid, (firebaseClasses: FirebaseClass[]) => {
      setClasses(firebaseClasses);
      setLoading(false);
    });

    return () => {
      unsubAssignments();
      unsubClasses();
    };
  }, [student?.uid]);

  // Fetch meetings from Firestore and organize by date
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const allMeetings = await getMeetings(db);
        const today = new Date();

        // Filter today's meetings
        const filtered = allMeetings.filter(m => {
          if (!m.time || typeof m.time !== 'object' || !m.time.toDate) return false;
          const mt = m.time.toDate();
          return mt.getFullYear() === today.getFullYear() &&
            mt.getMonth() === today.getMonth() &&
            mt.getDate() === today.getDate();
        });
        setTodayMeetings(filtered);

        // Organize meetings by calendar date for current month
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        const meetingsByDate: { [date: number]: Meeting[] } = {};

        allMeetings.forEach(meeting => {
          if (meeting.time && typeof meeting.time === 'object' && meeting.time.toDate) {
            const meetingDate = meeting.time.toDate();
            if (meetingDate.getMonth() === currentMonth && meetingDate.getFullYear() === currentYear) {
              const day = meetingDate.getDate();
              if (!meetingsByDate[day]) {
                meetingsByDate[day] = [];
              }
              meetingsByDate[day].push(meeting);
            }
          }
        });

        // Convert to array format for calendar
        const calendarData = Object.entries(meetingsByDate).map(([date, meetings]) => ({
          date: parseInt(date),
          meetings
        }));
        setCalendarMeetings(calendarData);
      } catch (error) {
        console.error('Error fetching meetings:', error);
        setTodayMeetings([]);
        setCalendarMeetings([]);
      }
    };

    fetchMeetings();
  }, [currentDate]); // Re-fetch when month changes

  const fetchTeacherName = useCallback(async (teacherId: string) => {
    if (!teacherId || teacherNames[teacherId]) return;
    try {
      const teacherDoc = await getDoc(doc(db, "teachers", teacherId));
      if (teacherDoc.exists()) {
        const data = teacherDoc.data();
        setTeacherNames(prev => ({ ...prev, [teacherId]: data.name || teacherId }));
      } else {
        setTeacherNames(prev => ({ ...prev, [teacherId]: teacherId }));
      }
    } catch {
      setTeacherNames(prev => ({ ...prev, [teacherId]: teacherId }));
    }
  }, [teacherNames]);

  // Fetch teacher names for today's meetings
  useEffect(() => {
    todayMeetings.forEach(meeting => {
      if (meeting.CreatedBy) fetchTeacherName(meeting.CreatedBy);
    });
  }, [todayMeetings, fetchTeacherName]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    const month = currentDate.getMonth();
    if (direction === 'prev') {
      newDate.setMonth(month - 1);
    } else {
      newDate.setMonth(month + 1);
    }
    setCurrentDate(newDate);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/student-portal/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const tabs = React.useMemo(() => [
    { key: 'dashboard', label: 'Dashboard', icon: <BookOpen className="w-5 h-5 inline mr-2" /> },
    { key: 'assignments', label: 'Assignments', icon: <FileText className="w-5 h-5 inline mr-2" />, badge: assignments.length },
    { key: 'stream', label: 'Stream', icon: <Megaphone className="w-5 h-5 inline mr-2" /> },
    { key: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5 inline mr-2" /> },
  ], [assignments.length]);

  useEffect(() => {
    if (!isClient) return; // Wait for client-side hydration

    const hash = window.location.hash.slice(1);
    const validTabs = tabs.map(tab => tab.key);

    if (hash && validTabs.includes(hash)) {
      setActiveTab(hash);
    }
  }, [isClient, tabs]);


  // Loading state
  if (loading || !student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Add a setSuccess handler (for demonstration, using alert; replace with your own logic as needed)
  const setSuccess = (msg: string) => {
    alert(msg);
  };

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 min-h-screen font-sans">
      {/* Compact Hero Section */}
      <HeroSection user={student} onLogout={handleLogout} />
      {/* Tabs Navigation */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <NavigationTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tabs={tabs}
        />
      </div>

      {/* Tab Panels */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        {activeTab === 'dashboard' && (
          <DashboardTab
            student={student}
            assignments={assignments}
            classes={classes}
            todayMeetings={todayMeetings}
            calendarMeetings={calendarMeetings}
            attendance={attendance}
            teacherNames={teacherNames}
            currentDate={currentDate}
            onNavigateMonth={navigateMonth}
          />
        )}

        {activeTab === 'assignments' && (
          <AssignmentsTab
            assignments={assignments}
          />
        )}

        {activeTab === 'stream' && (
          <StreamContent user={student} classes={classes} setSuccess={setSuccess} />
        )}

        {activeTab === 'settings' && (
          <SettingsContent user={student} /> // Use student as teacher prop for now
        )}
      </div>
    </div>
  );
}