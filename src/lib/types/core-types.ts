// src/lib/types/core-types.ts
import { User } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';
import { ReactNode } from 'react';

// Firebase related types
export interface FirebaseTimestamp {
  seconds: number;
  nanoseconds: number;
}

// Settings Types
export interface FactCheckSettings {
  showValidatedTrue: boolean;
  showValidatedFalse: boolean;
  showValidatedControversial: boolean;
  showUnvalidated: boolean;
  minNetVotes: number;
  moderatorOnly: boolean;
}

export type ValidationStatus = 
  | 'UNVALIDATED'
  | 'VALIDATED_TRUE'
  | 'VALIDATED_FALSE'
  | 'VALIDATED_CONTROVERSIAL';

// Context Types
export interface LoginModalContextType {
  isOpen: boolean;
  showLoginModal: () => void;
  hideLoginModal: () => void;
}

export interface FactCheckSettingsContextType {
  settings: FactCheckSettings;
  updateSettings: (newSettings: FactCheckSettings) => void;
  updateSingleSetting: (key: keyof FactCheckSettings, value: boolean | number) => void;
  resetToDefaults: () => void;
  shouldShowFactCheck: (factCheck: FactCheck) => boolean;
  saveAsDefault: () => Promise<boolean>;
  loading: boolean;
  userDefaults: FactCheckSettings | null;
  SYSTEM_DEFAULT_SETTINGS: FactCheckSettings;
}

// Fact Check Types
export interface FactCheck {
  id: string;
  episodeId: string;
  transcriptTime: string;
  flaggedText: string;
  submittedBy: string;
  source: string;
  context: string;
  status: ValidationStatus;
  moderatorValidation?: ValidationStatus;
  moderatorNote?: string;
  moderatorSourceLink?: string;
  moderatedBy?: string;
  moderatedAt?: Timestamp;
  upvotes: number;
  downvotes: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type FactCheckMap = Record<string, FactCheck[]>;
export type UserVotesMap = Record<string, number>;

// Voting Types
export interface Vote {
  userId: string;
  value: number;
  timestamp: Timestamp;
}

// Karma Types
export type KarmaAction = 
  | 'SUBMIT_FACT'
  | 'FACT_VALIDATED_TRUE'
  | 'FACT_VALIDATED_FALSE'
  | 'FACT_UPVOTED'
  | 'FACT_DOWNVOTED'
  | 'SUBMIT_COMMENT'
  | 'COMMENT_UPVOTED'
  | 'COMMENT_DOWNVOTED'
  | 'UPVOTE_GIVEN'
  | 'DOWNVOTE_CORRECT'
  | 'DOWNVOTE_VALIDATED_FACT';

export interface KarmaHistoryEntry {
  id: string;
  userId: string;
  action: KarmaAction;
  points: number;
  targetId: string;
  timestamp: Timestamp;
}

export interface UserKarma {
  userId: string;
  totalKarma: number;
  lastUpdated: Timestamp;
}

// Comment Types
export interface Comment {
  id: string;
  factCheckId: string;
  userId: string;
  content: string;
  parentCommentId: string | null;
  upvotes: number;
  downvotes: number;
  isDeleted: boolean;
  moderatorReason?: string;
  deletedAt?: Timestamp;
  deletedBy?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Notification Types
export type NotificationType = 
  | 'COMMENT_REPLY' 
  | 'VOTE_MILESTONE' 
  | 'MODERATION' 
  | 'FACT_CHECK_UPDATE';

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: NotificationType;
  factCheckId: string;
  read: boolean;
  viewed: boolean;
  createdAt: Timestamp;
  readAt?: Timestamp;
  viewedAt?: Timestamp;
}

export interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  unviewedCount: number;
  setUnviewedCount: (count: number) => void;
  error: string | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  markNotificationsAsViewed: () => Promise<void>;
}

// Component Props Types
export interface ProviderProps {
  children: ReactNode;
}

export interface TranscriptEntry {
  time: string;
  text: string;
  speaker?: string;
}

export interface TimestampEntry {
  time: string;
  chapter: string;
}

export interface TranscriptProps {
  transcript: TranscriptEntry[];
  timestamps: TimestampEntry[];
  episodeId: string;
  initialSelectedFactCheckId?: string;
}

// Hook Types
export interface UseModeration {
  isModerator: boolean;
  isAdmin: boolean;
  loading: boolean;
}

export interface UseRoles {
  isAdmin: boolean;
  isModerator: boolean;
  loading: boolean;
  error: string | null;
}

export interface UseKarma {
  karma: number | null;
  karmaHistory: KarmaHistoryEntry[];
  loading: boolean;
  error: string | null;
}



// Error Types
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Enhanced Error Types
export interface ServiceErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

export interface ServiceError {
  message: string;
  code: string;
  details?: ServiceErrorDetail[];
  statusCode: number;
}

// Enhanced Service Response
export interface ServiceResponse<T> {
  data?: T;
  error?: ServiceError;
  success: boolean;
  meta?: {
    timestamp: number;
    processingTime?: number;
  };
}

// Add these utility types for Firebase interactions
export interface FirebaseDocumentData {
  id: string;
  [key: string]: any;
}

export type FirebaseQueryConstraint = {
  fieldPath: string;
  opStr: string;
  value: any;
};