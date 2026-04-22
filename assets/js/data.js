// data.js - Initial state and dummy data
const initialPatients = [
    { id: 'PAT-1001', name: 'Maria Santos', age: 45, sex: 'Female', zone: 'Zone 2', visits: ['Check-up (2023-10-15)'] },
    { id: 'PAT-1002', name: 'Juan Dela Cruz', age: 28, sex: 'Male', zone: 'Zone 1', visits: ['Flu (2023-10-18)'] }
];

const initialInventory = [
    { name: 'Paracetamol 500mg', stock: 120, unit: 'Tabs', category: 'Fever' },
    { name: 'Amoxicillin 250mg', stock: 15, unit: 'Caps', category: 'Antibiotic' },
    { name: 'Cetirizine 10mg', stock: 80, unit: 'Tabs', category: 'Allergy' },
    { name: 'Oral Rehydration Salt', stock: 50, unit: 'Sachets', category: 'Dehydration' }
];

const initialImmunizations = [
    { id: 'VAC-01', patientName: 'Baby Liam', vaccine: 'BCG', date: '2023-11-05', status: 'Upcoming' },
    { id: 'VAC-02', patientName: 'Elena Cruz', vaccine: 'Pneumococcal', date: '2023-10-20', status: 'Completed' },
    { id: 'VAC-03', patientName: 'Baby Sofia', vaccine: 'Oral Polio (OPV)', date: '2023-11-12', status: 'Upcoming' },
    { id: 'VAC-04', patientName: 'Ricardo Gomez', vaccine: 'Flu Shot', date: '2023-11-20', status: 'Upcoming' }
];
