// src/lib/services/__tests__/voteService.test.ts
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { voteService } from '../voteService';
import { db } from '../../firebase/firebaseConfig';

// Mock Firebase modules
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDocs: jest.fn(),
  setDoc: jest.fn(),
  deleteDoc: jest.fn(),
  runTransaction: jest.fn(),
  serverTimestamp: jest.fn(),
}));

jest.mock('../../firebase/firebaseConfig', () => ({
  db: {},
}));

describe('voteService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Restore console.error to its original state
  });

  describe('getUserVotes', () => {
    it('should fetch votes for multiple fact checks', async () => {
      const mockVoteDocs = [{ id: 'user1', data: () => ({ value: 1 }) }];

      (collection as jest.Mock).mockReturnValue('votesCollection');
      (getDocs as jest.Mock).mockResolvedValue({
        forEach: (callback: (doc: any) => void) => mockVoteDocs.forEach(callback),
      });

      const result = await voteService.getUserVotes('user1', ['factCheck1']);

      expect(result).toEqual({ factCheck1: 1 });
      expect(collection).toHaveBeenCalledWith(db, 'factChecks', 'factCheck1', 'votes');
    });
  });

  describe('submitVote', () => {
    it('should handle new upvote correctly', async () => {
      const mockTransaction = {
        get: jest.fn().mockResolvedValue({
          exists: () => true,
          data: () => ({ upvotes: 1, downvotes: 0 }),
        }),
        set: jest.fn(),
        update: jest.fn(),
      };

      (runTransaction as jest.Mock).mockImplementation((_, callback) =>
        Promise.resolve(callback(mockTransaction))
      );

      await voteService.submitVote('factCheck1', 'user1', 1);

      expect(runTransaction).toHaveBeenCalled();
      expect(mockTransaction.update).toHaveBeenCalled();
    });

    it('should handle vote removal correctly', async () => {
      const mockTransaction = {
        get: jest.fn().mockResolvedValue({
          exists: () => true,
          data: () => ({ upvotes: 1, downvotes: 0 }),
        }),
        delete: jest.fn(),
        update: jest.fn(),
      };

      (runTransaction as jest.Mock).mockImplementation((_, callback) =>
        Promise.resolve(callback(mockTransaction))
      );

      await voteService.submitVote('factCheck1', 'user1', 0, 1);

      expect(runTransaction).toHaveBeenCalled();
      expect(mockTransaction.update).toHaveBeenCalled();
    });

    it('should throw error if fact check does not exist', async () => {
      const mockTransaction = {
        get: jest.fn().mockResolvedValue({
          exists: () => false,
        }),
      };

      (runTransaction as jest.Mock).mockImplementation((_, callback) =>
        Promise.reject(new Error('Fact check does not exist!'))
      );

      await expect(voteService.submitVote('factCheck1', 'user1', 1)).rejects.toThrow(
        'Fact check does not exist!'
      );
    });
  });
});
