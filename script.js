const WEB_APP_URL = "https://script.google.com/macros/s/AKfycby_T6NP98JLKr7MK3Ji_JrfV6I302HRJnM2cnRcM0-i9ChNq7tpBf6ltBhO53tPFrhr/exec"; 
let userRole = "User"; 
let allStudents = [];

// មុខងារ Login និងបែងចែកសិទ្ធិ
async function login() {
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value.trim();
    if(!u || !p) return Swal.fire('Error', 'សូមបញ្ចូលទិន្នន័យ', 'error');
    
    Swal.fire({title: 'កំពុងផ្ទៀងផ្ទាត់...', didOpen: () => Swal.showLoading()});
    const res = await callAPI('checkLogin', u, p);
    
    if(res && res.success) {
        userRole = res.role; 
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        
        // លាក់មុខងារ Admin សម្រាប់ User ធម្មតា
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.setProperty('display', userRole === 'Admin' ? 'block' : 'none', 'important');
        });
        
        showSection('dashboard');
        Swal.close();
    } else {
        Swal.fire('បរាជ័យ', 'Username ឬ Password មិនត្រឹមត្រូវ', 'error');
    }
}

async function callAPI(func, ...args) {
    const url = `${WEB_APP_URL}?func=${func}&args=${encodeURIComponent(JSON.stringify(args))}`;
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (e) { return null; }
}

// បង្ហាញតារាងសិស្សជាមួយប៊ូតុង Action តាម Role
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
    XLSX.writeFile(wb, "Student_List_" + new Date().toLocaleDateString() + ".xlsx");
}

// មុខងារ Print Receipt (វិក្កយបត្រ)
function printReceipt(index) {
    const s = allStudents[index];
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(`
        <html>
        <head>
            <style>
                body { font-family: sans-serif; text-align: center; padding: 40px; }
                .receipt { border: 1px solid #ccc; padding: 20px; width: 300px; margin: auto; border-radius: 10px; }
                .line { border-bottom: 1px dashed #eee; margin: 15px 0; }
            </style>
        </head>
        <body>
            <div class="receipt">
                <h3>វិក្កយបត្របង់ប្រាក់</h3>
                <p>សាលារៀន អគ្គមហេសី</p>
                <div class="line"></div>
                <p style="text-align:left">សិស្ស: <b>${s[0]}</b></p>
                <p style="text-align:left">គ្រូ: <b>${s[3]}</b></p>
                <p style="text-align:left">តម្លៃសិក្សា: <b>${s[4]}</b></p>
                <div class="line"></div>
                <p>អរគុណសម្រាប់ការបង់ប្រាក់!</p>
            </div>
            <script>window.print(); window.close();</script>
        </body>
        </html>
    `);
}
function logout() { location.reload(); }
