/***********************
 * GLOBAL CONFIG
 ***********************/
const WEB_APP_URL = "YOUR_WEB_APP_URL_HERE";
let currentRole = "";
let currentUser = "";

/***********************
 * API CORE (ONLY ONE)
 ***********************/
async function callAPI(func, ...args) {
  const url = `${WEB_APP_URL}?func=${func}&args=${encodeURIComponent(JSON.stringify(args))}`;
  try {
    const res = await fetch(url);
    return await res.json();
  } catch (e) {
    console.error("API Error:", e);
    return null;
  }
}

/***********************
 * AUTH
 ***********************/
async function login() {
  const u = document.getElementById("username").value.trim();
  const p = document.getElementById("password").value.trim();
  if (!u || !p) return Swal.fire("បញ្ចូលព័ត៌មាន!");

  const res = await callAPI("checkLogin", u, p);
  if (!res || !res.success) {
    Swal.fire("Login Fail", "Username ឬ Password ខុស", "error");
    return;
  }

  currentRole = res.role;
  currentUser = u;

  document.getElementById("loginSection").style.display = "none";
  document.getElementById("mainApp").style.display = "block";

  applyRoleUI();
  showSection("dashboard");
}

function logout() {
  location.reload();
}

/***********************
 * ROLE UI (UI ONLY)
 ***********************/
function applyRoleUI() {
  document.querySelectorAll(".admin-only").forEach(el => {
    el.style.display = currentRole === "Admin" ? "" : "none";
  });
}

/***********************
 * NAVIGATION
 ***********************/
function showSection(sec) {
  document.getElementById("dashboardSection").style.display =
    sec === "dashboard" ? "block" : "none";
  document.getElementById("studentSection").style.display =
    sec === "students" ? "block" : "none";

  if (sec === "dashboard") loadDashboard();
  if (sec === "students") loadStudents();
}

/***********************
 * DASHBOARD
 ***********************/
async function loadDashboard() {
  const data = await callAPI("getStudents");
  if (!data) return;

  const teacherMap = {};
  let totalStudents = 0;
  let totalFee = 0;

  data.forEach(r => {
    const teacher = r[2];
    const fee = Number(r[3]) || 0;

    if (!teacherMap[teacher]) {
      teacherMap[teacher] = { count: 0, total: 0 };
    }

    teacherMap[teacher].count++;
    teacherMap[teacher].total += fee;

    totalStudents++;
    totalFee += fee;
  });

  // Stats
  document.getElementById("statsRow").innerHTML = `
    <div class="col-6 col-md-3">
      <div class="bg-primary text-white p-3 rounded">សិស្ស<br><b>${totalStudents}</b></div>
    </div>
    <div class="col-6 col-md-3">
      <div class="bg-success text-white p-3 rounded">សរុប<br><b>$${totalFee}</b></div>
    </div>
  `;

  // Teacher Table
  const body = document.getElementById("teacherBody");
  body.innerHTML = "";

  Object.keys(teacherMap).forEach(t => {
    const v = teacherMap[t];
    body.innerHTML += `
      <tr>
        <td>${t}</td>
        <td>${v.count}</td>
        <td>$${v.total}</td>
        <td>$${(v.total * 0.2).toFixed(2)}</td>
      </tr>`;
  });
}

/***********************
 * STUDENTS TABLE
 ***********************/
async function loadStudents() {
  const data = await callAPI("getStudents");
  if (!data) return;

  const body = document.getElementById("studentBody");
  body.innerHTML = "";

  data.forEach(r => {
    const name = r[0];
    const gender = r[1];
    const teacher = r[2];
    const fee = r[3];

    body.innerHTML += `
      <tr>
        <td>${name}</td>
        <td>${gender}</td>
        <td>${teacher}</td>
        <td>$${fee}</td>
        ${currentRole === "Admin" ? `
        <td>
          <button class="btn btn-sm btn-danger" onclick="deleteStudent('${name}')">
            <i class="bi bi-trash"></i>
          </button>
        </td>` : ""}
      </tr>`;
  });
}

/***********************
 * DELETE (UI SAFE)
 ***********************/
async function deleteStudent(name) {
  if (currentRole !== "Admin") return;

  const ok = await Swal.fire({
    title: "Delete?",
    text: name,
    icon: "warning",
    showCancelButton: true
  });

  if (!ok.isConfirmed) return;

  const res = await callAPI("deleteStudent", name);
  if (res && res.success) {
    loadStudents();
    loadDashboard();
  }
}

/***********************
 * PRINT
 ***********************/
function printReport() {
  window.print();
}
