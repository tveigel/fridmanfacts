// useTextSelection.ts
'use client';
import { useState } from 'react';

// Define interfaces for the selection data
interface SelectionRect {
  top: number;
  right: number;
  bottom?: number;
  left?: number;
}

interface TranscriptEntry {
  time: string;
  text: string;
  speaker?: string;
}

interface TextSelectionData {
  rect: SelectionRect;
  selectedText: string;
  entry: TranscriptEntry | null;
}

interface PopupPosition {
  top: number;
  left: number;
}

export function useTextSelection() {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<TranscriptEntry | null>(null);
  const [popupPosition, setPopupPosition] = useState<PopupPosition | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleTextSelection = ({ rect, selectedText, entry }: TextSelectionData) => {
    if (!isSelectionMode) return;

    if (selectedText) {
      console.log('Selection rect:', rect); // Debug log
      
      setSelectedText(selectedText);
      setSelectedEntry(entry);
      setPopupPosition({
        top: rect.top,
        left: rect.right + 10
      });
    } else {
      setPopupPosition(null);
    }
  };

  const handleFactCheckClick = () => {
    window.getSelection()?.removeAllRanges(); // Clear the selection
    setShowModal(true);
    setPopupPosition(null);
  };

  return {
    isSelectionMode,
    setIsSelectionMode,
    selectedText,
    selectedEntry,
    popupPosition,
    showModal,
    setShowModal,
    handleTextSelection,
    handleFactCheckClick,
  };
}