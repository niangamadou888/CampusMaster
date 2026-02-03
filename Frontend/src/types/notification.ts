import { User } from './auth';

export type NotificationType =
  | 'ASSIGNMENT_PUBLISHED'
  | 'ASSIGNMENT_UPDATED'
  | 'ASSIGNMENT_DEADLINE_REMINDER'
  | 'GRADE_RELEASED'
  | 'GRADE_UPDATED'
  | 'SUBMISSION_RECEIVED'
  | 'COURSE_PUBLISHED'
  | 'COURSE_ENROLLMENT_APPROVED'
  | 'COURSE_MATERIAL_ADDED'
  | 'TEACHER_APPROVED'
  | 'TEACHER_REGISTRATION_PENDING'
  | 'NEW_MESSAGE'
  | 'ANNOUNCEMENT'
  | 'SYSTEM';

export interface Notification {
  id: number;
  recipient: User;
  notificationType: NotificationType;
  title: string;
  message: string;
  relatedEntityType?: string;
  relatedEntityId?: number;
  isRead: boolean;
  createdAt: string;
}
