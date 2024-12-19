// src/components/comments/CommentSection.js
import React, { useState, useMemo } from 'react';
import { useComments } from '../../hooks/useComments';
import { useAuth } from '../../lib/context/AuthContext';
import Comment from './Comment';
import { MessageSquarePlus } from 'lucide-react';
import { useProtectedAction } from '../../hooks/useProtectedAction';

const isHighlyRated = (comment) => {
  const upvotes = comment.upvotes || 0;
  const downvotes = comment.downvotes || 0;
  return (upvotes - downvotes) >= 2;
};

function CommentForm({ onSubmit, placeholder = "Write a comment...", autoFocus = false }) {
  const [content, setContent] = useState('');
  const { withAuth } = useProtectedAction();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim()) {
      withAuth(() => onSubmit(content))();
      setContent('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={3}
        autoFocus={autoFocus}
      />
      <button
        type="submit"
        disabled={!content.trim()}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
      >
        Submit
      </button>
    </form>
  );
}

function CommentTree({ 
  comments, 
  parentId = null, 
  depth = 0,
  userVotes,
  onVote,
  onReply,
  onDelete,
  showOnlyHighlyRated = false
}) {
  // Filter comments for current level
  const levelComments = comments.filter(comment => comment.parentCommentId === parentId);

  if (levelComments.length === 0) {
    return null;
  }

  // Sort comments by rating (upvotes - downvotes)
  const sortedComments = [...levelComments].sort((a, b) => {
    const ratingA = (a.upvotes || 0) - (a.downvotes || 0);
    const ratingB = (b.upvotes || 0) - (b.downvotes || 0);
    return ratingB - ratingA;
  });

  // If we're only showing highly rated comments, filter them
  const commentsToShow = showOnlyHighlyRated 
    ? sortedComments.filter(comment => isHighlyRated(comment))
    : sortedComments;

  if (commentsToShow.length === 0) {
    return null;
  }

  return (
    <>
      {commentsToShow.map(comment => {
        // For collapsed view, we need to check if this comment has highly rated children
        const hasHighlyRatedChildren = comments.some(c => 
          c.parentCommentId === comment.id && isHighlyRated(c)
        );

        // In collapsed view, only show if the comment is highly rated or has highly rated children
        if (showOnlyHighlyRated && !isHighlyRated(comment) && !hasHighlyRatedChildren) {
          return null;
        }

        return (
          <Comment
            key={comment.id}
            comment={comment}
            currentUserVote={userVotes[comment.id] || 0}
            onVote={onVote}
            onReply={onReply}
            onDelete={onDelete}
            depth={depth}
          >
            <CommentTree
              comments={comments}
              parentId={comment.id}
              depth={depth + 1}
              userVotes={userVotes}
              onVote={onVote}
              onReply={onReply}
              onDelete={onDelete}
              showOnlyHighlyRated={showOnlyHighlyRated}
            />
          </Comment>
        );
      })}
    </>
  );
}

export default function CommentSection({ factCheckId }) {
  const {
    comments,
    userVotes,
    loading,
    error,
    handleVote,
    addComment,
    deleteComment
  } = useComments(factCheckId);

  const [replyingTo, setReplyingTo] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const commentCount = comments.length;
  const highlyRatedCount = comments.filter(isHighlyRated).length;

  const handleReply = (parentCommentId) => {
    setReplyingTo(parentCommentId);
  };

  if (loading) {
    return <div className="text-gray-500">Loading comments...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error loading comments: {error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {isExpanded ? (
            `${commentCount} Comment${commentCount !== 1 ? 's' : ''}`
          ) : (
            <button
              onClick={() => setIsExpanded(true)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <MessageSquarePlus size={20} />
              <span>See all {commentCount} comment{commentCount !== 1 ? 's' : ''}</span>
            </button>
          )}
        </h3>
        {isExpanded && (
          <button
            onClick={() => setIsExpanded(false)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Show less
          </button>
        )}
      </div>

      {/* Show the comment tree - when collapsed only show highly rated comments */}
      <div className="space-y-4">
        <CommentTree
          comments={comments}
          userVotes={userVotes}
          onVote={handleVote}
          onReply={handleReply}
          onDelete={deleteComment}
          showOnlyHighlyRated={!isExpanded}
        />
      </div>

      {/* Only show the comment form and reply functionality when expanded */}
      {isExpanded && (
        <>
          <div className="mb-6">
            <CommentForm
              onSubmit={(content) => {
                addComment(content);
              }}
            />
          </div>

          {replyingTo && (
            <div className="pl-8 mt-2">
              <CommentForm
                onSubmit={(content) => {
                  addComment(content, replyingTo);
                  setReplyingTo(null);
                }}
                placeholder="Write a reply..."
                autoFocus
              />
              <button
                onClick={() => setReplyingTo(null)}
                className="mt-2 text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}