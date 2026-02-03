import { User } from './auth';

export interface Message {
  id: number;
  conversationId: number;
  sender: User;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  id: number;
  participant1: User;
  participant2: User;
  lastMessageAt: string;
  createdAt: string;
  lastMessage?: Message;
  unreadCount?: number;
}

export interface SendMessageRequest {
  recipientEmail: string;
  content: string;
}

export interface ContactUser {
  userEmail: string;
  userFirstName: string;
  userLastName: string;
  role: { roleName: string; roleDescription: string }[];
}
