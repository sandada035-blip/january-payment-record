const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxl7pljVnrOXPZYUAf2ZBUtjpi9b0YO3xwJAJcmsM8kU8kecj5Akwsk7G2JPmLnmA2U/exec"; 
let userRole = "User"; 
let allStudents = [];

// មុខងារ Login និងបែងចែកសិទ្ធិ
const WEB_APP_URL = "ដាក់_URL_WEB_APP_ថ្មី_របស់អ្នកទីនេះ";

async function callAPI(funcName, ...args) {
  // បង្កើត URL បញ្ជូន funcName និង args ឱ្យបានត្រឹមត្រូវ
  const url = `${WEB_APP_URL}?func=${funcName}&args=${encodeURIComponent(JSON.stringify(args))}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("ការតភ្ជាប់មានបញ្ហា");
    return await response.json();
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
}

// របៀបប្រើក្នុង function login
async function login() {
  const u = document.getElementById('username').value.trim();
  const p = document.getElementById('password').value.trim();
  
  // បញ្ជូន u និង p ជា arguments ទៅកាន់ checkLogin
  const res = await callAPI('checkLogin', u, p);
  
  if(res && res.success) {
    // ចូលទៅកាន់ Dashboard
  } else {
    // បង្ហាញ Error
  }
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
