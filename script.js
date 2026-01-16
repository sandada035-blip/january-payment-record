const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyu8ezQJLprjgJD62pcFCjjan3Y-z86DCad7SEvdPyDi69GiEKAm4LH0rjv1ykuQ2aI/exec"; // ដាក់ URL របស់អ្នក
let userRole = "User", allStudents = [];

async function login() {
  const u = document.getElementById('username').value.trim();
  const p = document.getElementById('password').value.trim();
  if(!u || !p) return Swal.fire('Error', 'បញ្ចូលទិន្នន័យ', 'error');
  
  Swal.fire({title: 'ផ្ទៀងផ្ទាត់...', didOpen: () => Swal.showLoading()});
  const res = await callAPI('checkLogin', u, p);
  
  if(res && res.success) {
    userRole = res.role;
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    applyPermissions();
    showSection('dashboard');
    Swal.close();
  } else { Swal.fire('បរាជ័យ', 'ខុសគណនី', 'error'); }
}

function applyPermissions() {
  const adminElems = document.querySelectorAll('.admin-only');
  adminElems.forEach(el => el.style.setProperty('display', userRole === 'Admin' ? 'flex' : 'none', 'important'));
}

async function callAPI(funcName, ...args) {
    // ត្រូវប្រាកដថា WEB_APP_URL របស់អ្នកបញ្ចប់ដោយ /exec
    const url = `${WEB_APP_URL}?func=${funcName}&args=${encodeURIComponent(JSON.stringify(args))}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Network response was not ok");
        return await response.json();
    } catch (error) {
        console.error("Fetch error:", error);
        return null;
    }
}

function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
  document.getElementById(id + 'Section').style.display = 'block';
  if(id === 'report') loadDailyReport();
  else if(id === 'students') loadStudents();
}

async function loadDailyReport() {
  const res = await callAPI('getDailyReportData');
  const rows = res.data;
  document.getElementById('reportHead').innerHTML = rows[0].map(h => `<th>${h}</th>`).join('');
  document.getElementById('reportBody').innerHTML = rows.slice(1).map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('');
}

function printReport() {
  const content = document.getElementById('printableArea').innerHTML;
  const win = window.open('', '', 'height=700,width=900');
  win.document.write('<html><head><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"><style>body{font-family:"Noto Serif Khmer", serif; padding:20px;}</style></head><body>');
  win.document.write('<h4 class="text-center mb-4">របាយការណ៍បង់ប្រាក់</h4>' + content + '</body></html>');
  setTimeout(() => { win.print(); win.close(); }, 500);
}

function renderStudentTable(rows) {
  allStudents = rows;
  document.getElementById('studentBody').innerHTML = rows.map((r, i) => `
    <tr>
      <td><div class="fw-bold text-primary">${r[0]}</div><div class="small text-muted">${r[3]}</div></td>
      <td class="text-end text-success small">${r[4]}</td>
      <td class="text-end">
        <div class="btn-group btn-group-xs">
          <button class="btn btn-outline-info btn-xs" onclick="printReceipt(${i})"><i class="bi bi-printer"></i></button>
          ${userRole === 'Admin' ? `<button class="btn btn-outline-warning btn-xs" onclick="editStudent(${i})"><i class="bi bi-pencil"></i></button>` : ''}
        </div>
      </td>
    </tr>
  `).join('');
}

// 6. CRUD Operations
function openStudentModal() {
    isEditMode = false;
    document.getElementById('modalTitle').innerText = "បញ្ចូលសិស្សថ្មី";
    document.getElementById('addStudentName').value = "";
    document.getElementById('addFee').value = "";
    new bootstrap.Modal(document.getElementById('studentModal')).show();
}

function editStudent(index) {
    isEditMode = true;
    const r = allStudents[index];
    originalName = r[0];
    document.getElementById('modalTitle').innerText = "កែប្រែព័ត៌មាន";
    document.getElementById('addStudentName').value = r[0];
    document.getElementById('addGender').value = r[1];
    document.getElementById('addGrade').value = r[2];
    document.getElementById('addTeacherSelect').value = r[3];
    document.getElementById('addFee').value = r[4].replace(/[^0-9]/g, '');
    new bootstrap.Modal(document.getElementById('studentModal')).show();
}

async function submitStudent() {
    const name = document.getElementById('addStudentName').value;
    const teacher = document.getElementById('addTeacherSelect').value;
    if(!name || !teacher) return Swal.fire('Error', 'សូមបំពេញព័ត៌មាន', 'error');
    
    const fee = document.getElementById('addFee').value || 0;
    const form = {
        studentName: name, gender: document.getElementById('addGender').value,
        grade: document.getElementById('addGrade').value, teacherName: teacher,
        schoolFee: parseInt(fee).toLocaleString() + " KHR",
        teacherFeeVal: (fee * 0.8).toLocaleString() + " KHR",
        schoolFeeVal: (fee * 0.2).toLocaleString() + " KHR",
        paymentDate: new Date().toISOString().split('T')[0],
        startDate: new Date().toISOString().split('T')[0]
    };

    Swal.fire({title: 'កំពុងដំណើរការ...', didOpen: () => Swal.showLoading()});
    const res = isEditMode ? await callAPI('updateStudentData', originalName, form) : await callAPI('saveStudentToTeacherSheet', form);
    
    if(res && res.success) {
        Swal.fire('ជោគជ័យ', res.message, 'success');
        bootstrap.Modal.getInstance(document.getElementById('studentModal')).hide();
        loadStudents();
    }
}

function confirmDelete(index) {
    const name = allStudents[index][0];
    const teacher = allStudents[index][3];
    Swal.fire({
        title: 'លុបទិន្នន័យ?',
        text: `តើអ្នកចង់លុបសិស្ស ${name}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'បាទ លុបវា!'
    }).then(async (result) => {
        if (result.isConfirmed) {
            const res = await callAPI('deleteStudentData', name, teacher);
            if(res && res.success) {
                Swal.fire('Deleted!', res.message, 'success');
                loadStudents();
            }
        }
    });
}

