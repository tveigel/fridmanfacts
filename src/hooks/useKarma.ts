// src/hooks/useKarma.ts
import { useState, useEffect } from 'react';
import { useAuth } from '../lib/context/AuthContext';
import { karmaService } from '../lib/services/karmaService';
import type { KarmaHistoryEntry } from '../lib/types/types';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  doc 
} from 'firebase/firestore';
import { db } from '../lib/firebase/firebaseConfig';

export function useKarma(targetUserId?: string) {
  const { user } = useAuth();
  const [karma, setKarma] = useState<number | null>(null);
  const [karmaHistory, setKarmaHistory] = useState<KarmaHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userId = targetUserId || user?.uid;
    if (!userId) {
      setKarma(null);
      setKarmaHistory([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Create real-time listener for karma updates
    const userKarmaRef = doc(db, 'userKarma', userId);
    const unsubscribeKarma = onSnapshot(userKarmaRef, 
      (doc) => {
        if (doc.exists()) {
          setKarma(doc.data().totalKarma);
        } else {
          setKarma(0);
        }
      },
      (error) => {
        console.error('Error in karma listener:', error);
        setError(error.message);
      }
    );

    // Create real-time listener for karma history
    const historyRef = collection(db, 'karmaHistory');
    const q = query(
      historyRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );

    const unsubscribeHistory = onSnapshot(q,
      (snapshot) => {
        const history = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as KarmaHistoryEntry[];
        setKarmaHistory(history);
        setLoading(false);
      },
      (error) => {
        console.error('Error in karma history listener:', error);
        setError(error.message);
      }
    );

    return () => {
      unsubscribeKarma();
      unsubscribeHistory();
    };
  }, [user?.uid, targetUserId]);

  return { karma, karmaHistory, loading, error };
}