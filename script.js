// ប្តូរ URL នេះទៅជា URL Web App របស់អ្នកដែលបាន Deploy ពី Google Apps Script
const API_URL = "https://script.google.com/macros/s/AKfycbw93KGO2Mf6Ph02jxDa93hJ6kAjFmntCESP_tZnwVMo_xIv8R63UNhOaq8qlekmHZ9X/exec";

let allStudents = [];
let isEditMode = false;

// 1. Authentication
function login() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    if(user === "admin" && pass === "123") { // Simple login for demo
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        fetchData();
    } else {
        Swal.fire('Error', 'Username ឬ Password មិនត្រឹមត្រូវ', 'error');
    }
}

function logout() {
    location.reload();
}

// 2. Section Control
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
    if(sectionId === 'dashboard') document.getElementById('dashboard').style.display = 'block';
    if(sectionId === 'students') {
        document.getElementById('studentSection').style.display = 'block';
        fetchStudents();
    }
}

// 3. Data Fetching (Read)
async function fetchData() {
    // ហៅទិន្នន័យពី GAS
    const response = await fetch(`${API_URL}?action=getTeacherData`);
    const data = await response.json();
    renderDashboard(data);
}

async function fetchStudents() {
    const response = await fetch(`${API_URL}?action=getStudentData`);
    const data = await response.json();
    allStudents = data.rows;
    renderStudentTable(data.rows);
}

// 4. CRUD Operations
async function submitStudent() {
    const studentData = {
        studentName: document.getElementById('addStudentName').value,
        gender: document.getElementById('addGender').value,
        grade: document.getElementById('addGrade').value,
        teacherName: document.getElementById('addTeacherSelect').value,
        schoolFee: document.getElementById('addFee').value + " KHR",
        originalName: document.getElementById('editOriginalName').value
    };

    const action = isEditMode ? "updateStudent" : "addStudent";
    
    Swal.fire({title: 'Processing...', didOpen: () => Swal.showLoading()});

    const response = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: action, data: studentData })
    });

    const result = await response.json();
    if(result.success) {
        Swal.fire('Success', result.message, 'success');
        bootstrap.Modal.getInstance(document.getElementById('studentModal')).hide();
        fetchStudents();
    }
}

async function deleteStudent(index) {
    const student = allStudents[index];
    const result = await Swal.fire({
        title: 'តើអ្នកប្រាកដទេ?',
        text: `លុបទិន្នន័យ ${student[0]}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'លុប',
        cancelButtonText: 'បោះបង់'
    });

    if (result.isConfirmed) {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ 
                action: "deleteStudent", 
                studentName: student[0], 
                teacherName: student[3] 
            })
        });
        const res = await response.json();
        if(res.success) {
            Swal.fire('Deleted!', '', 'success');
            fetchStudents();
        }
    }
}

// 5. Helpers
function editStudent(index) {
    isEditMode = true;
    const s = allStudents[index];
    document.getElementById('modalTitle').innerText = "កែប្រែព័ត៌មាន";
    document.getElementById('addStudentName').value = s[0];
    document.getElementById('editOriginalName').value = s[0];
    document.getElementById('addFee').value = s[4].replace(/[^0-9]/g, '');
    new bootstrap.Modal(document.getElementById('studentModal')).show();
}

function renderStudentTable(rows) {
    const html = rows.map((r, i) => `
        <tr>
            <td>${r[0]}</td>
            <td>${r[2]}</td>
            <td>${r[3]}</td>
            <td class="text-success fw-bold">${r[4]}</td>
            <td>
                <div class="btn-group">
                    <button class="btn btn-sm btn-outline-warning" onclick="editStudent(${i})"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteStudent(${i})"><i class="bi bi-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
    document.getElementById('studentBody').innerHTML = html;
}