// 7. Search, Export, & Print
function filterStudents() {
    const input = document.getElementById('studentSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#studentBody tr');
    rows.forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(input) ? '' : 'none';
    });
}

function exportToExcel() {
    const wb = XLSX.utils.table_to_book(document.getElementById("studentTableMain"));
    XLSX.writeFile(wb, "Student_Report_" + new Date().toLocaleDateString() + ".xlsx");
}

function printReceipt(index) {
    const s = allStudents[index];
    const printWindow = window.open('', '', 'height=600,width=800');
    const receiptHTML = `
        <html>
        <head>
            <title>Receipt - ${s[0]}</title>
            <style>
                body { font-family: 'Khmer OS', sans-serif; padding: 20px; text-align: center; }
                .receipt-box { border: 2px solid #333; padding: 20px; width: 350px; margin: auto; }
                .header { font-weight: bold; font-size: 18px; margin-bottom: 5px; }
                .line { border-bottom: 1px dashed #333; margin: 10px 0; }
                .details { text-align: left; font-size: 14px; }
                .footer { margin-top: 20px; font-size: 12px; font-style: italic; }
            </style>
        </head>
        <body>
            <div class="receipt-box">
                <div class="header">វិក្កយបត្របង់ប្រាក់</div>
                <div style="font-size: 12px;">សាលារៀន អគ្គមហេសី</div>
                <div class="line"></div>
                <div class="details">
                    <p>ឈ្មោះសិស្ស: <b>${s[0]}</b></p>
                    <p>ថ្នាក់: <b>${s[2]}</b></p>
                    <p>រៀនជាមួយគ្រូ: <b>${s[3]}</b></p>
                    <p>តម្លៃសិក្សា: <b style="color: #28a745;">${s[4]}</b></p>
                    <p>ថ្ងៃខែបង់: <b>${new Date().toLocaleDateString()}</b></p>
                </div>
                <div class="line"></div>
                <div class="footer">សូមអរគុណសម្រាប់ការបង់ប្រាក់!</div>
            </div>
            <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
        </html>
    `;
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
}



// ១. មុខងារបោះពុម្ពវិក្កយបត្រ (Print Student Receipt)
function printReceipt(index) {
    const s = allStudents[index]; // s[0]=Name, s[2]=Grade, s[3]=Teacher, s[4]=Fee
    const printWindow = window.open('', '', 'height=600,width=400');
    
    const receiptHTML = `
        <html>
        <head>
            <title>វិក្កយបត្រ - ${s[0]}</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+Khmer:wght@400;700&display=swap');
                body { font-family: 'Noto Serif Khmer', serif; padding: 10px; text-align: center; font-size: 14px; }
                .receipt-box { border: 1px solid #000; padding: 15px; border-radius: 5px; }
                .header { font-weight: bold; font-size: 18px; margin-bottom: 5px; color: #4361ee; }
                .line { border-bottom: 1px dashed #333; margin: 10px 0; }
                .details { text-align: left; line-height: 1.8; }
                .footer { margin-top: 15px; font-size: 12px; font-style: italic; }
            </style>
        </head>
        <body>
            <div class="receipt-box">
                <div class="header">វិក្កយបត្របង់ប្រាក់</div>
                <div style="font-weight:bold">សាលារៀន អគ្គមហេសី</div>
                <div class="line"></div>
                <div class="details">
                    ឈ្មោះសិស្ស: <b>${s[0]}</b><br>
                    ថ្នាក់: <b>${s[2]}</b><br>
                    គ្រូបង្គោល: <b>${s[3]}</b><br>
                    តម្លៃសិក្សា: <b style="color: #28a745;">${s[4]}</b><br>
                    ថ្ងៃខែបង់: <b>${new Date().toLocaleDateString('km-KH')}</b>
                </div>
                <div class="line"></div>
                <div class="footer">អរគុណសម្រាប់ការបង់ប្រាក់!</div>
            </div>
            <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
        </html>
    `;
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
}

// ២. មុខងារបោះពុម្ពរបាយការណ៍ប្រចាំថ្ងៃ (Print Daily Report)
function printDailyReport() {
    const content = document.getElementById('printableArea').innerHTML;
    const win = window.open('', '', 'height=700,width=900');
    win.document.write('<html><head><title>Daily Report</title>');
    win.document.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">');
    win.document.write('<style>@import url("https://fonts.googleapis.com/css2?family=Noto+Serif+Khmer:wght@400;700&display=swap"); body{font-family:"Noto Serif Khmer", serif; padding:30px;}</style>');
    win.document.write('</head><body><h3 class="text-center mb-4">របាយការណ៍បង់ប្រាក់ប្រចាំថ្ងៃ</h3>' + content + '</body></html>');
    setTimeout(() => { win.print(); win.close(); }, 500);
}
