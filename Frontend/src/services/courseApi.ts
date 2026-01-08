import { storage } from '@/utils/storage';
import {
  Department,
  Semester,
  Subject,
  Course,
  CourseMaterial,
  CourseEnrollment,
  CreateDepartmentRequest,
  CreateSemesterRequest,
  CreateSubjectRequest,
  CreateCourseRequest,
} from '@/types/course';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://campusmaster.onrender.com';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = storage.getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiError(response.status, errorText || response.statusText);
  }

  return response;
}

// Department API
export const departmentApi = {
  async getAll(): Promise<Department[]> {
    const response = await fetchWithAuth('/api/departments');
    return response.json();
  },

  async getById(id: number): Promise<Department> {
    const response = await fetchWithAuth(`/api/departments/${id}`);
    return response.json();
  },

  async create(data: CreateDepartmentRequest): Promise<Department> {
    const response = await fetchWithAuth('/api/departments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async update(id: number, data: Partial<CreateDepartmentRequest>): Promise<Department> {
    const response = await fetchWithAuth(`/api/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async delete(id: number): Promise<void> {
    await fetchWithAuth(`/api/departments/${id}`, { method: 'DELETE' });
  },
};

// Semester API
export const semesterApi = {
  async getAll(): Promise<Semester[]> {
    const response = await fetchWithAuth('/api/semesters');
    return response.json();
  },

  async getById(id: number): Promise<Semester> {
    const response = await fetchWithAuth(`/api/semesters/${id}`);
    return response.json();
  },

  async getActive(): Promise<Semester> {
    const response = await fetchWithAuth('/api/semesters/active');
    return response.json();
  },

  async create(data: CreateSemesterRequest): Promise<Semester> {
    const response = await fetchWithAuth('/api/semesters', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async update(id: number, data: Partial<CreateSemesterRequest>): Promise<Semester> {
    const response = await fetchWithAuth(`/api/semesters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async setActive(id: number): Promise<Semester> {
    const response = await fetchWithAuth(`/api/semesters/${id}/activate`, {
      method: 'PUT',
    });
    return response.json();
  },

  async delete(id: number): Promise<void> {
    await fetchWithAuth(`/api/semesters/${id}`, { method: 'DELETE' });
  },
};

// Subject API
export const subjectApi = {
  async getAll(): Promise<Subject[]> {
    const response = await fetchWithAuth('/api/subjects');
    return response.json();
  },

  async getById(id: number): Promise<Subject> {
    const response = await fetchWithAuth(`/api/subjects/${id}`);
    return response.json();
  },

  async getByDepartment(departmentId: number): Promise<Subject[]> {
    const response = await fetchWithAuth(`/api/subjects/department/${departmentId}`);
    return response.json();
  },

  async getBySemester(semesterId: number): Promise<Subject[]> {
    const response = await fetchWithAuth(`/api/subjects/semester/${semesterId}`);
    return response.json();
  },

  async create(data: CreateSubjectRequest, departmentId: number, semesterId: number): Promise<Subject> {
    const response = await fetchWithAuth(
      `/api/subjects?departmentId=${departmentId}&semesterId=${semesterId}`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response.json();
  },

  async update(id: number, data: Partial<CreateSubjectRequest>): Promise<Subject> {
    const response = await fetchWithAuth(`/api/subjects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async assignTeacher(id: number, teacherEmail: string): Promise<Subject> {
    const response = await fetchWithAuth(
      `/api/subjects/${id}/assign-teacher?teacherEmail=${encodeURIComponent(teacherEmail)}`,
      { method: 'PUT' }
    );
    return response.json();
  },

  async delete(id: number): Promise<void> {
    await fetchWithAuth(`/api/subjects/${id}`, { method: 'DELETE' });
  },
};

// Course API
export const courseApi = {
  async getPublished(): Promise<Course[]> {
    const response = await fetchWithAuth('/api/courses');
    return response.json();
  },

  async getAll(): Promise<Course[]> {
    const response = await fetchWithAuth('/api/courses/all');
    return response.json();
  },

  async getById(id: number): Promise<Course> {
    const response = await fetchWithAuth(`/api/courses/${id}`);
    return response.json();
  },

  async getMyCourses(): Promise<Course[]> {
    const response = await fetchWithAuth('/api/courses/my-courses');
    return response.json();
  },

  async getBySubject(subjectId: number): Promise<Course[]> {
    const response = await fetchWithAuth(`/api/courses/subject/${subjectId}`);
    return response.json();
  },

  async search(keyword: string): Promise<Course[]> {
    const response = await fetchWithAuth(`/api/courses/search?keyword=${encodeURIComponent(keyword)}`);
    return response.json();
  },

  async create(data: CreateCourseRequest, subjectId: number): Promise<Course> {
    const response = await fetchWithAuth(`/api/courses?subjectId=${subjectId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async update(id: number, data: Partial<CreateCourseRequest>): Promise<Course> {
    const response = await fetchWithAuth(`/api/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async publish(id: number): Promise<Course> {
    const response = await fetchWithAuth(`/api/courses/${id}/publish`, { method: 'PUT' });
    return response.json();
  },

  async unpublish(id: number): Promise<Course> {
    const response = await fetchWithAuth(`/api/courses/${id}/unpublish`, { method: 'PUT' });
    return response.json();
  },

  async delete(id: number): Promise<void> {
    await fetchWithAuth(`/api/courses/${id}`, { method: 'DELETE' });
  },

  // Enrollment
  async enroll(courseId: number): Promise<CourseEnrollment> {
    const response = await fetchWithAuth(`/api/courses/${courseId}/enroll`, { method: 'POST' });
    return response.json();
  },

  async unenroll(courseId: number): Promise<void> {
    await fetchWithAuth(`/api/courses/${courseId}/unenroll`, { method: 'DELETE' });
  },

  async getEnrolledStudents(courseId: number): Promise<CourseEnrollment[]> {
    const response = await fetchWithAuth(`/api/courses/${courseId}/students`);
    return response.json();
  },

  async getMyEnrollments(): Promise<CourseEnrollment[]> {
    const response = await fetchWithAuth('/api/courses/enrolled');
    return response.json();
  },

  async isEnrolled(courseId: number): Promise<boolean> {
    const response = await fetchWithAuth(`/api/courses/${courseId}/is-enrolled`);
    return response.json();
  },
};

// Course Material API
export const materialApi = {
  async getByCourse(courseId: number): Promise<CourseMaterial[]> {
    const response = await fetchWithAuth(`/api/courses/${courseId}/materials`);
    return response.json();
  },

  async upload(courseId: number, title: string, description: string | undefined, file: File): Promise<CourseMaterial> {
    const formData = new FormData();
    formData.append('title', title);
    if (description) {
      formData.append('description', description);
    }
    formData.append('file', file);

    const response = await fetchWithAuth(`/api/courses/${courseId}/materials`, {
      method: 'POST',
      body: formData,
    });
    return response.json();
  },

  async delete(courseId: number, materialId: number): Promise<void> {
    await fetchWithAuth(`/api/courses/${courseId}/materials/${materialId}`, { method: 'DELETE' });
  },

  getDownloadUrl(courseId: number, materialId: number): string {
    return `${API_BASE_URL}/api/courses/${courseId}/materials/${materialId}/download`;
  },

  async download(courseId: number, materialId: number, fileName: string): Promise<void> {
    const response = await fetchWithAuth(`/api/courses/${courseId}/materials/${materialId}/download`);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};

export { ApiError };
