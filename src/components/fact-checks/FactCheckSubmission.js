// src/components/fact-checks/FactCheckSubmission.js
import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/context/AuthContext';
import { factCheckService } from '../../lib/services';
import { AlertCircle } from 'lucide-react';

export default function FactCheckSubmission({ 
  episodeId, 
  transcriptTime, 
  selectedText,
  onClose 
}) {
  const { user } = useAuth();
  const [source, setSource] = useState('');
  const [context, setContext] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Validate props on mount
  useEffect(() => {
    console.log('FactCheckSubmission mounted with:', { episodeId, transcriptTime, selectedText, user });
    
    if (!episodeId) {
      console.error('FactCheckSubmission: episodeId is required');
      setError('Episode ID is missing. Please try again later.');
    }
    if (!transcriptTime) {
      console.error('FactCheckSubmission: transcriptTime is required');
      setError('Transcript time is missing. Please try again later.');
    }
    if (!selectedText) {
      console.error('FactCheckSubmission: selectedText is required');
      setError('Selected text is missing. Please try again later.');
    }
  }, [episodeId, transcriptTime, selectedText, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to submit a fact check.');
      return;
    }
    if (!episodeId || !transcriptTime || !selectedText) {
      setError('Missing required information. Please try again.');
      return;
    }
  
    setIsSubmitting(true);
    setError(null);
  
    try {
      const factCheckData = {
        episodeId,
        transcriptTime,
        flaggedText: selectedText,
        submittedBy: user.uid,
        source,
        context,
        status: 'UNVALIDATED',
        upvotes: 0,
        downvotes: 0
      };
  
      await factCheckService.createFactCheck(factCheckData);
      
      // If we get here, the operation was successful
      onClose();
    } catch (error) {
      console.error('Error submitting fact check:', error);
      
      // Check if the fact check might have been created despite the error
      // This helps prevent duplicate submissions
      if (error.message?.includes('permission-denied')) {
        setError('Permission denied. Please try logging out and back in.');
      } else {
        setError(error.message || 'Failed to submit fact check. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="p-4 text-center">
        <p>Please log in to submit fact checks.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Submit Fact Check</h3>
      
      <div className="mb-4 p-2 bg-gray-100 rounded">
        <strong>Selected text:</strong>
        <q className="block mt-1 italic">{selectedText}</q>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Source URL</label>
          <input
            type="url"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            placeholder="https://example.com/source"
          />
        </div>

        <div>
          <label className="block mb-1">Context/Explanation</label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            rows={4}
            placeholder="Explain why this needs fact-checking..."
          />
        </div>

        {error && (
          <div className="p-2 text-red-600 bg-red-50 rounded flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
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
            disabled={isSubmitting || !!error}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
}