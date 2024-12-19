// components/fact-checks/HighlightedText.js
import React from 'react';

export default function HighlightedText({ 
  text, 
  factChecks, 
  onFactCheckClick 
}) {
  if (!factChecks || factChecks.length === 0) {
    return text;
  }

  const getBackgroundColor = (check) => {
    const status = check.moderatorValidation || check.status || 'UNVALIDATED';
    switch (status) {
      case 'VALIDATED_FALSE':
        return 'bg-red-100';
      case 'VALIDATED_CONTROVERSIAL':
        return 'bg-yellow-100';
      case 'VALIDATED_TRUE':
        return 'bg-green-100';
      default:
        return 'bg-gray-100';
    }
  };

  // Sort fact checks by position in text
  const sortedChecks = [...factChecks].sort((a, b) => {
    const aStart = text.indexOf(a.flaggedText);
    const bStart = text.indexOf(b.flaggedText);
    return aStart - bStart;
  });

  let lastIndex = 0;
  const parts = [];

  sortedChecks.forEach((check, index) => {
    const startIndex = text.indexOf(check.flaggedText);
    if (startIndex === -1) return;

    // Add text before the highlight
    if (startIndex > lastIndex) {
      parts.push(text.slice(lastIndex, startIndex));
    }

    // Handle click event to prevent event bubbling and ensure proper function call
    const handleClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      onFactCheckClick(check);
    };

    // Add highlighted text with data attribute for position tracking
    parts.push(
      <span
        key={index}
        onClick={handleClick}
        className={`${getBackgroundColor(check)} cursor-pointer hover:opacity-80 transition-opacity`}
        data-factcheck-id={check.id}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleClick(e);
          }
        }}
      >
        {text.slice(startIndex, startIndex + check.flaggedText.length)}
      </span>
    );

    lastIndex = startIndex + check.flaggedText.length;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
}