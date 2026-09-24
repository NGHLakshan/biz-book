// Firebase App & Firestore (Modular SDK v9+)
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCKLLUPTrPkN-qKkXj72OGTwdN4Z00fuoo",
  authDomain: "anurabizbook-9737a.firebaseapp.com",
  projectId: "anurabizbook-9737a",
  storageBucket: "anurabizbook-9737a.firebasestorage.app",
  messagingSenderId: "697406696137",
  appId: "1:697406696137:web:2f067ed92d025657197b18",
};

const app = initializeApp(firebaseConfig);

// Simple Firestore — works on ALL browsers including Chrome Custom Tabs and mobile
// Data syncs from Firebase in real-time, no IndexedDB needed
export const db = getFirestore(app);


