const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzAcX5XL6UVlHgagoIgM3k3HIuG28CM_ym7ZLnyioxo28-9jrepRT2fvTnEDS1HbTB8/exec"; 
let userRole = "User"; 
let allStudents = [];

async function login() {
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value.trim();
    if(!u || !p) return Swal.fire('Error', 'សូមបំពេញព័ត៌មាន', 'error');
    
    Swal.fire({title: 'កំពុងផ្ទៀងផ្ទាត់...', didOpen: () => Swal.showLoading()});
    const res = await callAPI('checkLogin', u, p);
    
    if(res && res.success) {
        userRole = res.role;
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        if(userRole !== 'Admin') document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
        showSection('dashboard');
        Swal.close();
    } else {
        Swal.fire('បរាជ័យ', 'Username ឬ Password ខុស', 'error');
    }
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
    if(id === 'dashboard') { document.getElementById('dashboardSection').style.display = 'block'; loadDashboard(); }
    else { document.getElementById('studentSection').style.display = 'block'; loadStudents(); }
}

async function loadStudents() {
    const res = await callAPI('getStudentData');
    if(!res) return;
    allStudents = res.rows;
    document.getElementById('studentBody').innerHTML = res.rows.map((r, i) => `
        <tr>
            <td class="fw-bold text-primary">${r[0]}</td>
            <td>${r[3]}</td>
            <td class="text-success small">${r[4]}</td>
            <td class="text-center">
                <div class="btn-group">
                    <button class="btn btn-sm btn-outline-info" onclick="printReceipt(${i})"><i class="bi bi-printer"></i></button>
                    ${userRole === 'Admin' ? `<button class="btn btn-sm btn-outline-warning" onclick="editStudent(${i})"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteStudent(${i})"><i class="bi bi-trash"></i></button>` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

function filterStudents() {
    const val = document.getElementById('studentSearch').value.toLowerCase();
    document.querySelectorAll('#studentBody tr').forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(val) ? '' : 'none';
    });
}

function exportToExcel() {
    const wb = XLSX.utils.table_to_book(document.getElementById("studentTableMain"));
    XLSX.writeFile(wb, "Student_List.xlsx");
}

function printReceipt(index) {
    const s = allStudents[index];
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(`<html><body style="font-family:sans-serif;text-align:center;padding:20px;">
        <h2>វិក្កយបត្រ</h2><hr><p>សិស្ស: <b>${s[0]}</b></p><p>គ្រូ: <b>${s[3]}</b></p><p>តម្លៃ: <b>${s[4]}</b></p><hr><script>window.print();window.close();</script></body></html>`);
}

function logout() { location.reload(); }
