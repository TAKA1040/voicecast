import { useEffect, useState } from 'react';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

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

// シングルトンインスタンスを保持する変数
let firebaseServices: FirebaseServices | null = null;

// Firebaseを初期化し、各サービスを取得する関数
function initializeFirebase(): FirebaseServices {
  if (firebaseServices) {
    return firebaseServices;
  }

  if (getApps().length === 0) {
    // アプリがまだ初期化されていない場合のみ初期化
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const storage = getStorage(app);
    firebaseServices = { app, auth, db, storage };
  } else {
    // 既に初期化されている場合は既存のアプリインスタンスを取得
    const app = getApps()[0];
    const auth = getAuth(app);
    const db = getFirestore(app);
    const storage = getStorage(app);
    firebaseServices = { app, auth, db, storage };
  }
  
  return firebaseServices;
}


export function useFirebase() {
  // 初期化されたサービスをステートとして保持
  const [services, setServices] = useState<FirebaseServices | null>(null);

  useEffect(() => {
    // このフックはクライアントサイドでのみ実行されるため、
    // ここで初期化を呼び出すのが安全
    if (typeof window !== 'undefined') {
      setServices(initializeFirebase());
    }
  }, []);

  return services;
}

// 必要に応じてシングルトンインスタンスを直接エクスポートすることも可能
// ただし、使用はクライアントサイドに限定する必要がある
export const getFirebaseServices = () => {
  if (typeof window === 'undefined') {
    // サーバーサイドではnullを返すか、エラーを投げる
    return null;
  }
  return initializeFirebase();
};
