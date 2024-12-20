// src/hooks/useRoles.ts
import { useState, useEffect } from 'react';
import { useAuth } from '../lib/context/AuthContext';
import { roleService } from '../lib/services/roleService';
import { UseRoles } from '../lib/types/core-types';

export function useRoles(): UseRoles {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isModerator, setIsModerator] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkRoles = async () => {
      if (!user) {
        setIsAdmin(false);
        setIsModerator(false);
        setLoading(false);
        return;
      }

      try {
        const idTokenResult = await user.getIdTokenResult();
        console.log('Roles Hook - Token Claims:', idTokenResult.claims);
        
        const [adminStatus, moderatorStatus] = await Promise.all([
          roleService.checkIsAdmin(user),
          roleService.checkIsModerator(user)
        ]);

        console.log('Roles Hook - Status:', { adminStatus, moderatorStatus });

        setIsAdmin(adminStatus);
        setIsModerator(moderatorStatus);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error('Error checking roles:', err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    checkRoles();
  }, [user]);

  return {
    isAdmin,
    isModerator,
    loading,
    error
  };
}