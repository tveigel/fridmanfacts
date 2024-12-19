// components/fact-checks/ModeratorCommentModal.js
import React, { useState } from 'react';
import Modal from '../../common/Modal';

export default function ModeratorCommentModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  actionType 
}) {
  const [comment, setComment] = useState('');
  const [sourceLink, setSourceLink] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ comment, sourceLink });
    setComment('');
    setSourceLink('');
    onClose();
  };

  const getActionText = () => {
    switch (actionType) {
      case 'VALIDATED_FALSE':
        return 'Mark as False';
      case 'VALIDATED_CONTROVERSIAL':
        return 'Mark as Controversial';
      default:
        return 'Submit';
    }
  };

  const getActionDescription = () => {
    switch (actionType) {
      case 'VALIDATED_FALSE':
        return 'Please explain why this fact check is false:';
      case 'VALIDATED_CONTROVERSIAL':
        return 'Please explain why this fact check is controversial:';
      default:
        return 'Please provide your comment:';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          Moderator Comment
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {getActionDescription()}
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              required
              placeholder="Enter your comment here..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Source Link (Optional)
            </label>
            <input
              type="url"
              value={sourceLink}
              onChange={(e) => setSourceLink(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              {getActionText()}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}