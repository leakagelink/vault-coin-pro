
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBoRoMFvLWJWgQ6ZmnkJtBd0g7gky4aP2s",
  authDomain: "linkleakage-a7deb.firebaseapp.com",
  projectId: "linkleakage-a7deb",
  storageBucket: "linkleakage-a7deb.firebaseStogeapp",
  messagingSenderId: "572185003936",
  appId: "1:572185003936:web:5b9957b051f0f9973a46c5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
