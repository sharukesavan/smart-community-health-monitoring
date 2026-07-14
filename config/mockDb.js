// In-Memory Mock Database Store
// Allows running the complete project without a MySQL Server instance

const bcrypt = require('bcryptjs');

const dbStore = {
  states: [
    { id: 1, name: 'Assam' }, 
    { id: 2, name: 'Meghalaya' }, 
    { id: 3, name: 'Tripura' }, 
    { id: 4, name: 'Mizoram' }, 
    { id: 5, name: 'Nagaland' }
  ],

  districts: [
    { id: 1, name: 'Kamrup Rural', state_id: 1 }, 
    { id: 2, name: 'Dibrugarh', state_id: 1 }, 
    { id: 3, name: 'Sonitpur', state_id: 1 },
    { id: 4, name: 'East Khasi Hills', state_id: 2 }, 
    { id: 5, name: 'West Garo Hills', state_id: 2 },
    { id: 6, name: 'West Tripura', state_id: 3 }, 
    { id: 7, name: 'South Tripura', state_id: 3 },
    { id: 8, name: 'Aizawl', state_id: 4 }, 
    { id: 9, name: 'Lunglei', state_id: 4 },
    { id: 10, name: 'Kohima', state_id: 5 }, 
    { id: 11, name: 'Dimapur', state_id: 5 }
  ],

  villages: [
    { id: 1, name: 'Sualkuchi', district_id: 1, status: 'safe', latitude: 26.1732, longitude: 91.5647 },
    { id: 2, name: 'Hajo', district_id: 1, status: 'safe', latitude: 26.2483, longitude: 91.5239 },
    { id: 3, name: 'Chaygaon', district_id: 1, status: 'warning', latitude: 26.0378, longitude: 91.3854 },
    { id: 4, name: 'Moranhat', district_id: 2, status: 'safe', latitude: 27.1834, longitude: 94.9284 },
    { id: 5, name: 'Khowang', district_id: 2, status: 'danger', latitude: 27.2798, longitude: 94.8877 },
    { id: 6, name: 'Mawsynram', district_id: 4, status: 'safe', latitude: 25.2975, longitude: 91.5822 },
    { id: 7, name: 'Cherrapunji', district_id: 4, status: 'safe', latitude: 25.2702, longitude: 91.7323 },
    { id: 8, name: 'Mawlynnong', district_id: 4, status: 'safe', latitude: 25.2016, longitude: 91.9038 },
    { id: 9, name: 'Tura Rural', district_id: 5, status: 'warning', latitude: 25.5135, longitude: 90.2244 },
    { id: 10, name: 'Ranirbazar', district_id: 6, status: 'safe', latitude: 23.8378, longitude: 91.3734 },
    { id: 11, name: 'Darlawn', district_id: 8, status: 'safe', latitude: 24.0167, longitude: 92.9000 },
    { id: 12, name: 'Khonoma', district_id: 10, status: 'safe', latitude: 25.6500, longitude: 94.0167 },
    { id: 13, name: 'Jakhama', district_id: 10, status: 'safe', latitude: 25.5900, longitude: 94.1300 }
  ],

  users: [
    { id: 1, username: 'admin', password_hash: '$2a$10$o.c1bI5X3Tsh1kpxo35nveM.XvF/6a8i2Hq1PZ1D9D9CqZlhXy5oK', role: 'admin', created_at: new Date() },
    { id: 2, username: 'worker1', password_hash: '$2a$10$w6D09qj1Jd5sR/4WexLd5euL7N1.q2F1.K2492Y1Z0V1GqF1l7/2q', role: 'health_worker', created_at: new Date() }
  ],

  health_workers: [
    { id: 1, user_id: 2, name: 'John Doe', phone: '9876543210', email: 'johndoe@health.gov.in', assigned_village_id: 3, created_at: new Date() }
  ],

  health_reports: [
    { id: 1, village_id: 3, health_worker_id: 1, report_date: '2026-06-15', water_source: 'Tube Well', water_condition: 'Moderate', disease_name: 'Diarrhea', cases_count: 12, children_affected: 8, adults_affected: 4, remarks: 'Suspected pipe leak near village center.', status: 'approved', created_at: new Date('2026-06-15') },
    { id: 2, village_id: 5, health_worker_id: 1, report_date: '2026-07-01', water_source: 'River', water_condition: 'Contaminated', disease_name: 'Cholera', cases_count: 22, children_affected: 12, adults_affected: 10, remarks: 'River water used directly due to pump failure.', status: 'approved', created_at: new Date('2026-07-01') },
    { id: 3, village_id: 3, health_worker_id: 1, report_date: '2026-07-05', water_source: 'Well', water_condition: 'Clean', disease_name: 'Typhoid', cases_count: 5, children_affected: 2, adults_affected: 3, remarks: 'Routine check, minimal cases reported.', status: 'approved', created_at: new Date('2026-07-05') }
  ],

  alerts: [
    { id: 1, village_id: 3, report_id: 1, alert_date: '2026-06-15', disease_name: 'Diarrhea', cases_count: 12, status: 'active', alert_message: 'Warning: Elevated cases of Diarrhea (12 cases) in Chaygaon. Water contamination suspected.', created_at: new Date() },
    { id: 2, village_id: 5, report_id: 2, alert_date: '2026-07-01', disease_name: 'Cholera', cases_count: 22, status: 'active', alert_message: 'Danger: High risk of Cholera detected in Khowang (22 cases). Immediate medical inspection required.', created_at: new Date() }
  ]
};

// Counter states for IDs
let nextIds = {
  users: 3,
  health_workers: 2,
  health_reports: 4,
  alerts: 3,
  villages: 14
};

module.exports = { dbStore, nextIds };
