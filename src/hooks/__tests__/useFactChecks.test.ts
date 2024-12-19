// src/hooks/__tests__/useFactChecks.test.ts
import { renderHook, act } from '@testing-library/react';
import { useFactChecks } from '../useFactChecks';
import { useAuth } from '../../lib/context/AuthContext';

// Create mock functions
const mockGetFactChecksForEpisode = jest.fn();
const mockOrganizeFactChecksByTime = jest.fn();
const mockGetUserVotes = jest.fn();
const mockSubmitVote = jest.fn();

// Mock the entire services module
jest.mock('../../lib/services', () => ({
  factCheckService: {
    getFactChecksForEpisode: (...args) => mockGetFactChecksForEpisode(...args),
    organizeFactChecksByTime: (...args) => mockOrganizeFactChecksByTime(...args),
  },
  voteService: {
    getUserVotes: (...args) => mockGetUserVotes(...args),
    submitVote: (...args) => mockSubmitVote(...args),
  },
  roleService: {
    setUserRole: jest.fn(),
    getUserRole: jest.fn(),
    checkIsAdmin: jest.fn(),
    checkIsModerator: jest.fn(),
  }
}));

// Mock AuthContext
jest.mock('../../lib/context/AuthContext');

describe('useFactChecks', () => {
  const mockUser = { uid: 'user1' };
  const mockFactChecks = [
    {
      id: 'fact1',
      transcriptTime: '00:01:00',
      flaggedText: 'Test fact',
      upvotes: 1,
      downvotes: 0
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock auth context
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    
    // Mock service responses
    mockGetFactChecksForEpisode.mockResolvedValue(mockFactChecks);
    mockOrganizeFactChecksByTime.mockReturnValue({
      '00:01:00': mockFactChecks
    });
    mockGetUserVotes.mockResolvedValue({ fact1: 0 }); // Start with no vote
    mockSubmitVote.mockResolvedValue(undefined);
  });

  it('should load fact checks and user votes on mount', async () => {
    const { result } = renderHook(() => useFactChecks({ episodeId: 'episode1' }));

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.factChecks).toEqual({
      '00:01:00': mockFactChecks
    });
    expect(result.current.userVotes).toEqual({ fact1: 0 });
  });

  it('should handle vote submission', async () => {
    const { result } = renderHook(() => useFactChecks({ episodeId: 'episode1' }));

    // Wait for initial data load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Verify initial state
    expect(result.current.userVotes).toEqual({ fact1: 0 });

    // Submit vote
    await act(async () => {
      // Call handleVote directly
      await result.current.handleVote('fact1', 1);
      // Wait for any state updates
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Verify the mock was called with correct arguments
    expect(mockSubmitVote).toHaveBeenCalledWith('fact1', mockUser.uid, 1, 0);
  });

  it('should handle fact check deletion', async () => {
    const { result } = renderHook(() => useFactChecks({ episodeId: 'episode1' }));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.handleDelete('fact1');
    });

    expect(result.current.factChecks).toEqual({});
  });

  it('should handle errors during fact check loading', async () => {
    const error = new Error('Failed to load fact checks');
    mockGetFactChecksForEpisode.mockRejectedValue(error);

    const { result } = renderHook(() => useFactChecks({ episodeId: 'episode1' }));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.error).toBe('Failed to load fact checks');
    expect(result.current.loading).toBe(false);
  });

  it('should not load user votes when user is not logged in', async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });

    const { result } = renderHook(() => useFactChecks({ episodeId: 'episode1' }));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.userVotes).toEqual({});
    expect(mockGetUserVotes).not.toHaveBeenCalled();
  });

  it('should handle vote optimization and revert on error', async () => {
    const error = new Error('Vote failed');
    mockSubmitVote.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useFactChecks({ episodeId: 'episode1' }));

    // Wait for initial load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Attempt vote that will fail
    await act(async () => {
      await result.current.handleVote('fact1', 1).catch(() => {});
    });

    // Should have tried to submit the vote
    expect(mockSubmitVote).toHaveBeenCalledWith('fact1', mockUser.uid, 1, 0);

    // Vote count should be reverted
    expect(result.current.userVotes['fact1']).toBe(0);
  });
});