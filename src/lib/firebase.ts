import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// 🔍 Debug (REMOVE LATER)
console.log("🔥 Firebase ENV:", firebaseConfig);

// ✅ Validate config
const hasFirebaseConfig = Object.values(firebaseConfig).every(
  (value) => typeof value === "string" && value.length > 0
);

if (!hasFirebaseConfig) {
  console.warn("❌ Firebase config missing. Check your .env file.");
}

// ✅ Initialize safely
const app =
  hasFirebaseConfig && getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps()[0];

// ✅ Services
export const auth = hasFirebaseConfig ? getAuth(app) : null;
export const db = hasFirebaseConfig ? getFirestore(app) : null;
export const storage = hasFirebaseConfig ? getStorage(app) : null;
export const googleProvider = new GoogleAuthProvider();

// ✅ Flag
export const firebaseEnabled = hasFirebaseConfig;