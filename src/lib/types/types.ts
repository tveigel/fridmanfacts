// src/lib/types/types.ts
export type FactCheck = {
  id: string;
  episodeId: string;
  transcriptTime: string;
  flaggedText: string;
  submittedBy: string;
  source: string;
  context: string;
  status: 'UNVALIDATED' | 'VALIDATED_FALSE' | 'VALIDATED_CONTROVERSIAL' | 'VALIDATED_TRUE';
  moderatorValidation?: 'UNVALIDATED' | 'VALIDATED_FALSE' | 'VALIDATED_CONTROVERSIAL' | 'VALIDATED_TRUE';
  moderatorNote?: string;
  moderatorSourceLink?: string;
  moderatedBy?: string;
  moderatedAt?: any; // Firebase Timestamp
  upvotes: number;
  downvotes: number;
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

// Update this in your types.ts file
export type Comment = {
  id: string;
  factCheckId: string;
  userId: string;
  content: string;
  parentCommentId: string | null;
  upvotes: number;
  downvotes: number;
  isDeleted?: boolean;
  deletedAt?: any; // Firebase Timestamp
  deletedBy?: string;
  moderatorReason?: string | null;
  createdAt: any; // Firebase Timestamp
  updatedAt: any; // Firebase Timestamp
};

export type CommentVotesMap = {
  [commentId: string]: number;
};


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


export type KarmaAction = 
 // Fact submission and validation
 | 'SUBMIT_FACT'
 | 'FACT_VALIDATED_TRUE'
 | 'FACT_VALIDATED_FALSE'
 | 'FACT_VALIDATED_CONTROVERSIAL'
 | 'FACT_DELETED'
 
 // Voting on facts
 | 'FACT_UPVOTED'
 | 'FACT_DOWNVOTED'
 | 'FACT_UPVOTE_REMOVED'
 | 'FACT_DOWNVOTE_REMOVED'
 
 // Voting on unvalidated facts
 | 'UNVALIDATED_FACT_UPVOTED'
 | 'UNVALIDATED_FACT_DOWNVOTED'
 
 // Impact on fact owner
 | 'FACT_OWNER_UPVOTED'
 | 'FACT_OWNER_DOWNVOTED'
 
 // Voting behaviors
 | 'UPVOTE_GIVEN_VALIDATED_FALSE'
 | 'DOWNVOTE_GIVEN_VALIDATED_TRUE'
 | 'UPVOTE_GIVEN_VALIDATED_TRUE'
 | 'DOWNVOTE_GIVEN_VALIDATED_FALSE'
 
 // Removed votes
 | 'UPVOTE_GIVEN_REMOVED'
 | 'DOWNVOTE_GIVEN_REMOVED'
 | 'DOWNVOTE_CORRECT_REMOVED'
 | 'DOWNVOTE_VALIDATED_FACT_REMOVED'
 
 // Comments
 | 'SUBMIT_COMMENT'
 | 'COMMENT_UPVOTED'
 | 'COMMENT_DOWNVOTED';

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