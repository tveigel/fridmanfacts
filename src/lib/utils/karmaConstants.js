// src/lib/utils/karmaConstants.js

export const KARMA_LEVELS = {
    NOVICE: { 
      min: 0, 
      max: 99, 
      label: 'Novice',
      color: 'text-gray-400',
      bgColor: 'bg-gray-100'
    },
    BRONZE: { 
      min: 100, 
      max: 499, 
      label: 'Bronze',
      color: 'text-amber-600',
      bgColor: 'bg-amber-100'
    },
    SILVER: { 
      min: 500, 
      max: 999, 
      label: 'Silver',
      color: 'text-gray-300',
      bgColor: 'bg-gray-100'
    },
    GOLD: { 
      min: 1000, 
      max: Infinity, 
      label: 'Gold',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-100'
    }
  };
  
  export const KARMA_MILESTONES = [
    { 
      threshold: 100, 
      achievement: 'Rising Star',
      description: 'Made 100 karma points',
      icon: '⭐'
    },
    { 
      threshold: 500, 
      achievement: 'Trusted Contributor',
      description: 'Reached 500 karma points',
      icon: '🌟'
    },
    { 
      threshold: 1000, 
      achievement: 'Expert Fact Checker',
      description: 'Achieved 1000 karma points',
      icon: '👑'
    },
    { 
      threshold: 5000, 
      achievement: 'Truth Seeker',
      description: 'Mastered fact checking with 5000 points',
      icon: '🔍'
    }
  ];
  
  export const getKarmaLevel = (karma) => {
    return Object.entries(KARMA_LEVELS).find(
      ([_, level]) => karma >= level.min && karma <= level.max
    )?.[0] || 'NOVICE';
  };
  
  export const getNextMilestone = (karma) => {
    return KARMA_MILESTONES.find(milestone => karma < milestone.threshold);
  };
  
  export const getCompletedMilestones = (karma) => {
    return KARMA_MILESTONES.filter(milestone => karma >= milestone.threshold);
  };