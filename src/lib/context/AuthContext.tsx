// src/lib/context/AuthContext.tsx

"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  User
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import { generateUsername } from "../utils/userUtils"; 
import { AuthContextType } from "../types/component-types";

interface AuthProviderProps {
  children: ReactNode;
}



const AuthContext = createContext<AuthContextType | null>(null);

// Helper function to create/update user document
async function createOrUpdateUserDocument(user: User, username?: string) {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    // Don't create the user document yet - we'll do it after username confirmation
    return false;
  } else {
    // Update existing user document
    await setDoc(userRef, {
      updatedAt: serverTimestamp(),
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    }, { merge: true });
    return true;
  }
}

export const AuthProvider = ({ children }: AuthProviderProps): JSX.Element => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [needsUsername, setNeedsUsername] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const exists = await createOrUpdateUserDocument(user);
        if (!exists) {
          setNeedsUsername(true);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  

  const finalizeUserRegistration = async (username: string) => {
    if (!user) return;
    
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || username,
      username: username,
      photoURL: user.photoURL,
      role: 'user',
      preferences: {
        validationThreshold: 10,
        showControversialFlags: true,
        showUnvalidatedFlags: true
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    setNeedsUsername(false);
  };

  const login = async (): Promise<void> => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await createOrUpdateUserDocument(result.user);
    } catch (error) {
      throw error;
    }
  };

  const loginWithEmail = async (email: string, password: string): Promise<void> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (!userCredential.user.emailVerified) {
        await signOut(auth);
        throw new Error("Please verify your email before logging in.");
      }
      
      await createOrUpdateUserDocument(userCredential.user);
    } catch (error: any) {
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        throw new Error("Invalid email or password");
      }
      throw error;
    }
  };

  const resendVerificationEmail = async () => {
    if (!auth.currentUser) {
      throw new Error("No user logged in");
    }
    try {
      await sendEmailVerification(auth.currentUser);
      return "Verification email sent successfully. Please check your inbox.";
    } catch (error: any) {
      if (error.code === 'auth/too-many-requests') {
        throw new Error("Too many requests. Please wait a few minutes before trying again.");
      }
      throw new Error("Failed to send verification email. Please try again later.");
    }
  };


  const signUpWithEmail = async (email: string, password: string): Promise<string> => {
    try {
      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters long");
      }
      if (!/[A-Z]/.test(password)) {
        throw new Error("Password must contain at least one uppercase letter");
      }
      if (!/[a-z]/.test(password)) {
        throw new Error("Password must contain at least one lowercase letter");
      }
      if (!/[0-9]/.test(password)) {
        throw new Error("Password must contain at least one number");
      }
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      await signOut(auth);
      
      return "Please check your email to verify your account before logging in.";
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        throw new Error("This email is already registered");
      }
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    login,
    loginWithEmail,
    signUpWithEmail,
    logout,
    loading,
    needsUsername,
    finalizeUserRegistration,
    resendVerificationEmail
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

