// src/components/episodes/EpisodeLayout.js
import React from 'react';
import { LAYOUT } from '../../lib/utils/constants';


export default function EpisodeLayout({ 
  header, 
  tableOfContents,
  transcript,
  sidePanel 
}) {
  return (
    <div className="container mx-auto px-4">
      {/* Header Section */}
      <div className="mb-6">
        {header}
      </div>

      {/* Table of Contents */}
      <div className="mb-6">
        {tableOfContents}
      </div>

      {/* Main Content Area - Add relative positioning here */}
      <div className={`flex ${LAYOUT.SIDEBAR_GAP} relative min-h-screen`}>
        {/* Transcript Column */}
        <div className={`${LAYOUT.CONTENT_WIDTH}`}>
          {transcript}
        </div>

        {/* Side Panel Container - Add specific height and overflow */}
        <div className={`${LAYOUT.SIDEBAR_WIDTH} ${LAYOUT.SIDEBAR_MIN_WIDTH}`}>
          <div className="sticky top-4">
            {sidePanel}
          </div>
        </div>
      </div>
    </div>
  );
}