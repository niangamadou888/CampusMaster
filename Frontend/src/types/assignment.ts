import { User } from './auth';
import { Course } from './course';

export interface Assignment {
  id: number;
  title: string;
  description?: string;
  course?: Course;
  teacher?: User;
  maxScore: number;
  deadline?: string;
  allowLateSubmission: boolean;
  lateSubmissionPenalty: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  id: number;
  assignment?: Assignment;
  student?: User;
  version: number;
  fileName?: string;
  filePath?: string;
  fileSize?: number;
  comment?: string;
  isLate: boolean;
  submittedAt: string;
  grade?: Grade;
}

export interface Grade {
  id: number;
  submission?: Submission;
  score: number;
  feedback?: string;
  gradedBy?: User;
  gradedAt: string;
  updatedAt: string;
}

export interface CreateAssignmentRequest {
  title: string;
  description?: string;
  maxScore?: number;
  deadline?: string;
  allowLateSubmission?: boolean;
  lateSubmissionPenalty?: number;
}

export interface SubmitAssignmentRequest {
  file: File;
  comment?: string;
}

export interface GradeRequest {
  score: number;
  feedback?: string;
}

export interface SubmissionStats {
  totalSubmissions: number;
  uniqueStudents: number;
  ungradedCount: number;
  lateCount: number;
}

export interface GradeStats {
  averageScore: number;
  gradedCount: number;
}
