const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbw059ISJ4Hsele0Ky_oWq1JvRTtEcu-NwqGQS1O19iVLPCWP89b3a-4HS2-wfHCcWjm/exec"; 
let userRole = "User"; 
let allStudents = [];

async function login() {
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value.trim();
    if(!u || !p) return Swal.fire('Error', 'សូមបញ្ចូលទិន្នន័យ', 'error');
    
    Swal.fire({title: 'កំពុងផ្ទៀងផ្ទាត់...', didOpen: () => Swal.showLoading()});
    const res = await callAPI('checkLogin', u, p);
    
    if(res && res.success) {
        userRole = res.role; // រក្សាទុក Role (Admin ឬ User)
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        
        // លាក់ប៊ូតុង Add សម្រាប់ User
        if(userRole !== 'Admin') {
            document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
        }
        
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

function renderStudentTable(rows) {
    allStudents = rows;
    const body = document.getElementById('studentBody');
    body.innerHTML = rows.map((r, i) => `
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
                    <button class="btn btn-sm btn-outline-danger" onclick="confirmDelete(${i})"><i class="bi bi-trash"></i></button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

// មុខងារ Search
function filterStudents() {
    const val = document.getElementById('studentSearch').value.toLowerCase();
    document.querySelectorAll('#studentBody tr').forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(val) ? '' : 'none';
    });
}

// មុខងារ Export Excel
function exportToExcel() {
    const wb = XLSX.utils.table_to_book(document.getElementById("studentTableMain"));
    XLSX.writeFile(wb, "Student_List.xlsx");
}

// មុខងារ Print Receipt
function printReceipt(index) {
    const s = allStudents[index];
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(`
        <html><body style="font-family:sans-serif; text-align:center; padding:20px;">
            <h2>RECEIPT</h2><hr>
            <p>Student: <b>${s[0]}</b></p>
            <p>Teacher: <b>${s[3]}</b></p>
            <p>Fee: <b>${s[4]}</b></p>
            <hr><p>Thank You!</p>
            <script>window.print(); window.close();</script>
        </body></html>
    `);
}
function logout() { location.reload(); }
