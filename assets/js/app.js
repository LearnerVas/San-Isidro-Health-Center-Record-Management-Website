// app.js - Main Application Logic (Refactored)

// --- DATA INITIALIZATION ---
// Use data from data.js if localStorage is empty
let patients = JSON.parse(localStorage.getItem('si_patients')) || initialPatients;
let inventory = JSON.parse(localStorage.getItem('si_inventory')) || initialInventory;
let immunizations = JSON.parse(localStorage.getItem('si_immunizations')) || initialImmunizations;
let reports = JSON.parse(localStorage.getItem('si_reports')) || [];

// Save initial data if it was just loaded
if (!localStorage.getItem('si_patients')) {
    localStorage.setItem('si_patients', JSON.stringify(patients));
    localStorage.setItem('si_inventory', JSON.stringify(inventory));
    localStorage.setItem('si_immunizations', JSON.stringify(immunizations));
    localStorage.setItem('si_reports', JSON.stringify(reports));
}

// --- SELECTORS ---
const navItems = document.querySelectorAll('.nav-item');
const sections = {
    patients: document.getElementById('patients-section'),
    immunization: document.getElementById('immunization-section'),
    inventory: document.getElementById('inventory-section'),
    analytics: document.getElementById('analytics-section'),
    reports: document.getElementById('reports-section')
};
const sectionTitle = document.getElementById('section-title');
const generateReportBtn = document.getElementById('generate-report-btn');
const reportStatus = document.getElementById('report-status');
const progressBar = document.getElementById('report-progress');
const progressPercent = document.getElementById('progress-percent');

// --- NAVIGATION ---
navItems.forEach(item => {
    item.addEventListener('click', () => {
        const target = item.getAttribute('data-section');
        
        // Update Nav UI
        navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        // Switch Sections
        Object.keys(sections).forEach(key => {
            sections[key].classList.add('hidden');
        });
        sections[target].classList.remove('hidden');

        // Update Header
        sectionTitle.textContent = item.querySelector('span').textContent;

        // Refresh Data for Section
        refreshSection(target);
    });
});

function refreshSection(target) {
    if (target === 'dashboard') updateDashboard();
    if (target === 'patients') renderPatients();
    if (target === 'inventory') renderInventory();
    if (target === 'immunization') renderImmunizations();
    if (target === 'analytics') renderAnalytics();
    if (target === 'reports') renderReports();
}

// --- DASHBOARD LOGIC ---
function updateDashboard() {
    document.getElementById('stat-total-patients').textContent = patients.length;
    
    const lowStock = inventory.filter(item => item.stock < 20).length;
    document.getElementById('stat-low-stock').textContent = lowStock;

    const recentVisitsBody = document.getElementById('recent-visits-table');
    recentVisitsBody.innerHTML = '';
    
    patients.slice(-5).reverse().forEach(p => {
        const tr = document.createElement('tr');
        tr.className = 'border-b hover:bg-slate-50 transition-colors';
        tr.innerHTML = `
            <td class="py-4 font-medium">${p.name}</td>
            <td class="py-4">${p.visits ? p.visits[p.visits.length - 1] : 'Consultation'}</td>
            <td class="py-4 text-slate-500">Recent</td>
            <td class="py-4"><span class="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Completed</span></td>
        `;
        recentVisitsBody.appendChild(tr);
    });
}

// --- PATIENT LOGIC (CRUD) ---
const patientModal = document.getElementById('patient-modal');
const patientForm = document.getElementById('patient-form');
let editingPatientId = null;

document.getElementById('add-patient-btn').addEventListener('click', () => {
    editingPatientId = null;
    patientForm.reset();
    document.querySelector('#patient-modal h3').textContent = 'Add Patient Profile';
    patientModal.classList.remove('hidden');
});

patientForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(patientForm);
    
    if (editingPatientId) {
        // Update existing
        const index = patients.findIndex(p => p.id === editingPatientId);
        patients[index] = {
            ...patients[index],
            name: formData.get('name'),
            age: formData.get('age'),
            sex: formData.get('sex'),
            zone: formData.get('zone')
        };
    } else {
        // Create new
        const newPatient = {
            id: 'PAT-' + (1000 + patients.length + 1),
            name: formData.get('name'),
            age: formData.get('age'),
            sex: formData.get('sex'),
            zone: formData.get('zone'),
            visits: ['Initial Registration']
        };
        patients.push(newPatient);
    }

    saveAndRefresh('patients');
    closeModal('patient-modal');
});

