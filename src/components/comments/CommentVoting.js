import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { getVoteColor } from '../../lib/utils/votingUtils';

export default function CommentVoting({ 
  upvotes = 0, 
  downvotes = 0, 
  currentUserVote, 
  onVote, 
  commentId, 
  user 
}) {
  const voteColor = getVoteColor(upvotes, downvotes);

  return (
    <div className="flex flex-col items-center">
      <button 
        onClick={() => onVote(commentId, currentUserVote === 1 ? 0 : 1)}
        disabled={!user}
        className={`p-1 rounded disabled:opacity-50 transition-colors
                  ${currentUserVote === 1 
                    ? 'bg-blue-100 hover:bg-blue-200' 
                    : 'hover:bg-gray-100'}`}
        aria-label="Vote up"
      >
        <ArrowUp 
          size={16} 
          className={currentUserVote === 1 ? 'text-blue-500' : 'text-gray-600'} 
        />
      </button>
      <div className="flex flex-col items-center my-1">
        <span className={`font-bold ${voteColor}`}>{upvotes}</span>
        <span className="text-xs text-gray-400 mx-1">/</span>
        <span className={`font-bold ${voteColor}`}>{downvotes}</span>
      </div>
      <button
        onClick={() => onVote(commentId, currentUserVote === -1 ? 0 : -1)}
        disabled={!user}
        className={`p-1 rounded disabled:opacity-50 transition-colors
                  ${currentUserVote === -1 
                    ? 'bg-blue-100 hover:bg-blue-200' 
                    : 'hover:bg-gray-100'}`}
        aria-label="Vote down"
      >
        <ArrowDown 
          size={16} 
          className={currentUserVote === -1 ? 'text-blue-500' : 'text-gray-600'} 
        />
      </button>
    </div>
  );
}