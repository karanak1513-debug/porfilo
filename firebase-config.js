// Firebase Client SDK Configuration (Browser CDN Modules)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    GoogleAuthProvider,
    RecaptchaVerifier,
    signInWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

const firebaseConfig = {
  projectId: "gsttt-7301d",
  appId: "1:1001131160210:web:0fb46fe81adae078e8ec4b",
  databaseURL: "https://gsttt-7301d-default-rtdb.firebaseio.com",
  storageBucket: "gsttt-7301d.firebasestorage.app",
  apiKey: "AIzaSyBpNUCT4X7IFPjwuYBMU-An-T2b6dY4vXE",
  authDomain: "gsttt-7301d.firebaseapp.com",
  messagingSenderId: "1001131160210",
  measurementId: "G-2PPLZB4RYX",
  projectNumber: "1001131160210",
  version: "2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage, GoogleAuthProvider, RecaptchaVerifier, signInWithPhoneNumber };
