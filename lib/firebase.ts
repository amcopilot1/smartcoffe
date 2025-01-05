import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyALzWN14n9pJMxEORv2aPGTcOFSMjho7U8",
    authDomain: "coffee-shop-app-bdcc9.firebaseapp.com",
    projectId: "coffee-shop-app-bdcc9",
    storageBucket: "coffee-shop-app-bdcc9.appspot.com",
    messagingSenderId: "151970522398",
    appId: "1:151970522398:web:57e963d21ccd254da7d50f",
    measurementId: "G-TEQ1DSZ9LD",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

