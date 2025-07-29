import { useEffect, useState } from 'react';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// 環境変数が有効かどうかの検証関数
const areFirebaseVarsPresent = () => {
  return (
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET &&
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  );
};

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

interface FirebaseServices {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  storage: FirebaseStorage;
}

let firebaseServices: FirebaseServices | null = null;

function initializeFirebase(): FirebaseServices | null {
  if (firebaseServices) {
    return firebaseServices;
  }

  // 環境変数がすべて揃っているか最終チェック
  if (!areFirebaseVarsPresent()) {
    console.error("Firebase config environment variables are not fully set.");
    return null;
  }

  if (getApps().length === 0) {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const storage = getStorage(app);
    firebaseServices = { app, auth, db, storage };
  } else {
    const app = getApps()[0];
    const auth = getAuth(app);
    const db = getFirestore(app);
    const storage = getStorage(app);
    firebaseServices = { app, auth, db, storage };
  }
  
  return firebaseServices;
}

export function useFirebase() {
  const [services, setServices] = useState<FirebaseServices | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const initializedServices = initializeFirebase();
      if (initializedServices) {
        setServices(initializedServices);
      }
    }
  }, []);

  return services;
}

export const getFirebaseServices = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  return initializeFirebase();
};
