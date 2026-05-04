import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCeWSmdVeBBllYbz5TnoTK_rcpF4ybqG7Y",
  authDomain: "www.primolingo.fr",
  projectId: "orthographe-eabb9",
  storageBucket: "orthographe-eabb9.firebasestorage.app",
  messagingSenderId: "970082314822",
  appId: "1:970082314822:web:b57559f6592a9a5e3d3847"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code !== 'failed-precondition' && err.code !== 'unimplemented') {
    console.warn('Firestore offline persistence failed:', err.code);
  }
});

export default app;
