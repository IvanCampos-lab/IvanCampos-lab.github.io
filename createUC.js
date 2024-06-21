// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import {
    getAuth,
    signOut,
    GoogleAuthProvider,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getFirestore,
    doc,
    setDoc,
    collection,
    getDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    arrayUnion, 
    arrayRemove,
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
const auth = getAuth(app)
const db = getFirestore(app);

let btnClicked = false;
let email = "";
let docenteObj;
let userTypeDocente;
let signInBtn = document.getElementById("signInBtn");
let signOutBtn = document.getElementById("signOutBtn");
let alunoObj;
let ucObj;
let ucObjModal;
let i = 0;
let createUcBtn = document.getElementById("createUcBtn");
let cont = 1;
let nomeUcCardAddAluno;
let addMoreEmailBtn = document.getElementById("addMoreEmail");
let addAlunosBtn = document.getElementById("adicionarAlunos");
let removeAlunosBtn = document.getElementById("removerAlunos");
let emailAllAlunosArray =[];
let emailAlunoArray = [];
let examsArray = [];
let mostrarUcModal = document.getElementById("mostrarUcModal");


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
  constructor (name, date, startTime, endTime, user) {
      this.name = name;
      this.date = date;
      this.startTime = startTime;
      this.endTime = endTime;
      this.user = user;
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
          };
  },
  fromFirestore: (snapshot, options) => {
      const data = snapshot.data(options);
      return new Task(data.name, data.date, data.startTime, data.endTime, data.user);
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
    btnClicked = true;
    signOut(auth).then(() => {
        // Sign-out successful.
      }).catch((error) => {
        
      }); 
}


async function createUC(){
    let ucName = document.getElementById("nomeUC").value;
    let ucDesc = document.getElementById("descUC").value;
    if(userTypeDocente==true){
      
        let ucref = doc(db, "ucs", ucName).withConverter(ucConverter);
        await setDoc(ucref, new Uc(ucName, docenteObj.name, ucDesc, [], []));
        const docRef = doc(db, "docentes", email);
        await updateDoc(docRef, {
          userUcs: arrayUnion(ucName)
        });
        
        location.reload();
    }  
} 








