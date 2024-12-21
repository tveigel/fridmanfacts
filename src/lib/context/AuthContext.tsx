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
import { auth } from "../firebase/firebaseConfig";
import { AuthContextType } from "../types/component-types";

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps): JSX.Element => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (): Promise<void> => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      throw error;
    }
  };

  const loginWithEmail = async (email: string, password: string): Promise<void> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (!userCredential.user.emailVerified) {
        await signOut(auth);
        throw new Error("Please verify your email before logging in. Check your inbox for the verification link.");
      }
    } catch (error: any) {
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        throw new Error("Invalid email or password");
      }
      throw error;
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
    loading
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

