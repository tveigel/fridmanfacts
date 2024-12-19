"use client";

import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { getVoteColor } from '../../../lib/utils/votingUtils';
import { useProtectedAction } from '../../../hooks/useProtectedAction';

export default function FactCheckVoting({ 
  upvotes = 0, 
  downvotes = 0, 
  currentUserVote, 
  onVote, 
  factCheckId
}) {
  const { withAuth } = useProtectedAction();
  const voteColor = getVoteColor(upvotes, downvotes);
  const diff = upvotes - downvotes;

  return (
    <div className="flex flex-col items-center">
      <button 
        onClick={withAuth(() => onVote(factCheckId, currentUserVote === 1 ? 0 : 1))}
        className={`p-1 rounded transition-colors
                  ${currentUserVote === 1 
                    ? 'bg-blue-100 hover:bg-blue-200' 
                    : 'hover:bg-gray-100'}`}
        aria-label="Vote up"
      >
        <ArrowUp 
          size={20} 
          className={currentUserVote === 1 ? 'text-blue-500' : 'text-gray-600'} 
        />
      </button>
      <div className="flex flex-col items-center my-1">
        <span className={`font-bold ${voteColor}`}>{upvotes}</span>
        <span className="text-xs text-gray-400 mx-1">/</span>
        <span className={`font-bold ${voteColor}`}>{downvotes}</span>
      </div>
      <button
        onClick={withAuth(() => onVote(factCheckId, currentUserVote === -1 ? 0 : -1))}
        className={`p-1 rounded transition-colors
                  ${currentUserVote === -1 
                    ? 'bg-blue-100 hover:bg-blue-200' 
                    : 'hover:bg-gray-100'}`}
        aria-label="Vote down"
      >
        <ArrowDown 
          size={20} 
          className={currentUserVote === -1 ? 'text-blue-500' : 'text-gray-600'} 
        />
      </button>
    </div>
  );
}