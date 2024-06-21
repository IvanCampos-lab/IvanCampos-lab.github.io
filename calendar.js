// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import {
  getAuth,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { 
  getFirestore,
  collection,
  query,
  where, 
  doc, 
  setDoc, 
  getDoc,
  getDocs,
  arrayUnion,
  updateDoc,
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
let alunoObj;
let docenteObj;
let addTaskBtn = document.getElementById("addTaskBtn");
let taskObj;
let calendar;
let addExamForm = document.getElementById("addExamForm");
let addExamFormBtn = document.getElementById("addExamFormBtn");
let addExamBtn = document.getElementById("addExamBtn");
let ucObj;
let examObj;

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
    }).catch((error) => {
      
    }); 
}


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
      if (btnClicked == false){alert("Faça login para ver o seu calendário");}
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
    
    alunoObj = alunoConverter.fromFirestore(docSnap);

    for(let task of alunoObj.userTasks){
      let taskref = doc(db, "tasks", task);
      let taskSnap = await getDoc(taskref);
      
      taskObj = taskConverter.fromFirestore(taskSnap);
      calendar.addEvent({
        id: taskObj.taskId,
        extendedProps: {
          type: 'task'
        },
        title: taskObj.name,
        start: taskObj.date + 'T' + taskObj.startTime,
        end: taskObj.date + 'T' + taskObj.endTime,
      });
    }
    for(let uc of alunoObj.userUcs){
      let ucRef = doc(db, "ucs", uc);
      let ucSnap = await getDoc(ucRef);

      ucObj = ucConverter.fromFirestore(ucSnap);
      for(let exam of ucObj.exams){
        let examRef = doc(db, "exams", exam);
        let examSnap = await getDoc(examRef);
        
        examObj = examConverter.fromFirestore(examSnap);
        calendar.addEvent({
          id: examObj.examId,
          extendedProps: {
            type: 'exam'
          },
          title: 'Exame: ' + examObj.ucName,
          start: examObj.date + 'T' + examObj.startTime,
        });
      }

    }

  } else {
      const docRef = doc(db, "docentes", email);
      const docSnap = await getDoc(docRef);
      addExamFormBtn.style.visibility = "visible";
      docenteObj = docenteConverter.fromFirestore(docSnap);
      for(let task of docenteObj.userTasks){
        let taskref = doc(db, "tasks", task);
        let taskSnap = await getDoc(taskref);
        
        taskObj = taskConverter.fromFirestore(taskSnap);
        
        calendar.addEvent({
          id: taskObj.taskId,
          extendedProps: {
            type: 'task'
          },
          title: taskObj.name,
          start: taskObj.date + 'T' + taskObj.startTime,
          end: taskObj.date + 'T' + taskObj.endTime,
        });
      }
      for(let uc of docenteObj.userUcs){
        let ucRef = doc(db, "ucs", uc);
        let ucSnap = await getDoc(ucRef);

        ucObj = ucConverter.fromFirestore(ucSnap);
        for(let exam of ucObj.exams){
          let examRef = doc(db, "exams", exam);
          let examSnap = await getDoc(examRef);
          
          examObj = examConverter.fromFirestore(examSnap);
          calendar.addEvent({
            id: examObj.examId,
            extendedProps: {
              type: 'exam'
            },
            title: 'Exame de: ' + examObj.ucName,
            start: examObj.date + 'T' + examObj.startTime,
          });
        }
      
      }

  }
}

function formExams (){
  let selectUc = document.createElement("select");
  let selectUcOptionDefault = document.createElement("option");

  selectUc.className = "form-select";
  selectUc.id = "ucSelected";
  selectUcOptionDefault.selected = true;
  selectUcOptionDefault.innerHTML = "Selecione Uc";
  selectUc.append(selectUcOptionDefault);
  for (let unidade of docenteObj.userUcs){
    
    let selectUcOption = document.createElement("option");
    selectUcOption.value = unidade;
    selectUcOption.innerHTML = unidade;
    selectUc.append(selectUcOption);
  }
  addExamForm.append(selectUc);
}



async function addTask() {
  

  let taskIdNum = Date.now();
  let taskId = taskIdNum.toString();
  let taskName = document.getElementById("taskName").value;
  let taskDate = document.getElementById("date").value;
  let taskStartTime = document.getElementById("startTime").value;
  let taskEndTime = document.getElementById("endTime").value;
  if (userTypeDocente == true){
    
    let taskref = doc(db, "tasks", taskId).withConverter(taskConverter);
    await setDoc(taskref, new Task(taskName, taskDate, taskStartTime, taskEndTime, email, taskId));
    const docRef = doc(db, "docentes", email);
    await updateDoc(docRef, {
      userTasks: arrayUnion(taskId)
    });
    
  
  } else {
    
    let taskref = doc(db, "tasks", taskId).withConverter(taskConverter);
    await setDoc(taskref, new Task(taskName, taskDate, taskStartTime, taskEndTime, email, taskId));
    const docRef = doc(db, "alunos", email);
    await updateDoc(docRef, {
      userTasks: arrayUnion(taskId)
    });
    
  }
  location.reload();
}


