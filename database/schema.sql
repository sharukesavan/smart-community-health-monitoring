-- Create Database
CREATE DATABASE IF NOT EXISTS health_monitoring;
USE health_monitoring;

-- 1. States Table
CREATE TABLE IF NOT EXISTS states (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- 2. Districts Table
CREATE TABLE IF NOT EXISTS districts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    state_id INT NOT NULL,
    FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE CASCADE,
    UNIQUE KEY unique_district_state (name, state_id)
);

-- 3. Villages Table
CREATE TABLE IF NOT EXISTS villages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    district_id INT NOT NULL,
    status ENUM('safe', 'warning', 'danger') DEFAULT 'safe',
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_village_district (name, district_id)
);

-- 4. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'health_worker') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Health Workers Table
CREATE TABLE IF NOT EXISTS health_workers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    email VARCHAR(100),
    assigned_village_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_village_id) REFERENCES villages(id) ON DELETE SET NULL
);

-- 6. Health Reports Table
CREATE TABLE IF NOT EXISTS health_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    village_id INT NOT NULL,
    health_worker_id INT NOT NULL,
    report_date DATE NOT NULL,
    water_source ENUM('Tube Well', 'River', 'Pond', 'Well') NOT NULL,
    water_condition ENUM('Clean', 'Moderate', 'Contaminated') NOT NULL,
    disease_name ENUM('Cholera', 'Typhoid', 'Diarrhea', 'Dysentery', 'Hepatitis A') NOT NULL,
    cases_count INT NOT NULL DEFAULT 0,
    children_affected INT NOT NULL DEFAULT 0,
    adults_affected INT NOT NULL DEFAULT 0,
    remarks TEXT,
    status ENUM('pending', 'approved') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (village_id) REFERENCES villages(id) ON DELETE CASCADE,
    FOREIGN KEY (health_worker_id) REFERENCES health_workers(id) ON DELETE CASCADE
);

-- 7. Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    village_id INT NOT NULL,
    report_id INT,
    alert_date DATE NOT NULL,
    disease_name VARCHAR(50) NOT NULL,
    cases_count INT NOT NULL,
    status ENUM('active', 'resolved') DEFAULT 'active',
    alert_message VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (village_id) REFERENCES villages(id) ON DELETE CASCADE,
    FOREIGN KEY (report_id) REFERENCES health_reports(id) ON DELETE SET NULL
);

-- Indexes for performance and quick searches
CREATE INDEX idx_report_date ON health_reports(report_date);
CREATE INDEX idx_report_disease ON health_reports(disease_name);
CREATE INDEX idx_report_status ON health_reports(status);
CREATE INDEX idx_village_status ON villages(status);
CREATE INDEX idx_alert_status ON alerts(status);

-- Seed States
INSERT INTO states (name) VALUES 
('Assam'), 
('Meghalaya'), 
('Tripura'), 
('Mizoram'), 
('Nagaland');

-- Seed Districts
-- Assam Districts (State ID: 1)
INSERT INTO districts (name, state_id) VALUES 
('Kamrup Rural', 1), 
('Dibrugarh', 1), 
('Sonitpur', 1);

-- Meghalaya Districts (State ID: 2)
INSERT INTO districts (name, state_id) VALUES 
('East Khasi Hills', 2), 
('West Garo Hills', 2);

-- Tripura Districts (State ID: 3)
INSERT INTO districts (name, state_id) VALUES 
('West Tripura', 3), 
('South Tripura', 3);

-- Mizoram Districts (State ID: 4)
INSERT INTO districts (name, state_id) VALUES 
('Aizawl', 4), 
('Lunglei', 4);

-- Nagaland Districts (State ID: 5)
INSERT INTO districts (name, state_id) VALUES 
('Kohima', 5), 
('Dimapur', 5);

-- Seed Villages (Northeast India locations)
-- Kamrup Rural (District ID: 1)
INSERT INTO villages (name, district_id, status, latitude, longitude) VALUES 
('Sualkuchi', 1, 'safe', 26.1732, 91.5647),
('Hajo', 1, 'safe', 26.2483, 91.5239),
('Chaygaon', 1, 'warning', 26.0378, 91.3854);

