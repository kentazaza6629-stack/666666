<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/75356bc0-14c5-4169-a7e2-9fe98f75ed68

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCzyuGgDCQraa0Os4s4nbKFIwjM9WI0OIc",
  authDomain: "w00000-4d79e.firebaseapp.com",
  projectId: "w00000-4d79e",
  storageBucket: "w00000-4d79e.firebasestorage.app",
  messagingSenderId: "397135625501",
  appId: "1:397135625501:web:9e9b590a36c14423e135f4",
  measurementId: "G-357QJ1HBVG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
