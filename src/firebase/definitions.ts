import { Timestamp } from "firebase/firestore";
// Subject type for subject management
export interface Subject {
  uid?: string; // Firestore doc id
  name: string;
  code: string;
  board: string;
  level: string;
  field: string;
  syllabus: string;
  icon?: string;
}

export interface Question {
  id: string;
  fullName: string;
  contactNumber: string;
  email: string;
  question: string;
  answer?: string;
  status: "new" | "in-progress" | "resolved" | "closed";
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
}

export interface Post {
  uid?: string;
  classId: string;
  title: string;
  message: string;
  type: "announcement" | "general";
  createdAt?: Timestamp;
  teacherId: string;
}

// Type definitions
export interface Teacher {
  uid?: string;
  name: string;
  email: string;
  phone: string;
  subjects: string[];
  photoURL?: string;
  createdAt: Timestamp;
}

// Type definitions
export interface Student {
  phone: string;
  photoURL: string;
  uid?: string;
  name: string;
  email: string;
  enrolledClasses: string[];
  rollNumber?: string | number;
  attendance?: {
    totalDays: number;
    presentDays: number;
  };
  createdAt: Timestamp;
}

export interface Class {
  uid?: string; // Add uid to interface
  name: string;
  capacity: string | number;
  students: number;
  teacherIdList: string[];
  createdAt?: Timestamp;
}

export interface Assignment {
  uid?: string;
  classId: string | number | readonly string[] | undefined;
  dueTime: string | number | readonly string[] | undefined;
  assignmentType: string | number | readonly string[] | undefined;
  status: string;
  submissions: number;
  createdBy: string;
  title: string;
  subject: string;
  dueDate: Timestamp;
  priority: "low" | "medium" | "high";
  material?: string;
  description?: string;
  points?: number;
  createdAt?: Timestamp;
}

export interface Submission {
  uid?: string;
  assignmentId: string;
  studentId: string;
  content: string;
  attachments?: string[];
  submittedAt: Timestamp;
  grade?: number;
  feedback?: string;
  status: "submitted" | "graded";
}

export interface Meeting {
  uid?: string;
  title: string;
  link: string;
  time: Timestamp;
  classId: string;
  description?: string;
  createdAt?: Timestamp;
  CreatedBy: string;
}

interface PersonalInfo {
  name: string;
  email: string;
  phoneNo: string;
  gender: string;
}

interface ProgramPreferences {
  desiredClass: string;
  stream: string;
  careerGoals: string;
  reasonForJoining: string;
}

export interface AdmissionEntry {
  id: string;
  personalInfo: PersonalInfo;
  applicationStatus: "pending" | "approved" | "rejected";
  applicationDate: {
    seconds: number;
    nanoseconds: number;
  };
  programPreferences: ProgramPreferences;
  documents?: {
    profilePicture?: string;
    characterCertificate?: string;
    previousMarksheets?: string[];
  };
}
