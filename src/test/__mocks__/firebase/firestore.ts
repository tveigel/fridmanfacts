// src/test/__mocks__/firebase/firestore.ts
export const mockTimestamp = {
    toDate: () => new Date(),
    seconds: Math.floor(Date.now() / 1000),
    nanoseconds: 0,
  };
  
  export const mockFirestore = {
    collection: jest.fn(() => ({
      doc: jest.fn(),
      where: jest.fn(),
      orderBy: jest.fn(),
    })),
    doc: jest.fn(() => ({
      get: jest.fn(),
      set: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    })),
    getDoc: jest.fn().mockResolvedValue({
      exists: () => true,
      data: () => ({}),
      id: 'mock-doc-id',
    }),
    getDocs: jest.fn().mockResolvedValue({
      docs: [],
      forEach: jest.fn(),
    }),
    query: jest.fn(),
    where: jest.fn(),
    orderBy: jest.fn(),
    serverTimestamp: jest.fn(() => mockTimestamp),
    Timestamp: {
      now: jest.fn(() => mockTimestamp),
      fromDate: jest.fn((date) => mockTimestamp),
    },
    runTransaction: jest.fn(),
  };
  