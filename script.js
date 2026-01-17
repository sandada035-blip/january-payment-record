// ១. ត្រូវប្រាកដថា URL នេះត្រឹមត្រូវតាម Deployment ចុងក្រោយរបស់អ្នក
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbz3YoEncXIaiANF4U49rtwR1gDk5BZ-EEtVEcnbKCqpQc9Pp02sFQUkO2cYraY7p7CC/exec";

let isEditMode = false;
let originalName = "";
let allStudents = [];
let currentUserRole = "User"; // កំណត់ Role លំនាំដើម

// --- 1. Authentication ---
async function login() {
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value.trim();
    
    if(!u || !p) return Swal.fire('Warning', 'សូមបញ្ចូល Username និង Password', 'warning');
    
    Swal.fire({title: 'កំពុងផ្ទៀងផ្ទាត់...', didOpen: () => Swal.showLoading(), allowOutsideClick: false});
    
    const res = await callAPI('checkLogin', u, p);
    
    if(res && res.success) {
        currentUserRole = res.role; 
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        
        applyPermissions();
        showSection('dashboard');
        Swal.close();
    } else {
        Swal.fire('បរាជ័យ', res ? res.message : "Network Error", 'error');
    }
}

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
    const printWindow = window.open('', '', 'height=900,width=1000');
    
    // បង្កើតជួរដេកតារាង
    let tableRows = allStudents.map(r => `
        <tr>
            <td style="border: 1px solid black; padding: 8px; text-align: left;">${r[0]}</td>
            <td style="border: 1px solid black; padding: 8px; text-align: center;">${r[1]}</td>
            <td style="border: 1px solid black; padding: 8px; text-align: center;">${r[2]}</td>
            <td style="border: 1px solid black; padding: 8px; text-align: center;">${r[3]}</td>
            <td style="border: 1px solid black; padding: 8px; text-align: right;">${r[4]}</td>
        </tr>
    `).join('');

    const reportHTML = `
        <html>
        <head>
            <title>Student Report Print</title>
            <link href="https://fonts.googleapis.com/css2?family=Khmer+OS+Siemreap&family=Khmer+OS+Muol+Light&display=swap" rel="stylesheet">
            <style>
                body { font-family: 'Khmer OS Siemreap', sans-serif; padding: 30px; color: black; }
                
                /* Header ផ្នែក Logo និងឈ្មោះសាលា */
                .top-header { display: flex; align-items: center; margin-bottom: 20px; }
                .logo-box { width: 80px; height: 80px; margin-right: 15px; }
                .logo-box img { width: 100%; height: auto; }
                .school-name { font-family: 'Khmer OS Muol Light'; font-size: 16px; }

                /* ចំណងជើងរបាយការណ៍ */
                .report-title { font-family: 'Khmer OS Muol Light'; text-align: center; font-size: 20px; margin-top: 10px; }
                .report-subtitle { text-align: center; font-weight: bold; font-size: 16px; margin-bottom: 20px; text-decoration: underline; }

                /* តារាង */
                table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                th { border: 1px solid black; padding: 10px; background-color: #f2f2f2; font-family: 'Khmer OS Siemreap'; }
                
                /* ផ្នែកហត្ថលេខា និងកាលបរិច្ឆេទខាងក្រោម */
                .footer-section { margin-top: 20px; width: 100%; }
                .date-line { text-align: right; font-size: 14px; margin-bottom: 20px; margin-right: 30px; }
                
                .sig-container { display: flex; justify-content: space-between; padding: 0 40px; }
                .sig-block { text-align: center; width: 250px; }
                .sig-title { font-family: 'Khmer OS Muol Light'; font-size: 14px; margin-bottom: 60px; line-height: 1.8; }
                .sig-dots { border-bottom: 1px dotted black; width: 180px; margin: 0 auto 10px; }
                .sig-name { font-family: 'Khmer OS Siemreap'; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="top-header">
                <div class="logo-box">
                    <img src="https://via.placeholder.com/80" alt="Logo"> 
                </div>
                <div class="school-name">សាលារៀនព្រះរាជអគ្គមហេសី/PREAH REACH AKK MOHESSEY</div>
            </div>

            <div class="report-title">បញ្ជីឈ្មោះសិស្សរៀនបំប៉នបន្ថែម</div>
            <div class="report-subtitle">Student Records</div>
            
            <table>
                <thead>
                    <tr>
                        <th style="width: 25%;">ឈ្មោះ</th>
                        <th style="width: 10%;">ភេទ</th>
                        <th style="width: 15%;">ថ្នាក់</th>
                        <th style="width: 25%;">គ្រូ</th>
                        <th style="width: 25%;">តម្លៃ</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>

            <div class="footer-section">
                <div class="date-line">
                    ថ្ងៃទី........ខែ........ឆ្នាំ២០២៦<br>
                    ធ្វើនៅបន្ទាយ រាំងជៃ នៃ បន្ទាយរៃ
                </div>
                
                <div class="sig-container">
                    <div class="sig-block">
                        <div class="sig-title">បានពិនិត្យ និងឯកភាព<br>នាយកសាលា</div>
                        <div class="sig-dots"></div>
                    </div>
                    
                    <div class="sig-block">
                        <div class="sig-title">អ្នកចេញវិក្កយបត្រ</div>
                        <div class="sig-dots"></div>
                        <div class="sig-name">តាម ម៉ាលីនដា</div>
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



