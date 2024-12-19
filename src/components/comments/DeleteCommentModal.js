import React, { useState } from 'react';
import Modal from '../common/Modal';

export default function DeleteCommentModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isModerator 
}) {
  const [reason, setReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(reason);
    setReason('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          {isModerator ? 'Delete Comment' : 'Confirm Deletion'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {isModerator && (
            <div>
              <label className="block mb-2">
                Reason for deletion (optional):
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border rounded resize-none"
                rows={3}
                placeholder="Enter reason for deletion..."
              />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              {isModerator ? 'Delete Comment' : 'Delete My Comment'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}