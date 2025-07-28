import { Timestamp } from "firebase/firestore";

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
  subjects: string[];
  createdAt: Timestamp;
}

// Type definitions
export interface Student {
  uid?: string;
  name: string;
  email: string;
  studentId: string;
  enrolledClasses: string[];
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
  teacherId: string;
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

export interface Student {
  uid?: string;
  name: string;
  email: string;
  enrolledClasses: string[];
  rollNumber?: string | number;
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
