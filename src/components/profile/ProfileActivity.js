// src/components/profile/ProfileActivity.js
import React, { useState } from 'react';
import Link from 'next/link';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import FlagIcon from '../fact-checks/FlagIcon';
import { getStatusColors } from '../../lib/utils/colors';
import { getVoteBasedStyle } from '../../lib/utils/votingUtils';

export default function ProfileActivity({ activities }) {
  const [activeTab, setActiveTab] = useState('factChecks');
  const { factChecks, comments } = activities;

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('factChecks')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'factChecks'
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Fact Checks
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'comments'
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Comments
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeTab === 'factChecks' ? (
          factChecks.length > 0 ? (
            factChecks.map(factCheck => (
              <FactCheckCard key={factCheck.id} factCheck={factCheck} />
            ))
          ) : (
            <EmptyState message="No fact checks submitted yet" />
          )
        ) : (
          comments.length > 0 ? (
            comments.map(comment => (
              <CommentCard key={comment.id} comment={comment} />
            ))
          ) : (
            <EmptyState message="No comments yet" />
          )
        )}
      </div>
    </div>
  );
}

function FactCheckCard({ factCheck }) {
  const status = factCheck.moderatorValidation || factCheck.status || 'UNVALIDATED';
  const { bg } = getStatusColors(status);
  const voteStyle = getVoteBasedStyle(factCheck.upvotes || 0, factCheck.downvotes || 0);

  // Create sanitized time ID from transcriptTime
  const sanitizedTime = factCheck.transcriptTime.replace(/[:()]/g, "");

  return (
    <Link
      href={`/episode/${factCheck.episodeId}?selectedFactCheck=${factCheck.id}#transcript-${sanitizedTime}`}
      className={`block ${bg} rounded-lg shadow hover:shadow-md transition-shadow`}
    >
      <div className="p-6">
        <div className="flex items-start gap-6">
          {/* Voting section */}
          <div className={`rounded-lg ${voteStyle} p-2 flex flex-col items-center min-w-[80px]`}>
            <div className="flex items-center gap-1">
              <ThumbsUp size={18} className="text-green-600" />
              <span className="font-bold">{factCheck.upvotes || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <ThumbsDown size={18} className="text-red-600" />
              <span className="font-bold">{factCheck.downvotes || 0}</span>
            </div>
          </div>

          {/* Content section */}
          <div className="flex-1">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-sm text-gray-500 mb-2">
                  {new Date(factCheck.createdAt?.seconds * 1000).toLocaleDateString()}
                </div>
                <q className="text-lg font-medium text-gray-900">{factCheck.flaggedText}</q>
              </div>
              <FlagIcon status={status} size={32} />
            </div>
            
            <div className="mb-4">
              <div className="font-medium text-gray-700 mb-1">Context:</div>
              <p className="text-gray-600">{factCheck.context}</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Source:</span>
              <a
                href={factCheck.source}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline text-sm"
                onClick={(e) => e.stopPropagation()}
              >
                {factCheck.source}
              </a>
            </div>

            {factCheck.moderatorNote && (
              <div className="mt-4 p-3 bg-white bg-opacity-50 rounded">
                <div className="font-medium text-gray-700 mb-1">Moderator note:</div>
                <p className="text-gray-600">{factCheck.moderatorNote}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function CommentCard({ comment }) {
  const date = comment.createdAt?.seconds 
    ? new Date(comment.createdAt.seconds * 1000)
    : new Date();
    
  return (
    <Link
      href={`/episode/${comment.episodeId}?selectedFactCheck=${comment.factCheckId}#comment-${comment.id}`}
      className="block bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
    >
      <div className="text-sm text-gray-500 mb-2">
        {date.toLocaleDateString()}
      </div>
      <p className="text-gray-900 mb-4">{comment.content}</p>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <ThumbsUp className="text-green-500" size={16} />
          <span>{comment.upvotes || 0}</span>
        </div>
        <div className="flex items-center gap-1">
          <ThumbsDown className="text-red-500" size={16} />
          <span>{comment.downvotes || 0}</span>
        </div>
      </div>
    </Link>
  );
}

function EmptyState({ message }) {
  return (
    <div className="text-center py-12 bg-white rounded-lg">
      <p className="text-gray-500">{message}</p>
    </div>
  );
}