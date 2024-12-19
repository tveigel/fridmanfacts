// src/lib/utils/__tests__/flagUtils.test.js
import { getFlagStatus, VOTE_THRESHOLDS } from '../flagUtils';

describe('getFlagStatus', () => {
  it('should return moderator validation status when present', () => {
    const factCheck = {
      moderatorValidation: 'VALIDATED_TRUE',
      voteCount: -5 // This should be ignored when moderator validation exists
    };
    
    expect(getFlagStatus(factCheck, true)).toBe('VALIDATED_TRUE');
  });

  it('should return VALIDATED_TRUE when votes exceed threshold', () => {
    const factCheck = {
      voteCount: VOTE_THRESHOLDS.VALIDATED + 1
    };
    
    expect(getFlagStatus(factCheck, false)).toBe('VALIDATED_TRUE');
  });

  it('should return VALIDATED_CONTROVERSIAL when votes are below controversial threshold', () => {
    const factCheck = {
      voteCount: VOTE_THRESHOLDS.CONTROVERSIAL - 1
    };
    
    expect(getFlagStatus(factCheck, false)).toBe('VALIDATED_CONTROVERSIAL');
  });

  it('should return UNVALIDATED for votes between thresholds', () => {
    const factCheck = {
      voteCount: 0
    };
    
    expect(getFlagStatus(factCheck, false)).toBe('UNVALIDATED');
  });
});