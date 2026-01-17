/*********************************
 * GLOBAL CONFIG & STATE
 *********************************/
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzIjImp2Ds_T96-bnLwhoH9Zm4asoJxOaOeqr1EOk9zq-Pqv6NwwcS3miCHc60xUgJo/exec";

let allStudents = [];
let currentUserRole = "User";
let isEditMode = false;
let originalName = "";

/*********************************
 * API CORE (ONLY ONE)
 *********************************/
async function callAPI(funcName, ...args) {
  const url = `${WEB_APP_URL}?func=${funcName}&args=${encodeURIComponent(JSON.stringify(args))}`;
  try {
    const res = await fetch(url);
    return await res.json();
  } catch (err) {
    console.error("API Error:", err);
    return null;
  }
}

/*********************************
 * AUTH & PERMISSION
 *********************************/
async function login() {
  const u = document.getElementById("username").value.trim();
  const p = document.getElementById("password").value.trim();

  if (!u || !p) {
    return Swal.fire("តម្រូវការ", "សូមបញ្ចូល Username និង Password", "warning");
  }

  Swal.fire({ title: "កំពុងផ្ទៀងផ្ទាត់...", didOpen: () => Swal.showLoading(), allowOutsideClick: false });

  const res = await callAPI("checkLogin", u, p);

  if (res && res.success) {
    currentUserRole = res.role;

    document.getElementById("loginSection").classList.replace("d-flex", "d-none");
    document.getElementById("mainApp").style.display = "block";

    applyPermissions();
    showSection("dashboard");

    Swal.fire({
      icon: "success",
      title: "ជោគជ័យ!",
      text: "អ្នកបានចូលប្រើប្រាស់ដោយជោគជ័យ!",
      timer: 2000,
      showConfirmButton: false
    });
  } else {
    Swal.fire("បរាជ័យ", "Username ឬ Password មិនត្រឹមត្រូវ", "error");
  }
}

function applyPermissions() {
  document.querySelectorAll(".admin-only").forEach(el => {
    el.style.display = currentUserRole === "Admin" ? "inline-flex" : "none";
  });
}

function logout() {
  location.reload();
}

/*********************************
 * NAVIGATION
 *********************************/
function showSection(id) {
  document.getElementById("dashboardSection").style.display = id === "dashboard" ? "block" : "none";
  document.getElementById("studentSection").style.display = id === "students" ? "block" : "none";

  if (id === "dashboard") loadDashboard();
  if (id === "students") loadStudents();
}

/*********************************
 * DASHBOARD
 *********************************/
async function loadDashboard() {
  const res = await callAPI("getTeacherData");
  if (!res) return;

  let studentCount = 0;
  let totalFee = 0;

  res.rows.forEach(r => {
    studentCount += parseInt(r[2]) || 0;
    totalFee += parseInt(r[3].toString().replace(/[^0-9]/g, "")) || 0;
  });

  document.getElementById("statsRow").innerHTML = `
    <div class="col-6 col-md-3"><div class="stat-card"><small>គ្រូសរុប</small><div class="h4">${res.rows.length}</div></div></div>
    <div class="col-6 col-md-3"><div class="stat-card"><small>សិស្សសរុប</small><div class="h4">${studentCount}</div></div></div>
    <div class="col-12 col-md-6"><div class="stat-card"><small>ចំណូលសរុប</small><div class="h4 text-success">${totalFee.toLocaleString()} ៛</div></div></div>
  `;

  document.getElementById("teacherBody").innerHTML = res.rows.map(r => `
    <tr>
      <td>${r[0]}</td>
      <td>${r[1]}</td>
      <td>${r[2]}</td>
      <td class="fw-bold text-primary">${r[3]}</td>
      <td class="text-success">${r[4]}</td>
      <td class="text-danger">${r[5]}</td>
    </tr>
  `).join("");
}

/*********************************
 * STUDENTS
 *********************************/
async function loadStudents() {
  const res = await callAPI("getStudentData");
  if (!res) return;
  allStudents = res.rows;
  renderStudentTable(allStudents);
}

