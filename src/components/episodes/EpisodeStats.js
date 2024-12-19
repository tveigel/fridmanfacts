import React from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import FlagIcon from '../fact-checks/FlagIcon';

const EpisodeStats = ({ factChecks }) => {
  // Calculate statistics
  const stats = factChecks.reduce((acc, check) => {
    acc.upvotes += check.upvotes || 0;
    acc.downvotes += check.downvotes || 0;
    
    const status = check.moderatorValidation || check.status || 'UNVALIDATED';
    acc[status]++;
    
    return acc;
  }, {
    upvotes: 0,
    downvotes: 0,
    UNVALIDATED: 0,
    VALIDATED_TRUE: 0,
    VALIDATED_FALSE: 0,
    VALIDATED_CONTROVERSIAL: 0
  });

  if (Object.values(stats).every(val => val === 0)) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Vote counts */}
      <div className="flex items-center gap-4 mr-2">
        <div className="flex items-center gap-1">
          <ThumbsUp size={18} className="text-green-600" />
          <span className="text-sm font-bold text-green-700">
            {stats.upvotes}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <ThumbsDown size={18} className="text-red-600" />
          <span className="text-sm font-bold text-red-700">
            {stats.downvotes}
          </span>
        </div>
      </div>

      {/* Status flags */}
      {Object.entries({
        VALIDATED_TRUE: { color: 'green', label: 'Valid' },
        VALIDATED_FALSE: { color: 'red', label: 'False' },
        VALIDATED_CONTROVERSIAL: { color: 'yellow', label: 'Disputed' }
      }).map(([status, { color, label }]) => (
        stats[status] > 0 && (
          <div 
            key={status}
            className={`flex items-center gap-1 px-2 py-1 rounded-full 
              bg-${color}-50 text-${color}-700`}
          >
            <FlagIcon status={status} size={16} />
            <span className="text-sm font-medium">
              {stats[status]} {label}
            </span>
          </div>
        )
      ))}
    </div>
  );
};

export default EpisodeStats;