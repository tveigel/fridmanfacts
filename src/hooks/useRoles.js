// lib/hooks/useRoles.js
import { useState, useEffect } from 'react';
import { useAuth } from '../lib/context/AuthContext';
import { roleService } from '../lib/services/roleService';

// hooks/useRoles.js
export function useRoles() {
    const { user } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [isModerator, setIsModerator] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  
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
          console.log('Roles Hook - Token Claims:', idTokenResult.claims); // Debug log
          
          const [adminStatus, moderatorStatus] = await Promise.all([
            roleService.checkIsAdmin(user),
            roleService.checkIsModerator(user)
          ]);
  
          console.log('Roles Hook - Status:', { adminStatus, moderatorStatus }); // Debug log
  
          setIsAdmin(adminStatus);
          setIsModerator(moderatorStatus);
          setError(null);
        } catch (err) {
          console.error('Error checking roles:', err);
          setError(err.message);
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