import { User } from './auth';

export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Semester {
  id: number;
  name: string;
  year: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Subject {
  id: number;
  name: string;
  code: string;
  description?: string;
  credits?: number;
  department?: Department;
  semester?: Semester;
  teacher?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: number;
  title: string;
  description?: string;
  subject?: Subject;
  teacher?: User;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  materials?: CourseMaterial[];
  enrollments?: CourseEnrollment[];
}

export interface CourseMaterial {
  id: number;
  title: string;
  description?: string;
  fileType: 'PDF' | 'PPT' | 'PPTX' | 'DOC' | 'DOCX' | 'VIDEO' | 'IMAGE' | 'OTHER';
  fileName: string;
  filePath: string;
  fileSize: number;
  downloadCount: number;
  uploadedAt: string;
}

export interface CourseEnrollment {
  id: number;
  course?: Course;
  student?: User;
  status: 'ACTIVE' | 'COMPLETED' | 'DROPPED';
  enrolledAt: string;
  completedAt?: string;
}

export interface CreateDepartmentRequest {
  name: string;
  code: string;
  description?: string;
}

export interface CreateSemesterRequest {
  name: string;
  year: number;
  startDate?: string;
  endDate?: string;
}

export interface CreateSubjectRequest {
  name: string;
  code: string;
  description?: string;
  credits?: number;
}

export interface CreateCourseRequest {
  title: string;
  description?: string;
}

export interface UploadMaterialRequest {
  title: string;
  description?: string;
  file: File;
}
