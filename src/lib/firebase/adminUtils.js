// lib/firebase/adminUtils.js

// This code needs to run on your Firebase Cloud Functions
export const setUserRole = async (uid, role) => {
    const admin = require('firebase-admin');
    
    try {
      // Set custom claims
      await admin.auth().setCustomUserClaims(uid, {
        moderator: role === 'moderator',
        admin: role === 'admin'
      });
      
      // Update user profile in Firestore
      await admin.firestore().collection('users').doc(uid).set({
        role: role
      }, { merge: true });
      
      return { success: true };
    } catch (error) {
      console.error('Error setting user role:', error);
      return { success: false, error };
    }
  };