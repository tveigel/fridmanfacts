const {onCall, HttpsError} = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

admin.initializeApp();

exports.setUserRole = onCall(async (request) => {
  try {
    if (!request.auth) {
      throw new HttpsError(
        'unauthenticated',
        'User must be logged in.'
      );
    }

    const callerUid = request.auth.uid;
    const callerRef = await admin.firestore().collection('users').doc(callerUid).get();
    const callerData = callerRef.data();
    
    if (!callerData?.role === 'admin') {
      throw new HttpsError(
        'permission-denied',
        'Only admins can set user roles.'
      );
    }

    const { userId, role } = request.data;
    if (!userId || !role) {
      throw new HttpsError(
        'invalid-argument',
        'userId and role are required.'
      );
    }

    await admin.auth().setCustomUserClaims(userId, {
      moderator: role === 'moderator',
      admin: role === 'admin'
    });

    await admin.firestore().collection('users').doc(userId).set({
      role: role,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: callerUid
    }, { merge: true });

    return { success: true };
  } catch (error) {
    console.error('Error in setUserRole:', error);
    throw new HttpsError(
      'internal',
      'Error setting user role.',
      error
    );
  }
});