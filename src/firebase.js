// Firebase App & Firestore (Modular SDK v9+)
import { initializeApp } from "firebase/app";
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  memoryLocalCache,
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

let firestoreDb;
try {
  firestoreDb = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  });
} catch (err) {
  console.warn("Firestore persistent cache initialization failed, falling back to memory cache:", err);
  try {
    firestoreDb = initializeFirestore(app, {
      localCache: memoryLocalCache(),
    });
  } catch (fallbackErr) {
    console.error("Firestore initialization error:", fallbackErr);
  }
}

export const db = firestoreDb;

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



