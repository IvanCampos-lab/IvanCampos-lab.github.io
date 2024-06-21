import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";



const firebaseConfig = {
  apiKey: "AIzaSyBLM59GU3YuYBQL3G3UtMmkmg_LgMzGaLw",
  authDomain: "inter-56cc2.firebaseapp.com",
  projectId: "inter-56cc2",
  storageBucket: "inter-56cc2.appspot.com",
  messagingSenderId: "925648381010",
  appId: "1:925648381010:web:8570707ebfdb04c2826b8b",
  measurementId: "G-6RXGWR9585"
};

if ("serviceWorker" in navigator) {
  console.log("service worker supported")
  navigator.serviceWorker.register("./sw.js").then(function () {
    console.log("service worker is registered")
  });
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
let email;


onAuthStateChanged(auth, (user) => {
    if (user) {
        
      email = user.email;
      window.location.href = "calendar.html";
       
    } else {
      
      window.location.href = "login.html";
    }
  });
