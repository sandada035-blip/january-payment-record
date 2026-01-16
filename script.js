const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwPyx0d-qqXUEcyPcjIFR5CgzMSSB6l-gOJ1IshoK56mn5vXx-2JQe08xdC4XqUWpZB/exec"; 
let userRole = "User", allStudents = [], isEditMode = false, originalName = "";

async function callAPI(func, ...args) {
  const url = `${WEB_APP_URL}?func=${func}&args=${encodeURIComponent(JSON.stringify(args))}`;
  try {
    const res = await fetch(url);
    return await res.json();
  } catch (e) { return { success: false }; }
}

async function login() {
  const u = document.getElementById('username').value;
  const p = document.getElementById('password').value;
  Swal.fire({title: 'កំពុងចូល...', didOpen: () => Swal.showLoading()});
  const res = await callAPI('checkLogin', u, p);
  if (res && res.success) {
    userRole = res.role;
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    applyPermissions();
    showSection('dashboard');
    Swal.close();
  } else { Swal.fire('Error', 'ឈ្មោះ ឬលេខសម្ងាត់ខុស', 'error'); }
}

function applyPermissions() {
  document.querySelectorAll('.admin-only').forEach(el => el.style.display = userRole === 'Admin' ? 'block' : 'none');
}

function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
  document.getElementById(id + 'Section').style.display = 'block';
  if(id === 'dashboard') loadDashboard();
  if(id === 'students') loadStudents();
}

async function loadDashboard() {
  const res = await callAPI('getDashboardStats');
  if(res.success) {
    document.getElementById('statsRow').innerHTML = `
      <div class="col-6"><div class="stat-card"><h6>សិស្សសរុប</h6><h4>${res.data.totalStudents}</h4></div></div>
      <div class="col-6"><div class="stat-card"><h6>ចំណូលសរុប</h6><h4>${res.data.totalIncome}</h4></div></div>
    `;
  }
}

async function loadStudents() {
  const res = await callAPI('getStudents');
  if(res.success) {
    allStudents = res.data;
    document.getElementById('studentBody').innerHTML = res.data.map((r, i) => `
      <tr>
        <td><b>${r[0]}</b><br><small>${r[3]}</small></td>
        <td class="text-success">${r[4]}</td>
        <td>
          <button class="btn btn-sm btn-info" onclick="printReceipt(${i})"><i class="bi bi-printer"></i></button>
          ${userRole==='Admin' ? `<button class="btn btn-sm btn-warning" onclick="editStudent(${i})"><i class="bi bi-pencil"></i></button>` : ''}
        </td>
      </tr>`).join('');
  }
}

async function submitStudent() {
  const form = {
    studentName: document.getElementById('addStudentName').value,
    gender: document.getElementById('addGender').value,
    grade: document.getElementById('addGrade').value,
    teacherName: document.getElementById('addTeacherSelect').value,
    schoolFee: document.getElementById('addFee').value + " KHR",
    paymentDate: new Date().toLocaleDateString()
  };
  Swal.fire({title: 'កំពុងរក្សាទុក...'});
  const res = isEditMode ? await callAPI('updateStudentData', originalName, form) : await callAPI('saveStudent', form);
  if(res.success) {
    bootstrap.Modal.getInstance(document.getElementById('studentModal')).hide();
    loadStudents();
    Swal.fire('ជោគជ័យ', '', 'success');
  }
}

function editStudent(i) {
  isEditMode = true;
  const s = allStudents[i];
  originalName = s[0];
  document.getElementById('addStudentName').value = s[0];
  document.getElementById('addGrade').value = s[2];
  document.getElementById('addFee').value = s[4].replace(/[^0-9]/g, "");
  new bootstrap.Modal(document.getElementById('studentModal')).show();
}

function printReceipt(i) {
  const s = allStudents[i];
  const win = window.open('', '', 'width=400,height=600');
  win.document.write(`<html><body style="font-family:serif;text-align:center;">
    <h3>វិក្កយបត្រ</h3><hr>
    <p>ឈ្មោះ: ${s[0]}</p><p>ថ្នាក់: ${s[2]}</p><p>តម្លៃ: ${s[4]}</p>
    <hr><p>អរគុណ!</p>
    <script>window.print();window.close();</script></body></html>`);
}
