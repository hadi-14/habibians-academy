export * from "./functions/subjectFunctions";
// Main functions file now delegates to split files for fetch, edit, and listen logic
export * from "./functions/fetchFunctions";
export * from "./functions/editFunctions";
export * from "./functions/listenFunctions";
// Handler and glue functions below (if any)
// Handler and glue functions

import { getStudentProfile } from "./functions/fetchFunctions";
import {
  createAssignment,
  updateAssignment,
  submitAssignment,
} from "./functions/editFunctions";
import type { Assignment, Submission } from "./definitions";
import {
  getFirestore,
  doc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  getCountFromServer,
  getDoc,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

export const onSubmitAssignment = async (
  assignmentId: string,
  submission: Partial<Submission>
): Promise<void> => {
  if (!submission.studentId || !submission.content) {
    throw new Error("Missing studentId or content in submission");
  }
  const studentProfile = await getStudentProfile(submission.studentId);
  const studentName = studentProfile?.name || "Unknown Student";
  await submitAssignment(
    assignmentId,
    submission.studentId,
    studentName,
    submission.content,
    []
  );
};

export const onCreateAssignment = async (
  assignment: Partial<Assignment>
): Promise<void> => {
  const requiredFields: Array<keyof Assignment> = [
    "title",
    "subject",
    "dueDate",
    "createdBy",
  ];
  const missingFields = requiredFields.filter((field) => !assignment[field]);
  if (missingFields.length > 0) {
    throw new Error(
      `Missing required assignment field(s): ${missingFields.join(", ")}`
    );
  }
  const assignmentData: Assignment = {
    ...assignment,
    status: assignment.status || "pending",
    material: assignment.material || "",
    createdAt: assignment.createdAt || new Date(),
  } as Assignment;
  await createAssignment(assignmentData);
};

export const onUpdateAssignment = async (
  assignmentId: string,
  updates: Partial<Assignment>
): Promise<void> => {
  await updateAssignment(assignmentId, updates);
};

// Grade a submission (updates grade, feedback, and status)
export async function onGradeSubmission(
  submissionId: string,
  grade: number,
  feedback: string
): Promise<void> {
  const db = getFirestore();
  const submissionRef = doc(db, "submissions", submissionId);
  await updateDoc(submissionRef, {
    grade,
    feedback,
    status: "graded",
  });
}

// Get all submissions for an assignment
export async function onGetSubmissions(
  assignmentId: string
): Promise<Submission[]> {
  const db = getFirestore();
  const submissionsRef = collection(db, "submissions");
  const q = query(submissionsRef, where("assignmentId", "==", assignmentId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (docSnap) =>
      ({
        uid: docSnap.id,
        ...docSnap.data(),
      } as Submission)
  );
}

// Get student name by id
export async function getStudentNameById(studentId: string): Promise<string> {
  const db = getFirestore();
  const studentDoc = await getDoc(doc(db, "students", studentId));
  if (studentDoc.exists()) {
    return studentDoc.data().name || studentId;
  }
  return studentId;
}

// Get all submissions for a student
export async function getStudentSubmissions(
  studentId: string
): Promise<Submission[]> {
  const db = getFirestore();
  const submissionsRef = collection(db, "submissions");
  const q = query(submissionsRef, where("studentId", "==", studentId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (docSnap) =>
      ({
        uid: docSnap.id,
        ...docSnap.data(),
      } as Submission)
  );
}

// Get submission counts for a list of assignments
export async function getAssignmentSubmissionCounts(
  assignments: Assignment[]
): Promise<Record<string, number>> {
  const db = getFirestore();
  const counts: Record<string, number> = {};
  await Promise.all(
    assignments.map(async (assignment) => {
      if (!assignment.uid) return;
      const submissionsRef = collection(db, "submissions");
      const q = query(
        submissionsRef,
        where("assignmentId", "==", assignment.uid)
      );
      try {
        const snapshot = await getCountFromServer(q);
        counts[assignment.uid] = snapshot.data().count || 0;
      } catch {
        counts[assignment.uid] = 0;
      }
    })
  );
  return counts;
}

// Upload material file to Firebase Storage and return URL
export async function uploadMaterialFile(file: File): Promise<string> {
  const storage = getStorage();
  const storageRef = ref(
    storage,
    `assignment-materials/${Date.now()}_${file.name}`
  );
  const uploadTask = uploadBytesResumable(storageRef, file);
  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (error) => reject(error),
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(url);
      }
    );
  });
}
