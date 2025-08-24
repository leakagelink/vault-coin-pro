
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBoRoMFvLWJWgQ6ZmnkJtBd0g7gky4aP2s",
  authDomain: "linkleakage-a7deb.firebaseapp.com",
  projectId: "linkleakage-a7deb",
  storageBucket: "linkleakage-a7deb.firebasestorage.app",
  messagingSenderId: "572185003936",
  appId: "1:572185003936:web:5b9957b051f0f9973a46c5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// CoinMarketCap API Configuration
export const CMC_API_KEY = '8bf7f0bd-1180-4bc4-9380-07b4d49bd233';
export const CMC_BASE_URL = 'https://pro-api.coinmarketcap.com/v1';
