// Fetch all teachers
export async function fetchTeachers(): Promise<Teacher[]> {
  const q = query(collection(db, "teachers"), orderBy("createdAt"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(
    (doc) => ({ uid: doc.id, ...doc.data() } as Teacher)
  );
}

// Fetch all classes
export async function fetchClasses(): Promise<Class[]> {
  const q = query(collection(db, "classes"), orderBy("createdAt"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(
    (doc) => ({ uid: doc.id, ...doc.data() } as Class)
  );
}
// Search and discovery functions
export async function searchAvailableClasses(
  searchTerm?: string
): Promise<Class[]> {
  try {
    const q = query(collection(db, "classes"), orderBy("name"));
    const snapshot = await getDocs(q);
    let classes = snapshot.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data(),
    })) as Class[];
    // Filter by search term if provided
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      classes = classes.filter(
        (cls) =>
          cls.name.toLowerCase().includes(term) ||
          (Array.isArray(cls.teacherIdList) &&
            cls.teacherIdList.some((teacherId: string) =>
              teacherId.toLowerCase().includes(term)
            ))
      );
    }
    return classes;
  } catch (error) {
    console.error("Error searching classes:", error);
    throw error;
  }
}
// Fetch functions for students, classes, assignments, etc.
import { db } from "../config";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Firestore,
} from "firebase/firestore";
import type {
  Teacher,
  Class,
  Assignment,
  Student,
  Submission,
  Meeting,
  Post,
} from "../definitions";

// Fetch all students
export async function getAllStudents(): Promise<Student[]> {
  const q = query(collection(db, "students"), orderBy("createdAt"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(
    (doc) => ({ uid: doc.id, ...doc.data() } as Student)
  );
}

export async function getStudentsByClass(classId: string): Promise<Student[]> {
  const q = query(
    collection(db, "students"),
    where("enrolledClasses", "array-contains", classId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ uid: doc.id, ...doc.data() } as Student));
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
      phone: data.phone || "",
      subjects: data.subjects,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
    };
  }
  return null;
}

export async function getPostsForClass(classId: string): Promise<Post[]> {
  const q = query(
    collection(db, "posts"),
    where("classId", "==", classId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ uid: doc.id, ...doc.data() } as Post));
}

export async function getStudentProfile(uid: string): Promise<Student | null> {
  try {
    const docRef = doc(db, "students", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { uid, ...docSnap.data() } as Student;
    }
    return null;
  } catch (error) {
    console.error("Error getting student profile:", error);
    throw error;
  }
}

export async function getStudentAssignments(
  studentId: string
): Promise<Assignment[]> {
  try {
    const studentDoc = await getDoc(doc(db, "students", studentId));
    if (!studentDoc.exists()) return [];
    const studentData = studentDoc.data() as Student;
    const enrolledClasses = studentData.enrolledClasses || [];
    if (enrolledClasses.length === 0) return [];
    const assignmentsQuery = query(
      collection(db, "assignments"),
      where("classId", "in", enrolledClasses),
      orderBy("dueDate", "asc")
    );
    const snapshot = await getDocs(assignmentsQuery);
    return snapshot.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data(),
    })) as Assignment[];
  } catch (error) {
    console.error("Error getting student assignments:", error);
    throw error;
  }
}

export async function getStudentClasses(studentId: string): Promise<Class[]> {
  try {
    const studentDoc = await getDoc(doc(db, "students", studentId));
    if (!studentDoc.exists()) return [];
    const studentData = studentDoc.data() as Student;
    const enrolledClasses = studentData.enrolledClasses || [];
    if (enrolledClasses.length === 0) return [];
    const classesQuery = query(
      collection(db, "classes"),
      where("__name__", "in", enrolledClasses)
    );
    const snapshot = await getDocs(classesQuery);
    return snapshot.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data(),
    })) as Class[];
  } catch (error) {
    console.error("Error getting student classes:", error);
    throw error;
  }
}

export async function getStudentSubmissions(
  studentId: string
): Promise<Submission[]> {
  try {
    const q = query(
      collection(db, "submissions"),
      where("studentId", "==", studentId),
      orderBy("submittedAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data(),
    })) as Submission[];
  } catch (error) {
    console.error("Error getting student submissions:", error);
    throw error;
  }
}

export async function getSubmissionForAssignment(
  assignmentId: string,
  studentId: string
): Promise<Submission | null> {
  try {
    const q = query(
      collection(db, "submissions"),
      where("assignmentId", "==", assignmentId),
      where("studentId", "==", studentId)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { uid: doc.id, ...doc.data() } as Submission;
  } catch (error) {
    console.error("Error getting submission:", error);
    throw error;
  }
}

export async function getMeetings(db: Firestore): Promise<Meeting[]> {
  const snapshot = await getDocs(collection(db, "meetings"));
  return snapshot.docs.map((doc) => ({
    uid: doc.id,
    ...(doc.data() as Omit<Meeting, "uid">),
  }));
}
