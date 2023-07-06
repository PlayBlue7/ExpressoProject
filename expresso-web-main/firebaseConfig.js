// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import Firebase from 'firebase/app';
// import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "", // removed for personal privacy
    authDomain: "expressoqr.firebaseapp.com",
    projectId: "expressoqr",
    storageBucket: "expressoqr.appspot.com",
    messagingSenderId: "804717443647",
    appId: "1:804717443647:web:e5513c9fa99b1fe281168a",
    measurementId: "G-2HKVMDZ1KT"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// export const analytics = getAnalytics(app);
export const database = getFirestore(app);
