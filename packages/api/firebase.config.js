// Firebase Admin SDK Configuration for Vercel Serverless
// Optimized for serverless environment with connection reuse

const admin = require('firebase-admin');

// Check if Firebase is already initialized
if (!admin.apps.length) {
  // Initialize Firebase Admin SDK
  // In Vercel, we can use service account from environment variables
  // or rely on default credentials if deployed with proper setup

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Parse service account from environment variable
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } else {
    // Try to initialize with application default credentials
    // This works when deployed to Vercel with proper setup
    try {
      admin.initializeApp();
    } catch (error) {
      console.warn('Firebase admin initialization warning:', error.message);
      // In development, you might need to set up credentials differently
      // For now, we'll proceed but auth verification may fail
    }
  }
}

module.exports = admin;