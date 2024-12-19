// lib/utils/votingUtils.js
export const getVoteColor = (upvotes, downvotes) => {
    const diff = upvotes - downvotes;
    if (diff > 0) return 'text-green-600';
    if (diff < 0) return 'text-red-600';
    return 'text-gray-600';
  };
  
  export const getVoteBasedStyle = (upvotes, downvotes) => {
    const diff = upvotes - downvotes;
    if (diff > 0) return 'bg-green-100';
    if (diff < 0) return 'bg-red-100';
    return 'bg-white';
  };