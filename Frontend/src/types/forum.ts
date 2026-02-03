import { User } from './auth';
import { Course } from './course';

export interface ForumPost {
  id: number;
  course?: Course;
  author?: User;
  title: string;
  content: string;
  isPinned: boolean;
  isClosed: boolean;
  createdAt: string;
  updatedAt: string;
  replies?: ForumReply[];
  replyCount?: number;
}

export interface ForumReply {
  id: number;
  author?: User;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostRequest {
  title: string;
  content: string;
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
}

export interface CreateReplyRequest {
  content: string;
}
