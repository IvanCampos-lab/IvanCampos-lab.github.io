// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
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
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);
const auth = getAuth(app)
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
let googleEmail;
let googleName;
let googlePhone;
class Uc {
  constructor (name, docente, desc, alunos, exams) {
      this.name = name;
      this.docente = docente;
      this.desc = desc;
      this.alunos = alunos;
      this.exams = exams;
  }
  toString() {
      return this.name + ', ' + this.docente;
  }
}

const ucConverter = {
  toFirestore: (uc) => {
      return {
          name: uc.name,
          docente: uc.docente,
          desc: uc.desc,
          alunos: uc.alunos,
          exams: uc.exams
          };
  },
  fromFirestore: (snapshot, options) => {
      const data = snapshot.data(options);
      return new Uc(data.name, data.docente, data.desc, data.alunos, data.exams);
  }
};

class Task {
  constructor (name, date, startTime, endTime, user, taskId) {
      this.name = name;
      this.date = date;
      this.startTime = startTime;
      this.endTime = endTime;
      this.user = user;
      this.taskId = taskId;
  }
  toString() {
      return this.name + ', ' + this.user;
  }
}

const taskConverter = {
  toFirestore: (task) => {
      return {
          name: task.name,
          date: task.date,
          startTime: task.startTime,
          endTime: task.endTime,
          user: task.user,
          taskId: task.taskId,
          };
  },
  fromFirestore: (snapshot, options) => {
      const data = snapshot.data(options);
      return new Task(data.name, data.date, data.startTime, data.endTime, data.user, data.taskId);
  }
};

class Exam {
  constructor (examId, ucName, date, startTime, docente) {
      this.examId = examId;
      this.ucName = ucName;
      this.date = date;
      this.startTime = startTime;
      this.docente = docente;
  }
  toString() {
      return this.name + ', ' + this.user;
  }
}

const examConverter = {
  toFirestore: (exam) => {
      return {
          examId: exam.examId,
          ucName: exam.ucName,
          date: exam.date,
          startTime: exam.startTime,
          docente: exam.docente,
          };
  },
  fromFirestore: (snapshot, options) => {
      const data = snapshot.data(options);
      return new Exam(data.examId, data.ucName, data.date, data.startTime, data.docente);
  }
};



class Aluno {
  constructor (name, userMail, userPhone, userUcs, userTasks) {
      this.name = name;
      this.userMail = userMail;
      this.userPhone = userPhone;
      this.userUcs = userUcs;
      this.userTasks = userTasks;
  }
  toString() {
      return this.name + ', ' + this.userMail + ', ' + this.userPhone;
  }
}

const alunoConverter = {
  toFirestore: (aluno) => {
      return {
          name: aluno.name,
          userMail: aluno.userMail,
          userPhone: aluno.userPhone,
          userUcs: aluno.userUcs,
          userTasks: aluno.userTasks
          };
  },
  fromFirestore: (snapshot, options) => {
      const data = snapshot.data(options);
      return new Aluno(data.name, data.userMail, data.userPhone, data.userUcs, data.userTasks);
  }
};

class Docente {
  constructor (name, userMail, userPhone, userUcs, userTasks) {
      this.name = name;
      this.userMail = userMail;
      this.userPhone = userPhone;
      this.userUcs = userUcs;
      this.userTasks = userTasks;
  }
  toString() {
      return this.name + ', ' + this.userMail + ', ' + this.userPhone;
  }
}

const docenteConverter = {
  toFirestore: (docente) => {
      return {
          name: docente.name,
          userMail: docente.userMail,
          userPhone: docente.userPhone,
          userUcs: docente.userUcs,
          userTasks: docente.userTasks,
          };
  },
  fromFirestore: (snapshot, options) => {
      const data = snapshot.data(options);
      return new Docente(data.name, data.userMail, data.userPhone, data.userUcs, data.userTasks);
  }
};
async function signOutFnc(){
    signOut(auth).then(() => {
        // Sign-out successful.
      }).catch((error) => {
        
      }); 
}

async function signUp(){
    let email = document.getElementById("signEmail").value;
    let password = document.getElementById("password").value;
    let uName = document.getElementById("userName").value;
    let uTel = document.getElementById("numTel").value;
    let uType =document.getElementById("userType").value;

    if(uType=="aluno"){
      const ref = doc(db, "alunos", email).withConverter(alunoConverter);
      await setDoc(ref, new Aluno(uName, email, uTel,[],[]));
      

      createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
          
          const user = userCredential.user;
          
          window.location.href = "calendar.html";

      })
      .catch((error) => {
          console.log(error)
          
      });
  } else if(uType=="docente"){
      const ref = doc(db, "docentes", email).withConverter(docenteConverter);
      await setDoc(ref, new Docente(uName, email, uTel,[],[]));
      

      createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
          
          const user = userCredential.user;
          
          window.location.href = "calendar.html";
      })
      .catch((error) => {
          
          
      });
  }
  
}
async function signUpGoogle(){
    console.log(1)
    signInWithPopup(auth, provider)
    .then(async (result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;
        console.log(result.user);
        googleEmail = result.user.email;
        console.log(googleEmail)
        let uType = document.getElementById("userType").value;
        if (result.user.phoneNumber != null) {
          googlePhone = result.user.phoneNumber;
        } else {
          googlePhone = "";
        }
        if (result.user.displayName != null) {
          googleName = result.user.displayName;
        } else {
          googleName = "";
        }
        if(uType=="aluno"){
    
          console.log(googleName)
          console.log(googleEmail)
          console.log(googlePhone)
          const ref = doc(db, "alunos", googleEmail).withConverter(alunoConverter);
          await setDoc(ref, new Aluno(googleName, googleEmail, googlePhone, [], []));
          window.location.href = "calendar.html";
      
          
      } else if(uType=="docente"){
        
          console.log(googleName)
          console.log(googleEmail)
          console.log(googlePhone)
          const ref = doc(db, "docentes", googleEmail).withConverter(docenteConverter);
          await setDoc(ref, new Docente(googleName, googleEmail,googlePhone,[],[]));
          window.location.href = "calendar.html";
        
      }
        
        // IdP data available using getAdditionalUserInfo(result)
        // ...
    }).catch((error) => {
        
        const errorCode = error.code;
        console.log(errorCode)
        const errorMessage = error.message;
        
        const email = error.customData.email;
        
        const credential = GoogleAuthProvider.credentialFromError(error);
        
  })
  

  
}

let signGoogle = document.getElementById("signwGoogle");
let signOutBtn = document.getElementById("signOutBtn");
let signBtn = document.getElementById("signupBtn");

signGoogle.addEventListener("click", signUpGoogle);
signBtn.addEventListener("click", signUp);

onAuthStateChanged(auth, (user) => {
    if (user) {
      const uid = user.uid;
      
      // ...
    } else {
        
      // User is signed out
      // ...
    }
  });