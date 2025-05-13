/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

//const {onRequest} = require("firebase-functions/v2/https");
//const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { onCall, HttpsError } from 'firebase-functions/v2/https';

initializeApp();

export const setAdmin = onCall({ region: 'us-central1' }, async ({ data, auth }) => {
  if (!auth || !auth.token.isAdmin) {
    throw new HttpsError(
      'permission-denied',
      'The function must be called while being admin.'
    );
  }
  const userId = data.userId;
  try {
    await getAuth().setCustomUserClaims(userId, { isAdmin: true });
    return { message: `User ${userId} is now admin.` };
  } catch (error) {
    throw new HttpsError(
      'internal',
      'Unable to set user as admin.',
      error.message
    );
  }
});

