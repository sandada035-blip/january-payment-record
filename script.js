const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbz9swnasTL7EdXnLgZuS5l2n8KACzzQkPr4G5nlb4o-1N5_JxF2fW9POQkBbQlUvPUo/exec"; 
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
  if(!u || !p) return Swal.fire('Error', 'សូមបំពេញព័ត៌មាន', 'error');

  Swal.fire({title: 'កំពុងផ្ទៀងផ្ទាត់...', didOpen: () => Swal.showLoading()});
  const res = await callAPI('checkLogin', u, p);
  
  if (res && res.success) {
    userRole = res.role;
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    applyPermissions();
    showSection('dashboard');
    Swal.close();
  } else { Swal.fire('បរាជ័យ', 'គណនីមិនត្រឹមត្រូវ', 'error'); }
}

function applyPermissions() {
  const isAdmin = (userRole === 'Admin');
  document.querySelectorAll('.admin-only').forEach(el => el.style.display = isAdmin ? 'block' : 'none');
}

function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
  document.getElementById(id + 'Section').style.display = 'block';
  if(id === 'dashboard') loadDashboard();
  if(id === 'students') loadStudents();
}

async function loadDashboard() {
  const res = await callAPI('getDashboardStats');
  if(res && res.success) {
    // បង្ហាញលេខលើ Dashboard Card ដូចក្នុងរូបភាពរបស់អ្នក
    document.getElementById('statsRow').innerHTML = `
      <div class="col-md-6 col-12">
        <div class="stat-card p-3 mb-2">
          <small class="text-muted">សិស្សសរុប</small>
          <h2 class="fw-bold">${res.data.totalStudents}</h2>
        </div>
      </div>
      <div class="col-md-6 col-12">
        <div class="stat-card p-3 mb-2" style="border-left-color: #4361ee;">
          <small class="text-muted">ចំណូលសរុប</small>
          <h2 class="fw-bold">${res.data.totalIncome}</h2>
        </div>
      </div>
    `;
  }
}

async function loadStudents() {
  const res = await callAPI('getStudents');
  if(res && res.success) {
    allStudents = res.data;
    const body = document.getElementById('studentBody');
    body.innerHTML = res.data.map((r, i) => `
      <tr class="align-middle">
        <td><div class="fw-bold text-primary">${r[0]}</div><small class="text-muted">${r[3]}</small></td>
        <td class="text-end text-success fw-bold">${r[4]}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-light text-info" onclick="printReceipt(${i})"><i class="bi bi-printer"></i></button>
          ${userRole === 'Admin' ? `<button class="btn btn-sm btn-light text-warning" onclick="editStudent(${i})"><i class="bi bi-pencil"></i></button>` : ''}
        </td>
      </tr>
    `).join('');
  }
}
// ... មុខងារផ្សេងៗ (Submit, Edit, Print) ទុកដូចកូដមុន ...

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
