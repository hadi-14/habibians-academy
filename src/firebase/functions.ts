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
  if (
    !assignment.title ||
    !assignment.subject ||
    !assignment.dueDate ||
    !assignment.createdBy
  ) {
    throw new Error("Missing required assignment fields");
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
