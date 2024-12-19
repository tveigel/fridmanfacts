import React from 'react';
import { useKarma } from '../../../hooks/useKarma';
import { getKarmaLevel, KARMA_LEVELS } from '../../../lib/utils/karmaConstants';

const UserLevelDisplay = ({ userId, displayName = null, className = '', showLevel = true }) => {
  const { karma } = useKarma(userId);
  const currentLevel = getKarmaLevel(karma || 0);
  const levelInfo = KARMA_LEVELS[currentLevel];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-gray-600">
        {displayName || userId}
      </span>
      {showLevel && levelInfo && (
        <span 
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-sm ${levelInfo.bgColor} ${levelInfo.color}`}
          title={`${levelInfo.label} Level`}
        >
          {getLevelEmoji(currentLevel)}
        </span>
      )}
    </div>
  );
};

// Helper function to get level emoji
const getLevelEmoji = (level) => {
  switch (level) {
    case 'GOLD':
      return '👑';
    case 'SILVER':
      return '⭐';
    case 'BRONZE':
      return '🌟';
    default:
      return '👶';
  }
};

export default UserLevelDisplay;