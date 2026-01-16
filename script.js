let currentUser = null;
let students = [];

// Google Apps Script Web App URL
const API_URL = "https://script.google.com/macros/s/AKfycbx-a9dmrYFFW7qTSgODe-6mHNyrbc2ZGal4Yezs40dIrLweWh-sYAdTzcEJg4DFDunQ/exec"; // <-- ប្តូរទៅ URL Web App

// Initialize App
function initApp() {
  const savedUser = localStorage.getItem('schoolAdminUser');
  if(savedUser){ currentUser = JSON.parse(savedUser); showApp(); loadDashboard(); }
  document.getElementById('password').addEventListener('keypress', e=>{ if(e.key==='Enter') login(); });
  document.getElementById('addStudentName').addEventListener('keypress', e=>{ if(e.key==='Enter') submitStudent(); });
}
window.onload = initApp;

// Login
function login(){
  const username=document.getElementById('username').value;
  const password=document.getElementById('password').value;
  if(!username || !password){ Swal.fire('សូមបំពេញ','សូមបំពេញឈ្មោះអ្នកប្រើ និងពាក្យសម្ងាត់','warning'); return; }
  Swal.fire({title:'កំពុងចូល...',allowOutsideClick:false,didOpen:()=>Swal.showLoading()});
  
  fetch(`${API_URL}?func=checkLogin&args=${encodeURIComponent(JSON.stringify([username,password]))}`)
  .then(res=>res.json())
  .then(res=>{
    Swal.close();
    if(res.success){
      currentUser={username,isAdmin: res.role==='Admin'};
      localStorage.setItem('schoolAdminUser',JSON.stringify(currentUser));
      showApp(); loadDashboard();
    } else { Swal.fire('បរាជ័យ',res.message,'error'); }
  });
}

// Show Main App
function showApp(){
  document.getElementById('loginSection').style.display='none';
  document.getElementById('mainApp').style.display='block';
  document.querySelectorAll('.admin-only').forEach(el=>el.style.display=currentUser.isAdmin?'flex':'none');
}

// Logout
function logout(){
  Swal.fire({title:'តើអ្នកចង់ចាកចេញ?',icon:'question',showCancelButton:true,confirmButtonText:'បាទ/ចាស',cancelButtonText:'ទេ'})
  .then(result=>{ if(result.isConfirmed){ localStorage.removeItem('schoolAdminUser'); currentUser=null; document.getElementById('mainApp').style.display='none'; document.getElementById('loginSection').style.display='flex'; document.getElementById('username').value=''; document.getElementById('password').value=''; }});
}

// Section
function showSection(sectionId){
  document.querySelectorAll('.section').forEach(sec=>sec.style.display='none');
  document.getElementById(sectionId+'Section').style.display='block';
  if(sectionId==='dashboard') loadDashboard();
  else if(sectionId==='students') loadStudents();
  else if(sectionId==='report') loadReport();
}

// Load Dashboard
function loadDashboard(){
  fetch(`${API_URL}?func=getDashboardStats`).then(res=>res.json()).then(res=>{
    if(res.success){
      const stats=[
        {title:'សិស្សសរុប',value:res.data.totalStudents,icon:'bi-people',color:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)'},
        {title:'ចំណូល',value:res.data.totalIncome,icon:'bi-cash-stack',color:'linear-gradient(135deg,#43e97b 0%,#38f9d7 100%)'}
      ];
      document.getElementById('statsRow').innerHTML=stats.map(stat=>`<div class="col-6 col-md-3"><div class="stat-card" style="background:${stat.color}"><i class="bi ${stat.icon}"></i><h4>${stat.value}</h4><p>${stat.title}</p></div></div>`).join('');
    }
  });
}

// Load Students
function loadStudents(){
  fetch(`${API_URL}?func=getStudents`).then(res=>res.json()).then(res=>{
    if(res.success){
      students=res.data.map((row,i)=>({id:i+1,name:row[0],gender:row[1],grade:row[2],teacher:row[3],fee:parseFloat(row[4])}));
      renderStudents();
    }
  });
}

// Render Students
function renderStudents(){
  const studentBody=document.getElementById('studentBody');
  studentBody.innerHTML=students.map(s=>`<tr>
    <td width="40%"><div class="fw-bold">${s.name}</div><small class="text-muted">${s.gender} • ${s.grade}</small></td>
    <td width="30%">${s.teacher}</td>
    <td width="20%">$${s.fee}</td>
    <td width="10%" class="text-end"><button class="btn btn-sm btn-outline-secondary" onclick="editStudent(${s.id})"><i class="bi bi-pencil"></i></button></td>
  </tr>`).join('');
}

