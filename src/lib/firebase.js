import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  projectId: "gsttt-7301d",
  appId: "1:1001131160210:web:0fb46fe81adae078e8ec4b",
  databaseURL: "https://gsttt-7301d-default-rtdb.firebaseio.com",
  storageBucket: "gsttt-7301d.firebasestorage.app",
  apiKey: "AIzaSyBpNUCT4X7IFPjwuYBMU-An-T2b6dY4vXE",
  authDomain: "gsttt-7301d.firebaseapp.com",
  messagingSenderId: "1001131160210",
  measurementId: "G-2PPLZB4RYX"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
