// lib/services/roleService.js
import { getFunctions, httpsCallable } from 'firebase/functions';
import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const functions = getFunctions();

export const roleService = {
  async setUserRole(userId, role) {
    try {
      const setUserRoleFunction = httpsCallable(functions, 'setUserRole');
      const result = await setUserRoleFunction({ userId, role });
      return result.data;
    } catch (error) {
      console.error('Error setting user role:', error);
      throw error;
    }
  },

  async getUserRole(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        return userDoc.data().role;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user role:', error);
      throw error;
    }
  },

  async checkIsAdmin(user) {
    if (!user) return false;
    try {
      const idTokenResult = await user.getIdTokenResult();
      return idTokenResult.claims.admin === true;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  },

  async checkIsModerator(user) {
    if (!user) return false;
    try {
      const idTokenResult = await user.getIdTokenResult();
      return idTokenResult.claims.moderator === true || idTokenResult.claims.admin === true;
    } catch (error) {
      console.error('Error checking moderator status:', error);
      return false;
    }
  }
};