// Filter Students
function filterStudents(){
  const term=document.getElementById('studentSearch').value.toLowerCase();
  const filtered=students.filter(s=>s.name.toLowerCase().includes(term)||s.grade.toLowerCase().includes(term)||s.teacher.toLowerCase().includes(term));
  const studentBody=document.getElementById('studentBody');
  studentBody.innerHTML=filtered.map(s=>`<tr>
    <td width="40%"><div class="fw-bold">${s.name}</div><small class="text-muted">${s.gender} • ${s.grade}</small></td>
    <td width="30%">${s.teacher}</td>
    <td width="20%">$${s.fee}</td>
    <td width="10%" class="text-end"><button class="btn btn-sm btn-outline-secondary" onclick="editStudent(${s.id})"><i class="bi bi-pencil"></i></button></td>
  </tr>`).join('');
}

// Open Student Modal
function openStudentModal(id=null){
  const modal=new bootstrap.Modal(document.getElementById('studentModal'));
  const modalTitle=document.getElementById('modalTitle');
  if(id){
    modalTitle.textContent='កែសម្រួលសិស្ស';
    const s=students.find(s=>s.id===id);
    if(s){ document.getElementById('addStudentName').value=s.name; document.getElementById('addGender').value=s.gender; document.getElementById('addGrade').value=s.grade; document.getElementById('addTeacherSelect').value=s.teacher; document.getElementById('addFee').value=s.fee; document.getElementById('addStudentName').setAttribute('data-student-id',id); }
  } else { modalTitle.textContent='បញ្ចូលសិស្ស'; document.getElementById('addStudentName').value=''; document.getElementById('addGender').value='Male'; document.getElementById('addGrade').value=''; document.getElementById('addTeacherSelect').value='កែមលៀងគា'; document.getElementById('addFee').value=''; document.getElementById('addStudentName').removeAttribute('data-student-id'); }
  modal.show();
}

// Submit Student
function submitStudent(){
  const form={
    studentName:document.getElementById('addStudentName').value,
    gender:document.getElementById('addGender').value,
    grade:document.getElementById('addGrade').value,
    teacherName:document.getElementById('addTeacherSelect').value,
    schoolFee:parseFloat(document.getElementById('addFee').value)||0
  };
  const oldId=document.getElementById('addStudentName').getAttribute('data-student-id');
  if(oldId){
    // Update student
    fetch(`${API_URL}?func=updateStudentData&args=${encodeURIComponent(JSON.stringify([students.find(s=>s.id==oldId).name, form]))}`)
    .then(res=>res.json()).then(res=>{ if(res.success){ Swal.fire('ជោគជ័យ',res.message,'success'); loadStudents(); bootstrap.Modal.getInstance(document.getElementById('studentModal')).hide(); } });
  } else {
    // New student
    fetch(`${API_URL}?func=saveStudent&args=${encodeURIComponent(JSON.stringify([form]))}`)
    .then(res=>res.json()).then(res=>{ if(res.success){ Swal.fire('ជោគជ័យ',res.message,'success'); loadStudents(); bootstrap.Modal.getInstance(document.getElementById('studentModal')).hide(); } });
  }
}

// Export to Excel
function exportToExcel(){
  const wb=XLSX.utils.book_new();
  const ws=XLSX.utils.json_to_sheet(students.map(s=>({Name:s.name,Gender:s.gender,Grade:s.grade,Teacher:s.teacher,Fee:s.fee})));
  XLSX.utils.book_append_sheet(wb,ws,'Students');
  XLSX.writeFile(wb,'Students.xlsx');
}

// Load Report
function loadReport(){
  fetch(`${API_URL}?func=getDailyReportData`).then(res=>res.json()).then(res=>{
    if(!res.error){
      const data=res.data;
      if(data.length>0){
        document.getElementById('reportHead').innerHTML=data[0].map(h=>`<th>${h}</th>`).join('');
        document.getElementById('reportBody').innerHTML=data.slice(1).map(row=>`<tr>${row.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('');
      }
    }
  });
}

// Print Report
function printReport(){ window.print(); }
