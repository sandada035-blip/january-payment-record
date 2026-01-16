// ប្តូរ URL នេះជាមួយ URL ដែលបានមកពីការ Deploy Google Apps Script
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxXrI6Mo3rJ2PAxZ-KNBa7ofrZylCoY_iLWG4WUfYNRZw3U18rueBtzdb03MPt9ePG1/exec";

let isEditMode = false;
let originalName = "";
let allStudents = [];

// 1. Authentication
async function login() {
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value.trim();
    
    if(!u || !p) return Swal.fire('Warning', 'សូមបញ្ចូល Username និង Password', 'warning');
    
    Swal.fire({title: 'កំពុងផ្ទៀងផ្ទាត់...', didOpen: () => Swal.showLoading()});
    
    const res = await callAPI('checkLogin', u, p);
    if(res && res.success) {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        showSection('dashboard');
        Swal.close();
    } else {
        Swal.fire('បរាជ័យ', res ? res.message : "Network Error", 'error');
    }
}

function logout() { location.reload(); }

// 2. Navigation
function showSection(id) {
    document.getElementById('dashboardSection').style.display = id === 'dashboard' ? 'block' : 'none';
    document.getElementById('studentSection').style.display = id === 'students' ? 'block' : 'none';
    if(id === 'dashboard') loadDashboard();
    if(id === 'students') loadStudents();
}

// 3. API Core
async function callAPI(func, ...args) {
    const url = `${WEB_APP_URL}?func=${func}&args=${encodeURIComponent(JSON.stringify(args))}`;
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (e) {
        console.error(e);
        return null;
    }
}

// 4. Data Loading
async function loadDashboard() {
    const res = await callAPI('getTeacherData');
    if(!res) return;
    
    // Render Stats Row
    let studentCount = 0, totalFee = 0;
    res.rows.forEach(r => {
        studentCount += parseInt(r[2]) || 0;
        totalFee += parseInt(r[3].replace(/[^0-9]/g, '')) || 0;
    });

    document.getElementById('statsRow').innerHTML = `
        <div class="col-6 col-md-3"><div class="stat-card"><small class="text-muted">គ្រូសរុប</small><div class="h4 mb-0">${res.rows.length}</div></div></div>
        <div class="col-6 col-md-3"><div class="stat-card" style="border-color:#10b981"><small class="text-muted">សិស្សសរុប</small><div class="h4 mb-0">${studentCount}</div></div></div>
        <div class="col-12 col-md-6"><div class="stat-card" style="border-color:#f59e0b"><small class="text-muted">ចំណូលសរុប</small><div class="h4 mb-0 text-success">${totalFee.toLocaleString()} ៛</div></div></div>
    `;

    document.getElementById('teacherBody').innerHTML = res.rows.map(r => `
        <tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td>${r[4]}</td><td>${r[5]}</td></tr>
    `).join('');
}

async function loadStudents() {
    document.getElementById('studentLoading').classList.remove('d-none');
    const res = await callAPI('getStudentData');
    document.getElementById('studentLoading').classList.add('d-none');
    if(!res) return;
    
    allStudents = res.rows;
    document.getElementById('studentBody').innerHTML = res.rows.map((r, i) => `
        <tr>
            <td class="fw-bold text-primary">${r[0]}</td>
            <td>${r[1]}</td>
            <td>${r[2]}</td>
            <td>${r[3]}</td>
            <td class="text-success">${r[4]}</td>
            <td>
                <div class="btn-group">
                    <button class="btn btn-sm btn-outline-warning" onclick="editStudent(${i})"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-danger" onclick="confirmDelete(${i})"><i class="bi bi-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

// 5. CRUD Operations
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
    
    const action = isEditMode ? 'updateStudentData' : 'saveStudentToTeacherSheet';
    const params = isEditMode ? [originalName, form] : [form];
    
    const res = await callAPI(action, ...params);
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
        confirmButtonColor: '#d33',
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


// --- ១. មុខងារស្វែងរកសិស្ស (Search Filter) ---
function filterStudents() {
    const input = document.getElementById('studentSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#studentBody tr');
    
    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(input) ? '' : 'none';
    });
}

// --- ២. មុខងារទាញយកទិន្នន័យជា Excel (Export to Excel) ---
function exportToExcel() {
    const table = document.getElementById("studentTableMain");
    // បង្កើត Workbook ថ្មី
    const wb = XLSX.utils.table_to_book(table, {sheet: "StudentList"});
    // ទាញយក File
    XLSX.writeFile(wb, "Student_Report_" + new Date().toLocaleDateString() + ".xlsx");
}

// --- ៣. មុខងារបោះពុម្ពវិក្កយបត្រ (Print Receipt) ---
// បន្ថែមប៊ូតុងនេះទៅក្នុងជួរ Action នៃ renderStudentTable
function renderStudentTable(rows) {
    allStudents = rows;
    document.getElementById('studentBody').innerHTML = rows.map((r, i) => `
        <tr>
            <td class="fw-bold text-primary">${r[0]}</td>
            <td>${r[1]}</td>
            <td>${r[2]}</td>
            <td>${r[3]}</td>
            <td class="text-success">${r[4]}</td>
            <td>
                <div class="btn-group">
                    <button class="btn btn-sm btn-outline-info" onclick="printReceipt(${i})"><i class="bi bi-printer"></i></button>
                    <button class="btn btn-sm btn-outline-warning" onclick="editStudent(${i})"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-danger" onclick="confirmDelete(${i})"><i class="bi bi-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
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
                .receipt-box { border: 2px solid #333; padding: 20px; width: 400px; margin: auto; }
                .header { font-weight: bold; font-size: 18px; }
                .line { border-bottom: 1px dashed #ccc; margin: 10px 0; }
                .details { text-align: left; }
                .footer { margin-top: 20px; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="receipt-box">
                <div class="header">វិក្កយបត្របង់ប្រាក់</div>
                <div>សាលារៀន អគ្គមហេសី</div>
                <div class="line"></div>
                <div class="details">
                    <p>ឈ្មោះសិស្ស: <b>${s[0]}</b></p>
                    <p>ថ្នាក់: <b>${s[2]}</b></p>
                    <p>រៀនជាមួយគ្រូ: <b>${s[3]}</b></p>
                    <p>តម្លៃសិក្សា: <b style="color: green;">${s[4]}</b></p>
                    <p>ថ្ងៃខែបង់: <b>${new Date().toLocaleDateString()}</b></p>
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
