const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzIjImp2Ds_T96-bnLwhoH9Zm4asoJxOaOeqr1EOk9zq-Pqv6NwwcS3miCHc60xUgJo/exec";
let allStudents = [];
let currentUserRole = "User";

// ១. មុខងារ LOGIN
async function login() {
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value.trim();
    
    if(!u || !p) return Swal.fire('តម្រូវការ', 'សូមបញ្ចូលឈ្មោះអ្នកប្រើប្រាស់ និងពាក្យសម្ងាត់', 'warning');
    
    Swal.fire({title: 'កំពុងផ្ទៀងផ្ទាត់...', didOpen: () => Swal.showLoading(), allowOutsideClick: false});
    
    const res = await callAPI('checkLogin', u, p); 
    
    if(res && res.success) {
        currentUserRole = res.role;
        // លាក់ Login និងបង្ហាញ Main App
        const loginSec = document.getElementById('loginSection');
        loginSec.classList.remove('d-flex');
        loginSec.classList.add('d-none');
        document.getElementById('mainApp').style.display = 'block';
        
        showSection('dashboard');
        Swal.fire({
            icon: 'success',
            title: 'ជោគជ័យ!',
            text: 'អ្នកបានចូលប្រើប្រាស់ដោយជោគជ័យ!',
            timer: 2000,
            showConfirmButton: false
        });
    } else {
        Swal.fire('បរាជ័យ', 'សូមបញ្ចូលឈ្មោះអ្នកប្រើប្រាស់ឬពាក្យម្តងទៀត!', 'error');
    }
}

// ២. មុខងារ LOGOUT
function logout() {
    Swal.fire({
        title: 'តើអ្នកចង់ចាកចេញមែនទេ?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'បាទ ចាកចេញ',
        cancelButtonText: 'បោះបង់'
    }).then((result) => {
        if (result.isConfirmed) {
            const loginSec = document.getElementById('loginSection');
            loginSec.classList.remove('d-none');
            loginSec.classList.add('d-flex');
            document.getElementById('mainApp').style.display = 'none';
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
        }
    });
}

