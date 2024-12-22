"use client";

// src/hooks/useFactChecks.ts
import { useState, useEffect } from 'react';
import { useAuth } from '../lib/context/AuthContext';
import type { FactCheck } from '../lib/types/types';
import { onSnapshot, collection, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase/firebaseConfig';
import { voteService } from '../lib/services/voteService';
import { factCheckService } from '../lib/services';


export function useFactChecks({ episodeId }: { episodeId: string }) {
  const { user } = useAuth();
  const [factChecks, setFactChecks] = useState<{ [key: string]: FactCheck[] }>({});
  const [selectedFactCheck, setSelectedFactCheck] = useState<FactCheck | null>(null);
  const [userVotes, setUserVotes] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!episodeId) return;

    setLoading(true);
    setError(null);

    // Create a real-time listener for fact checks
    const factChecksRef = collection(db, 'factChecks');
    const q = query(factChecksRef, where('episodeId', '==', episodeId));

    const unsubscribe = onSnapshot(q, 
      async (snapshot) => {
        try {
          const fetchedFactChecks = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as FactCheck[];

          const organizedChecks = factCheckService.organizeFactChecksByTime(fetchedFactChecks);
          setFactChecks(organizedChecks);

          // Load user votes if user is logged in
          if (user) {
            const factCheckIds = fetchedFactChecks.map(fc => fc.id);
            const votes = await voteService.getUserVotes(user.uid, factCheckIds);
            setUserVotes(votes);
          }

          setLoading(false);
        } catch (error) {
          console.error('Error processing fact checks:', error);
          setError(error instanceof Error ? error.message : 'Error loading fact checks');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error in fact checks subscription:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [episodeId, user]);

  const handleVote = async (factCheckId: string, value: number) => {
    if (!user) return;
  
    try {
      const previousValue = userVotes[factCheckId] || 0;
      
      // If clicking the same vote type, remove the vote
      const newValue = value === previousValue ? 0 : value;
  
      // Optimistic update for user votes
      setUserVotes(prev => ({
        ...prev,
        [factCheckId]: newValue
      }));
  
      // Optimistic update for fact check counts
      setFactChecks(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(time => {
          updated[time] = updated[time].map(fc => {
            if (fc.id === factCheckId) {
              let newUpvotes = fc.upvotes || 0;
              let newDownvotes = fc.downvotes || 0;
  
              // Remove previous vote
              if (previousValue === 1) newUpvotes--;
              if (previousValue === -1) newDownvotes--;
  
              // Add new vote
              if (newValue === 1) newUpvotes++;
              if (newValue === -1) newDownvotes++;
  
              return {
                ...fc,
                upvotes: Math.max(0, newUpvotes),
                downvotes: Math.max(0, newDownvotes)
              };
            }
            return fc;
          });
        });
        return updated;
      });
  
      await voteService.submitVote(factCheckId, user.uid, newValue, previousValue);
    } catch (error) {
      console.error('Error submitting vote:', error);
      // Revert optimistic updates on error
      setUserVotes(prev => ({ ...prev, [factCheckId]: userVotes[factCheckId] }));
    }
  };

  const handleUpdateOrDelete = (factCheckId: string, updatedFactCheck?: FactCheck) => {
    if (updatedFactCheck) {
      // Update operation
      setFactChecks(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(time => {
          updated[time] = updated[time].map(fc => 
            fc.id === factCheckId ? updatedFactCheck : fc
          );
        });
        return updated;
      });

      // Update selected fact check if it was modified
      if (selectedFactCheck?.id === factCheckId) {
        setSelectedFactCheck(updatedFactCheck);
      }
    } else {
      // Delete operation
      setFactChecks(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(time => {
          updated[time] = updated[time].filter(fc => fc.id !== factCheckId);
          if (updated[time].length === 0) {
            delete updated[time];
          }
        });
        return updated;
      });

      if (selectedFactCheck?.id === factCheckId) {
        setSelectedFactCheck(null);
      }
    }
  };

  // Get all fact checks as a flat array for the side panel
  const getAllFactChecks = () => {
    return Object.values(factChecks).flat();
  };

  return {
    factChecks,
    allFactChecks: getAllFactChecks(),
    userVotes,
    handleVote,
    handleUpdateOrDelete,
    selectedFactCheck,
    setSelectedFactCheck,
    loading,
    error,
  };
}