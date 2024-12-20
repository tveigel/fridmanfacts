// src/lib/types/component-types.ts
import { ReactNode } from 'react';
import { User } from 'firebase/auth';
import { FactCheck, Comment, NotificationType } from './types';

export interface AuthContextType {
  user: User | null;
  login: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<string>;
  logout: () => Promise<void>;
  loading: boolean;
}

export interface LoginModalContextType {
  showLoginModal: () => void;
  hideLoginModal: () => void;
}

export interface NotificationsContextType {
  notifications: Array<{
    id: string;
    userId: string;
    message: string;
    type: NotificationType;
    factCheckId: string;
    read: boolean;
    viewed: boolean;
    createdAt: Date;
  }>;
  unreadCount: number;
  unviewedCount: number;
  setUnviewedCount: (count: number) => void;
  error: string | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  markNotificationsAsViewed: () => Promise<void>;
}

export interface FactCheckSubmissionProps {
  episodeId: string;
  transcriptTime: string;
  selectedText: string;
  onClose: () => void;
}

export interface FactCheckVotingProps {
  upvotes: number;
  downvotes: number;
  currentUserVote: number;
  onVote: (factCheckId: string, value: number) => void;
  factCheckId: string;
  user: User | null;
}

export interface CommentProps {
  comment: Comment;
  currentUserVote: number;
  onVote: (commentId: string, value: number) => void;
  onReply: (commentId: string) => void;
  onDelete: (commentId: string, reason?: string) => void;
  depth?: number;
  children?: ReactNode;
}

export interface TranscriptProps {
  transcript: Array<{
    time: string;
    text: string;
    speaker?: string;
  }>;
  timestamps: Array<{
    time: string;
    chapter: string;
  }>;
  episodeId: string;
  initialSelectedFactCheckId?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export interface SelectionPopupProps {
  top: number;
  left: number;
  onFactCheck: () => void;
}

export interface HighlightedTextProps {
  text: string;
  factChecks: FactCheck[];
  onFactCheckClick: (factCheck: FactCheck) => void;
}