// Define vote thresholds
export const VOTE_THRESHOLDS = {
    CONTROVERSIAL: -1,  // Test threshold: 0 or below is controversial
    VALIDATED: 1      // Test threshold: 1 or above is validated
  };
  
  export const getFlagStatus = (factCheck, isModerator = false) => {
    // If a moderator has validated it, their status takes precedence
    if (factCheck.moderatorValidation) {
      return factCheck.moderatorValidation;
    }
  
    // Community validation based on votes
    const voteCount = factCheck.voteCount || 0;
    
    // Three clear states:
    if (voteCount >= VOTE_THRESHOLDS.VALIDATED) {
      return 'VALIDATED_TRUE';
    } else if (voteCount <= VOTE_THRESHOLDS.CONTROVERSIAL) {
      return 'VALIDATED_CONTROVERSIAL';
    } else {
      // Everything else (including 0 votes) should be unvalidated
      return 'UNVALIDATED';
    }
  };