function renderStudentTable(rows) {
  document.getElementById("studentBody").innerHTML = rows.map((r, i) => `
    <tr>
      <td class="fw-bold">${r[0]}</td>
      <td class="d-none d-md-table-cell">${r[1]}</td>
      <td class="d-none d-md-table-cell">${r[2]}</td>
      <td>${r[3]}</td>
      <td class="text-success fw-bold">${r[4]}</td>
      <td>
        <div class="btn-group">
          <button class="btn btn-sm btn-outline-info" onclick="printReceipt(${i})">
            <i class="bi bi-printer"></i>
          </button>
          ${currentUserRole === "Admin" ? `
            <button class="btn btn-sm btn-outline-warning" onclick="editStudent(${i})">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="confirmDelete(${i})">
              <i class="bi bi-trash"></i>
            </button>
          ` : ""}
        </div>
      </td>
    </tr>
  `).join("");
}

/*********************************
 * MODAL & CRUD
 *********************************/
function openStudentModal() {
  isEditMode = false;
  document.getElementById("modalTitle").innerText = "បញ្ចូលសិស្សថ្មី";
  document.getElementById("addStudentName").value = "";
  document.getElementById("addFee").value = "";
  document.getElementById("disp80").innerText = "0 ៛";
  document.getElementById("disp20").innerText = "0 ៛";
  new bootstrap.Modal(document.getElementById("studentModal")).show();
}

function editStudent(index) {
  isEditMode = true;
  const r = allStudents[index];
  originalName = r[0];

  document.getElementById("modalTitle").innerText = "កែប្រែព័ត៌មាន";
  document.getElementById("addStudentName").value = r[0];
  document.getElementById("addGender").value = r[1];
  document.getElementById("addGrade").value = r[2];
  document.getElementById("addTeacherSelect").value = r[3];

  const fee = parseInt(r[4].replace(/[^0-9]/g, "")) || 0;
  document.getElementById("addFee").value = fee;
  document.getElementById("disp80").innerText = (fee * 0.8).toLocaleString() + " ៛";
  document.getElementById("disp20").innerText = (fee * 0.2).toLocaleString() + " ៛";

  new bootstrap.Modal(document.getElementById("studentModal")).show();
}

async function submitStudent() {
  const name = document.getElementById("addStudentName").value.trim();
  const teacher = document.getElementById("addTeacherSelect").value;
  const fee = parseInt(document.getElementById("addFee").value) || 0;

  if (!name || !teacher) {
    return Swal.fire("Error", "សូមបំពេញព័ត៌មានចាំបាច់", "error");
  }

  const form = {
    studentName: name,
    gender: document.getElementById("addGender").value,
    grade: document.getElementById("addGrade").value,
    teacherName: teacher,
    schoolFee: fee.toLocaleString() + " ៛",
    teacherFeeVal: (fee * 0.8).toLocaleString() + " ៛",
    schoolFeeVal: (fee * 0.2).toLocaleString() + " ៛",
    paymentDate: new Date().toISOString().split("T")[0]
  };

  Swal.fire({ title: "កំពុងរក្សាទុក...", didOpen: () => Swal.showLoading() });

  const res = isEditMode
    ? await callAPI("updateStudentData", originalName, form)
    : await callAPI("saveStudentToTeacherSheet", form);

  if (res && res.success) {
    Swal.fire("ជោគជ័យ", res.message, "success");
    bootstrap.Modal.getInstance(document.getElementById("studentModal")).hide();
    loadStudents();
  } else {
    Swal.fire("Error", "រក្សាទុកមិនបានសម្រេច", "error");
  }
}

function confirmDelete(index) {
  const s = allStudents[index];
  Swal.fire({
    title: "លុបទិន្នន័យ?",
    text: `តើអ្នកចង់លុប ${s[0]} ?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#ef4444",
    confirmButtonText: "បាទ លុប!"
  }).then(async r => {
    if (r.isConfirmed) {
      const res = await callAPI("deleteStudentData", s[0], s[3]);
      if (res && res.success) {
        Swal.fire("Deleted!", res.message, "success");
        loadStudents();
      }
    }
  });
}

/*********************************
 * PRINT
 *********************************/
function printStudentReport() {
  // 👉 ใช้ version Report ใหญ่ล่าสุดของអ្នក (logic ស្អាត)
  // (មិនកែ UI/HTML ខាងក្នុង ដើម្បីរក្សារូបរាងដើម)
  window.print();
}

function printReceipt(index) {
  const s = allStudents[index];
  const w = window.open("", "", "width=800,height=600");
  w.document.write(`
    <html><body onload="window.print();window.close()">
    <h3>វិក្កយបត្រ</h3>
    <p>ឈ្មោះ: ${s[0]}</p>
    <p>តម្លៃ: ${s[4]}</p>
    </body></html>
  `);
  w.document.close();
}
