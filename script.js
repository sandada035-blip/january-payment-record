let currentUser = null;
let students = [];

const API_URL = "https://script.google.com/macros/s/AKfycbyecikJuMR1Y5W9iGylWzXhOHF0QoOxGNov1x_RDsyyRyQ9WdwpIQoyYdCei8vnqJIt/exec"; // <-- ប្តូរ URL នេះ ជា Web App URL របស់អ្នក

window.onload = initApp;

function initApp() {
  const savedUser = localStorage.getItem('schoolAdminUser');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    showApp();
    loadDashboard();
    loadStudents();
  }
  document.getElementById('password').addEventListener('keypress', e=>{ if(e.key==='Enter') login(); });
}

function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  if (!username || !password) return Swal.fire('សូមបំពេញ','សូមបំពេញឈ្មោះអ្នកប្រើ និងពាក្យសម្ងាត់','warning');

  Swal.fire({ title:'កំពុងចូល...', allowOutsideClick:false, didOpen:()=>Swal.showLoading() });

  fetch(`${API_URL}?func=checkLogin&args=${encodeURIComponent(JSON.stringify([username,password]))}`)
  .then(res=>res.json())
  .then(res=>{
    Swal.close();
    if(res.success){
      currentUser = { username, isAdmin: res.role==='Admin' };
      localStorage.setItem('schoolAdminUser', JSON.stringify(currentUser));
      showApp();
      loadDashboard();
      loadStudents();
    } else Swal.fire('បរាជ័យ', res.message,'error');
  }).catch(err=>{ Swal.close(); Swal.fire('Error',err,'error'); });
}

function showApp(){
  document.getElementById('loginSection').style.display='none';
  document.getElementById('mainApp').style.display='block';
}

function logout(){
  localStorage.removeItem('schoolAdminUser');
  location.reload();
}

function loadDashboard(){
  fetch(`${API_URL}?func=getDashboardStats`)
  .then(res=>res.json())
  .then(res=>{
    if(res.success){
      const statsHTML = `
        <div class="col-md-6"><div class="stat-card" style="background:linear-gradient(135deg,#667eea,#764ba2)"><i class="bi bi-people"></i><h4>${res.data.totalStudents}</h4><p>សិស្សសរុប</p></div></div>
        <div class="col-md-6"><div class="stat-card" style="background:linear-gradient(135deg,#43e97b,#38f9d7)"><i class="bi bi-cash-stack"></i><h4>${res.data.totalIncome}</h4><p>ចំណូល</p></div></div>
      `;
      document.getElementById('statsRow').innerHTML = statsHTML;
    }
  });
}

function loadStudents(){
  fetch(`${API_URL}?func=getStudents`)
  .then(res=>res.json())
  .then(res=>{
    if(res.success){
      students = res.data.map((row,i)=>({
        id:i+1, name:row[0], gender:row[1], grade:row[2], teacher:row[3], fee:parseFloat(row[4])
      }));
      renderStudents();
      renderTeacherSummary();
    }
  });
}

function renderStudents(){
  const tbody = document.getElementById('studentBody');
  tbody.innerHTML = students.map(s=>`
    <tr>
      <td>${s.name} <small>• ${s.gender} • ${s.grade}</small></td>
      <td>${s.teacher}</td>
      <td>${s.fee}</td>
      <td>---</td>
    </tr>
  `).join('');
}

function filterStudents(){
  const term = document.getElementById('studentSearch').value.toLowerCase();
  const filtered = students.filter(s=>s.name.toLowerCase().includes(term) || s.grade.toLowerCase().includes(term) || s.teacher.toLowerCase().includes(term));
  const tbody = document.getElementById('studentBody');
  tbody.innerHTML = filtered.map(s=>`
    <tr>
      <td>${s.name} <small>• ${s.gender} • ${s.grade}</small></td>
      <td>${s.teacher}</td>
      <td>${s.fee}</td>
      <td>---</td>
    </tr>
  `).join('');
}

function renderTeacherSummary(){
  const table = document.getElementById('teacherTable');
  const teachers = {};
  students.forEach(s=>{ teachers[s.teacher]=(teachers[s.teacher]||0)+1; });
  table.innerHTML = `<thead><tr><th>គ្រូ</th><th>ចំនួនសិស្ស</th></tr></thead>
  <tbody>${Object.entries(teachers).map(([t,c])=>`<tr><td>${t}</td><td>${c}</td></tr>`).join('')}</tbody>`;
}
