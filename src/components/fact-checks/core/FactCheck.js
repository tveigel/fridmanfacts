// src/components/fact-checks/core/FactCheck.js
import React, { useState } from 'react';
import { useAuth } from '../../../lib/context/AuthContext';
import { useModeration } from '../../../hooks/useModeration';
import { useRoles } from '../../../hooks/useRoles';
import { factCheckService, notificationService } from '../../../lib/services';
import FlagIcon from '../FlagIcon';
import FactCheckVoting from './FactCheckVoting';
import { getVoteBasedStyle } from '../../../lib/utils/votingUtils';
import { getStatusColors } from '../../../lib/utils/colors';
import FactCheckContent from './FactCheckContent';
import ModeratorControls from './ModeratorControls';
import ModeratorCommentModal from '../ui/ModeratorCommentModal';
import CommentSection from '../../comments/CommentSection';

const getNotificationMessage = (status, comment) => {
  switch (status) {
    case 'VALIDATED_TRUE':
      return 'Your fact check has been validated as correct';
    case 'VALIDATED_FALSE':
      return `Your fact check has been marked as false${comment ? `. Moderator note: ${comment}` : ''}`;
    case 'VALIDATED_CONTROVERSIAL':
      return `Your fact check has been marked as controversial${comment ? `. Moderator note: ${comment}` : ''}`;
    default:
      return 'Your fact check status has been updated';
  }
};

export default function FactCheck({ factCheck, onVote, userVotes, onUpdateOrDelete }) {
  const { user } = useAuth();
  const { isModerator: isModFromModeration } = useModeration();
  const { isModerator: isModFromRoles } = useRoles();
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  
  const isModerator = isModFromModeration || isModFromRoles;
  const currentUserVote = userVotes?.[factCheck.id] || 0;
  const flagStatus = factCheck.moderatorValidation || factCheck.status || 'UNVALIDATED';
  
  // Get background color based on moderator status
  const { bg } = getStatusColors(flagStatus);

  const handleModeratorValidation = async (e, status) => {
    if (!isModerator || !user) return;
    e.preventDefault();
    e.stopPropagation();
  
    if (status === 'VALIDATED_TRUE') {
      await updateFactCheckStatus(status);
    } else {
      setPendingAction(status);
      setShowCommentModal(true);
    }
  };

  const handleDeleteFactCheck = async (reason) => {
    try {
      await factCheckService.deleteFactCheck(factCheck.id, factCheck.episodeId);
      
      if (factCheck.submittedBy) {
        await notificationService.createNotification({
          userId: factCheck.submittedBy,
          factCheckId: factCheck.id,
          message: `Your fact check has been deleted. ${reason ? `Reason: ${reason}` : ''}`,
          type: 'MODERATION'
        });
      }

      if (onUpdateOrDelete) {
        onUpdateOrDelete(factCheck.id);
      }
    } catch (error) {
      console.error('Error deleting fact check:', error);
    }
  };

  const updateFactCheckStatus = async (status, comment = null, sourceLink = null) => {
    try {
      const updateData = {
        moderatorValidation: status,
        moderatorNote: comment,
        moderatorSourceLink: sourceLink,
        moderatedBy: user.uid,
        moderatedAt: new Date()
      };

      await factCheckService.updateFactCheck(factCheck.id, updateData);

      if (factCheck.submittedBy) {
        const notificationMessage = getNotificationMessage(status, comment);
        await notificationService.createNotification({
          userId: factCheck.submittedBy,
          factCheckId: factCheck.id,
          message: notificationMessage,
          type: 'FACT_CHECK_UPDATE'
        });
      }

      if (onUpdateOrDelete) {
        onUpdateOrDelete(factCheck.id, { ...factCheck, ...updateData });
      }
    } catch (error) {
      console.error('Error updating fact check:', error);
    }
  };

  return (
    <>
      <div className={`fact-check-card p-6 my-3 rounded-lg relative ${bg}`}>
        <div className="absolute top-4 right-4">
          <FlagIcon status={flagStatus} size={32} />
        </div>

        <div className="flex items-start gap-6">
          {/* Voting section with its own background */}
          <div className={`rounded-lg ${getVoteBasedStyle(factCheck.upvotes || 0, factCheck.downvotes || 0)} p-2`}>
            <FactCheckVoting
              upvotes={factCheck.upvotes}
              downvotes={factCheck.downvotes}
              currentUserVote={currentUserVote}
              onVote={onVote}
              factCheckId={factCheck.id}
              user={user}
            />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base text-gray-600">
                Submitted by {factCheck.submittedBy}
              </span>
            </div>

            <FactCheckContent factCheck={factCheck} />

            {isModerator && (
              <ModeratorControls
                onValidate={handleModeratorValidation}
                onDelete={handleDeleteFactCheck}
              />
            )}

            <div className="mt-6 pt-4 border-t border-gray-200">
              <CommentSection factCheckId={factCheck.id} />
            </div>
          </div>
        </div>
      </div>

      <ModeratorCommentModal
        isOpen={showCommentModal}
        onClose={() => setShowCommentModal(false)}
        onSubmit={async ({ comment, sourceLink }) => {
          await updateFactCheckStatus(pendingAction, comment, sourceLink);
          setShowCommentModal(false);
          setPendingAction(null);
        }}
        actionType={pendingAction}
      />
    </>
  );
}