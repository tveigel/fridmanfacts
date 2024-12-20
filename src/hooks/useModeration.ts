// src/hooks/useModeration.ts
import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { auth } from '../lib/firebase/firebaseConfig';
import { UseModeration } from '../lib/types/core-types';

export const useModeration = (): UseModeration => {
  const [isModerator, setIsModerator] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user: User | null) => {
      if (user) {
        try {
          const idTokenResult = await user.getIdTokenResult();
          setIsModerator(idTokenResult.claims.moderator === true);
          setIsAdmin(idTokenResult.claims.admin === true);
        } catch (error) {
          console.error('Error checking moderation status:', error);
          setIsModerator(false);
          setIsAdmin(false);
        }
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