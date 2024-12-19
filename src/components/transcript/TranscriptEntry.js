// components/transcript/TranscriptEntry.js
import React from 'react';
import HighlightedText from '../fact-checks/HighlightedText';

export default function TranscriptEntry({ 
  entry, 
  timestampMap, 
  factChecks, 
  isSelectionMode, 
  onTextSelection, 
  onFactCheckClick 
}) {
  if (!entry || !entry.time) return null;
  
  const sanitizedTime = entry.time.replace(/[:()]/g, "");
  const entryFactChecks = factChecks[entry.time] || [];
  const isTimestamp = timestampMap[entry.time];
  const hasNewSpeaker = entry.speaker && entry.speaker.trim().length > 0;
  
  const handleMouseUp = (e) => {
    e.preventDefault(); // Prevent any default handling
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();
    
    if (selectedText && selection?.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      // Pass the actual viewport coordinates
      onTextSelection({
        rect,
        selectedText,
        entry
      });
    }
  };
  
  return (
    <div
      id={`transcript-${sanitizedTime}`}
      className={`p-8 ${isTimestamp ? 'bg-gray-50' : 'bg-white'} rounded-lg shadow-sm
                  border border-gray-200 hover:border-gray-300 transition-colors
                  ${isSelectionMode ? 'cursor-text select-text' : 'select-none'}
                  mb-6`}
      onMouseUp={handleMouseUp}
    >
      {/* Time and Chapter with larger text */}
      <div className="mb-6 flex items-center gap-4">
        <strong className="transcript-time">{entry.time}</strong>
        {isTimestamp && (
          <span className="text-xl text-gray-600">
            {timestampMap[entry.time]}
          </span>
        )}
      </div>

      {/* Transcript Text with larger font */}
      <div className="transcript-text">
        {hasNewSpeaker && (
          <em className="transcript-speaker block mb-4 text-gray-900">
            {entry.speaker}:
          </em>
        )}
        <div className="space-y-3">
          <HighlightedText
            text={entry.text}
            factChecks={entryFactChecks}
            onFactCheckClick={onFactCheckClick}
          />
        </div>
      </div>
    </div>
  );
}