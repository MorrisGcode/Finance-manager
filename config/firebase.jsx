// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB-iZtkUVCVkWLRDGEmMb2n1qnkgPJ_WPs",
  authDomain: "personal-finance-app-6cc18.firebaseapp.com",
  projectId: "personal-finance-app-6cc18",
  storageBucket: "personal-finance-app-6cc18.firebasestorage.app",
  messagingSenderId: "351901642706",
  appId: "1:351901642706:web:52952b5ec2c178c14ea20b",
  measurementId: "G-BV8MFE10BK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);