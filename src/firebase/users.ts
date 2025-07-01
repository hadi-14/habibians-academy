import { db } from "./config";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

export async function createUserProfile(
  uid: string,
  data: {
    name: string;
    role: "student" | "teacher";
    email: string;
    phone?: string;
    teacherId?: string;
  }
) {
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, data, { merge: true });
}

export async function getUserProfile(uid: string) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  return snap.exists() ? snap.data() : null;
}

export async function getUsersByRole(role: "student" | "teacher") {
  const q = query(collection(db, "users"), where("role", "==", role));
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
}
