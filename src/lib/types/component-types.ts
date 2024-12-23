// src/lib/types/component-types.ts
import { ReactNode, ButtonHTMLAttributes } from 'react';
import { User } from 'firebase/auth';
import { FactCheck, Comment, NotificationType } from './types';
import { ValidationStatus } from './core-types';

// Base Props
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
  testId?: string;
}

// Enhanced Loading State
export interface WithLoadingState {
  loading?: boolean;
  loadingText?: string;
}

// Button Props
export interface ButtonProps extends 
  ButtonHTMLAttributes<HTMLButtonElement>,
  BaseComponentProps,
  WithLoadingState {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

// Status Badge Props
export interface StatusBadgeProps extends BaseComponentProps {
  status: ValidationStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

// Modal Props
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  showCloseButton?: boolean;
  closeOnOutsideClick?: boolean;
}

// Form Field Props
export interface FormFieldProps extends BaseComponentProps {
  label: string;
  error?: string;
  required?: boolean;
  helperText?: string;
}

export interface AuthContextType {
  user: User | null;
  login: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<string>;
  logout: () => Promise<void>;
  loading: boolean;
  needsUsername: boolean;
  finalizeUserRegistration: (username: string) => Promise<void>;
  resendVerificationEmail: () => Promise<string>;
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