const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Function to set user role
exports.setUserRole = functions.https.onCall(async (data, context) => {
  // Check if the caller is an admin
  const callerUid = context.auth?.uid;
  if (!callerUid) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
  }

  const callerRef = await admin.firestore().collection('users').doc(callerUid).get();
  const callerData = callerRef.data();
  
  if (!callerData?.role === 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can set user roles.');
  }

  // Get parameters
  const { userId, role } = data;
  if (!userId || !role) {
    throw new functions.https.HttpsError('invalid-argument', 'userId and role are required.');
  }

  try {
    // Set custom claims
    await admin.auth().setCustomUserClaims(userId, {
      moderator: role === 'moderator',
      admin: role === 'admin'
    });

    // Update user profile in Firestore
    await admin.firestore().collection('users').doc(userId).set({
      role: role,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: callerUid
    }, { merge: true });

    return { success: true };
  } catch (error) {
    console.error('Error setting user role:', error);
    throw new functions.https.HttpsError('internal', 'Error setting user role.');
  }
});