// ៣. មុខងារ PRINT (តាមរូបភាពដែលបានកែសម្រួលចុងក្រោយ)
function printReport() {
    const printWindow = window.open('', '', 'height=900,width=1100');
    let totalStudents = allStudents.length;
    let totalFemale = allStudents.filter(s => s[1] === 'Female' || s[1] === 'ស្រី').length;
    let totalFee = 0;
    
    let tableRows = allStudents.map(r => {
        let feeNum = parseInt(r[4].toString().replace(/[^0-9]/g, '')) || 0;
        totalFee += feeNum;
        let payDate = r[7] && !r[7].toString().includes('KHR') ? r[7] : new Date().toLocaleDateString('km-KH');
        return `
            <tr>
                <td style="border: 1px solid black; padding: 6px;">${r[0]}</td>
                <td style="border: 1px solid black; padding: 6px; text-align: center;">${r[1]}</td>
                <td style="border: 1px solid black; padding: 6px; text-align: center;">${r[2]}</td>
                <td style="border: 1px solid black; padding: 6px;">${r[3]}</td>
                <td style="border: 1px solid black; padding: 6px; text-align: right;">${feeNum.toLocaleString()} ៛</td>
                <td style="border: 1px solid black; padding: 6px; text-align: right; color: blue;">${(feeNum * 0.8).toLocaleString()} ៛</td>
                <td style="border: 1px solid black; padding: 6px; text-align: right; color: red;">${(feeNum * 0.2).toLocaleString()} ៛</td>
                <td style="border: 1px solid black; padding: 6px; text-align: center;">${payDate}</td>
            </tr>`;
    }).join('');

    const reportHTML = `
        <html>
        <head>
            <title>Report</title>
            <style>
                body { font-family: 'Khmer OS Siemreap', sans-serif; padding: 20px; }
                .header-table { width: 100%; display: flex; justify-content: space-between; margin-bottom: 20px; }
                .report-title { font-family: 'Khmer OS Muol Light'; text-align: center; font-size: 18px; margin-bottom: 20px; text-decoration: underline; }
                .stats { display: flex; gap: 10px; margin-bottom: 20px; }
                .stat-box { border: 1px solid black; padding: 5px 15px; text-align: center; flex: 1; border-radius: 4px; }
                table { width: 100%; border-collapse: collapse; font-size: 12px; }
                th { border: 1px solid black; background: #eee; padding: 8px; }
                .footer { margin-top: 30px; display: flex; justify-content: space-between; padding: 0 50px; }
            </style>
        </head>
        <body>
            <div class="header-table">
                <div style="text-align:center"><img src="https://blogger.googleusercontent.com/img/a/AVvXsEi33gP-LjadWAMAbW6z8mKj7NUYkZeslEJ4sVFw7WK3o9fQ-JTQFMWEe06xxew4lj7WKpfuk8fadTm5kXo3GSW9jNaQHE8SrCs8_bUFDV8y4TOJ1Zhbu0YKVnWIgL7sTPuEPMrmrtuNqwDPWKHOvy6PStAaSrCz-GpLfsQNyq-BAElq9EI3etjnYsft0Pvo" width="70"><br><small>សាលាបឋមសិក្សាសម្តេចព្រះរាជអគ្គមហេសី</small></div>
                <div style="text-align:center; font-family:'Khmer OS Muol Light'">ព្រះរាជាណាចក្រកម្ពុជា<br>ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
            </div>
            <div class="report-title">របាយការណ៍លម្អិតសិស្សរៀនបំប៉នបន្ថែម</div>
            <div class="stats">
                <div class="stat-box">សិស្សសរុប: <b>${totalStudents}</b></div>
                <div class="stat-box">សរុបស្រី: <b>${totalFemale}</b></div>
                <div class="stat-box">សរុប: <b>${totalFee.toLocaleString()} ៛</b></div>
            </div>
            <table>
                <thead><tr><th>ឈ្មោះសិស្ស</th><th>ភេទ</th><th>ថ្នាក់</th><th>គ្រូ</th><th>តម្លៃសិក្សា</th><th>គ្រូ(80%)</th><th>សាលា(20%)</th><th>ថ្ងៃបង់ប្រាក់</th></tr></thead>
                <tbody>${tableRows}</tbody>
            </table>
            <div style="text-align:right; margin-top:20px;">ថ្ងៃទី........ខែ........ឆ្នាំ២០២៦</div>
            <div class="footer">
                <div><b>នាយកសាលា</b><br><br><br>..........................</div>
                <div><b>អ្នកចេញវិក្កយបត្រ</b><br><br><br><b>ហម ម៉ាលីនដា</b></div>
            </div>
            <script>window.onload = function(){ window.print(); window.close(); }</script>
        </body></html>`;
    printWindow.document.write(reportHTML);
    printWindow.document.close();
}

// មុខងារហៅ API (Core)
async function callAPI(funcName, ...args) {
    const url = `${WEB_APP_URL}?func=${funcName}&args=${encodeURIComponent(JSON.stringify(args))}`;
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (e) { return null; }
}

// (បន្ថែមអនុគមន៍ loadDashboard, loadStudents... ដូចកូដមុនរបស់អ្នក)
function applyPermissions() {
    const adminElements = document.querySelectorAll('.admin-only');
    adminElements.forEach(el => {
        el.style.setProperty('display', currentUserRole === 'Admin' ? 'flex' : 'none', 'important');
    });
}

function logout() { location.reload(); }

// --- 2. Navigation ---
function showSection(id) {
    document.getElementById('dashboardSection').style.display = id === 'dashboard' ? 'block' : 'none';
    document.getElementById('studentSection').style.display = id === 'students' ? 'block' : 'none';
    if(id === 'dashboard') loadDashboard();
    if(id === 'students') loadStudents();
}

// --- 3. API Core ---
async function callAPI(funcName, ...args) {
    const url = `${WEB_APP_URL}?func=${funcName}&args=${encodeURIComponent(JSON.stringify(args))}`;
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error("API Error:", error);
        return null;
    }
}

