// src/components/comments/Comment.js
import React, { useState } from 'react';
import { ArrowUp, ArrowDown, Reply, Trash } from 'lucide-react';
import { useAuth } from '../../lib/context/AuthContext';
import { useRoles } from '../../hooks/useRoles';
import DeleteCommentModal from './DeleteCommentModal';
import CommentVoting from './CommentVoting';

const isHighlyRated = (comment) => {
  const upvotes = comment.upvotes || 0;
  const downvotes = comment.downvotes || 0;
  return (upvotes - downvotes) >= 2;
};

export default function Comment({
  comment,
  currentUserVote,
  onVote,
  onReply,
  onDelete,
  depth = 0,
  children
}) {
  const { user } = useAuth();
  const { isModerator } = useRoles();
  const [isExpanded, setIsExpanded] = useState(() => {
    // Show highly rated comments by default
    if (isHighlyRated(comment)) return true;
    // Show parent comments of highly rated replies
    if (children && React.Children.toArray(children).some(child => 
      child.props.comment && isHighlyRated(child.props.comment)
    )) return true;
    // Otherwise follow depth rules
    return depth < 3;
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const maxDepth = 5;

  if (!isExpanded) {
    return (
      <div 
        className="pl-4 py-2 cursor-pointer text-gray-500 hover:text-gray-700" 
        onClick={() => setIsExpanded(true)}
      >
        {isHighlyRated(comment) ? (
          <div className="flex items-center gap-2">
            <span>[+]</span>
            <span className="text-blue-500">Highly rated comment</span>
            <span>({comment.upvotes || 0} upvotes)</span>
          </div>
        ) : (
          "[+] Expand comment"
        )}
      </div>
    );
  }

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  return (
    <div className={`pl-4 ${depth > 0 ? 'border-l border-gray-200' : ''}`}>
      <div className="py-2">
        <div className="flex items-start gap-2">
          {/* Voting */}
          <CommentVoting
            upvotes={comment.upvotes || 0}
            downvotes={comment.downvotes || 0}
            currentUserVote={currentUserVote}
            onVote={onVote}
            commentId={comment.id}
            user={user}
            disabled={comment.isDeleted}
          />

          {/* Comment content */}
          <div className="flex-1">
            <div className="text-sm text-gray-500 mb-1">
              {comment.userId} · {new Date(comment.createdAt).toLocaleDateString()}
              {comment.isDeleted && (
                <span className="ml-2 italic">
                  · Deleted {new Date(comment.deletedAt).toLocaleDateString()}
                </span>
              )}
            </div>

            {/* Comment text - handles deleted state */}
            <div className="text-gray-900">
              {comment.isDeleted ? (
                <em className="text-gray-500">
                  {comment.moderatorReason 
                    ? `Comment deleted by moderator: ${comment.moderatorReason}`
                    : "This comment was deleted by the user"}
                </em>
              ) : (
                comment.content
              )}
            </div>
            
            {/* Actions */}
            {!comment.isDeleted && (
              <div className="flex items-center gap-4 mt-2">
                {depth < maxDepth && (
                  <button
                    onClick={() => onReply(comment.id)}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                  >
                    <Reply size={14} />
                    Reply
                  </button>
                )}
                {(user?.uid === comment.userId || isModerator) && (
                  <button
                    onClick={handleDeleteClick}
                    className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700"
                  >
                    <Trash size={14} />
                    Delete
                  </button>
                )}
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Collapse
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nested comments */}
      {children}

      {/* Delete Modal */}
      <DeleteCommentModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={(reason) => {
          onDelete(comment.id, reason);
          setShowDeleteModal(false);
        }}
        isModerator={isModerator && user?.uid !== comment.userId}
      />
    </div>
  );
}