// src/components/karma/KarmaAchievements.js
import React from 'react';
import { useKarma } from '../../hooks/useKarma';
import { ChevronRight } from 'lucide-react';
import { KarmaDisplay, KarmaHistoryItem } from './KarmaDisplay';
import { 
  KARMA_MILESTONES, 
  KARMA_LEVELS, 
  getKarmaLevel,
  getCompletedMilestones 
} from '../../lib/utils/karmaConstants';

export default function KarmaAchievements() {
  const { karma, karmaHistory, loading } = useKarma();

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-20 bg-gray-200 rounded-lg"></div>
        <div className="h-40 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  const level = getKarmaLevel(karma);
  const levelInfo = KARMA_LEVELS[level];
  const nextMilestone = KARMA_MILESTONES.find(m => karma < m.threshold);
  const completedMilestones = getCompletedMilestones(karma);

  return (
    <div className="space-y-6">
      {/* Karma Overview Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Karma & Achievements</h2>
          <KarmaDisplay size="large" />
        </div>

        {/* Level Badge */}
        <div className={`inline-flex items-center px-3 py-1 rounded-full ${levelInfo.bgColor} ${levelInfo.color}`}>
          <span className="font-medium">{levelInfo.label}</span>
        </div>

        {/* Progress Bar */}
        {nextMilestone && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progress to {nextMilestone.achievement}</span>
              <span>{karma}/{nextMilestone.threshold}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${levelInfo.bgColor}`}
                style={{
                  width: `${Math.min(100, (karma/nextMilestone.threshold) * 100)}%`
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Achievements Grid */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {KARMA_MILESTONES.map(milestone => {
            const isCompleted = karma >= milestone.threshold;
            const progressPercentage = Math.min(100, (karma/milestone.threshold) * 100);
            
            return (
              <div
                key={milestone.threshold}
                className={`p-4 rounded-lg border transition-all duration-300 ${
                  isCompleted 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200 bg-gray-50'
                } ${isCompleted ? 'achievement-unlock' : 'opacity-50'}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{milestone.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold">{milestone.achievement}</h4>
                      {isCompleted && (
                        <span className="text-green-600 text-sm font-medium">
                          Unlocked!
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {milestone.description}
                    </p>
                    {!isCompleted && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Progress</span>
                          <span>{karma}/{milestone.threshold}</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gray-400 transition-all duration-500"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Karma History */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Recent Karma Activity</h3>
          <button className="text-blue-500 hover:text-blue-600 flex items-center gap-1 text-sm font-medium">
            View All
            <ChevronRight size={16} />
          </button>
        </div>
        {karmaHistory.length > 0 ? (
          <div className="space-y-2">
            {karmaHistory.slice(0, 5).map((entry, index) => (
              <KarmaHistoryItem key={entry.id || index} entry={entry} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No karma activity yet
          </div>
        )}
      </div>
    </div>
  );
}