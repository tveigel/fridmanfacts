// src/lib/firebase/__mocks__/firebaseConfig.js

// Mock Firebase App initialization
const mockInitializeApp = jest.fn();
const mockGetFunctions = jest.fn();
const mockGetFirestore = jest.fn();
const mockGetAuth = jest.fn();

// Mock Firestore methods
export const mockCollection = jest.fn();
export const mockQuery = jest.fn();
export const mockWhere = jest.fn();
export const mockOrderBy = jest.fn();
export const mockGetDocs = jest.fn();
export const mockGetDoc = jest.fn();
export const mockDoc = jest.fn();
export const mockOnSnapshot = jest.fn();
export const mockServerTimestamp = jest.fn(() => new Date());
export const mockAddDoc = jest.fn();
export const mockUpdateDoc = jest.fn();
export const mockDeleteDoc = jest.fn();
export const mockRunTransaction = jest.fn();

// Mock Auth methods
const mockSignInWithPopup = jest.fn();
const mockSignOut = jest.fn();
const mockOnAuthStateChanged = jest.fn();
const mockCreateUserWithEmailAndPassword = jest.fn();
const mockSignInWithEmailAndPassword = jest.fn();
const mockSendEmailVerification = jest.fn();

// Mock auth object
const auth = {
  currentUser: null,
  onAuthStateChanged: mockOnAuthStateChanged,
  signInWithPopup: mockSignInWithPopup,
  signOut: mockSignOut,
  createUserWithEmailAndPassword: mockCreateUserWithEmailAndPassword,
  signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
  sendEmailVerification: mockSendEmailVerification
};

// Mock db object
const db = {
  collection: mockCollection,
  doc: mockDoc,
  onSnapshot: mockOnSnapshot
};

// Export mocked Firebase modules
jest.mock('firebase/app', () => ({
  initializeApp: mockInitializeApp
}));

jest.mock('firebase/functions', () => ({
  getFunctions: mockGetFunctions,
  httpsCallable: jest.fn()
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: () => db,
  collection: mockCollection,
  query: mockQuery,
  where: mockWhere,
  orderBy: mockOrderBy,
  getDocs: mockGetDocs,
  getDoc: mockGetDoc,
  doc: mockDoc,
  onSnapshot: mockOnSnapshot,
  serverTimestamp: mockServerTimestamp,
  addDoc: mockAddDoc,
  updateDoc: mockUpdateDoc,
  deleteDoc: mockDeleteDoc,
  runTransaction: mockRunTransaction
}));

jest.mock('firebase/auth', () => ({
  getAuth: () => auth,
  GoogleAuthProvider: jest.fn(),
  signInWithPopup: mockSignInWithPopup,
  signOut: mockSignOut,
  onAuthStateChanged: mockOnAuthStateChanged,
  createUserWithEmailAndPassword: mockCreateUserWithEmailAndPassword,
  signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
  sendEmailVerification: mockSendEmailVerification
}));

export { auth, db };