-- Dibrugarh (District ID: 2)
INSERT INTO villages (name, district_id, status, latitude, longitude) VALUES 
('Moranhat', 2, 'safe', 27.1834, 94.9284),
('Khowang', 2, 'danger', 27.2798, 94.8877);

-- East Khasi Hills (District ID: 4)
INSERT INTO villages (name, district_id, status, latitude, longitude) VALUES 
('Mawsynram', 4, 'safe', 25.2975, 91.5822),
('Cherrapunji', 4, 'safe', 25.2702, 91.7323),
('Mawlynnong', 4, 'safe', 25.2016, 91.9038);

-- West Garo Hills (District ID: 5)
INSERT INTO villages (name, district_id, status, latitude, longitude) VALUES 
('Tura Rural', 5, 'warning', 25.5135, 90.2244);

-- West Tripura (District ID: 6)
INSERT INTO villages (name, district_id, status, latitude, longitude) VALUES 
('Ranirbazar', 6, 'safe', 23.8378, 91.3734);

-- Aizawl (District ID: 8)
INSERT INTO villages (name, district_id, status, latitude, longitude) VALUES 
('Darlawn', 8, 'safe', 24.0167, 92.9000);

-- Kohima (District ID: 10)
INSERT INTO villages (name, district_id, status, latitude, longitude) VALUES 
('Khonoma', 10, 'safe', 25.6500, 94.0167),
('Jakhama', 10, 'safe', 25.5900, 94.1300);


-- Seed default users:
-- admin / admin123 (bcrypt hash of 'admin123')
-- worker1 / worker123 (bcrypt hash of 'worker123')
-- We use standard blowfish bcrypt hashes generated with 10 rounds:
-- admin123 -> $2a$10$o.c1bI5X3Tsh1kpxo35nveM.XvF/6a8i2Hq1PZ1D9D9CqZlhXy5oK
-- worker123 -> $2a$10$w6D09qj1Jd5sR/4WexLd5euL7N1.q2F1.K2492Y1Z0V1GqF1l7/2q
INSERT INTO users (username, password_hash, role) VALUES 
('admin', '$2a$10$o.c1bI5X3Tsh1kpxo35nveM.XvF/6a8i2Hq1PZ1D9D9CqZlhXy5oK', 'admin'),
('worker1', '$2a$10$w6D09qj1Jd5sR/4WexLd5euL7N1.q2F1.K2492Y1Z0V1GqF1l7/2q', 'health_worker');

-- Insert Health Worker profile for worker1 (user_id: 2)
INSERT INTO health_workers (user_id, name, phone, email, assigned_village_id) VALUES 
(2, 'John Doe', '9876543210', 'johndoe@health.gov.in', 3);

-- Seed some historical sample reports
INSERT INTO health_reports (village_id, health_worker_id, report_date, water_source, water_condition, disease_name, cases_count, children_affected, adults_affected, remarks, status) VALUES 
(3, 1, '2026-06-15', 'Tube Well', 'Moderate', 'Diarrhea', 12, 8, 4, 'Suspected pipe leak near village center.', 'approved'),
(5, 1, '2026-07-01', 'River', 'Contaminated', 'Cholera', 22, 12, 10, 'River water used directly due to pump failure.', 'approved'),
(3, 1, '2026-07-05', 'Well', 'Clean', 'Typhoid', 5, 2, 3, 'Routine check, minimal cases reported.', 'approved');

-- Seed alerts corresponding to danger and warning cases in history
INSERT INTO alerts (village_id, report_id, alert_date, disease_name, cases_count, status, alert_message) VALUES 
(3, 1, '2026-06-15', 'Diarrhea', 12, 'active', 'Warning: Elevated cases of Diarrhea (12 cases) in Chaygaon. Water contamination suspected.'),
(5, 2, '2026-07-01', 'Cholera', 22, 'active', 'Danger: High risk of Cholera detected in Khowang (22 cases). Immediate medical inspection required.');
