import React from 'react';
import HighlightedText from '../fact-checks/HighlightedText';
import { FactCheck } from '../../lib/types/types';

interface TranscriptEntry {
  time: string;
  text: string;
  speaker?: string;
}

interface TimestampMap {
  [key: string]: string;
}

interface FactCheckMap {
  [key: string]: FactCheck[];
}

interface TranscriptEntryProps {
  entry: TranscriptEntry;
  timestampMap: TimestampMap;
  factChecks: FactCheckMap;
  isSelectionMode: boolean;
  onTextSelection: (data: {
    rect: DOMRect;
    selectedText: string;
    entry: TranscriptEntry;
  }) => void;
  onFactCheckClick: (factCheck: FactCheck) => void;
}

export function TranscriptEntry({ 
  entry, 
  timestampMap, 
  factChecks, 
  isSelectionMode, 
  onTextSelection, 
  onFactCheckClick 
}: TranscriptEntryProps) {
  if (!entry || !entry.time) return null;
  
  const sanitizedTime = entry.time.replace(/[:()]/g, "");
  const entryFactChecks = factChecks[entry.time] || [];
  const isTimestamp = timestampMap[entry.time];
  const hasNewSpeaker = entry.speaker && entry.speaker.trim().length > 0;
  
  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault();
    const selection = window.getSelection();
    
    if (!selection) return;
    
    const selectedText = selection.toString().trim();
    
    if (selectedText && selection.rangeCount > 0) {
      try {
        const range = selection.getRangeAt(0);
        if (!range) return;
        
        const rect = range.getBoundingClientRect();
        if (!rect) return;
        
        onTextSelection({
          rect,
          selectedText,
          entry
        });
      } catch (error) {
        console.error('Error getting selection range:', error);
      }
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
      <div className="mb-6 flex items-center gap-4">
        <strong className="transcript-time">{entry.time}</strong>
        {isTimestamp && (
          <span className="text-xl text-gray-600">
            {timestampMap[entry.time]}
          </span>
        )}
      </div>

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