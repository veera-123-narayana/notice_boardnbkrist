// Department credentials
const adminCredentials = {
    cse: { username: 'cse_admin', password: 'cse123' },
    eee: { username: 'eee_admin', password: 'eee123' },
    ece: { username: 'ece_admin', password: 'ece123' },
    mec: { username: 'mec_admin', password: 'mec123' },
    civil: { username: 'civil_admin', password: 'civil123' }
};

// Department names mapping
const departmentNames = {
    cse: 'Computer Science & Engineering',
    eee: 'Electrical & Electronics Engineering',
    ece: 'Electronics & Communication Engineering',
    mec: 'Mechanical Engineering',
    civil: 'Civil Engineering'
};

// Global variables
let currentDepartment = null;
let notices = JSON.parse(localStorage.getItem('notices')) || {};

// Initialize notices for each department if not exists
Object.keys(adminCredentials).forEach(dept => {
    if (!notices[dept]) {
        notices[dept] = [];
    }
});

// Page navigation
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Remove active class from nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected page
    document.getElementById(pageId).classList.add('active');
    
    // Add active class to corresponding nav button
    const navBtn = document.querySelector(`[onclick="showPage('${pageId}')"]`);
    if (navBtn) {
        navBtn.classList.add('active');
    }
    
    // Load display notices if display page is shown
    if (pageId === 'display') {
        loadDisplayNotices();
    }
}

// Show admin login for specific department
function showAdminLogin(department) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(`admin-login-${department}`).classList.add('active');
}

// Admin login
function adminLogin(event, department) {
    event.preventDefault();
    
    const username = document.getElementById(`username-${department}`).value;
    const password = document.getElementById(`password-${department}`).value;
    
    if (username === adminCredentials[department].username && 
        password === adminCredentials[department].password) {
        currentDepartment = department;
        showAdminPanel(department);
        loadAdminNotices(department);
    } else {
        alert('Invalid credentials!');
    }
}

// Show admin panel for specific department
function showAdminPanel(department) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(`admin-panel-${department}`).classList.add('active');
}

// Logout
function logout() {
    currentDepartment = null;
    showPage('home');
    
    // Clear all login forms
    Object.keys(adminCredentials).forEach(dept => {
        document.getElementById(`username-${dept}`).value = '';
        document.getElementById(`password-${dept}`).value = '';
    });
}

// Add notice
function addNotice(event, department) {
    event.preventDefault();
    
    const title = document.getElementById(`title-${department}`).value;
    const content = document.getElementById(`content-${department}`).value;
    const imageFile = document.getElementById(`image-${department}`).files[0];
    
    const notice = {
        id: Date.now(),
        title: title,
        content: content,
        department: department,
        date: new Date().toLocaleDateString(),
        image: null
    };
    
    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            notice.image = e.target.result;
            saveNotice(notice, department);
        };
        reader.readAsDataURL(imageFile);
    } else {
        saveNotice(notice, department);
    }
}

// Save notice
function saveNotice(notice, department) {
    if (!notices[department]) {
        notices[department] = [];
    }
    
    notices[department].unshift(notice);
    localStorage.setItem('notices', JSON.stringify(notices));
    
    // Clear form
    document.getElementById(`title-${department}`).value = '';
    document.getElementById(`content-${department}`).value = '';
    document.getElementById(`image-${department}`).value = '';
    
    loadAdminNotices(department);
    alert('Notice added successfully!');
}

// Load admin notices
function loadAdminNotices(department) {
    const container = document.getElementById(`admin-notices-${department}`);
    const departmentNotices = notices[department] || [];
    
    if (departmentNotices.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #7f8c8d; padding: 20px;">No notices yet.</p>';
        return;
    }
    
    container.innerHTML = departmentNotices.map(notice => `
        <div class="notice-item">
            <h4>${notice.title}</h4>
            <p>${notice.content}</p>
            ${notice.image ? `<img src="${notice.image}" alt="Notice Image" class="notice-image">` : ''}
            <div class="notice-meta">
                <span>Posted on: ${notice.date}</span>
                <button onclick="deleteNotice(${notice.id}, '${department}')" class="delete-btn">Delete</button>
            </div>
        </div>
    `).join('');
}

// Delete notice
function deleteNotice(noticeId, department) {
    if (confirm('Are you sure you want to delete this notice?')) {
        notices[department] = notices[department].filter(notice => notice.id !== noticeId);
        localStorage.setItem('notices', JSON.stringify(notices));
        loadAdminNotices(department);
    }
}

// Show department notices (from home page)
function showDepartmentNotices(department) {
    showPage('display');
    setTimeout(() => {
        filterNotices(department);
    }, 100);
}

// Load display notices
function loadDisplayNotices(filterDept = 'all') {
    const container = document.getElementById('display-notices');
    let allNotices = [];
    
    // Collect all notices from all departments
    Object.keys(notices).forEach(dept => {
        notices[dept].forEach(notice => {
            allNotices.push({...notice, department: dept});
        });
    });
    
    // Filter notices if needed
    if (filterDept !== 'all') {
        allNotices = allNotices.filter(notice => notice.department === filterDept);
    }
    
    // Sort by date (newest first)
    allNotices.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (allNotices.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #7f8c8d; padding: 40px; grid-column: 1/-1;">No notices to display.</p>';
        return;
    }
    
    container.innerHTML = allNotices.map(notice => `
        <div class="display-notice ${notice.department}">
            <div class="department-tag ${notice.department}">${notice.department.toUpperCase()}</div>
            <h4>${notice.title}</h4>
            <p>${notice.content}</p>
            ${notice.image ? `<img src="${notice.image}" alt="Notice Image" class="notice-image">` : ''}
            <div class="notice-date">Posted on: ${notice.date}</div>
        </div>
    `).join('');
}

// Filter notices by department
function filterNotices(department) {
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    loadDisplayNotices(department);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    showPage('home');
    
    // Add some sample notices for demonstration
    if (Object.keys(notices).every(dept => notices[dept].length === 0)) {
        // Sample notices for each department
        const sampleNotices = {
            cse: [
                {
                    id: 1,
                    title: 'Programming Contest Registration',
                    content: 'Annual programming contest registration is now open. Last date to register is 15th March.',
                    department: 'cse',
                    date: new Date().toLocaleDateString(),
                    image: null
                }
            ],
            eee: [
                {
                    id: 2,
                    title: 'Circuit Design Workshop',
                    content: 'Workshop on advanced circuit design techniques. Date: 20th March, Time: 10:00 AM',
                    department: 'eee',
                    date: new Date().toLocaleDateString(),
                    image: null
                }
            ],
            ece: [
                {
                    id: 3,
                    title: 'Communication Systems Seminar',
                    content: 'Guest lecture on 5G communication systems by industry expert.',
                    department: 'ece',
                    date: new Date().toLocaleDateString(),
                    image: null
                }
            ],
            mec: [
                {
                    id: 4,
                    title: 'Industrial Visit',
                    content: 'Industrial visit to manufacturing plant scheduled for next week.',
                    department: 'mec',
                    date: new Date().toLocaleDateString(),
                    image: null
                }
            ],
            civil: [
                {
                    id: 5,
                    title: 'Construction Site Visit',
                    content: 'Site visit to ongoing construction project for practical learning.',
                    department: 'civil',
                    date: new Date().toLocaleDateString(),
                    image: null
                }
            ]
        };
        
        notices = sampleNotices;
        localStorage.setItem('notices', JSON.stringify(notices));
    }
});