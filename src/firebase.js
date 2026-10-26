// Firebase App & Firestore (Modular SDK v9+)
import { initializeApp } from "firebase/app";
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  disableNetwork,
  enableNetwork 
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCKLLUPTrPkN-qKkXj72OGTwdN4Z00fuoo",
  authDomain: "anurabizbook-9737a.firebaseapp.com",
  projectId: "anurabizbook-9737a",
  storageBucket: "anurabizbook-9737a.firebasestorage.app",
  messagingSenderId: "697406696137",
  appId: "1:697406696137:web:2f067ed92d025657197b18",
};

const app = initializeApp(firebaseConfig);

// persistentLocalCache: IndexedDB-backed offline persistence.
// Data survives app close/refresh — loads instantly even without internet.
// persistentMultipleTabManager allows multiple browser tabs to stay in sync.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Immediate offline/online switching so Firestore never hangs waiting for network timeouts
if (typeof window !== "undefined") {
  if (!navigator.onLine) {
    disableNetwork(db).catch(() => {});
  }

  window.addEventListener("online", () => {
    enableNetwork(db).catch(() => {});
  });

  window.addEventListener("offline", () => {
    disableNetwork(db).catch(() => {});
  });
}



