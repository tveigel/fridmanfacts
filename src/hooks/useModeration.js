// Hook to check if user is moderator
// lib/hooks/useModeration.js
import { useState, useEffect } from 'react';
import { auth } from '../lib/firebase/firebaseConfig';

// hooks/useModeration.js
export const useModeration = () => {
    const [isModerator, setIsModerator] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
          // Get the ID token result which contains custom claims
          const idTokenResult = await user.getIdTokenResult();
          console.log('Moderation Hook - Token Claims:', idTokenResult.claims); // Debug log
          setIsModerator(idTokenResult.claims.moderator === true);
          setIsAdmin(idTokenResult.claims.admin === true);
        } else {
          setIsModerator(false);
          setIsAdmin(false);
        }
        setLoading(false);
      });
  
      return () => unsubscribe();
    }, []);
  
    return { isModerator, isAdmin, loading };
  };