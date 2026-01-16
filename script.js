// ប្តូរ URL នេះចេញ!
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyPyR0GvOLuljYGavF_d5Oppzvbjb6rXwhrT47bVfUv5q4rjHI786aw_1NWmBizCqb3/exec"; 

let isEditMode = false;
let originalName = "";
let allStudents = [];

// សំខាន់៖ យក URL ថ្មីដែលបានពីការ Deploy មកដាក់នៅទីនេះ
const WEB_APP_URL = "ដាក់_URL_Web_App_ថ្មី_របស់អ្នកទីនេះ"; 

async function login() {
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value.trim();
    
    if(!u || !p) {
        Swal.fire('បញ្ចូលទិន្នន័យ', 'សូមបំពេញ Username និង Password', 'warning');
        return;
    }

    Swal.fire({title: 'កំពុងផ្ទៀងផ្ទាត់...', didOpen: () => Swal.showLoading()});
    
    // បញ្ជូន [u, p] ជា args ទៅកាន់ checkLogin
    const res = await callAPI('checkLogin', u, p);
    
    if(res && res.success) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', res.role);
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        showDashboard();
        Swal.close();
    } else {
        Swal.fire('បរាជ័យ', res ? res.message : "មិនអាចទាក់ទង Server បាន", 'error');
    }
}

async function callAPI(func, ...args) {
    // បង្កើត URL ឱ្យត្រឹមត្រូវតាមទម្រង់ដែល doGet ត្រូវការ
    const url = `${WEB_APP_URL}?func=${func}&args=${encodeURIComponent(JSON.stringify(args))}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (e) {
        console.error("API Error:", e);
        return null;
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

// 3. CRUD Operations
async function loadStudents() {
    const res = await callAPI('getStudentData');
    allStudents = res.rows;
    const body = document.getElementById('studentBody');
    body.innerHTML = res.rows.map((r, i) => `
        <tr>
            <td class="fw-bold text-primary">${r[0]}</td>
            <td>${r[2]}</td>
            <td>${r[3]}</td>
            <td class="text-success">${r[4]}</td>
            <td>
                <div class="btn-group">
                    <button class="btn btn-sm btn-outline-warning" onclick="editStudent(${i})"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteStudent(${i})"><i class="bi bi-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

async function submitStudent() {
    const form = {
        studentName: document.getElementById('addStudentName').value,
        gender: document.getElementById('addGender').value,
        grade: document.getElementById('addGrade').value,
        teacherName: document.getElementById('addTeacherSelect').value,
        schoolFee: document.getElementById('addFee').value + " KHR",
        teacherFeeVal: (document.getElementById('addFee').value * 0.8).toLocaleString() + " KHR",
        schoolFeeVal: (document.getElementById('addFee').value * 0.2).toLocaleString() + " KHR",
        paymentDate: new Date().toISOString().split('T')[0],
        startDate: new Date().toISOString().split('T')[0]
    };

    Swal.fire({title: 'Processing...', didOpen: () => Swal.showLoading()});
    
    const action = isEditMode ? 'updateStudentData' : 'saveStudentToTeacherSheet';
    const params = isEditMode ? [originalName, form] : [form];
    
    const res = await callAPI(action, ...params);
    if(res.success) {
        Swal.fire('Success', res.message, 'success');
        bootstrap.Modal.getInstance(document.getElementById('studentModal')).hide();
        loadStudents();
    }
}

async function deleteStudent(index) {
    const student = allStudents[index];
    const confirm = await Swal.fire({
        title: 'តើអ្នកប្រាកដទេ?',
        text: `លុបទិន្នន័យសិស្ស ${student[0]}`,
        icon: 'warning',
        showCancelButton: true
    });

    if(confirm.isConfirmed) {
        const res = await callAPI('deleteStudentData', student[0], student[3]);
        if(res.success) {
            Swal.fire('Deleted', res.message, 'success');
            loadStudents();
        }
    }
}

// 4. API Core (ប្រើ JSONP ឬ CORS)
async function callAPI(func, ...args) {
    const url = `${WEB_APP_URL}?func=${func}&args=${encodeURIComponent(JSON.stringify(args))}`;
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (e) {
        return {success: false, message: "API Error"};
    }
}

// Modal Helpers
function openStudentModal() {
    isEditMode = false;
    document.getElementById('modalTitle').innerText = "បញ្ចូលសិស្សថ្មី";
    document.getElementById('addStudentName').value = "";
    new bootstrap.Modal(document.getElementById('studentModal')).show();
}

function editStudent(index) {
    isEditMode = true;
    const r = allStudents[index];
    originalName = r[0];
    document.getElementById('modalTitle').innerText = "កែប្រែព័ត៌មាន";
    document.getElementById('addStudentName').value = r[0];
    document.getElementById('addFee').value = r[4].replace(/[^0-9]/g, '');
    new bootstrap.Modal(document.getElementById('studentModal')).show();
}

function calcAddFees() {
    let f = document.getElementById('addFee').value || 0;
    // Update labels if needed
}