function renderPatients() {
    const tableBody = document.getElementById('patients-table-body');
    tableBody.innerHTML = '';

    patients.forEach(p => {
        const tr = document.createElement('tr');
        tr.className = 'border-b hover:bg-slate-50';
        tr.innerHTML = `
            <td class="py-4 font-mono text-xs text-slate-500">${p.id}</td>
            <td class="py-4 font-semibold text-slate-700">${p.name}</td>
            <td class="py-4">${p.age} / ${p.sex}</td>
            <td class="py-4">${p.zone}</td>
            <td class="py-4">
                <button onclick="editPatient('${p.id}')" class="text-blue-600 hover:underline text-xs mr-3">Edit</button>
                <button onclick="deletePatient('${p.id}')" class="text-red-600 hover:underline text-xs">Delete</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

window.editPatient = (id) => {
    editingPatientId = id;
    const p = patients.find(p => p.id === id);
    if (p) {
        document.querySelector('#patient-modal h3').textContent = 'Edit Patient Profile';
        patientForm.querySelector('[name="name"]').value = p.name;
        patientForm.querySelector('[name="age"]').value = p.age;
        patientForm.querySelector('[name="sex"]').value = p.sex;
        patientForm.querySelector('[name="zone"]').value = p.zone;
        patientModal.classList.remove('hidden');
    }
};

window.deletePatient = (id) => {
    if (confirm('Are you sure you want to delete this record?')) {
        patients = patients.filter(p => p.id !== id);
        saveAndRefresh('patients');
    }
};

// --- INVENTORY LOGIC (CRUD) ---
const inventoryModal = document.getElementById('inventory-modal');
const inventoryForm = document.getElementById('inventory-form');

document.getElementById('add-inventory-btn').addEventListener('click', () => {
    inventoryForm.reset();
    inventoryModal.classList.remove('hidden');
});

inventoryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(inventoryForm);
    const name = formData.get('name');
    const existingIndex = inventory.findIndex(i => i.name.toLowerCase() === name.toLowerCase());
    
    if (existingIndex > -1) {
        inventory[existingIndex].stock = parseInt(formData.get('stock'));
        inventory[existingIndex].unit = formData.get('unit');
        inventory[existingIndex].category = formData.get('category');
    } else {
        inventory.push({
            name: name,
            stock: parseInt(formData.get('stock')),
            unit: formData.get('unit'),
            category: formData.get('category')
        });
    }

    saveAndRefresh('inventory');
    closeModal('inventory-modal');
});

function renderInventory() {
    const container = document.querySelector('#inventory-section .grid');
    container.innerHTML = '';

    inventory.forEach(item => {
        const isLow = item.stock < 20;
        const card = document.createElement('div');
        card.className = `card border-l-4 ${isLow ? 'border-l-red-500' : 'border-l-teal-500'} group relative`;
        card.innerHTML = `
            <button onclick="deleteMedicine('${item.name}')" class="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
            <div class="flex justify-between items-start mb-2">
                <h5 class="font-bold text-slate-800">${item.name}</h5>
                <span class="text-[10px] uppercase font-bold px-2 py-1 bg-slate-100 rounded">${item.category}</span>
            </div>
            <div class="flex items-end justify-between">
                <div>
                    <p class="text-3xl font-bold ${isLow ? 'text-red-600' : 'text-slate-800'}">${item.stock}</p>
                    <p class="text-xs text-slate-500">${item.unit} available</p>
                </div>
                ${isLow ? '<span class="text-red-500 text-xs font-medium flex items-center gap-1"><i data-lucide="alert-triangle" class="w-3 h-3"></i> Low</span>' : ''}
            </div>
        `;
        container.appendChild(card);
    });
    lucide.createIcons();
}

window.deleteMedicine = (name) => {
    if (confirm(`Delete ${name} from inventory?`)) {
        inventory = inventory.filter(i => i.name !== name);
        saveAndRefresh('inventory');
    }
};

// --- IMMUNIZATION LOGIC ---
function renderImmunizations() {
    const container = document.getElementById('immunization-section');
    container.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-bold">Immunization Schedules</h3>
            <button id="add-vac-btn" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">+ Record Vaccination</button>
        </div>
        <div class="card">
            <div class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead class="text-sm text-slate-500 border-b">
                        <tr>
                            <th class="pb-3">ID</th>
                            <th class="pb-3">Patient</th>
                            <th class="pb-3">Vaccine</th>
                            <th class="pb-3">Scheduled Date</th>
                            <th class="pb-3">Status</th>
                            <th class="pb-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="immunization-table-body" class="text-sm">
                    </tbody>
                </table>
            </div>
        </div>
    `;

    const tableBody = document.getElementById('immunization-table-body');
    immunizations.forEach(v => {
        const tr = document.createElement('tr');
        tr.className = 'border-b hover:bg-slate-50';
        tr.innerHTML = `
            <td class="py-4 font-mono text-xs text-slate-500">${v.id}</td>
            <td class="py-4 font-semibold text-slate-700">${v.patientName}</td>
            <td class="py-4">${v.vaccine}</td>
            <td class="py-4 text-slate-500">${v.date}</td>
            <td class="py-4">
                <span class="px-2 py-1 ${v.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'} rounded-full text-[10px] font-bold uppercase">
                    ${v.status}
                </span>
            </td>
            <td class="py-4">
                ${v.status === 'Upcoming' ? `<button onclick="completeVac('${v.id}')" class="text-green-600 hover:underline text-xs mr-3">Mark Done</button>` : ''}
                <button onclick="deleteVac('${v.id}')" class="text-red-600 hover:underline text-xs">Remove</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });

    document.getElementById('add-vac-btn').addEventListener('click', () => {
        document.getElementById('vac-modal').classList.remove('hidden');
    });
}

window.completeVac = (id) => {
    const vac = immunizations.find(v => v.id === id);
    if (vac) {
        vac.status = 'Completed';
        saveAndRefresh('immunization');
    }
};

window.deleteVac = (id) => {
    if (confirm('Delete this record?')) {
        immunizations = immunizations.filter(v => v.id !== id);
        saveAndRefresh('immunization');
    }
};

const vacForm = document.getElementById('vac-form');
if (vacForm) {
    vacForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(vacForm);
        const newVac = {
            id: 'VAC-0' + (immunizations.length + 1),
            patientName: formData.get('patientName'),
            vaccine: formData.get('vaccine'),
            date: formData.get('date'),
            status: 'Upcoming'
        };
        immunizations.push(newVac);
        saveAndRefresh('immunization');
        vacForm.reset();
        closeModal('vac-modal');
    });
}

// --- DATA ANALYTICS LOGIC ---
let chartInstances = {
    age: null,
    sex: null,
    inventory: null
};

function renderAnalytics() {
    // 1. Prepare Age Data
    const ageGroups = { 'Infant (0-2)': 0, 'Child (3-12)': 0, 'Adult (13-59)': 0, 'Senior (60+)': 0 };
    patients.forEach(p => {
        const age = parseInt(p.age);
        if (age <= 2) ageGroups['Infant (0-2)']++;
        else if (age <= 12) ageGroups['Child (3-12)']++;
        else if (age <= 59) ageGroups['Adult (13-59)']++;
        else ageGroups['Senior (60+)']++;
    });

    // 2. Prepare Sex Data
    const sexData = { 'Male': 0, 'Female': 0 };
    patients.forEach(p => {
        if (sexData[p.sex] !== undefined) sexData[p.sex]++;
    });

    // 3. Prepare Inventory Data
    const invCategories = {};
    inventory.forEach(item => {
        invCategories[item.category] = (invCategories[item.category] || 0) + item.stock;
    });

    // --- Render Charts ---
    
    // Age Distribution Chart
    if (chartInstances.age) chartInstances.age.destroy();
    chartInstances.age = new Chart(document.getElementById('age-chart'), {
        type: 'doughnut',
        data: {
            labels: Object.keys(ageGroups),
            datasets: [{
                data: Object.values(ageGroups),
                backgroundColor: ['#38bdf8', '#2dd4bf', '#818cf8', '#fb7185'],
                borderWidth: 0
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });

    // Sex Distribution Chart
    if (chartInstances.sex) chartInstances.sex.destroy();
    chartInstances.sex = new Chart(document.getElementById('sex-chart'), {
        type: 'pie',
        data: {
            labels: Object.keys(sexData),
            datasets: [{
                data: Object.values(sexData),
                backgroundColor: ['#0ea5e9', '#ec4899'],
                borderWidth: 0
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });

    // Inventory Chart
    if (chartInstances.inventory) chartInstances.inventory.destroy();
    chartInstances.inventory = new Chart(document.getElementById('inventory-chart'), {
        type: 'bar',
        data: {
            labels: Object.keys(invCategories),
            datasets: [{
                label: 'Units in Stock',
                data: Object.values(invCategories),
                backgroundColor: '#14b8a6',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, grid: { display: false } }, x: { grid: { display: false } } }
        }
    });
}

// --- REPORTS HISTORY LOGIC ---
function renderReports() {
    const tableBody = document.getElementById('reports-table-body');
    tableBody.innerHTML = '';

    if (reports.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" class="py-8 text-center text-slate-400 italic">No reports generated yet. Click "Generate Report" to create your first one.</td></tr>';
        return;
    }

    reports.slice().reverse().forEach(r => {
        const tr = document.createElement('tr');
        tr.className = 'border-b hover:bg-slate-50';
        tr.innerHTML = `
            <td class="py-4 font-mono text-xs text-slate-500">${r.id}</td>
            <td class="py-4 font-semibold text-slate-700">${r.timestamp}</td>
            <td class="py-4 text-xs text-slate-500">
                ${r.summary.totalPatients} Patients, ${r.summary.totalInventoryItems} Items
            </td>
            <td class="py-4">
                <button onclick="viewReport('${r.id}')" class="text-blue-600 hover:underline text-xs mr-3">View Report</button>
                <button onclick="deleteReport('${r.id}')" class="text-red-600 hover:underline text-xs">Delete</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

window.viewReport = (id) => {
    const report = reports.find(r => r.id === id);
    if (report) {
        document.getElementById('report-modal-date').textContent = `Generated on ${report.timestamp}`;
        
        const container = document.getElementById('report-readable-content');
        container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-blue-50 p-4 rounded-xl">
                    <p class="text-xs font-bold text-blue-600 uppercase mb-1">Total Patients</p>
                    <p class="text-2xl font-bold">${report.summary.totalPatients}</p>
                </div>
                <div class="bg-teal-50 p-4 rounded-xl">
                    <p class="text-xs font-bold text-teal-600 uppercase mb-1">Medicine Stock</p>
                    <p class="text-2xl font-bold">${report.summary.totalInventoryItems} Items</p>
                </div>
                <div class="bg-purple-50 p-4 rounded-xl">
                    <p class="text-xs font-bold text-purple-600 uppercase mb-1">Immunizations</p>
                    <p class="text-2xl font-bold">${report.summary.totalImmunizations}</p>
                </div>
            </div>

            <div class="space-y-4">
                <h5 class="font-bold text-slate-700 flex items-center gap-2">
                    <i data-lucide="users" class="w-4 h-4"></i> Patient Census
                </h5>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    ${report.data.patients.slice(0, 8).map(p => `
                        <div class="text-sm p-3 border rounded-lg">
                            <p class="font-bold text-slate-800 truncate">${p.name}</p>
                            <p class="text-xs text-slate-500">${p.age}y / ${p.sex}</p>
                        </div>
                    `).join('')}
                    ${report.data.patients.length > 8 ? `<div class="text-xs text-slate-400 flex items-center">...and ${report.data.patients.length - 8} more</div>` : ''}
                </div>
            </div>

            <div class="space-y-4">
                <h5 class="font-bold text-slate-700 flex items-center gap-2">
                    <i data-lucide="package" class="w-4 h-4"></i> Critical Stock Status
                </h5>
                <div class="overflow-x-auto border rounded-lg">
                    <table class="w-full text-left text-sm">
                        <thead class="bg-slate-50">
                            <tr>
                                <th class="p-3">Medicine</th>
                                <th class="p-3">Stock</th>
                                <th class="p-3">Category</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${report.data.inventory.slice(0, 5).map(i => `
                                <tr class="border-t">
                                    <td class="p-3 font-medium">${i.name}</td>
                                    <td class="p-3 ${i.stock < 20 ? 'text-red-600 font-bold' : ''}">${i.stock}</td>
                                    <td class="p-3 text-slate-500">${i.category}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        document.getElementById('report-json-display').textContent = JSON.stringify(report, null, 4);
        document.getElementById('view-report-modal').classList.remove('hidden');
        lucide.createIcons();

        // Toggle logic
        const toggleBtn = document.getElementById('toggle-raw-json');
        const rawContainer = document.getElementById('raw-json-container');
        rawContainer.classList.add('hidden');
        toggleBtn.textContent = 'View Technical JSON';
        
        toggleBtn.onclick = () => {
            const isHidden = rawContainer.classList.toggle('hidden');
            toggleBtn.textContent = isHidden ? 'View Technical JSON' : 'Hide Technical JSON';
        };
    }
};

window.deleteReport = (id) => {
    if (confirm('Delete this report snapshot?')) {
        reports = reports.filter(r => r.id !== id);
        saveAndRefresh('reports');
    }
};

// --- WEB WORKER (PARALLEL COMPUTING) ---
// We use an Inline Worker (Blob) to ensure it works even on file:// protocols (Opera GX fix)
const workerCode = `
self.onmessage = function(e) {
    if (e.data.action === 'generate_report') {
        const { patients, inventory, immunizations } = e.data.payload;
        const totalSteps = 100;
        
        for (let i = 0; i <= totalSteps; i++) {
            // Simulate heavy computation/analysis
            const start = Date.now();
            while (Date.now() - start < 15) {} // Synchronous delay for visual progress
            
            self.postMessage({ status: 'processing', progress: i });
        }

        const report = {
            id: 'RP-' + Math.floor(Math.random() * 1000000),
            timestamp: new Date().toLocaleString(),
            summary: {
                totalPatients: patients.length,
                totalInventoryItems: inventory.length,
                totalImmunizations: immunizations.length
            },
            data: {
                patients,
                inventory,
                immunizations
            }
        };

        self.postMessage({ status: 'complete', report: report });
    }
};
`;

let worker;
generateReportBtn.addEventListener('click', () => {
    if (worker) return;
    
    // UI Feedback
    reportStatus.classList.remove('hidden');
    generateReportBtn.disabled = true;
    generateReportBtn.classList.add('opacity-50');
    progressBar.style.width = '0%';
    progressPercent.textContent = '0%';

    // Initialize Blob Worker
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    worker = new Worker(URL.createObjectURL(blob));

    // Send actual data payload for parallel processing
    worker.postMessage({ 
        action: 'generate_report',
        payload: { patients, inventory, immunizations }
    });

    worker.onmessage = function(e) {
        if (e.data.status === 'processing') {
            progressBar.style.width = e.data.progress + '%';
            progressPercent.textContent = e.data.progress + '%';
        } else if (e.data.status === 'complete') {
            const newReport = e.data.report;
            reports.push(newReport);
            
            progressBar.style.width = '100%';
            progressPercent.textContent = '100%';

            setTimeout(() => {
                alert("Report Generated Successfully! Check the 'Reports History' tab to view the data.");
                reportStatus.classList.add('hidden');
                generateReportBtn.disabled = false;
                generateReportBtn.classList.remove('opacity-50');
                
                // Cleanup
                worker.terminate();
                worker = null;
                
                // Refresh data
                saveAndRefresh('reports');
            }, 500);
        }
    };

    worker.onerror = function(err) {
        console.error("Worker Error:", err);
        alert("Report generation failed. Please check the console for details.");
        reportStatus.classList.add('hidden');
        generateReportBtn.disabled = false;
        generateReportBtn.classList.remove('opacity-50');
        if (worker) {
            worker.terminate();
            worker = null;
        }
    };
});

// --- UTILS ---
function saveAndRefresh(target) {
    localStorage.setItem('si_patients', JSON.stringify(patients));
    localStorage.setItem('si_inventory', JSON.stringify(inventory));
    localStorage.setItem('si_immunizations', JSON.stringify(immunizations));
    localStorage.setItem('si_reports', JSON.stringify(reports));
    refreshSection(target);
    updateDashboard();
}

window.closeModal = (id) => {
    document.getElementById(id).classList.add('hidden');
};

// Initial Load
window.onload = () => {
    updateDashboard();
    lucide.createIcons();
};