onAuthStateChanged(auth, (user) => {
    if (user) {
      signInBtn.style.visibility = "hidden";
      signOutBtn.style.visibility = "visible";
      email = user.email;
      userTypeDocente = false;
      getCurrentUser();  
    } else {
      document.getElementById("signInBtn").style.visibility = "visible";
      document.getElementById("signOutBtn").style.visibility = "hidden";
      if (btnClicked == false){alert("Faça login para ver as suas Unidades Curriculares");}
      window.location.href = "login.html";
    }
  });
  async function getCurrentUser(){
  
    const usersDocRef = collection(db, "docentes");

    const q = query(usersDocRef, where("userMail", "==", email));
  
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
    userTypeDocente = true;
    

    
    });
    
    if (userTypeDocente == true){
        const docRef = doc(db, "docentes", email);
        const docSnap = await getDoc(docRef);
        
        docenteObj = docenteConverter.fromFirestore(docSnap);
        listUcs();
    } else {
      const docAlunoRef = doc(db, "alunos", email);
      const docAlunoSnap = await getDoc(docAlunoRef);
      alunoObj = alunoConverter.fromFirestore(docAlunoSnap);
      
      document.getElementById("criarUcBtn").style.visibility = "hidden";
      listUcs();
    }
  }
  
  async function listUcs(){
    let container = document.getElementById("cardContainer");
    container.innerHTML = "";
    if (userTypeDocente == true){

      
      for (const unidade of docenteObj.userUcs) {
        let ucref = doc(db, "ucs", unidade);
        let ucSnap = await getDoc(ucref);
        ucObj = ucConverter.fromFirestore(ucSnap);
        var el = document.createElement("div");
        var cardTitle = document.createElement("h5");
        var cardText = document.createElement("p");
        var cardBody = document.createElement("div");
        var cardBtn = document.createElement("button");
        var cardBtnDeleteUc = document.createElement("button");
        var cardFtr = document.createElement("div");
        var cardBtnDeleteUcImg = document.createElement("img");
        var cardBtnImg = document.createElement("img");
        cardFtr.className = "card-footer d-flex";
        cardBtn.className = "align-self-end btn btn-lg fs-6";
        cardBtn.dataset.bsTarget = "#adicionarAluno";
        cardBtn.dataset.bsToggle = "modal";
        cardBtn.name = "cardUcTitle" + i; //usamos o nome igual ao id do titulo para podermos pegar o nome da UC mais tarde
        cardBtnDeleteUc.className = "btn fs-6";
        cardBtnDeleteUc.dataset.bsTarget = "#adicionarAluno";
        cardBtnDeleteUc.name = "cardUcTitle" + i;
        cardBody.className = "card-body";
        cardTitle.className = "card-title";
        cardTitle.id = "cardUcTitle" + i;
        cardBtnDeleteUcImg.src = "delete.png";
        cardBtnImg.src = "menu.png"

        


        cardBtn.onclick = function(event){
          nomeUcCardAddAluno=event.currentTarget.name;
        }
        cardBtnDeleteUc.onclick = async function(event){
          nomeUcCardAddAluno=event.currentTarget.name;
          let nomeUcAddAluno = document.getElementById(nomeUcCardAddAluno).innerHTML;
          if(userTypeDocente==true){
            
            
            const docRef = doc(db, "docentes", email);
            await updateDoc(docRef, {
              userUcs: arrayRemove(nomeUcAddAluno)
            });
            await deleteDoc(doc(db, "ucs", nomeUcAddAluno));
            
            let examDocRef = collection(db, "exams");
            let qExam = query(examDocRef, where("ucName", "==", nomeUcAddAluno));
            let examsQuerySnapshot = await getDocs(qExam);
            examsQuerySnapshot.forEach((doc) => {
              examsArray.push(doc.data().examId);
            });
            for (let exam of examsArray){
              await deleteDoc(doc(db, "exams", exam));
            }

            const querySnapshot = await getDocs(collection(db, "alunos"));
            querySnapshot.forEach((doc) => {
              emailAllAlunosArray.push(doc.data().userMail);
              
            });
            for(let c of emailAllAlunosArray) {
              let docAlunoRef = doc(db, "alunos", c);
              await updateDoc(docAlunoRef, {
                userUcs: arrayRemove(nomeUcAddAluno)
              });
            }
            emailAllAlunosArray=[];
            location.reload();
          }
        }
        cardTitle.innerHTML = ucObj.name;
        cardText.className = "card-text";
        cardText.innerHTML = ucObj.desc;
        cardBtnDeleteUc.append(cardBtnDeleteUcImg);
        cardBtn.append(cardBtnImg);
        cardBtnDeleteUcImg.style.width = "3rem";
        cardBtnImg.style.width = "3rem";
        cardFtr.style.border = "none";
        cardFtr.style.backgroundColor = "#D08329";
        cardBtn.style.color = "white";
        cardBtn.style.position = "relative";
        cardBtn.style.left = "0,5rem";
        cardBtnDeleteUc.style.position = "relative";
        cardBtnDeleteUc.style.left = "4.5rem";
        cardBody.append(cardTitle);
        cardBody.append(cardText);
        cardFtr.append(cardBtn);
        cardFtr.append(cardBtnDeleteUc);
        el.append(cardBody);
        el.append(cardFtr);
        el.className = "card";
        el.id = "cardUc" + i;
        el.style.width = "18rem";
        el.style.height = "18rem";
        el.style.backgroundColor = "#D08329";
        el.style.borderRadius = "25px";
        el.style.color = "white";
        container.append(el);
        i=i+1;
      }
    } else {
      
      for (const unidade of alunoObj.userUcs) {
  
        let ucref = doc(db, "ucs", unidade);
        let ucSnap = await getDoc(ucref);
        ucObj = ucConverter.fromFirestore(ucSnap);
        var el = document.createElement("div");
        var cardTitle = document.createElement("h5");
        var cardText = document.createElement("p");
        var cardBody = document.createElement("div");
        var cardBtn = document.createElement("button");
        var cardFtr = document.createElement("div");
        var cardBtnImg = document.createElement("img");
        cardBtnImg.src = "info.png";
        cardFtr.className = "card-footer d-flex";
        cardBtn.className = "btn fs-6";
        cardBtn.dataset.bsTarget = "#mostrarUcModal";
        cardBtn.dataset.bsToggle = "modal";
        cardBtn.name = "cardUcTitle" + i;
        cardBtn.onclick = async function(event){
          nomeUcCardAddAluno=event.currentTarget.name;
          
          let nomeUcAddAluno = document.getElementById(nomeUcCardAddAluno).innerHTML;
          
          const docUcRef = doc(db, "ucs", nomeUcAddAluno);
          const docUcSnap = await getDoc(docUcRef);
          ucObjModal = ucConverter.fromFirestore(docUcSnap);
          
          document.getElementById("tituloUc").innerHTML = ucObjModal.name;
          document.getElementById("docenteUc").innerHTML = "Docente: " + ucObjModal.docente;
          document.getElementById("descricaoUc").innerHTML = ucObjModal.desc;
        }
        cardBody.className = "card-body";
        cardTitle.className = "card-title";
        cardTitle.id = "cardUcTitle" + i;
        cardTitle.innerHTML = ucObj.name;
        cardText.className = "card-text";
        cardText.innerHTML = ucObj.desc;
        cardBtnImg.style.width = "2rem";
        cardBtnImg.style.height = "2rem";
        cardBtn.style.borderRadius = "25px";
        cardBtn.style.height = "2.5";
        cardBtn.append(cardBtnImg);
        cardFtr.append(cardBtn);
        cardFtr.style.border = "none";
        cardFtr.style.backgroundColor = "#D08329";
        cardFtr.style.alignSelf = "center";
        cardBody.append(cardTitle);
        cardBody.style.textAlign = "center";
        el.append(cardBody);
        el.append(cardFtr);
        el.className = "card";
        el.id = "cardUc" + i;
        el.style.backgroundColor = "#D08329";
        el.style.borderRadius = "25px";
        el.style.color = "white";
        el.style.width = "8.5rem";
        el.style.height = "8.5rem";
        container.append(el);
        i=i+1;
        
      }
    }
   
  }
  
  function validateEmail(emailInput) {
    const pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return pattern.test(emailInput);
  }

  async function addStudent () {
    let nomeUcAddAluno = document.getElementById(nomeUcCardAddAluno).innerHTML;
    for (let c = 0; c<cont; c++){
      emailAlunoArray.push(document.getElementById("emailAluno"+c).value);
      
    }
    
    
    for(let email of emailAlunoArray){
      if(validateEmail(email)){
        let ucref = doc(db, "ucs", nomeUcAddAluno);
        await updateDoc(ucref, {
          alunos: arrayUnion(email)
        });

        let docAlunoRef = doc(db, "alunos", email);
        await updateDoc(docAlunoRef, {
          userUcs: arrayUnion(nomeUcAddAluno)
        });
      } else {
        emailAlunoArray = [];
        alert("enter a valid email");
        
      }
    }
    emailAlunoArray = [];
    location.reload();
  
  }

  async function removeStudent () {
    let nomeUcAddAluno = document.getElementById(nomeUcCardAddAluno).innerHTML;
    for (let c = 0; c<cont; c++){
      emailAlunoArray.push(document.getElementById("emailAluno"+c).value);
      
    }
    
    
    for(let email of emailAlunoArray){
      if(validateEmail(email)){
        let ucref = doc(db, "ucs", nomeUcAddAluno);
        await updateDoc(ucref, {
          alunos: arrayRemove(email)
        });

        let docAlunoRef = doc(db, "alunos", email);
        await updateDoc(docAlunoRef, {
          userUcs: arrayRemove(nomeUcAddAluno)
        });
      } else {
        emailAlunoArray = [];
        alert("enter a valid email");
        
      }
    }
    emailAlunoArray = [];
    location.reload();
  
  }
  
  

 
 

  addAlunosBtn.addEventListener("click", addStudent);
  removeAlunosBtn.addEventListener("click", removeStudent);
  
  mostrarUcModal.addEventListener("hidden.bs.modal", function () {
    //location.reload();
  });


  addMoreEmailBtn.addEventListener("click", function addEmail() {
    var addAlunoForm = document.getElementById("addAlunoForm");
    var emailAlunoDiv = document.createElement("div");
    var emailAlunoLbl = document.createElement("label");
    var emailAlunoInput = document.createElement("input");
    emailAlunoDiv.className = "mb-3";
    emailAlunoLbl.className = "col-form-label";
    emailAlunoLbl.for = "emailAluno" + cont;
    emailAlunoInput.className = "form-control";
    emailAlunoInput.type = "email";
    emailAlunoInput.id = "emailAluno" + cont;
    emailAlunoDiv.append(emailAlunoLbl);
    emailAlunoDiv.append(emailAlunoInput);
    addAlunoForm.append(emailAlunoDiv);
    cont = cont+1;

  })
  createUcBtn.addEventListener("click", createUC);
  signOutBtn.addEventListener("click", signOutFnc);  