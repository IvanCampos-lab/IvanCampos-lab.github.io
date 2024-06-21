import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getFirestore,
    doc,
    setDoc,
    collection,
    addDoc,
    getDoc,
    updateDoc,
    serverTimestamp,
    increment ,
    getDocFromCache ,
    collectionGroup,
    query,
    limit,
    where,
    arrayUnion, 
    arrayRemove,
    Timestamp,
    getDocs,
  } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyBLM59GU3YuYBQL3G3UtMmkmg_LgMzGaLw",
  authDomain: "inter-56cc2.firebaseapp.com",
  projectId: "inter-56cc2",
  storageBucket: "inter-56cc2.appspot.com",
  messagingSenderId: "925648381010",
  appId: "1:925648381010:web:8570707ebfdb04c2826b8b",
  measurementId: "G-6RXGWR9585"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();



async function signOutFnc(){
    signOut(auth).then(() => {
        // Sign-out successful.
      }).catch((error) => {
        // An error happened.
      }); 
}

async function login(){

    let email = document.getElementById("signEmail").value;
    let password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, email, password)
    .then(() => {
        // Signed in 
        window.location.href = "calendar.html";
        // ...
    })
    .catch((error) => {
      alert("Wrong email or password, Try again")
        const errorCode = error.code;
        const errorMessage = error.message;
    });
    

}



async function signUpGoogle(){
    signInWithPopup(auth, provider)
    .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;

        window.location.href = "calendar.html";
        // IdP data available using getAdditionalUserInfo(result)
        // ...
    }).catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
  });
}

let signGoogle = document.getElementById("signwGoogle");
let loginBtn = document.getElementById("loginBtn");

signGoogle.addEventListener("click", signUpGoogle);
loginBtn.addEventListener("click", login);


onAuthStateChanged(auth, (user) => {
    if (user) {
      const uid = user.uid;
      
    } else {
        
    
    }
  });