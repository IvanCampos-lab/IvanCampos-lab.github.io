// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
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
  collection,
  query,
  where, 
  doc, 
  setDoc, 
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  Timestamp 
// } from "firebase/firestore";
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js'; 



// Your web app's Firebase configuration
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

let signInBtn = document.getElementById("signInBtn");
let signOutBtn = document.getElementById("signOutBtn");
let btnClicked = false;
let aluno;
let docente;
let changeNameBtn = document.getElementById("changeNameBtn");
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



let email="";
let userTypeDocente;


onAuthStateChanged(auth, (user) => {
  if (user) {
    signInBtn.style.visibility = "hidden";
    signOutBtn.style.visibility = "visible";
    email = user.email;
    userTypeDocente = false;
    getCurrentUser();    
  } else {
      signInBtn.style.visibility = "visible";
      signOutBtn.style.visibility = "hidden";
      window.location.href = "login.html";
  }
});
async function getCurrentUser(){

  const usersRef = collection(db, "docentes");
  
  const q = query(usersRef, where("userMail", "==", email));

  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    userTypeDocente = true;
  });

  if (userTypeDocente == false){
    const docRef = doc(db, "alunos", email);
    const docSnap = await getDoc(docRef);
    
    aluno = alunoConverter.fromFirestore(docSnap);
    document.getElementById("changeNameInput").placeholder = aluno.name;
    document.getElementById("email").innerHTML = "Email: " + aluno.userMail;
    document.getElementById("phone").innerHTML = "Telemóvel: " + aluno.userPhone;
    document.getElementById("userType").innerHTML = "Tipo de usuário: Aluno";
  } else {
      const docRef = doc(db, "docentes", email);
      const docSnap = await getDoc(docRef);
      
      docente = docenteConverter.fromFirestore(docSnap);
      document.getElementById("changeNameInput").placeholder = docente.name;
      document.getElementById("email").innerHTML = "Email: " + docente.userMail;
      document.getElementById("phone").innerHTML = "Telemóvel: " + docente.userPhone;
      document.getElementById("userType").innerHTML = "Tipo de usuário: Docente";
  }
}

async function changeName(){
  let newName = document.getElementById("changeNameInput").value;
  if (userTypeDocente == false){
    const docRef = doc(db, "alunos", email);
    await updateDoc(docRef, {
      name: newName
    })
  } else {
    const docRef = doc(db, "docentes", email);
    for (let unidade of docente.userUcs){
      let ucRef = doc(db, "ucs", unidade)
      await updateDoc(ucRef, {
        docente: newName
      })
    }
    await updateDoc(docRef, {
      name: newName
    })


  }
}

changeNameBtn.addEventListener("click", changeName);

