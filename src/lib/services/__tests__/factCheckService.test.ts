// src/lib/services/__tests__/factCheckService.test.ts
import { 
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  increment,
  serverTimestamp
} from 'firebase/firestore';
import { factCheckService } from '../factCheckService';
import { db } from '../../firebase/firebaseConfig';

// Mock Firebase modules
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  doc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  serverTimestamp: jest.fn(),
  increment: jest.fn()
}));

jest.mock('../../firebase/firebaseConfig', () => ({
  db: {}
}));

describe('factCheckService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getFactChecksForEpisode', () => {
    it('should fetch fact checks for a given episode', async () => {
      const mockFactChecks = [
        { id: '1', episodeId: 'episode1', text: 'Test fact check' }
      ];

      (collection as jest.Mock).mockReturnValue('collection');
      (query as jest.Mock).mockReturnValue('query');
      (where as jest.Mock).mockReturnValue('where');
      (getDocs as jest.Mock).mockResolvedValue({
        docs: mockFactChecks.map(fc => ({
          id: fc.id,
          data: () => fc
        }))
      });

      const result = await factCheckService.getFactChecksForEpisode('episode1');

      expect(collection).toHaveBeenCalledWith(db, 'factChecks');
      expect(where).toHaveBeenCalledWith('episodeId', '==', 'episode1');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });
  });

  describe('createFactCheck', () => {
    it('should create a new fact check', async () => {
      const mockFactCheck = {
        episodeId: 'episode1',
        flaggedText: 'Test text',
        submittedBy: 'user1',
        source: 'source1',
        context: 'context1'
      };

      const mockDocRef = { id: 'newFactCheck1' };
      (addDoc as jest.Mock).mockResolvedValue(mockDocRef);
      (serverTimestamp as jest.Mock).mockReturnValue('timestamp');
      (doc as jest.Mock).mockReturnValue('docRef');
      (updateDoc as jest.Mock).mockResolvedValue(undefined);
      (increment as jest.Mock).mockReturnValue('incrementValue');

      const result = await factCheckService.createFactCheck(mockFactCheck);

      expect(addDoc).toHaveBeenCalledWith(
        'collection',
        expect.objectContaining({
          ...mockFactCheck,
          voteCount: 0,
          createdAt: 'timestamp',
          updatedAt: 'timestamp'
        })
      );

      expect(updateDoc).toHaveBeenCalledWith(
        'docRef',
        expect.objectContaining({
          factCheckCount: 'incrementValue',
          updatedAt: 'timestamp'
        })
      );

      expect(result).toBe('newFactCheck1');
    });
  });
});