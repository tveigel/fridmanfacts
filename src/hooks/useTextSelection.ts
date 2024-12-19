// useTextSelection.ts
'use client';

import { useState } from 'react';


export function useTextSelection() {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [popupPosition, setPopupPosition] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleTextSelection = ({ rect, selectedText, entry }) => {
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