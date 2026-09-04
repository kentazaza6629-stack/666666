/// <reference types="vite/client" />
// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Fallback config from firebase-applet-config.json values
const fallbackConfig = {
  apiKey: "AIzaSyALVs5p0sA_Ytbbb4MIK0j8HJiCMV4z0w8",
  authDomain: "w00000-4d79e.firebaseapp.com",
  projectId: "w00000-4d79e",
  storageBucket: "w00000-4d79e.firebasestorage.app",
  messagingSenderId: "397135625501",
  appId: "1:397135625501:web:9e9b590a36c14423e135f4",
  measurementId: "G-357QJ1HBVG"
};

// Default config from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || fallbackConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || fallbackConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || fallbackConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || fallbackConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || fallbackConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || fallbackConfig.appId,
};

const databaseId = import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || "ai-studio-infoquest5-75356bc0-14c5-4169-a7e2-9fe98f75ed68";

// Initialize Firebase lazily to avoid crashing on missing environment variables
function getFirebaseApp() {
  if (getApps().length > 0) {
    return getApp();
  }
  
  if (!firebaseConfig.apiKey) {
    console.warn('Firebase API key is missing from environment variables.');
    return null;
  }
  
  try {
    return initializeApp(firebaseConfig);
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    return null;
  }
}

export const app = getFirebaseApp();

export const db = app ? getFirestore(app, databaseId) : null;
export const auth = app ? getAuth(app) : null;
