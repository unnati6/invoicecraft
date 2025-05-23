// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAQpJ471rTAwlioZ_qKyamJhcil0T4iBrk",
  authDomain: "invoicecraft-4hbcl.firebaseapp.com",
  projectId: "invoicecraft-4hbcl",
  storageBucket: "invoicecraft-4hbcl.firebasestorage.app",
  messagingSenderId: "634052583887",
  appId: "1:634052583887:web:d36201c43a53c1638472ba"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export { auth };