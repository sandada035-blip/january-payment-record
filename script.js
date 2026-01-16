let currentUser = null;
let students = [];
let teachers = [];
let classes = [];

// Initialize the app
function initApp() {
  // Check if user is logged in
  const savedUser = localStorage.getItem('schoolAdminUser');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    showApp();
    loadDashboard();
  }
  
  // Initialize event listeners
  document.getElementById('password').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') login();
  });
  
  document.getElementById('addStudentName').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') submitStudent();
  });
}

// Login function
function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  // Simple validation
  if (!username || !password) {
    Swal.fire('សូមបំពេញ', 'សូមបំពេញឈ្មោះអ្នកប្រើ និងពាក្យសម្ងាត់', 'warning');
    return;
  }
  
  // Show loading
  Swal.fire({
    title: 'កំពុងចូល...',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });
  
  // Simulate API call (replace with actual Google Apps Script call)
  setTimeout(() => {
    // For demo, accept any login
    currentUser = {
      username: username,
      isAdmin: username === 'admin' || username === 'អ្នកគ្រប់គ្រង'
    };
    
    localStorage.setItem('schoolAdminUser', JSON.stringify(currentUser));
    showApp();
    loadDashboard();
    Swal.close();
  }, 1000);
}

// Show main app
function showApp() {
  document.getElementById('loginSection').style.display = 'none';
  document.getElementById('mainApp').style.display = 'block';
  
  // Show admin-only elements
  const adminElements = document.querySelectorAll('.admin-only');
  adminElements.forEach(el => {
    el.style.display = currentUser.isAdmin ? 'flex' : 'none';
  });
}

// Logout function
function logout() {
  Swal.fire({
    title: 'តើអ្នកចង់ចាកចេញ?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'បាទ/ចាស',
    cancelButtonText: 'ទេ'
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem('schoolAdminUser');
      currentUser = null;
      document.getElementById('mainApp').style.display = 'none';
      document.getElementById('loginSection').style.display = 'flex';
      document.getElementById('username').value = '';
      document.getElementById('password').value = '';
    }
  });
}

// Show different sections
function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(section => {
    section.style.display = 'none';
  });
  
  // Show selected section
  document.getElementById(sectionId + 'Section').style.display = 'block';
  
  // Load data for the section
  switch(sectionId) {
    case 'dashboard':
      loadDashboard();
      break;
    case 'students':
      loadStudents();
      break;
    case 'report':
      loadReport();
      break;
  }
}

// Load dashboard data
function loadDashboard() {
  // Sample stats data
  const stats = [
    { title: 'សិស្សសរុប', value: '១,២៤៥', icon: 'bi-people', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { title: 'គ្រូអ្នកគ្រូ', value: '៣៨', icon: 'bi-person-badge', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { title: 'ថ្នាក់សិក្សា', value: '២៣', icon: 'bi-building', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { title: 'ចំណូលខែនេះ', value: '១២,៤៥០$', icon: 'bi-cash-stack', color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }
  ];
  
  // Render stats cards
  let statsHTML = '';
  stats.forEach(stat => {
    statsHTML += `
      <div class="col-6 col-md-3">
        <div class="stat-card" style="background: ${stat.color}">
          <i class="bi ${stat.icon}"></i>
          <h4>${stat.value}</h4>
          <p>${stat.title}</p>
        </div>
      </div>
    `;
  });
  document.getElementById('statsRow').innerHTML = statsHTML;
  
  // Load teacher data
  loadTeachers();
}

// Load teacher data
function loadTeachers() {
  // Sample teacher data
  teachers = [
    { name: 'កែមលៀងគា', students: 45, grade: '១០ ក', fee: 120 },
    { name: 'ម៉ៅ សុភ័ក្រ', students: 38, grade: '៩ ខ', fee: 110 },
    { name: 'វ៉ាន់ សុធារី', students: 42, grade: '១១ ក', fee: 130 },
    { name: 'ហ៊ុន សែន', students: 35, grade: '១២ ខ', fee: 150 }
  ];
  
  // Render teacher table
  const teacherTable = document.getElementById('teacherTable');
  teacherTable.innerHTML = `
    <thead>
      <tr>
        <th>គ្រូ</th>
        <th>ចំនួនសិស្ស</th>
        <th>ថ្នាក់</th>
        <th>តម្លៃជាមធ្យម</th>
      </tr>
    </thead>
    <tbody>
      ${teachers.map(teacher => `
        <tr>
          <td>${teacher.name}</td>
          <td>${teacher.students}</td>
          <td>${teacher.grade}</td>
          <td>$${teacher.fee}</td>
        </tr>
      `).join('')}
    </tbody>
  `;
}

// Load students
function loadStudents() {
  // Sample student data
  students = [
    { id: 1, name: 'យាយ សុខុម', gender: 'ប្រុស', grade: '១០ ក', teacher: 'កែមលៀងគា', fee: 120 },
    { id: 2, name: 'ផល្លី សុផល', gender: 'ស្រី', grade: '៩ ខ', teacher: 'ម៉ៅ សុភ័ក្រ', fee: 110 },
    { id: 3, name: 'វណ្ណា សុខា', gender: 'ស្រី', grade: '១១ ក', teacher: 'វ៉ាន់ សុធារី', fee: 130 },
    { id: 4, name: 'សុខ សេរី', gender: 'ប្រុស', grade: '១២ ខ', teacher: 'ហ៊ុន សែន', fee: 150 },
    { id: 5, name: 'គឹម សុខន', gender: 'ប្រុស', grade: '១០ ក', teacher: 'កែមលៀងគា', fee: 120 },
    { id: 6, name: 'នារី សុជាតា', gender: 'ស្រី', grade: '៩ ខ', teacher: 'ម៉ៅ សុភ័ក្រ', fee: 110 }
  ];
  
  renderStudents();
}

// Render students to table
function renderStudents() {
  const studentBody = document.getElementById('studentBody');
  studentBody.innerHTML = students.map(student => `
    <tr>
      <td width="40%">
        <div class="fw-bold">${student.name}</div>
        <small class="text-muted">${student.gender} • ${student.grade}</small>
      </td>
      <td width="30%">${student.teacher}</td>
      <td width="20%">$${student.fee}</td>
      <td width="10%" class="text-end">
        <button class="btn btn-sm btn-outline-secondary" onclick="editStudent(${student.id})">
          <i class="bi bi-pencil"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

// Filter students
function filterStudents() {
  const searchTerm = document.getElementById('studentSearch').value.toLowerCase();
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm) ||
    student.grade.toLowerCase().includes(searchTerm) ||
    student.teacher.toLowerCase().includes(searchTerm)
  );
  
  const studentBody = document.getElementById('studentBody');
  studentBody.innerHTML = filteredStudents.map(student => `
    <tr>
      <td width="40%">
        <div class="fw-bold">${student.name}</div>
        <small class="text-muted">${student.gender} • ${student.grade}</small>
      </td>
      <td width="30%">${student.teacher}</td>
      <td width="20%">$${student.fee}</td>
      <td width="10%" class="text-end">
        <button class="btn btn-sm btn-outline-secondary" onclick="editStudent(${student.id})">
          <i class="bi bi-pencil"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

// Open student modal
function openStudentModal(studentId = null) {
  const modal = new bootstrap.Modal(document.getElementById('studentModal'));
  const modalTitle = document.getElementById('modalTitle');
  
  if (studentId) {
    // Edit mode
    modalTitle.textContent = 'កែសម្រួលសិស្ស';
    const student = students.find(s => s.id === studentId);
    if (student) {
      document.getElementById('addStudentName').value = student.name;
      document.getElementById('addGender').value = student.gender;
      document.getElementById('addGrade').value = student.grade;
      document.getElementById('addTeacherSelect').value = student.teacher;
      document.getElementById('addFee').value = student.fee;
      document.getElementById('addStudentName').setAttribute('data-student-id', studentId);
    }
  } else {
    // Add mode
    modalTitle.textContent = 'បញ្ចូលសិស្ស';
    document.getElementById('addStudentName').value = '';
    document.getElementById('addGender').value = 'Male';
    document.getElementById('addGrade').value = '';
    document.getElementById('addTeacherSelect').value = 'កែមលៀងគា';
    document.getElementById('addFee').value = '';
    document.getElementById('addStudentName').removeAttribute('data-student-id');
  }
  
  modal.show();
}

// Submit student
function submitStudent() {
  const name = document.getElementById('addStudentName').value;
  const gender = document.getElementById('addGender').value;
  const grade = document.getElementById('addGrade').value;
  const teacher = document.getElementById('addTeacherSelect').value;
  const fee = document.getElementById('addFee').value;
  const studentId = document.getElementById('addStudentName').getAttribute('data-student-id');
  
  if (!name || !grade || !fee) {
    Swal.fire('សូមបំពេញ', 'សូមបំពេញព័ត៌មានចាំបាច់', 'warning');
    return;
  }
  
  if (studentId) {
    // Update existing student
    const index = students.findIndex(s => s.id === parseInt(studentId));
    if (index !== -1) {
      students[index] = { ...students[index], name, gender, grade, teacher, fee: parseFloat(fee) };
    }
  } else {
    // Add new student
    const newId = students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1;
    students.push({
      id: newId,
      name,
      gender,
      grade,
      teacher,
      fee: parseFloat(fee)
    });
  }
  
  renderStudents();
  bootstrap.Modal.getInstance(document.getElementById('studentModal')).hide();
  Swal.fire('ជោគជ័យ', 'រក្សាទុកព័ត៌មានសិស្សដោយជោគជ័យ', 'success');
}

// Edit student
function editStudent(id) {
  openStudentModal(id);
}

// Export to Excel
function exportToExcel() {
  const ws = XLSX.utils.json_to_sheet(students.map(s => ({
    'ឈ្មោះ': s.name,
    'ភេទ': s.gender,
    'ថ្នាក់': s.grade,
    'គ្រូ': s.teacher,
    'តម្លៃសិក្សា': s.fee
  })));
  
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Students');
  XLSX.writeFile(wb, 'student_list.xlsx');
}

// Load report
function loadReport() {
  const reportHead = document.getElementById('reportHead');
  const reportBody = document.getElementById('reportBody');
  
  // Sample report data
  const reportData = [
    { date: '០១/១២/២០២៤', student: '១,២៤៥', present: '១,២០០', absent: '៤៥', income: '២,៤៥០$' },
    { date: '០២/១២/២០២៤', student: '១,២៤៥', present: '១,២១០', absent: '៣៥', income: '២,៥០០$' },
    { date: '០៣/១២/២០២៤', student: '១,២៤៥', present: '១,១៩០', absent: '៥៥', income: '២,៣០០$' },
    { date: '០៤/១២/២០២៤', student: '១,២៤៥', present: '១,២២០', absent: '២៥', income: '២,៦០០$' },
    { date: '០៥/១២/២០២៤', student: '១,២៤៥', present: '១,២០៥', absent: '៤០', income: '២,៤០០$' }
  ];
  
  // Create table headers
  reportHead.innerHTML = `
    <th>កាលបរិច្ឆេទ</th>
    <th>សិស្សសរុប</th>
    <th>មករៀន</th>
    <th>អវត្តមាន</th>
    <th>ចំណូល</th>
  `;
  
  // Create table body
  reportBody.innerHTML = reportData.map(row => `
    <tr class="text-center">
      <td>${row.date}</td>
      <td>${row.student}</td>
      <td><span class="badge bg-success">${row.present}</span></td>
      <td><span class="badge bg-danger">${row.absent}</span></td>
      <td class="fw-bold">${row.income}</td>
    </tr>
  `).join('');
}


// Load dashboard data with Khmer formatting
function loadDashboard() {
  // Format number to Khmer style
  function formatKhmerNumber(num) {
    const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    return num.toString().replace(/\d/g, digit => khmerDigits[digit]);
  }
  
  // Format currency in KHR
  function formatKHR(amount) {
    const formatted = new Intl.NumberFormat('km-KH', {
      style: 'currency',
      currency: 'KHR',
      minimumFractionDigits: 0
    }).format(amount);
    
    // Replace Latin digits with Khmer digits
    const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    let result = formatted;
    khmerDigits.forEach((khmer, index) => {
      result = result.replace(new RegExp(index, 'g'), khmer);
    });
    return result;
  }
  
  // Sample stats data with Khmer text
  const stats = [
    { 
      title: 'សិស្សសរុប', 
      value: formatKhmerNumber('1245'), 
      icon: 'bi-people', 
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
    },
    { 
      title: 'គ្រូអ្នកគ្រូ', 
      value: formatKhmerNumber('38'), 
      icon: 'bi-person-badge', 
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' 
    },
    { 
      title: 'ថ្នាក់សិក្សា', 
      value: formatKhmerNumber('23'), 
      icon: 'bi-building', 
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' 
    },
    { 
      title: 'ចំណូលខែនេះ', 
      value: formatKHR(12250000), // 12,250,000 KHR
      icon: 'bi-cash-stack', 
      color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' 
    }
  ];
  
  // Render stats cards
  let statsHTML = '';
  stats.forEach(stat => {
    statsHTML += `
      <div class="col-6 col-md-3">
        <div class="stat-card shadow-sm" style="background: ${stat.color}">
          <i class="bi ${stat.icon} fs-3 mb-2"></i>
          <h4 class="khmer-number fw-bold">${stat.value}</h4>
          <p class="m-0">${stat.title}</p>
        </div>
      </div>
    `;
  });
  document.getElementById('statsRow').innerHTML = statsHTML;
  
  // Load teacher data with Khmer text
  loadTeachers();
}

// Load teacher data with improved formatting
function loadTeachers() {
  // Sample teacher data with Khmer text
  teachers = [
    { 
      name: 'កែមលៀងគា', 
      students: '៤៥', 
      grade: '១០ ក', 
      fee: '១២០' 
    },
    { 
      name: 'ម៉ៅ សុភ័ក្រ', 
      students: '៣៨', 
      grade: '៩ ខ', 
      fee: '១១០' 
    },
    { 
      name: 'វ៉ាន់ សុធារី', 
      students: '៤២', 
      grade: '១១ ក', 
      fee: '១៣០' 
    },
    { 
      name: 'ហ៊ុន សែន', 
      students: '៣៥', 
      grade: '១២ ខ', 
      fee: '១៥០' 
    }
  ];
  
  // Render teacher table with Khmer text
  const teacherTable = document.getElementById('teacherTable');
  teacherTable.innerHTML = `
    <thead class="table-light">
      <tr>
        <th class="khmer-text">គ្រូ</th>
        <th class="khmer-text text-center">ចំនួនសិស្ស</th>
        <th class="khmer-text text-center">ថ្នាក់</th>
        <th class="khmer-text text-center">តម្លៃជាមធ្យម ($)</th>
      </tr>
    </thead>
    <tbody>
      ${teachers.map(teacher => `
        <tr>
          <td class="fw-bold khmer-text">${teacher.name}</td>
          <td class="text-center khmer-number">${teacher.students}</td>
          <td class="text-center khmer-text">${teacher.grade}</td>
          <td class="text-center khmer-number">${teacher.fee}</td>
        </tr>
      `).join('')}
    </tbody>
  `;
  
  // Add header title
  const teacherSection = document.querySelector('#dashboardSection .content-box .p-2');
  if (teacherSection) {
    teacherSection.innerHTML = '<h6 class="fw-bold m-0 khmer-text">សង្ខេបព័ត៌មានគ្រូ</h6>';
  }
}


// Utility functions for Khmer formatting
const KhmerUtils = {
  // Convert Latin digits to Khmer digits
  toKhmerNumber: function(number) {
    const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    return number.toString().replace(/\d/g, digit => khmerDigits[digit]);
  },
  
  // Format currency in KHR
  formatCurrency: function(amount) {
    // Format with commas
    const formatted = amount.toLocaleString('en-US');
    // Convert to Khmer digits
    return this.toKhmerNumber(formatted) + ' ៛';
  },
  
  // Format date in Khmer
  formatDate: function(date) {
    const khmerMonths = [
      'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
      'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
    ];
    
    const day = this.toKhmerNumber(date.getDate());
    const month = khmerMonths[date.getMonth()];
    const year = this.toKhmerNumber(date.getFullYear());
    
    return `${day} ${month} ${year}`;
  }
};

// Update dashboard to use these utilities
function updateDashboardWithRealData() {
  // You can replace this with actual data from Google Sheets
  const statsData = {
    totalStudents: 1245,
    totalTeachers: 38,
    totalClasses: 23,
    monthlyRevenue: 12250000 // in KHR
  };
  
  const stats = [
    { 
      title: 'សិស្សសរុប', 
      value: KhmerUtils.toKhmerNumber(statsData.totalStudents), 
      icon: 'bi-people', 
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
    },
    { 
      title: 'គ្រូអ្នកគ្រូ', 
      value: KhmerUtils.toKhmerNumber(statsData.totalTeachers), 
      icon: 'bi-person-badge', 
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' 
    },
    { 
      title: 'ថ្នាក់សិក្សា', 
      value: KhmerUtils.toKhmerNumber(statsData.totalClasses), 
      icon: 'bi-building', 
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' 
    },
    { 
      title: 'ចំណូលខែនេះ', 
      value: KhmerUtils.formatCurrency(statsData.monthlyRevenue),
      icon: 'bi-cash-stack', 
      color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' 
    }
  ];
  
  // Render the stats
  let statsHTML = '';
  stats.forEach(stat => {
    statsHTML += `
      <div class="col-6 col-md-3 mb-3">
        <div class="stat-card rounded-3 shadow-sm" style="background: ${stat.color}">
          <i class="bi ${stat.icon} fs-3 mb-2 text-white"></i>
          <h3 class="fw-bold text-white mb-1">${stat.value}</h3>
          <p class="text-white m-0 opacity-90">${stat.title}</p>
        </div>
      </div>
    `;
  });
  
  document.getElementById('statsRow').innerHTML = statsHTML;
}





// Print report
function printReport() {
  const printContent = document.getElementById('printableArea').innerHTML;
  const originalContent = document.body.innerHTML;
  
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: 'Noto Serif Khmer', sans-serif;">
      <h4 style="text-align: center; margin-bottom: 20px;">របាយការណ៍ប្រចាំថ្ងៃ</h4>
      ${printContent}
      <div style="margin-top: 30px; text-align: center; font-size: 0.8rem;">
        <p>ថ្ងៃចេញរបាយការណ៍: ${new Date().toLocaleDateString('km-KH')}</p>
      </div>
    </div>
  `;
  
  window.print();
  document.body.innerHTML = originalContent;
  showSection('report');
  loadReport();
}

// Initialize app when page loads
window.onload = initApp;
