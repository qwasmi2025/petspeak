import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB0OG2DJngT847xvho6Wwior0EuiLT9XlQ",
  authDomain: "animal-sounds-ai.firebaseapp.com",
  projectId: "animal-sounds-ai",
  storageBucket: "animal-sounds-ai.firebasestorage.app",
  messagingSenderId: "934449176790",
  appId: "1:934449176790:web:db367139eb86797e84a977",
  measurementId: "G-Q4GJJ0Q5EF"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Firestore persistence unavailable: multiple tabs open');
  } else if (err.code === 'unimplemented') {
    console.warn('Firestore persistence unavailable: browser not supported');
  }
});

export default app;
