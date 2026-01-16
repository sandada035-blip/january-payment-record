const WEB_APP_URL =
"https://script.google.com/macros/s/AKfycbxkz2jkoLj1RcRVeN9LQCakgKFmR_VOPlko-fCuqpcQ8_4n9rx-3YuWoYQl4T054vOR/exec";

let allStudents = [];
let userRole = "User";

async function callAPI(func, ...args) {
  const url = `${WEB_APP_URL}?func=${func}&args=${encodeURIComponent(JSON.stringify(args))}`;
  const res = await fetch(url);
  return await res.json();
}

async function login() {
  const u = username.value.trim();
  const p = password.value.trim();
  if (!u || !p) return Swal.fire("Error","Fill all fields","error");

  Swal.fire({title:"Checking...",didOpen:()=>Swal.showLoading()});

  const res = await callAPI("checkLogin", u, p);
  if (res.success) {
    userRole = res.role;
    loginSection.style.display="none";
    mainApp.style.display="block";
    loadStudents();
    Swal.close();
  } else {
    Swal.fire("Fail","Wrong login","error");
  }
}

async function loadStudents() {
  const res = await callAPI("getStudentData");
  allStudents = res.rows || [];

  studentBody.innerHTML = allStudents.map((r,i)=>`
    <tr>
      <td>${r[0]}</td>
      <td>${r[3]}</td>
      <td class="text-success">${r[4]}</td>
      <td class="text-center">
        <button class="btn btn-sm btn-outline-primary" onclick="printReceipt(${i})">
          <i class="bi bi-printer"></i>
        </button>
      </td>
    </tr>
  `).join("");
}

function filterStudents() {
  const v = studentSearch.value.toLowerCase();
  document.querySelectorAll("#studentBody tr").forEach(r=>{
    r.style.display = r.innerText.toLowerCase().includes(v) ? "" : "none";
  });
}

function printReceipt(i) {
  const s = allStudents[i];
  const w = window.open("");
  w.document.write(`
    <h3>Receipt</h3>
    <p>Student: <b>${s[0]}</b></p>
    <p>Teacher: <b>${s[3]}</b></p>
    <p>Fee: <b>${s[4]}</b></p>
    <script>window.print();window.close()</script>
  `);
}

function logout() {
  location.reload();
}


let allStudents = [];

// Load Students
async function loadStudents() {
  allStudents = await callAPI("getStudents");
  renderStudentTable();
}

function renderStudentTable() {
  const tbody = document.getElementById("studentTable");
  tbody.innerHTML = "";

  allStudents.forEach((s, i) => {
    tbody.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>${s[0]}</td>
        <td>${s[1]}</td>
        <td>${s[2]}</td>
        <td>${s[3]}</td>
        <td>${s[4]}</td>
        <td>
          <button class="btn btn-sm btn-warning"
            onclick="editStudent(${i})">
            <i class="bi bi-pencil"></i>
          </button>
        </td>
      </tr>`;
  });
}

// Open Edit Modal
function editStudent(index) {
  const s = allStudents[index];

  editOldName.value = s[0];
  editName.value = s[0];
  editGender.value = s[1];
  editGrade.value = s[2];
  editTeacher.value = s[3];
  editFee.value = s[4];

  new bootstrap.Modal(
    document.getElementById("editStudentModal")
  ).show();
}

// Update Student
async function updateStudent() {
  const oldName = editOldName.value;

  const data = {
    studentName: editName.value,
    gender: editGender.value,
    grade: editGrade.value,
    teacherName: editTeacher.value,
    schoolFee: editFee.value
  };

  const res = await callAPI("updateStudentData", oldName, data);

  if (res.success) {
    alert("បានកែទិន្នន័យរួចរាល់");
    bootstrap.Modal
      .getInstance(editStudentModal)
      .hide();
    loadStudents();
  } else {
    alert(res.message);
  }
}
