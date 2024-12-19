// src/components/karma/KarmaDisplay.js
import React, { useState, useRef, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useKarma } from '../../hooks/useKarma';
import { formatNumber } from '../../lib/utils/numbers';
import { 
  KARMA_LEVELS, 
  getKarmaLevel, 
  getNextMilestone 
} from '../../lib/utils/karmaConstants';

export function KarmaHistoryItem({ entry }) {
  return (
    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
      <div>
        <span className="text-gray-600">{entry.action}</span>
        <span className={`ml-2 font-medium ${entry.points >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {entry.points > 0 ? '+' : ''}{entry.points}
        </span>
      </div>
      <span className="text-sm text-gray-500">
        {new Date(entry.timestamp?.seconds * 1000).toLocaleDateString()}
      </span>
    </div>
  );
}

export function KarmaDisplay({ size = "default", className = "", showDetails = false }) {
  const { karma, loading } = useKarma();
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef(null);
  const karmaRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target) &&
          karmaRef.current && !karmaRef.current.contains(event.target)) {
        setShowTooltip(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [karma]);

  if (loading) {
    return (
      <div className={`flex items-center gap-1 ${
        size === "large" ? 'text-xl' : 'text-sm'
      } ${className}`}>
        <div className="animate-pulse bg-gray-300 rounded h-4 w-12"></div>
      </div>
    );
  }

  const formattedKarma = formatNumber(karma || 0);
  const level = getKarmaLevel(karma || 0);
  const levelInfo = KARMA_LEVELS[level];
  const nextMilestone = getNextMilestone(karma || 0);

  const karmaContent = (
    <div 
      ref={karmaRef}
      className={`flex items-center gap-1.5 cursor-pointer ${
        size === "large" ? 'text-xl' : 'text-sm'
      } ${className} ${isAnimating ? 'karma-change' : ''}`}
      onClick={() => setShowTooltip(!showTooltip)}
    >
      <Star className={`${levelInfo.color} ${
        size === "large" ? 'w-6 h-6' : 'w-4 h-4'
      }`} />
      <span className={`font-medium ${
        size === "large" ? 'text-gray-900' : 'text-white'
      }`}>
        {formattedKarma}
      </span>
    </div>
  );

  if (showDetails) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
        {karmaContent}
        
        <div className={`karma-badge ${levelInfo.bgColor} ${levelInfo.color}`}>
          {levelInfo.label}
        </div>

        {nextMilestone && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Next: {nextMilestone.achievement}</span>
              <span>{karma}/{nextMilestone.threshold}</span>
            </div>
            <div className="karma-progress">
              <div 
                className={`karma-progress-bar ${levelInfo.bgColor}`}
                style={{ 
                  width: `${Math.min(100, (karma/nextMilestone.threshold) * 100)}%` 
                }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      {karmaContent}
      {showTooltip && (
        <div
          ref={tooltipRef}
          className="absolute top-full mt-2 p-3 bg-white text-black rounded-lg shadow-xl whitespace-nowrap z-50"
          style={{ left: '50%', transform: 'translateX(-50%)' }}
        >
          <div className="font-medium">{levelInfo.label}</div>
          {nextMilestone && (
            <div className="text-sm text-gray-600">
              {nextMilestone.threshold - karma} points to {nextMilestone.achievement}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ErrorFallback() {
  return (
    <div className="text-gray-400 flex items-center gap-1">
      <Star size={16} />
      <span>--</span>
    </div>
  );
}