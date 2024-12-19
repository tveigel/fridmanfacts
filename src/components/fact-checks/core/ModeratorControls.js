// components/fact-checks/core/ModeratorControls.js
import { useState } from 'react';
import Modal from '../../common/Modal';

export default function ModeratorControls({ onValidate, onDelete }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');

  const handleDeleteSubmit = (e) => {
    e.preventDefault();
    if (deleteReason.trim()) {
      onDelete(deleteReason);
      setShowDeleteModal(false);
      setDeleteReason('');
    }
  };

  return (
    <>
      <div className="mt-4 p-2 bg-gray-50 rounded" data-testid="moderator-controls">
        <h4 className="font-medium mb-2">Moderator Controls</h4>
        <div className="flex gap-2">
            <button
                onClick={(e) => onValidate(e, 'VALIDATED_TRUE')}
                className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                >
                Validate
            </button>
            <button
                onClick={(e) => onValidate(e, 'VALIDATED_FALSE')}
                className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                Mark False
            </button>
            <button
                onClick={(e) => onValidate(e, 'VALIDATED_CONTROVERSIAL')}
                className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                >
                Mark Controversial
            </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Delete
          </button>
        </div>
      </div>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">Delete Fact Check</h3>
          <form onSubmit={handleDeleteSubmit}>
            <div className="mb-4">
              <label className="block mb-2">
                Please provide a reason for deletion:
              </label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="w-full px-3 py-2 border rounded resize-none"
                rows={3}
                required
                data-testid="delete-reason-input"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                disabled={!deleteReason.trim()}
                data-testid="confirm-delete-button"
              >
                Delete
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}