// services/firebase/types.ts
export type FactCheck = {
  id: string;
  episodeId: string;
  transcriptTime: string;
  flaggedText: string;
  submittedBy: string;
  source: string;
  context: string;
  status: 'UNVALIDATED' | 'VALIDATED_FALSE' | 'VALIDATED_CONTROVERSIAL' | 'VALIDATED_TRUE';
  upvotes: number;  // New field
  downvotes: number;  // New field
  createdAt: any; // Firebase Timestamp
  updatedAt: any; // Firebase Timestamp
};

export type Vote = {
  userId: string;
  value: number;
  timestamp: any; // Firebase Timestamp
};

export type FactCheckMap = {
  [transcriptTime: string]: FactCheck[];
};

export type UserVotesMap = {
  [factCheckId: string]: number;
};

export type OnDeleteFunction = (factCheckId: string) => void;

export type Comment = {
  id: string;
  factCheckId: string;
  userId: string;
  content: string;
  parentCommentId: string | null;
  upvotes: number;
  downvotes: number;
  createdAt: any; // Firebase Timestamp
  updatedAt: any; // Firebase Timestamp
};

export type CommentVotesMap = {
  [commentId: string]: number;
};

// lib/types/types.ts
export type NotificationType = 'COMMENT_REPLY' | 'VOTE_MILESTONE' | 'MODERATION' | 'FACT_CHECK_UPDATE';

export type Notification = {
  id: string;
  userId: string;
  message: string;
  type: NotificationType;
  factCheckId: string;
  read: boolean;
  viewed: boolean;
  createdAt: any; // Firebase Timestamp
};


// Karma action types
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

// Karma history entry
export type KarmaHistoryEntry = {
  id: string;
  userId: string;
  action: KarmaAction;
  points: number;
  targetId: string; // ID of the fact check or comment
  timestamp: any; // Firebase Timestamp
};

// User karma structure
export type UserKarma = {
  userId: string;
  totalKarma: number;
  lastUpdated: any; // Firebase Timestamp
};