import { ReactNode } from "react";
import { Key } from "readline";
import { db } from "./config";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

// Type definitions
export interface Teacher {
  uid: string;
  name: string;
  email: string;
  subjects: string[];
  createdAt?: Date;
}

export interface Class {
  subject: ReactNode;
  schedule: ReactNode;
  room: ReactNode;
  avgGrade: ReactNode;
  id: Key | null | undefined;
  capacity: string;
  students: number;
  name: string;
  createdAt?: Date;
  // Add other fields as needed
}

export interface Assignment {
  classId: string | number | readonly string[] | undefined;
  dueTime: string | number | readonly string[] | undefined;
  assignmentType: string | number | readonly string[] | undefined;
  classCapacity: string | undefined;
  status: string;
  submissions: ReactNode;
  totalStudents: ReactNode;
  id?: string;
  teacherId: string;
  title: string;
  subject: string;
  class: string;
  dueDate: string;
  priority: "low" | "medium" | "high";
  material?: string;
  description?: string;
  points?: number;
  createdAt?: Date;
  // Add other fields as needed
}

export interface Submission {
  id?: string;
  assignmentId: string;
  studentId: string;
  grade?: number;
  feedback?: string;
  // Add other fields as needed
}

export interface Announcement {
  id?: string;
  classId: string;
  title: string;
  message: string;
  createdAt?: Date;
  // Add other fields as needed
}

export interface Student {
  id?: string;
  name: string;
  email: string;
  enrolledClasses: string[];
  // Add other fields as needed
}

// TEACHER PROFILE
export async function createTeacherProfile(
  uid: string,
  data: Omit<Teacher, "uid">
) {
  await setDoc(
    doc(db, "teachers", uid),
    { ...data, createdAt: serverTimestamp() },
    { merge: true }
  );
}

export async function getTeacherProfile(uid: string): Promise<Teacher | null> {
  const ref = doc(db, "teachers", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  if (
    typeof data.name === "string" &&
    typeof data.email === "string" &&
    Array.isArray(data.subjects)
  ) {
    return {
      uid,
      name: data.name,
      email: data.email,
      subjects: data.subjects,
    };
  }
  return null;
}

// CLASSES
export async function createClass(data: Class) {
  return await addDoc(collection(db, "classes"), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export function listenToTeacherClasses(
  teacherId: string,
  cb: (classes: Class[]) => void
) {
  const q = query(
    collection(db, "classes"),
    where("teacherIdList", "array-contains", teacherId),
    orderBy("createdAt")
  );
  return onSnapshot(q, (snap) =>
    cb(
      snap.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as unknown as Class)
      )
    )
  );
}

export async function updateClass(classId: string, data: Partial<Class>) {
  await updateDoc(doc(db, "classes", classId), data);
}

export async function deleteClass(classId: string) {
  await deleteDoc(doc(db, "classes", classId));
}

// ASSIGNMENTS
export async function createAssignment(data: Assignment) {
  return await addDoc(collection(db, "assignments"), {
    ...data,
    material: data.material || "", // Add material field
    createdAt: serverTimestamp(),
  });
}

export function listenToTeacherAssignments(
  teacherId: string,
  cb: (assignments: Assignment[]) => void
) {
  const q = query(
    collection(db, "assignments"),
    where("teacherId", "==", teacherId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) =>
    cb(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Assignment)))
  );
}

export async function updateAssignment(
  assignmentId: string,
  data: Partial<Assignment>
) {
  await updateDoc(doc(db, "assignments", assignmentId), {
    ...data,
    material: data.material || "", // Ensure material is updated
  });
}

export async function deleteAssignment(assignmentId: string) {
  await deleteDoc(doc(db, "assignments", assignmentId));
}

// STUDENTS
export async function getStudentsByClass(classId: string): Promise<Student[]> {
  const q = query(
    collection(db, "students"),
    where("enrolledClasses", "array-contains", classId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Student));
}

// SUBMISSIONS
export function listenToAssignmentSubmissions(
  assignmentId: string,
  cb: (subs: Submission[]) => void
) {
  const q = query(
    collection(db, "submissions"),
    where("assignmentId", "==", assignmentId)
  );
  return onSnapshot(q, (snap) =>
    cb(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Submission)))
  );
}

export async function gradeSubmission(
  submissionId: string,
  grade: number,
  feedback: string
) {
  await updateDoc(doc(db, "submissions", submissionId), { grade, feedback });
}

// ANNOUNCEMENTS
export async function createAnnouncement(data: Announcement) {
  return await addDoc(collection(db, "announcements"), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export function listenToClassAnnouncements(
  classId: string,
  cb: (ann: Announcement[]) => void
) {
  const q = query(
    collection(db, "announcements"),
    where("classId", "==", classId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) =>
    cb(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Announcement)))
  );
}