// --- 4. Data Loading & Dashboard ---
async function loadDashboard() {
    const res = await callAPI('getTeacherData');
    if(!res) return;
    
    let studentCount = 0, totalFee = 0;
    res.rows.forEach(r => {
        studentCount += parseInt(r[2]) || 0;
        // ដកអក្សរ ៛ ឬ KHR ចេញមុននឹងបូកលេខ
        let feeNum = parseInt(r[3].toString().replace(/[^0-9]/g, '')) || 0;
        totalFee += feeNum;
    });

    document.getElementById('statsRow').innerHTML = `
        <div class="col-6 col-md-3"><div class="stat-card"><small class="text-muted">គ្រូសរុប</small><div class="h4 mb-0">${res.rows.length}</div></div></div>
        <div class="col-6 col-md-3"><div class="stat-card" style="border-color:#10b981"><small class="text-muted">សិស្សសរុប</small><div class="h4 mb-0">${studentCount}</div></div></div>
        <div class="col-12 col-md-6"><div class="stat-card" style="border-color:#f59e0b"><small class="text-muted">ចំណូលសរុប</small><div class="h4 mb-0 text-success">${totalFee.toLocaleString()} ៛</div></div></div>
    `;

    document.getElementById('teacherBody').innerHTML = res.rows.map(r => `
        <tr>
            <td>${r[0]}</td>
            <td>${r[1]}</td>
            <td>${r[2]}</td>
            <td class="fw-bold text-primary">${r[3]}</td>
            <td class="text-success">${r[4]}</td>
            <td class="text-danger">${r[5]}</td>
        </tr>
    `).join('');
}

async function loadStudents() {
    const loading = document.getElementById('studentLoading');
    if(loading) loading.classList.remove('d-none');
    
    const res = await callAPI('getStudentData');
    
    if(loading) loading.classList.add('d-none');
    if(!res) return;
    
    allStudents = res.rows;
    renderStudentTable(res.rows);
}

