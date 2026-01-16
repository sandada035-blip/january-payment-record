const WEB_APP_URL =
"https://script.google.com/macros/s/AKfycbzPX4ig4vnntSL9t62z-1OZ3c8CuhTe07nb7w-n6QLI6OWsM9PdErIoTq6yCrxtgDic/exec";

let allStudents = [];
let userRole = "User";

async function callAPI(func, ...args) {
  const url = `${WEB_APP_URL}?func=${func}&args=${encodeURIComponent(JSON.stringify(args))}`;
  const res = await fetch(url);
  return await res.json();
}

async function login() {
  const u = username.value.trim();
  const p = password.value.trim();
  if (!u || !p) return Swal.fire("Error","Fill all fields","error");

  Swal.fire({title:"Checking...",didOpen:()=>Swal.showLoading()});

  const res = await callAPI("checkLogin", u, p);
  if (res.success) {
    userRole = res.role;
    loginSection.style.display="none";
    mainApp.style.display="block";
    loadStudents();
    Swal.close();
  } else {
    Swal.fire("Fail","Wrong login","error");
  }
}

async function loadStudents() {
  const res = await callAPI("getStudentData");
  allStudents = res.rows || [];

  studentBody.innerHTML = allStudents.map((r,i)=>`
    <tr>
      <td>${r[0]}</td>
      <td>${r[3]}</td>
      <td class="text-success">${r[4]}</td>
      <td class="text-center">
        <button class="btn btn-sm btn-outline-primary" onclick="printReceipt(${i})">
          <i class="bi bi-printer"></i>
        </button>
      </td>
    </tr>
  `).join("");
}

function filterStudents() {
  const v = studentSearch.value.toLowerCase();
  document.querySelectorAll("#studentBody tr").forEach(r=>{
    r.style.display = r.innerText.toLowerCase().includes(v) ? "" : "none";
  });
}

function printReceipt(i) {
  const s = allStudents[i];
  const w = window.open("");
  w.document.write(`
    <h3>Receipt</h3>
    <p>Student: <b>${s[0]}</b></p>
    <p>Teacher: <b>${s[3]}</b></p>
    <p>Fee: <b>${s[4]}</b></p>
    <script>window.print();window.close()</script>
  `);
}

function logout() {
  location.reload();
}
