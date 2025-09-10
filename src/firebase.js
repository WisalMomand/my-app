// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBXCTGzsfdaKUnRMko9vwAyRkO8yyHKsQs",
  authDomain: "quizcraft-a7d3d.firebaseapp.com",
  projectId: "quizcraft-a7d3d",
  storageBucket: "quizcraft-a7d3d.appspot.com", // ✅ Fixed this line
  messagingSenderId: "3553339082",
  appId: "1:3553339082:web:6d2bf4e9deb300f303b633",
  measurementId: "G-B43T1T4DMT",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

