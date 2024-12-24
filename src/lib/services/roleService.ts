// lib/services/roleService.ts

import { getFunctions, httpsCallable, Functions } from 'firebase/functions';
import {
  doc,
  getDoc,
  Firestore
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { User, IdTokenResult } from 'firebase/auth';

// Initialize Firebase Functions
const functions: Functions = getFunctions();

// Define the shape of data expected by the 'setUserRole' callable function
interface SetUserRolePayload {
  userId: string;
  role: string;
}

// Define the expected response from the 'setUserRole' callable function
type SetUserRoleResponse = any; // Replace `any` with a specific type if known

export const roleService = {
  /**
   * Sets the role of a user by invoking a Firebase Cloud Function.
   * 
   * @param userId - The ID of the user whose role is to be set.
   * @param role - The role to assign to the user.
   * @returns A promise that resolves with the response data from the Cloud Function.
   */
  async setUserRole(userId: string, role: string): Promise<SetUserRoleResponse> {
    try {
      const setUserRoleFunction = httpsCallable<SetUserRolePayload, SetUserRoleResponse>(functions, 'setUserRole');
      const result = await setUserRoleFunction({ userId, role });
      return result.data;
    } catch (error) {
      console.error('Error setting user role:', error);
      throw error;
    }
  },

  /**
   * Retrieves the role of a user from Firestore.
   * 
   * @param userId - The ID of the user whose role is to be retrieved.
   * @returns A promise that resolves with the user's role or `null` if not found.
   */
  async getUserRole(userId: string): Promise<string | null> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        return data.role as string;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user role:', error);
      throw error;
    }
  },

  /**
   * Checks if the given user has admin privileges.
   * 
   * @param user - The Firebase user object.
   * @returns A promise that resolves to `true` if the user is an admin, otherwise `false`.
   */
  async checkIsAdmin(user: User | null | undefined): Promise<boolean> {
    if (!user) return false;
    try {
      const idTokenResult: IdTokenResult = await user.getIdTokenResult();
      return idTokenResult.claims.admin === true;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  },

  /**
   * Checks if the given user has moderator privileges.
   * 
   * @param user - The Firebase user object.
   * @returns A promise that resolves to `true` if the user is a moderator or an admin, otherwise `false`.
   */
  async checkIsModerator(user: User | null | undefined): Promise<boolean> {
    if (!user) return false;
    try {
      const idTokenResult: IdTokenResult = await user.getIdTokenResult();
      return (
        idTokenResult.claims.moderator === true ||
        idTokenResult.claims.admin === true
      );
    } catch (error) {
      console.error('Error checking moderator status:', error);
      return false;
    }
  }
};
