import { db } from "./config";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  setDoc,
} from "firebase/firestore";

export async function createAssignment(data: {
  title: string;
  description: string;
  dueDate: string;
  teacherId: string;
}) {
  const assignmentsRef = collection(db, "assignments");
  const docRef = await addDoc(assignmentsRef, data);
  return docRef.id;
}

export async function getAssignmentsForTeacher(teacherId: string) {
  const q = query(
    collection(db, "assignments"),
    where("teacherId", "==", teacherId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function getAssignmentsForStudent() {
  // For now, return all assignments. You can filter by class/group if needed.
  const snap = await getDocs(collection(db, "assignments"));
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function submitAssignment(
  assignmentId: string,
  studentId: string,
  submission: { content: string; submittedAt: string }
) {
  const submissionRef = doc(
    db,
    "assignments",
    assignmentId,
    "submissions",
    studentId
  );
  await setDoc(submissionRef, submission);
}

export async function getSubmissions(assignmentId: string) {
  const submissionsRef = collection(
    db,
    "assignments",
    assignmentId,
    "submissions"
  );
  const snap = await getDocs(submissionsRef);
  return snap.docs.map((doc) => ({ studentId: doc.id, ...doc.data() }));
}
