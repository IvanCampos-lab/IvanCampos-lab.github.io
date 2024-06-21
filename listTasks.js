// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import {
    getAuth,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getFirestore,
    doc,
    collection,
    getDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
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
let taskObj;
let cardTaskId;
let examObj;
let cardExamId;

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
    btnClicked = true;
    signOut(auth).then(() => {
        // Sign-out successful.
      }).catch((error) => {
        
      }); 
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
      if (btnClicked == false){alert("Faça login para ver as suas tarefas");}
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
        listTasks();
        listExams();
    } else {
      const docAlunoRef = doc(db, "alunos", email);
      const docAlunoSnap = await getDoc(docAlunoRef);
      alunoObj = alunoConverter.fromFirestore(docAlunoSnap);
      
      
      listTasks();
      listExams();
    }
  }
  
  async function listTasks(){
    let container = document.getElementById("taskContainer");
    container.innerHTML = "";
    
    if (userTypeDocente == true){
        
        for(let task of docenteObj.userTasks){
            
            let taskRef = doc(db, "tasks", task);
            let taskSnap = await getDoc(taskRef);
            taskObj = taskConverter.fromFirestore(taskSnap);
            var el = document.createElement("div");
            var cardTitle = document.createElement("h5");
            var cardDate = document.createElement("p");
            var cardStartTime = document.createElement("p");
            var cardEndTime = document.createElement("p");
            var cardBody = document.createElement("div");
            var cardBtnDeleteTask = document.createElement("button");
            var cardFtr = document.createElement("div");
            var cardText = document.createElement("div");
            var cardBtnDeleteTaskImg = document.createElement("img");
            cardBtnDeleteTaskImg.src = "delete.png";
            cardBtnDeleteTask.id = taskObj.taskId;
            cardFtr.className = "card-footer d-flex";
            cardBtnDeleteTask.className = "align-self-end btn fs-6";
            cardBody.className = "card-body";
            cardTitle.className = "card-title";
            cardText.className = "card-text";

            cardBtnDeleteTaskImg.style.width = "2.5rem";
            cardBtnDeleteTaskImg.style.height = "2.5rem";

            cardBtnDeleteTask.append(cardBtnDeleteTaskImg);

            cardTitle.innerHTML = taskObj.name;
            cardDate.innerHTML = "Data: " + taskObj.date;
            cardStartTime.innerHTML = "Inicio da tarefa: " + taskObj.startTime;
            cardEndTime.innerHTML = "Fim da tarefa: " + taskObj.endTime;

            cardBtnDeleteTask.onclick = async function(event){
                cardTaskId = event.currentTarget.id;
                await deleteDoc(doc(db, "tasks", cardTaskId));
                let docRef = doc(db, "docentes", email);
                await updateDoc(docRef, {
                userTasks: arrayRemove(cardTaskId)
                });

                location.reload();
              }
            
            cardFtr.style.border = "none";
            cardFtr.style.backgroundColor = "#D08329";
            cardFtr.style.alignSelf = "center";  

            cardBody.append(cardTitle);
            cardText.append(cardDate);
            cardText.append(cardStartTime);
            cardText.append(cardEndTime);
            cardBody.append(cardText);
            cardFtr.append(cardBtnDeleteTask);
            el.append(cardBody);
            el.append(cardFtr);
            el.className = "card";
            el.style.width = "18rem";
            el.style.height = "16rem";
            el.style.backgroundColor = "#D08329";
            el.style.borderRadius = "25px";
            el.style.color = "white";
            container.append(el);
        }
    } else {
        
        for(let task of alunoObj.userTasks){
            
            let taskRef = doc(db, "tasks", task);
            let taskSnap = await getDoc(taskRef);
            taskObj = taskConverter.fromFirestore(taskSnap);
            var el = document.createElement("div");
            var cardTitle = document.createElement("h5");
            var cardDate = document.createElement("p");
            var cardStartTime = document.createElement("p");
            var cardEndTime = document.createElement("p");
            var cardBody = document.createElement("div");
            var cardBtnDeleteTask = document.createElement("button");
            var cardFtr = document.createElement("div");
            var cardText = document.createElement("div");
            var cardBtnDeleteTaskImg = document.createElement("img");
            cardBtnDeleteTaskImg.src = "delete.png";
            cardBtnDeleteTask.id = taskObj.taskId;
            cardFtr.className = "card-footer d-flex";
            cardBtnDeleteTask.className = "btn fs-6";
            cardBody.className = "card-body";
            cardTitle.className = "card-title";
            cardText.className = "card-text";


            cardTitle.innerHTML = taskObj.name;
            cardDate.innerHTML = "Data: " + taskObj.date;
            cardStartTime.innerHTML = "Inicio da tarefa: " + taskObj.startTime;
            cardEndTime.innerHTML = "Fim da tarefa: " + taskObj.endTime;

            cardBtnDeleteTask.onclick = async function(event){
                cardTaskId = event.currentTarget.id;
                await deleteDoc(doc(db, "tasks", cardTaskId));
                let docAlunoRef = doc(db, "alunos", email);
                await updateDoc(docAlunoRef, {
                userTasks: arrayRemove(cardTaskId)
                });

                location.reload();
              }
            
            cardFtr.style.border = "none";
            cardFtr.style.backgroundColor = "#D08329";
            cardFtr.style.alignSelf = "center";  

            cardBtnDeleteTaskImg.style.width = "2.5rem";
            cardBtnDeleteTaskImg.style.height = "2.5rem";

            cardBtnDeleteTask.append(cardBtnDeleteTaskImg);
            cardBody.append(cardTitle);
            cardText.append(cardDate);
            cardText.append(cardStartTime);
            cardText.append(cardEndTime);
            cardBody.append(cardText);
            cardFtr.append(cardBtnDeleteTask);
            el.append(cardBody);
            el.append(cardFtr);
            el.style.width = "18rem";
            el.style.height = "16rem";
            el.style.backgroundColor = "#D08329";
            el.style.borderRadius = "25px";
            el.style.color = "white";
            el.className = "card";
            container.append(el);
        }
    }
   
  }

  async function listExams(){
    let examContainer = document.getElementById("examContainer");
    examContainer.innerHTML = "";
    
    if (userTypeDocente == true){
        
        for(let uc of docenteObj.userUcs){
            let c = 0;
            let ucRef = doc(db, "ucs", uc);
            let ucSnap = await getDoc(ucRef);
            ucObj = ucConverter.fromFirestore(ucSnap);
            let examUcName = ucObj.name;
            if (ucObj.exams[c] == undefined) continue;
            for (let exam of ucObj.exams){
              if (ucObj.exams[c] == undefined) continue;
              let examRef = doc(db, "exams", exam);
              let examSnap = await getDoc(examRef);
              examObj = examConverter.fromFirestore(examSnap);
              var el = document.createElement("div");
              var cardTitle = document.createElement("h5");
              var cardDate = document.createElement("p");
              var cardStartTime = document.createElement("p");
              var cardEndTime = document.createElement("p");
              var cardBody = document.createElement("div");
              var cardBtnDeleteTask = document.createElement("button");
              var cardFtr = document.createElement("div");
              var cardText = document.createElement("div");
              var cardBtnDeleteTaskImg = document.createElement("img");
              cardBtnDeleteTaskImg.src = "delete.png";
              cardBtnDeleteTask.id = examObj.examId;
              cardFtr.className = "card-footer d-flex";
              cardBtnDeleteTask.className = "align-self-end btn fs-6";
              
              cardBody.className = "card-body";
              cardTitle.className = "card-title";
              cardText.className = "card-text";


              cardTitle.innerHTML = "Exame de: " + examObj.ucName;
              cardDate.innerHTML = "Data: " + examObj.date;
              cardStartTime.innerHTML = "Inicio do exame: " + examObj.startTime ;

              cardBtnDeleteTask.onclick = async function(event){
                  cardExamId = event.currentTarget.id;
                  let ucRef = doc(db, "ucs", examUcName);
                  await updateDoc(ucRef, {
                      exams: arrayRemove(cardExamId)
                      });
                  await deleteDoc(doc(db, "exams", cardExamId));    
                  location.reload();
                }
              
              cardFtr.style.border = "none";
              cardFtr.style.backgroundColor = "#D08329";
              cardFtr.style.alignSelf = "center";    
              
              cardBtnDeleteTaskImg.style.width = "2.5rem";
              cardBtnDeleteTaskImg.style.height = "2.5rem";

              cardBtnDeleteTask.append(cardBtnDeleteTaskImg);
              cardBody.append(cardTitle);
              cardText.append(cardDate);
              cardText.append(cardStartTime);
              cardText.append(cardEndTime);
              cardBody.append(cardText);
              cardFtr.append(cardBtnDeleteTask);
              el.append(cardBody);
              
              el.append(cardFtr);
              el.className = "card";
              el.style.width = "18rem";
              el.style.height = "16rem";
              el.style.backgroundColor = "#D08329";
              el.style.borderRadius = "25px";
              el.style.color = "white";
              examContainer.append(el);
              c++ ;
            }
        }
    } else {
        
        for(let uc of alunoObj.userUcs){
            let c = 0;
            let ucRef = doc(db, "ucs", uc);
            let ucSnap = await getDoc(ucRef);
            ucObj = ucConverter.fromFirestore(ucSnap);
            if (ucObj.exams[c] == undefined) continue;
            for (let exam of ucObj.exams){
              if (exam == undefined) continue;
              let examRef = doc(db, "exams", exam);
              console.log(ucObj.exams[c])
              let examSnap = await getDoc(examRef);
              examObj = examConverter.fromFirestore(examSnap);
              var el = document.createElement("div");
              var cardTitle = document.createElement("h5");
              var cardDate = document.createElement("p");
              var cardStartTime = document.createElement("p");
              var cardEndTime = document.createElement("p");
              var cardBody = document.createElement("div");
              var cardFtr = document.createElement("div");
              var cardText = document.createElement("div");
              cardFtr.className = "card-footer d-flex";
              
              cardBody.className = "card-body";
              cardTitle.className = "card-title";
              cardText.className = "card-text";
              

              cardTitle.innerHTML = "Exame de: " + examObj.ucName;
              cardDate.innerHTML = "Data: " + examObj.date;
              cardStartTime.innerHTML = "Inicio do exame: " + examObj.startTime ;


              cardBody.append(cardTitle);
              cardText.append(cardDate);
              cardText.append(cardStartTime);
              cardText.append(cardEndTime);
              cardBody.append(cardText);
              el.append(cardBody);
              el.className = "card";
              el.style.width = "18rem";
              
              el.style.backgroundColor = "#D08329";
              el.style.borderRadius = "25px";
              el.style.color = "white";
              examContainer.append(el);
              c++ ;
            }
        }
    }
   
  }
  
  


  

 
 

  
  
  

 
  signOutBtn.addEventListener("click", signOutFnc);  