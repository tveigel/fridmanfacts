// src/hooks/useKarma.ts
import { useState, useEffect } from 'react';
import { useAuth } from '../lib/context/AuthContext';
import { karmaService } from '../lib/services/karmaService';
import type { KarmaHistoryEntry } from '../lib/types/types';

export function useKarma() {
  const { user } = useAuth();
  const [karma, setKarma] = useState<number | null>(null);
  const [karmaHistory, setKarmaHistory] = useState<KarmaHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchKarma() {
      if (!user) {
        setKarma(null);
        setKarmaHistory([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch total karma
        const totalKarma = await karmaService.getUserKarma(user.uid);
        setKarma(totalKarma);

        // Fetch karma history
        const history = await karmaService.getKarmaHistory(user.uid);
        setKarmaHistory(history);
      } catch (err) {
        console.error('Error fetching karma:', err);
        setError(err instanceof Error ? err.message : 'Error fetching karma');
      } finally {
        setLoading(false);
      }
    }

    fetchKarma();
  }, [user]);

  return {
    karma,
    karmaHistory,
    loading,
    error
  };
}