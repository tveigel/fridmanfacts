// src/components/profile/KarmaHistory.js
import React, { useState } from 'react';
import { useKarma } from '../../hooks/useKarma';
import { KarmaHistoryItem } from '../karma/KarmaDisplay';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function KarmaHistory() {
  const { karmaHistory, loading } = useKarma();
  const [isExpanded, setIsExpanded] = useState(false);

  if (loading) {
    return <div className="animate-pulse bg-gray-100 h-32 rounded-lg"></div>;
  }

  const sortedHistory = [...karmaHistory].sort((a, b) => 
    b.timestamp.seconds - a.timestamp.seconds
  );

  const displayedHistory = isExpanded 
    ? sortedHistory 
    : sortedHistory.slice(0, 5);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">Karma History</h3>
        {karmaHistory.length > 5 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
          >
            {isExpanded ? (
              <>
                Show Less
                <ChevronUp size={16} />
              </>
            ) : (
              <>
                Show All
                <ChevronDown size={16} />
              </>
            )}
          </button>
        )}
      </div>

      <div className="space-y-2">
        {displayedHistory.length > 0 ? (
          displayedHistory.map((entry) => (
            <KarmaHistoryItem key={entry.id} entry={entry} />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No karma history yet
          </div>
        )}
      </div>
    </div>
  );
}