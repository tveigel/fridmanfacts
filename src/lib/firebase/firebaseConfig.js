// lib/firebase/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Add this check
if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  console.error('Firebase API key is missing. Make sure your .env.local file is in the correct location and contains the required variables.');
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// More detailed debug logging
console.log('Environment check:', {
  nodeEnv: process.env.NODE_ENV,
  hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  hasProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
});

// Modified validation
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('Essential Firebase configuration is missing:', {
    apiKey: !!firebaseConfig.apiKey,
    projectId: !!firebaseConfig.projectId,
  });
  if (process.env.NODE_ENV === 'development') {
    throw new Error('Firebase configuration is incomplete. Please check your .env.local file.');
  }
}

let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };