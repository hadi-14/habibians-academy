import { db } from "../config";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  query,
} from "firebase/firestore";
import type { Subject } from "../definitions";

const SUBJECTS_COLLECTION = "subjects";

export async function createSubject(
  subject: Omit<Subject, "id">
): Promise<string> {
  const docRef = await addDoc(collection(db, SUBJECTS_COLLECTION), subject);
  return docRef.id;
}

export async function getAllSubjects(): Promise<Subject[]> {
  const q = query(collection(db, SUBJECTS_COLLECTION), orderBy("order", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (docSnap) => ({ uid: docSnap.id, ...docSnap.data() } as Subject)
  );
}

export async function updateSubject(
  id: string,
  updates: Partial<Subject>
): Promise<void> {
  await updateDoc(doc(db, SUBJECTS_COLLECTION, id), updates);
}

export async function deleteSubject(id: string): Promise<void> {
  await deleteDoc(doc(db, SUBJECTS_COLLECTION, id));
}
