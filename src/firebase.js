// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  authDomain: "pet-care-cfc59.firebaseapp.com",
  projectId: "pet-care-cfc59",
  storageBucket: "pet-care-cfc59.firebasestorage.app",
  messagingSenderId: "1035448236983",
  appId: "1:1035448236983:web:055248997fc18299040632",
  measurementId: "G-GC5YEJ67SZ",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
