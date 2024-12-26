// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; // Ensure proper imports for auth and provider
import { getFirestore } from "firebase/firestore"; // Import Firestore for database functionality
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBMvJH6bXGIb2jWuIrNO4w3yIyIaqdX0yE",
  authDomain: "shcs-5b6c5.firebaseapp.com",
  projectId: "shcs-5b6c5",
  storageBucket: "shcs-5b6c5.firebasestorage.app",
  messagingSenderId: "309400310340",
  appId: "1:309400310340:web:dbc8ca1bfb6a9d1c45a211",
  measurementId: "G-87B5GXSE3G"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

