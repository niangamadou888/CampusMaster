import { storage } from '@/utils/storage';
import {
  Assignment,
  Submission,
  Grade,
  CreateAssignmentRequest,
  GradeRequest,
  SubmissionStats,
  GradeStats,
} from '@/types/assignment';

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

// Assignment API
export const assignmentApi = {
  async getAll(): Promise<Assignment[]> {
    const response = await fetchWithAuth('/api/assignments');
    return response.json();
  },

  async getById(id: number): Promise<Assignment> {
    const response = await fetchWithAuth(`/api/assignments/${id}`);
    return response.json();
  },

  async getByCourse(courseId: number): Promise<Assignment[]> {
    const response = await fetchWithAuth(`/api/assignments/course/${courseId}`);
    return response.json();
  },

  async getMyAssignments(): Promise<Assignment[]> {
    const response = await fetchWithAuth('/api/assignments/my-assignments');
    return response.json();
  },

  async getForStudent(): Promise<Assignment[]> {
    const response = await fetchWithAuth('/api/assignments/student/all');
    return response.json();
  },

  async getUpcomingForStudent(): Promise<Assignment[]> {
    const response = await fetchWithAuth('/api/assignments/student/upcoming');
    return response.json();
  },

  async create(data: CreateAssignmentRequest, courseId: number): Promise<Assignment> {
    const response = await fetchWithAuth(`/api/assignments?courseId=${courseId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async update(id: number, data: Partial<CreateAssignmentRequest>): Promise<Assignment> {
    const response = await fetchWithAuth(`/api/assignments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async publish(id: number): Promise<Assignment> {
    const response = await fetchWithAuth(`/api/assignments/${id}/publish`, { method: 'PUT' });
    return response.json();
  },

  async unpublish(id: number): Promise<Assignment> {
    const response = await fetchWithAuth(`/api/assignments/${id}/unpublish`, { method: 'PUT' });
    return response.json();
  },

  async delete(id: number): Promise<void> {
    await fetchWithAuth(`/api/assignments/${id}`, { method: 'DELETE' });
  },
};

// Submission API
export const submissionApi = {
  async getByAssignment(assignmentId: number): Promise<Submission[]> {
    const response = await fetchWithAuth(`/api/submissions/assignment/${assignmentId}`);
    return response.json();
  },

  async getMySubmissions(): Promise<Submission[]> {
    const response = await fetchWithAuth('/api/submissions/my-submissions');
    return response.json();
  },

  async getById(id: number): Promise<Submission> {
    const response = await fetchWithAuth(`/api/submissions/${id}`);
    return response.json();
  },

  async getMySubmissionForAssignment(assignmentId: number): Promise<Submission> {
    const response = await fetchWithAuth(`/api/submissions/assignment/${assignmentId}/my-submission`);
    return response.json();
  },

  async getMyVersions(assignmentId: number): Promise<Submission[]> {
    const response = await fetchWithAuth(`/api/submissions/assignment/${assignmentId}/my-versions`);
    return response.json();
  },

  async submit(assignmentId: number, file: File, comment?: string): Promise<Submission> {
    const formData = new FormData();
    formData.append('file', file);
    if (comment) {
      formData.append('comment', comment);
    }

    const response = await fetchWithAuth(`/api/submissions/assignment/${assignmentId}/submit`, {
      method: 'POST',
      body: formData,
    });
    return response.json();
  },

  async getUngraded(assignmentId: number): Promise<Submission[]> {
    const response = await fetchWithAuth(`/api/submissions/assignment/${assignmentId}/ungraded`);
    return response.json();
  },

  async getGraded(assignmentId: number): Promise<Submission[]> {
    const response = await fetchWithAuth(`/api/submissions/assignment/${assignmentId}/graded`);
    return response.json();
  },

  async getLate(assignmentId: number): Promise<Submission[]> {
    const response = await fetchWithAuth(`/api/submissions/assignment/${assignmentId}/late`);
    return response.json();
  },

  async getStats(assignmentId: number): Promise<SubmissionStats> {
    const response = await fetchWithAuth(`/api/submissions/assignment/${assignmentId}/stats`);
    return response.json();
  },

  async hasSubmitted(assignmentId: number): Promise<boolean> {
    const response = await fetchWithAuth(`/api/submissions/assignment/${assignmentId}/has-submitted`);
    return response.json();
  },

  async getDownloadUrl(submissionId: number): Promise<string> {
    const response = await fetchWithAuth(`/api/submissions/${submissionId}/download`);
    const data = await response.json();
    return data.url;
  },

  async download(submissionId: number, fileName: string): Promise<void> {
    const url = await this.getDownloadUrl(submissionId);
    // Open the Cloudinary URL in a new tab for download
    window.open(url, '_blank');
  },
};

// Grade API
export const gradeApi = {
  async getById(id: number): Promise<Grade> {
    const response = await fetchWithAuth(`/api/grades/${id}`);
    return response.json();
  },

  async getBySubmission(submissionId: number): Promise<Grade> {
    const response = await fetchWithAuth(`/api/grades/submission/${submissionId}`);
    return response.json();
  },

  async getMyGrades(): Promise<Grade[]> {
    const response = await fetchWithAuth('/api/grades/my-grades');
    return response.json();
  },

  async getMyGradesByCourse(courseId: number): Promise<Grade[]> {
    const response = await fetchWithAuth(`/api/grades/my-grades/course/${courseId}`);
    return response.json();
  },

  async getByCourse(courseId: number): Promise<Grade[]> {
    const response = await fetchWithAuth(`/api/grades/course/${courseId}`);
    return response.json();
  },

  async getByAssignment(assignmentId: number): Promise<Grade[]> {
    const response = await fetchWithAuth(`/api/grades/assignment/${assignmentId}`);
    return response.json();
  },

  async grade(submissionId: number, data: GradeRequest): Promise<Grade> {
    const response = await fetchWithAuth(`/api/grades/submission/${submissionId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async update(gradeId: number, data: GradeRequest): Promise<Grade> {
    const response = await fetchWithAuth(`/api/grades/${gradeId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async delete(gradeId: number): Promise<void> {
    await fetchWithAuth(`/api/grades/${gradeId}`, { method: 'DELETE' });
  },

  async getAssignmentStats(assignmentId: number): Promise<GradeStats> {
    const response = await fetchWithAuth(`/api/grades/stats/assignment/${assignmentId}`);
    return response.json();
  },

  async getCourseStats(courseId: number): Promise<{ averageScore: number }> {
    const response = await fetchWithAuth(`/api/grades/stats/course/${courseId}`);
    return response.json();
  },

  async getMyAverageScore(): Promise<{ averageScore: number }> {
    const response = await fetchWithAuth('/api/grades/stats/my-average');
    return response.json();
  },
};

export { ApiError };