function renderStudentTable(rows) {
    document.getElementById('studentBody').innerHTML = rows.map((r, i) => `
        <tr>
            <td class="fw-bold text-primary">${r[0]}</td>
            <td class="d-none d-md-table-cell">${r[1]}</td>
            <td class="d-none d-md-table-cell">${r[2]}</td>
            <td>${r[3]}</td>
            <td class="text-success small fw-bold">${r[4]}</td>
            <td>
                <div class="btn-group">
                    <button class="btn btn-sm btn-outline-info" title="វិក្កយបត្រ" onclick="printReceipt(${i})"><i class="bi bi-printer"></i></button>
                    ${currentUserRole === 'Admin' ? `
                        <button class="btn btn-sm btn-outline-warning" onclick="editStudent(${i})"><i class="bi bi-pencil"></i></button>
                        <button class="btn btn-sm btn-outline-danger" onclick="confirmDelete(${i})"><i class="bi bi-trash"></i></button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

// --- 5. Modal & Calculation ---
// មុខងារគណនាលុយ ៨០% និង ២០% ពេលវាយបញ្ចូលតម្លៃសិក្សា
document.getElementById('addFee')?.addEventListener('input', function(e) {
    const val = parseInt(e.target.value) || 0;
    document.getElementById('disp80').innerText = (val * 0.8).toLocaleString() + " ៛";
    document.getElementById('disp20').innerText = (val * 0.2).toLocaleString() + " ៛";
});

function openStudentModal() {
    isEditMode = false;
    document.getElementById('modalTitle').innerText = "បញ្ចូលសិស្សថ្មី";
    document.getElementById('addStudentName').value = "";
    document.getElementById('addFee').value = "";
    document.getElementById('disp80').innerText = "0 ៛";
    document.getElementById('disp20').innerText = "0 ៛";
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
    const feeValue = r[4].replace(/[^0-9]/g, '');
    document.getElementById('addFee').value = feeValue;
    
    // បង្ហាញការគណនាឡើងវិញ
    const val = parseInt(feeValue) || 0;
    document.getElementById('disp80').innerText = (val * 0.8).toLocaleString() + " ៛";
    document.getElementById('disp20').innerText = (val * 0.2).toLocaleString() + " ៛";
    
    new bootstrap.Modal(document.getElementById('studentModal')).show();
}

// --- 6. CRUD Operations ---
async function submitStudent() {
    const name = document.getElementById('addStudentName').value.trim();
    const teacher = document.getElementById('addTeacherSelect').value;
    const fee = document.getElementById('addFee').value || 0;

    if(!name || !teacher) return Swal.fire('Error', 'សូមបំពេញឈ្មោះសិស្ស និងជ្រើសរើសគ្រូ', 'error');
    
    const form = {
        studentName: name, 
        gender: document.getElementById('addGender').value,
        grade: document.getElementById('addGrade').value, 
        teacherName: teacher,
        schoolFee: parseInt(fee).toLocaleString() + " ៛",
        teacherFeeVal: (fee * 0.8).toLocaleString() + " ៛",
        schoolFeeVal: (fee * 0.2).toLocaleString() + " ៛",
        paymentDate: new Date().toISOString().split('T')[0],
        startDate: new Date().toISOString().split('T')[0]
    };

    Swal.fire({title: 'កំពុងរក្សាទុក...', didOpen: () => Swal.showLoading(), allowOutsideClick: false});
    const res = isEditMode ? await callAPI('updateStudentData', originalName, form) : await callAPI('saveStudentToTeacherSheet', form);
    
    if(res && res.success) {
        Swal.fire('ជោគជ័យ', res.message, 'success');
        bootstrap.Modal.getInstance(document.getElementById('studentModal')).hide();
        loadStudents();
    } else {
        Swal.fire('Error', res ? res.message : 'រក្សាទុកមិនបានសម្រេច', 'error');
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
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'បាទ លុបវា!'
    }).then(async (result) => {
        if (result.isConfirmed) {
            Swal.fire({title: 'កំពុងលុប...', didOpen: () => Swal.showLoading()});
            const res = await callAPI('deleteStudentData', name, teacher);
            if(res && res.success) {
                Swal.fire('Deleted!', res.message, 'success');
                loadStudents();
            }
        }
    });
}

// --- 7. Print & Reports ---

// មុខងារ Print របាយការណ៍សរុប (Dashboard ឬ Student List)
function printReport(sectionId) {
    const now = new Date();
    const dateStr = now.toLocaleDateString('km-KH') + " " + now.toLocaleTimeString('km-KH');
    const dateElem = document.getElementById('printDate');
    if(dateElem) dateElem.innerText = dateStr;
    window.print();
}


// មុខងារ Print របាយការណ៍សិស្ស (កែសម្រួលថ្មីតាមរូបភាព)
function printReport() {
    const printWindow = window.open('', '', 'height=900,width=1100');
    
    // ១. គណនាទិន្នន័យសង្ខេប
    let totalStudents = allStudents.length;
    let totalFemale = allStudents.filter(s => s[1] === 'Female' || s[1] === 'ស្រី').length;
    let totalFee = 0;
    
    // ២. បង្កើតជួរដេកតារាង
    let tableRows = allStudents.map(r => {
        // ដកយកតែលេខពីតម្លៃសិក្សា
        let feeNum = parseInt(r[4].toString().replace(/[^0-9]/g, '')) || 0;
        totalFee += feeNum;
        
        let teacherPart = feeNum * 0.8;
        let schoolPart = feeNum * 0.2;
        
        // កែសម្រួល Index ថ្ងៃបង់ប្រាក់៖ ប្រសិនបើក្នុង Spreadsheet វាស្ថិតនៅជួរឈរទី ៨ ត្រូវប្រើ r[7]
        // ប្រសិនបើបង្ហាញខុស ជួរឈរទី ៩ ត្រូវប្រើ r[8] ។ តាមរូបភាព r[7] ហាក់ដូចជាលទ្ធផលគណនាផ្សេង
        // ដូច្នេះខ្ញុំបន្ថែម Logic ដើម្បីឆែកមើលកាលបរិច្ឆេទឱ្យបានត្រឹមត្រូវ
        let payDate = r[7]; 
        if (!payDate || payDate.toString().includes('KHR') || !isNaN(payDate)) {
            payDate = new Date().toLocaleDateString('km-KH'); // ប្រើថ្ងៃបច្ចុប្បន្នបើរកមិនឃើញកាលបរិច្ឆេទ
        }

        return `
            <tr>
                <td style="border: 1px solid black; padding: 6px; text-align: left;">${r[0]}</td>
                <td style="border: 1px solid black; padding: 6px; text-align: center;">${r[1]}</td>
                <td style="border: 1px solid black; padding: 6px; text-align: center;">${r[2]}</td>
                <td style="border: 1px solid black; padding: 6px; text-align: left;">${r[3]}</td>
                <td style="border: 1px solid black; padding: 6px; text-align: right; font-weight: bold;">${feeNum.toLocaleString()} ៛</td>
                <td style="border: 1px solid black; padding: 6px; text-align: right; color: #0d6efd;">${teacherPart.toLocaleString()} ៛</td>
                <td style="border: 1px solid black; padding: 6px; text-align: right; color: #dc3545;">${schoolPart.toLocaleString()} ៛</td>
                <td style="border: 1px solid black; padding: 6px; text-align: center;">${payDate}</td>
            </tr>
        `;
    }).join('');

    let fee80 = totalFee * 0.8;
    let fee20 = totalFee * 0.2;

    const reportHTML = `
        <html>
        <head>
            <title>Student Report Detailed</title>
            <link href="https://fonts.googleapis.com/css2?family=Khmer+OS+Siemreap&family=Khmer+OS+Muol+Light&display=swap" rel="stylesheet">
            <style>
                body { font-family: 'Khmer OS Siemreap', sans-serif; padding: 20px; color: black; background-color: white; }
                
                /* Header Layout */
                .header-wrapper { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; }
                .left-header { text-align: center; }
                .right-header { text-align: center; font-family: 'Khmer OS Muol Light'; font-size: 14px; }
                .logo-box { width: 70px; margin: 0 auto 5px; }
                .logo-box img { width: 100%; display: block; }
                .school-kh { font-family: 'Khmer OS Muol Light'; font-size: 14px; line-height: 1.8; }

                .report-header { text-align: center; margin-bottom: 20px; }
                .report-title { font-family: 'Khmer OS Muol Light'; font-size: 18px; text-decoration: underline; }

                /* Stats Cards */
                .stats-container { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-bottom: 20px; }
                .stat-card { border: 1px solid black; padding: 6px; text-align: center; border-radius: 4px; }
                .stat-label { font-size: 10px; font-weight: bold; margin-bottom: 2px; }
                .stat-value { font-size: 12px; font-weight: bold; }

                /* Table Design */
                table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 12px; }
                th { border: 1px solid black; padding: 8px; background-color: #f2f2f2; font-family: 'Khmer OS Siemreap'; }
                
                .footer-container { width: 100%; margin-top: 20px; }
                .date-section { text-align: right; font-size: 13px; margin-bottom: 10px; padding-right: 60px; }
                
                .signature-wrapper { display: flex; justify-content: space-between; padding: 0 80px; }
                .sig-box { text-align: center; width: 220px; }
                .sig-role { font-family: 'Khmer OS Muol Light'; font-size: 13px; margin-bottom: 60px; }
                .sig-line { border-bottom: 1px dotted black; width: 100%; margin: 10px 0; }
                .sig-name { font-weight: bold; font-size: 13px; }

                @media print {
                    @page { size: A4 landscape; margin: 1cm; }
                    .stat-card { border: 1px solid black !important; -webkit-print-color-adjust: exact; }
                }
            </style>
        </head>
        <body>
            <div class="header-wrapper">
                <div class="left-header">
                    <div class="logo-box">
                        <img src="https://blogger.googleusercontent.com/img/a/AVvXsEi33gP-LjadWAMAbW6z8mKj7NUYkZeslEJ4sVFw7WK3o9fQ-JTQFMWEe06xxew4lj7WKpfuk8fadTm5kXo3GSW9jNaQHE8SrCs8_bUFDV8y4TOJ1Zhbu0YKVnWIgL7sTPuEPMrmrtuNqwDPWKHOvy6PStAaSrCz-GpLfsQNyq-BAElq9EI3etjnYsft0Pvo" alt="Logo">
                    </div>
                    <div class="school-kh">សាលាបឋមសិក្សាសម្តេចព្រះរាជអគ្គមហេសី<br>នរោត្តមមុនីនាថសីហនុ</div>
                </div>
                <div class="right-header">
                    ព្រះរាជាណាចក្រកម្ពុជា<br>ជាតិ សាសនា ព្រះមហាក្សត្រ
                </div>
            </div>

            <div class="report-header">
                <div class="report-title">របាយការណ៍លម្អិតសិស្សរៀនបំប៉នបន្ថែម</div>
            </div>

            <div class="stats-container">
                <div class="stat-card"><div class="stat-label">សិស្សសរុប</div><div class="stat-value">${totalStudents} នាក់</div></div>
                <div class="stat-card"><div class="stat-label">សរុបស្រី</div><div class="stat-value">${totalFemale} នាក់</div></div>
                <div class="stat-card"><div class="stat-label">ទឹកប្រាក់សរុប</div><div class="stat-value">${totalFee.toLocaleString()} ៛</div></div>
                <div class="stat-card"><div class="stat-label">គ្រូទទួលបាន (80%)</div><div class="stat-value">${fee80.toLocaleString()} ៛</div></div>
                <div class="stat-card"><div class="stat-label">សាលាទទួលបាន (20%)</div><div class="stat-value">${fee20.toLocaleString()} ៛</div></div>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th style="width: 18%;">ឈ្មោះសិស្ស</th>
                        <th style="width: 7%;">ភេទ</th>
                        <th style="width: 8%;">ថ្នាក់</th>
                        <th style="width: 15%;">គ្រូបង្រៀន</th>
                        <th style="width: 13%;">តម្លៃសិក្សា</th>
                        <th style="width: 13%;">គ្រូ (80%)</th>
                        <th style="width: 13%;">សាលា (20%)</th>
                        <th style="width: 13%;">ថ្ងៃបង់ប្រាក់</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>

            <div class="footer-container">
                <div class="date-section">
                    ថ្ងៃទី........ខែ........ឆ្នាំ២០២៦
                </div>
                
                <div class="signature-wrapper">
                    <div class="sig-box">
                        <div class="sig-role">បានពិនិត្យ និងឯកភាព<br>នាយកសាលា</div>
                        <div class="sig-line" style="margin-top: 40px;"></div>
                    </div>
                    <div class="sig-box">
                        <div class="sig-role">អ្នកចេញវិក្កយបត្រ</div>
                        <div style="margin-top: 50px;"></div>
                        <div class="sig-name">ហម ម៉ាលីនដា</div>
                    </div>
                </div>
            </div>

            <script>
                window.onload = function() { 
                    window.print(); 
                    setTimeout(function() { window.close(); }, 500);
                };
            </script>
        </body>
        </html>
    `;

    printWindow.document.write(reportHTML);
    printWindow.document.close();
}


// មុខងារ Print វិក្កយបត្រ (Receipt) សម្រាប់សិស្សម្នាក់ៗ
function printReceipt(index) {
    const s = allStudents[index];
    const printWindow = window.open('', '', 'height=600,width=800');
    const receiptHTML = `
        <html>
        <head>
            <title>Receipt - ${s[0]}</title>
            <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+Khmer:wght@400;700&display=swap" rel="stylesheet">
            <style>
                body { font-family: 'Noto Serif Khmer', serif; padding: 40px; text-align: center; }
                .receipt-box { border: 2px solid #333; padding: 30px; width: 400px; margin: auto; border-radius: 10px; }
                .header { font-weight: bold; font-size: 20px; margin-bottom: 5px; color: #4361ee; }
                .line { border-bottom: 2px dashed #ccc; margin: 15px 0; }
                .details { text-align: left; font-size: 15px; line-height: 1.8; }
                .footer { margin-top: 25px; font-size: 12px; font-style: italic; color: #666; }
                .price { font-size: 18px; color: #10b981; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="receipt-box">
                <div class="header">វិក្កយបត្របង់ប្រាក់</div>
                <div style="font-size: 14px;">សាលារៀន ព្រះរាជអគ្គមហេសី</div>
                <div class="line"></div>
                <div class="details">
                    <div>ឈ្មោះសិស្ស: <b>${s[0]}</b></div>
                    <div>ភេទ: <b>${s[1]}</b></div>
                    <div>ថ្នាក់សិក្សា: <b>${s[2]}</b></div>
                    <div>គ្រូបង្រៀន: <b>${s[3]}</b></div>
                    <div>តម្លៃសិក្សា: <span class="price">${s[4]}</span></div>
                    <div>កាលបរិច្ឆេទ: <b>${new Date().toLocaleDateString('km-KH')}</b></div>
                </div>
                <div class="line"></div>
                <div class="footer">សូមអរគុណ! ការអប់រំគឺជាទ្រព្យសម្បត្តិដែលមិនអាចកាត់ថ្លៃបាន។</div>
            </div>
            <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
        </html>
    `;
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
}













