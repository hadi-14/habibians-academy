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
  Timestamp,
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
} from "./definitions";
// POSTS CRUD

export async function createPost(data: Omit<Post, "uid" | "createdAt">) {
  return await addDoc(collection(db, "posts"), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

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

export async function getPostsForClass(classId: string): Promise<Post[]> {
  const q = query(
    collection(db, "posts"),
    where("classId", "==", classId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ uid: doc.id, ...doc.data() } as Post));
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
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
    };
  }
  return null;
}

// CLASSES
export async function createClass(classData: Class) {
  try {
    const classesRef = collection(db, "classes");
    const docRef = await addDoc(classesRef, {
      ...classData,
      createdAt: new Date(),
    });
    // Update the document with its uid
    await updateDoc(docRef, { uid: docRef.id });
    return { ...classData, uid: docRef.id };
  } catch (error) {
    console.error("Error creating class:", error);
    throw error;
  }
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
    cb(snap.docs.map((doc) => ({ uid: doc.id, ...doc.data() } as Assignment)))
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
  return snap.docs.map((doc) => ({ uid: doc.id, ...doc.data() } as Student));
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
    cb(snap.docs.map((doc) => ({ uid: doc.id, ...doc.data() } as Submission)))
  );
}

export async function gradeSubmission(
  submissionId: string,
  grade: number,
  feedback: string
) {
  await updateDoc(doc(db, "submissions", submissionId), { grade, feedback });
}

// Student profile functions
export const getStudentProfile = async (
  uid: string
): Promise<Student | null> => {
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
};

export const updateStudentProfile = async (
  uid: string,
  data: Partial<Student>
): Promise<void> => {
  try {
    const docRef = doc(db, "students", uid);
    await updateDoc(docRef, data);
  } catch (error) {
    console.error("Error updating student profile:", error);
    throw error;
  }
};

// Assignment functions
export const listenToStudentAssignments = (
  studentId: string,
  callback: (assignments: Assignment[]) => void
): (() => void) => {
  try {
    // First get student's enrolled classes
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

      // Get assignments for enrolled classes
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
  } catch (error) {
    console.error("Error listening to student assignments:", error);
    return () => {};
  }
};

export const getStudentAssignments = async (
  studentId: string
): Promise<Assignment[]> => {
  try {
    // Get student's enrolled classes
    const studentDoc = await getDoc(doc(db, "students", studentId));
    if (!studentDoc.exists()) return [];

    const studentData = studentDoc.data() as Student;
    const enrolledClasses = studentData.enrolledClasses || [];

    if (enrolledClasses.length === 0) return [];

    // Get assignments for enrolled classes
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
};

// Class functions
export const listenToStudentClasses = (
  studentId: string,
  callback: (classes: Class[]) => void
): (() => void) => {
  try {
    // First get student's enrolled classes
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

      // Get class details for enrolled classes
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
  } catch (error) {
    console.error("Error listening to student classes:", error);
    return () => {};
  }
};

export const getStudentClasses = async (
  studentId: string
): Promise<Class[]> => {
  try {
    // Get student's enrolled classes
    const studentDoc = await getDoc(doc(db, "students", studentId));
    if (!studentDoc.exists()) return [];

    const studentData = studentDoc.data() as Student;
    const enrolledClasses = studentData.enrolledClasses || [];

    if (enrolledClasses.length === 0) return [];

    // Get class details
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
};

// Submission functions
export const submitAssignment = async (
  assignmentId: string,
  studentId: string,
  studentName: string,
  content: string,
  attachments?: string[]
): Promise<void> => {
  try {
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
  } catch (error) {
    console.error("Error submitting assignment:", error);
    throw error;
  }
};

export const getStudentSubmissions = async (
  studentId: string
): Promise<Submission[]> => {
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
};

export const getSubmissionForAssignment = async (
  assignmentId: string,
  studentId: string
): Promise<Submission | null> => {
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
};

// Enrollment functions
export const enrollInClass = async (
  studentId: string,
  classId: string
): Promise<void> => {
  try {
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
  } catch (error) {
    console.error("Error enrolling in class:", error);
    throw error;
  }
};

export const unenrollFromClass = async (
  studentId: string,
  classId: string
): Promise<void> => {
  try {
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
  } catch (error) {
    console.error("Error unenrolling from class:", error);
    throw error;
  }
};

// Search and discovery functions
export const searchAvailableClasses = async (
  searchTerm?: string
): Promise<Class[]> => {
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
          cls.teacherIdList.some((teacherId) =>
            teacherId.toLowerCase().includes(term)
          )
      );
    }

    return classes;
  } catch (error) {
    console.error("Error searching classes:", error);
    throw error;
  }
};

// Attendance functions
export const updateStudentAttendance = async (
  studentId: string,
  presentDays: number,
  totalDays: number
): Promise<void> => {
  try {
    const studentRef = doc(db, "students", studentId);
    await updateDoc(studentRef, {
      attendance: {
        presentDays,
        totalDays,
      },
    });
  } catch (error) {
    console.error("Error updating attendance:", error);
    throw error;
  }
};

/**
 * Fetch meetings from the 'meetings' collection.
 * @param db Firestore instance
 * @returns Promise<Meeting[]>
 */
export async function getMeetings(db: Firestore): Promise<Meeting[]> {
  const snapshot = await getDocs(collection(db, "meetings"));
  return snapshot.docs.map((doc) => ({
    uid: doc.id,
    ...(doc.data() as Omit<Meeting, "uid">),
  }));
}