async function addExam() {
  
  let examDate = document.getElementById("examDate").value;
  let examStartTime = document.getElementById("examTime").value;
  let examUc = document.getElementById("ucSelected").value;
  let examIdNum = Date.now();
  let examId = examIdNum.toString();

  
  let examref = doc(db, "exams", examId).withConverter(examConverter);
  await setDoc(examref, new Exam(examId,examUc, examDate, examStartTime, email));
  let ucRef = doc(db, "ucs", examUc);
  await updateDoc(ucRef, {
    exams: arrayUnion(examId)
  })
  
   
  location.reload();
}
addTaskBtn.addEventListener('click', addTask);

signOutBtn.addEventListener("click", signOutFnc);  
addExamFormBtn.addEventListener('click', formExams);
addExamBtn.addEventListener('click', addExam);
document.addEventListener('DOMContentLoaded', function() {
  if(window.innerWidth<768){
    let calendarEl = document.getElementById('calendar');
    calendar = new FullCalendar.Calendar(calendarEl, {
    height: 600,
    initialView: "dayGridMonth",
    eventClick: async function(info) {
      let taskId = info.event.id;
      let eventType = info.event.extendedProps.type;
      if (eventType == "task"){
        let taskref = doc(db, "tasks", taskId);
        let taskSnap = await getDoc(taskref);
        
        taskObj = taskConverter.fromFirestore(taskSnap);
        document.getElementById("taskModalTitle").innerHTML = taskObj.name;
        document.getElementById("taskData").innerHTML = "Data: " + taskObj.date;
        document.getElementById("taskStart").innerHTML = "Inicio da tarefa: " + taskObj.startTime;
        document.getElementById("taskEnd").innerHTML = "Fim da tarefa: " + taskObj.endTime;
        var taskModal = document.getElementById("taskModal");
        var taskModalObj = new bootstrap.Modal(taskModal);
        taskModalObj.show();
      } else if (eventType == "exam") {
        let examref = doc(db, "exams", taskId);
        let examSnap = await getDoc(examref);
        
        taskObj = examConverter.fromFirestore(examSnap);
        document.getElementById("taskModalTitle").innerHTML = "Exame de " + taskObj.ucName;
        document.getElementById("taskData").innerHTML = "Data:" + taskObj.date;
        document.getElementById("taskStart").innerHTML = "Inicio do exame: " + taskObj.startTime;
        var taskModal = document.getElementById("taskModal");
        var taskModalObj = new bootstrap.Modal(taskModal);
        taskModalObj.show();
      }
      
    }
  });
  } else {
    let calendarEl = document.getElementById('calendar');
    calendar = new FullCalendar.Calendar(calendarEl, {
    height: "auto",
    initialView: "timeGridWeek",
    eventClick: async function(info) {
      let taskId = info.event.id;
      let eventType = info.event.extendedProps.type;
      if (eventType == "task"){
        let taskref = doc(db, "tasks", taskId);
        let taskSnap = await getDoc(taskref);
        
        taskObj = taskConverter.fromFirestore(taskSnap);
        document.getElementById("taskModalTitle").innerHTML = taskObj.name;
        document.getElementById("taskData").innerHTML = "Data: " + taskObj.date;
        document.getElementById("taskStart").innerHTML = "Inicio da tarefa: " + taskObj.startTime;
        document.getElementById("taskEnd").innerHTML = "Fim da tarefa: " + taskObj.endTime;
        var taskModal = document.getElementById("taskModal");
        var taskModalObj = new bootstrap.Modal(taskModal);
        taskModalObj.show();
      } else if (eventType == "exam") {
        let examref = doc(db, "exams", taskId);
        let examSnap = await getDoc(examref);
        
        taskObj = examConverter.fromFirestore(examSnap);
        document.getElementById("taskModalTitle").innerHTML = "Exame de " + taskObj.ucName;
        document.getElementById("taskData").innerHTML = "Data:" + taskObj.date;
        document.getElementById("taskStart").innerHTML = "Inicio do exame: " + taskObj.startTime;
        var taskModal = document.getElementById("taskModal");
        var taskModalObj = new bootstrap.Modal(taskModal);
        taskModalObj.show();
      }
    }
  });
  }
  calendar.render();
});
