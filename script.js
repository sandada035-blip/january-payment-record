const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxXrI6Mo3rJ2PAxZ-KNBa7ofrZylCoY_iLWG4WUfYNRZw3U18rueBtzdb03MPt9ePG1/exec"; // ប្តូរ URL របស់អ្នកទីនេះ
let userRole = "User"; // លំនាំដើម
let allStudents = [];

async function login() {
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value.trim();
    if(!u || !p) return Swal.fire('Error', 'បញ្ចូលទិន្នន័យ', 'error');
    
    Swal.fire({title: 'កំពុងផ្ទៀងផ្ទាត់...', didOpen: () => Swal.showLoading()});
    const res = await callAPI('checkLogin', u, p);
    
    if(res && res.success) {
        userRole = res.role;
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        applyPermissions();
        showSection('dashboard');
        Swal.close();
    } else {
        Swal.fire('បរាជ័យ', 'Username ឬ Password ខុស', 'error');
    }
}

function applyPermissions() {
    const adminElems = document.querySelectorAll('.admin-only');
    adminElems.forEach(el => {
        el.style.setProperty('display', userRole === 'Admin' ? 'flex' : 'none', 'important');
    });
}

async function callAPI(func, ...args) {
    const url = `${WEB_APP_URL}?func=${func}&args=${encodeURIComponent(JSON.stringify(args))}`;
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (e) { return null; }
}

function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
    document.getElementById(id === 'dashboard' ? 'dashboardSection' : 'studentSection').style.display = 'block';
    id === 'dashboard' ? loadDashboard() : loadStudents();
}

async function loadStudents() {
    const res = await callAPI('getStudentData');
    if(!res) return;
    allStudents = res.rows;
    document.getElementById('studentBody').innerHTML = res.rows.map((r, i) => `
        <tr>
            <td class="fw-bold text-primary">${r[0]}</td>
            <td class="d-none d-md-table-cell">${r[2]}</td>
            <td>${r[3]}</td>
            <td class="text-success small">${r[4]}</td>
            <td class="text-center">
                <div class="btn-group">
                    <button class="btn btn-sm btn-outline-info" onclick="printReceipt(${i})"><i class="bi bi-printer"></i></button>
                    ${userRole === 'Admin' ? `
                    <button class="btn btn-sm btn-outline-warning" onclick="editStudent(${i})"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteStudent(${i})"><i class="bi bi-trash"></i></button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

// មុខងារ Search, Export, Print ដាក់តាមក្រោយដូចសារមុន...
function filterStudents() {
    const val = document.getElementById('studentSearch').value.toLowerCase();
    document.querySelectorAll('#studentBody tr').forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(val) ? '' : 'none';
    });
}

function exportToExcel() {
    const wb = XLSX.utils.table_to_book(document.getElementById("studentTableMain"));
    XLSX.writeFile(wb, "Students_List.xlsx");
}

function logout() { location.reload(); }
