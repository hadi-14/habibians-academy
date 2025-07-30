// Submit assignment passthrough
export async function submitAssignment(
  assignmentId: string,
  studentId: string,
  studentName: string,
  content: string,
  attachments?: string[]
): Promise<void> {
  const submissionData = {
    assignmentId,
    studentId,
    studentName,
    content,
    attachments: attachments || [],
    submittedAt: Timestamp.now(),
    status: "submitted" as const,
  };
  await addDoc(collection(db, "submissions"), submissionData);
}
// Edit/update functions for students, classes, assignments, etc.
import { db } from "../config";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  Timestamp,
  getDoc,
} from "firebase/firestore";
import type { Teacher, Class, Assignment, Student, Post } from "../definitions";

// Teacher
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

// Class
export async function createClass(classData: Class) {
  const classesRef = collection(db, "classes");
  const docRef = await addDoc(classesRef, {
    ...classData,
    createdAt: new Date(),
  });
  await updateDoc(docRef, { uid: docRef.id });
  return { ...classData, uid: docRef.id };
}
export async function updateClass(classId: string, data: Partial<Class>) {
  await updateDoc(doc(db, "classes", classId), data);
}
export async function deleteClass(classId: string) {
  await deleteDoc(doc(db, "classes", classId));
}

// Assignment
export async function createAssignment(data: Assignment) {
  return await addDoc(collection(db, "assignments"), {
    ...data,
    material: data.material || "",
    createdAt: serverTimestamp(),
  });
}
export async function updateAssignment(
  assignmentId: string,
  data: Partial<Assignment>
) {
  await updateDoc(doc(db, "assignments", assignmentId), {
    ...data,
    material: data.material || "",
  });
}
export async function deleteAssignment(assignmentId: string) {
  await deleteDoc(doc(db, "assignments", assignmentId));
}

// Student
export async function updateStudentProfile(
  uid: string,
  data: Partial<Student>
): Promise<void> {
  const docRef = doc(db, "students", uid);
  await updateDoc(docRef, data);
}

// Submission
export async function gradeSubmission(
  submissionId: string,
  grade: number,
  feedback: string
) {
  await updateDoc(doc(db, "submissions", submissionId), { grade, feedback });
}

// Enrollment
export async function enrollInClass(
  studentId: string,
  classId: string
): Promise<void> {
  // Update student's enrolled classes
  const studentRef = doc(db, "students", studentId);
  const studentDoc = await getDoc(studentRef);
  if (studentDoc.exists()) {
    const currentClasses = studentDoc.data().enrolledClasses || [];
    if (!currentClasses.includes(classId)) {
      await updateDoc(studentRef, {
        enrolledClasses: [...currentClasses, classId],
      });
    }
  }
  // Update class's students list
  const classRef = doc(db, "classes", classId);
  const classDoc = await getDoc(classRef);
  if (classDoc.exists()) {
    const currentStudents = classDoc.data().students || [];
    if (!currentStudents.includes(studentId)) {
      await updateDoc(classRef, {
        students: [...currentStudents, studentId],
      });
    }
  }
}
export async function unenrollFromClass(
  studentId: string,
  classId: string
): Promise<void> {
  // Update student's enrolled classes
  const studentRef = doc(db, "students", studentId);
  const studentDoc = await getDoc(studentRef);
  if (studentDoc.exists()) {
    const currentClasses = studentDoc.data().enrolledClasses || [];
    await updateDoc(studentRef, {
      enrolledClasses: currentClasses.filter((id: string) => id !== classId),
    });
  }
  // Update class's students list
  const classRef = doc(db, "classes", classId);
  const classDoc = await getDoc(classRef);
  if (classDoc.exists()) {
    const currentStudents = classDoc.data().students || [];
    await updateDoc(classRef, {
      students: currentStudents.filter((id: string) => id !== studentId),
    });
  }
}

// Attendance
export async function updateStudentAttendance(
  studentId: string,
  presentDays: number,
  totalDays: number
): Promise<void> {
  const studentRef = doc(db, "students", studentId);
  await updateDoc(studentRef, {
    attendance: {
      presentDays,
      totalDays,
    },
  });
}

// Post
export async function createPost(data: Omit<Post, "uid" | "createdAt">) {
  return await addDoc(collection(db, "posts"), {
    ...data,
    createdAt: serverTimestamp(),
  });
}
