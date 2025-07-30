// Listen/subscribe functions for real-time updates
import { db } from "../config";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
} from "firebase/firestore";
import type {
  Class,
  Assignment,
  Student,
  Submission,
  Post,
} from "../definitions";

export function listenToClassPosts(
  classId: string,
  cb: (posts: Post[]) => void
) {
  const q = query(
    collection(db, "posts"),
    where("classId", "==", classId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) =>
    cb(snap.docs.map((doc) => ({ uid: doc.id, ...doc.data() } as Post)))
  );
}

export function listenToTeacherClasses(
  teacherId: string,
  cb: (classes: Class[]) => void
) {
  const q = query(
    collection(db, "classes"),
    where("teacherIdList", "array-contains", teacherId),
    orderBy("name")
  );
  return onSnapshot(q, (snap) =>
    cb(snap.docs.map((doc) => ({ uid: doc.id, ...doc.data() } as Class)))
  );
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
    cb(snap.docs.map((doc) => ({ uid: doc.id, ...doc.data() } as Assignment)))
  );
}

export function listenToAssignmentSubmissions(
  assignmentId: string,
  cb: (subs: Submission[]) => void
) {
  const q = query(
    collection(db, "submissions"),
    where("assignmentId", "==", assignmentId)
  );
  return onSnapshot(q, (snap) =>
    cb(snap.docs.map((doc) => ({ uid: doc.id, ...doc.data() } as Submission)))
  );
}

export function listenToStudentAssignments(
  studentId: string,
  callback: (assignments: Assignment[]) => void
): () => void {
  const studentRef = doc(db, "students", studentId);
  return onSnapshot(studentRef, async (studentDoc) => {
    if (!studentDoc.exists()) {
      callback([]);
      return;
    }
    const studentData = studentDoc.data() as Student;
    const enrolledClasses = studentData.enrolledClasses || [];
    if (enrolledClasses.length === 0) {
      callback([]);
      return;
    }
    const assignmentsQuery = query(
      collection(db, "assignments"),
      where("classId", "in", enrolledClasses),
      orderBy("dueDate", "asc")
    );
    return onSnapshot(assignmentsQuery, (snapshot) => {
      const assignments = snapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      })) as Assignment[];
      callback(assignments);
    });
  });
}

export function listenToStudentClasses(
  studentId: string,
  callback: (classes: Class[]) => void
): () => void {
  const studentRef = doc(db, "students", studentId);
  return onSnapshot(studentRef, async (studentDoc) => {
    if (!studentDoc.exists()) {
      callback([]);
      return;
    }
    const studentData = studentDoc.data() as Student;
    const enrolledClasses = studentData.enrolledClasses || [];
    if (enrolledClasses.length === 0) {
      callback([]);
      return;
    }
    const classesQuery = query(
      collection(db, "classes"),
      where("__name__", "in", enrolledClasses)
    );
    return onSnapshot(classesQuery, (snapshot) => {
      const classes = snapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      })) as Class[];
      callback(classes);
    });
  });
}
