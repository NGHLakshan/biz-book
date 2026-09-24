// Firebase App & Firestore (Modular SDK v9+)
import { initializeApp } from "firebase/app";
import { initializeFirestore, memoryLocalCache } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCKLLUPTrPkN-qKkXj72OGTwdN4Z00fuoo",
  authDomain: "anurabizbook-9737a.firebaseapp.com",
  projectId: "anurabizbook-9737a",
  storageBucket: "anurabizbook-9737a.firebasestorage.app",
  messagingSenderId: "697406696137",
  appId: "1:697406696137:web:2f067ed92d025657197b18",
};

const app = initializeApp(firebaseConfig);

// memoryLocalCache: fast in-memory cache — works on ALL browsers (no IndexedDB)
// Writes are acknowledged instantly from cache, then synced to Firebase in background
export const db = initializeFirestore(app, {
  localCache: memoryLocalCache(),
});



