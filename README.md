# Smart Community Health Monitoring and Early Warning System for Water-Borne Diseases in Rural North-East India

A modern, responsive full-stack healthcare web application designed as a prototype for college-level hackathons (such as Smart India Hackathon). It allows village health workers to log local water quality data and water-borne disease cases, which the system aggregates to generate dynamic, rule-based early warning status alerts (Safe, Warning, Danger) mapped visually using Leaflet.js and analyzed through Chart.js.

---

## 🌟 Key Features

1. **Role-Based Authentication**:
   - **Admin**: Full access to dashboard metrics, village registration (CRUD), health worker profiles management (CRUD), reports approval workflow, and alerts resolution.
   - **Health Worker**: Assigned to specific villages to submit, edit, and delete water and health reports.
   - **Public Viewer**: Read-only access to community indicators, public maps, charts, and warnings.
2. **Dynamic Early Warning System (EWS)**:
   - Rule-based evaluation on submitted reports:
     - **Cases < 10**: SAFE Status (Green)
     - **Cases 10 - 20**: WARNING Status (Yellow) with warning message triggers.
     - **Cases > 20**: DANGER Status (Red) with medical emergency alert flags.
3. **Interactive Map Visualization**:
   - Uses Leaflet.js with OpenStreetMap.
   - Displays color-coded marker pins (Green, Yellow, Red) representing current village risk thresholds.
   - Custom styled HTML markers with popups highlighting local details (village name, latest water condition, case metrics).
4. **Data Visualization Dashboards**:
   - Implements Chart.js for real-time statistical breakdowns.
   - Includes: cases trend by month, disease type distribution, water source condition counts, and village hazard comparison.
5. **Print & PDF Export Reports**:
   - Filter-based custom reports (Daily, Weekly, Monthly, Village, District).
   - Dedicated print-friendly styles enabling clean PDF generation through standard browser printing (`Ctrl+P` / `Cmd+P`).

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, Vanilla CSS, JavaScript (ES6+), Bootstrap 5, Chart.js, Leaflet.js
- **Backend**: Node.js with Express framework
- **Database**: MySQL (using `mysql2` driver)
- **Session Management**: Session cookies handled with `express-session`
- **Password Security**: Encryption via `bcryptjs`

---

## 📂 Project Structure

```text
smart-community-health-monitoring/
├── config/
│   └── db.js                 # MySQL Pool database connection helper
├── controllers/
│   ├── alertController.js    # Fetch and resolve early warning alerts
│   ├── authController.js     # User registration, login sessions, & logs
│   ├── dashboardController.js# Query stats and chart structures
│   ├── reportController.js   # Submit/manage reports and trigger warning rules
│   ├── userController.js     # Admin CRUD for health workers
│   └── villageController.js  # Admin CRUD for villages and location drops
├── database/
│   └── schema.sql            # Database creation script and mock data
├── middleware/
│   └── auth.js               # Role-based middleware for API protection
├── models/
│   ├── Alert.js              # Alert model queries
│   ├── User.js               # User & health worker model queries (Transactions)
│   ├── Village.js            # Village directory queries (includes latest report joins)
│   └── Report.js             # Reports database queries
├── public/
│   ├── css/
│   │   └── style.css         # Unified Green/Blue Healthcare Theme
│   ├── js/
│   │   └── utils.js          # Shared JS utilities, navbar renderer, alert toaster
│   ├── admin.html            # Admin dashboard and configuration panel
│   ├── alerts.html           # EWS alert notification list
│   ├── login.html            # Staff authentication portal
│   ├── map.html              # Leaflet.js interactive maps
│   ├── public.html           # Public landing stats page
│   ├── reports.html          # Reports generator & printable layouts
│   └── worker.html           # Health worker submission form
├── .env                      # Local server configuration file (gitignored)
├── .env.example              # Template configuration variables
├── package.json              # App dependencies list
├── server.js                 # Server entry point
└── README.md                 # Project documentation
```

---

## ⚙️ Installation & Run Instructions

This application is configured to run **100% database-free in-memory out of the box**. This means you do **NOT** need to install or configure MySQL to run and test all features (login, dashboards, report creation, maps, and warning status changes). Everything saves and updates in the node memory automatically!

### Step 1: Open the Project in VS Code
Open the project folder in VS Code:
```bash
# Navigate to project folder
cd smart-community-health-monitoring
```

### Step 2: Install Node.js Dependencies
Install the required packages by running:
```bash
# For PowerShell (if script execution is blocked, use npm.cmd install)
npm install
```

### Step 3: Start the Server
Start the local server:
```bash
npm start
```
*The server will boot up and print: `Server is running on http://localhost:3000`*

### Step 4: Open in Browser
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🗄️ Optional: Setting up MySQL
If you specifically want to run the project using a real MySQL server:
1. Open [database/schema.sql](file:///C:/Users/User/.gemini/antigravity/scratch/smart-community-health-monitoring/database/schema.sql) and import it into your MySQL instance to create the tables and seed data.
2. Edit the `.env` file with your MySQL server credentials.
3. Switch the imports in the `models/` directory files back from `../config/mockDb` to `../config/db`. (We suggest keeping it in-memory for fast and painless testing during prototype evaluations).

---

## 🔑 Default Credentials

To log in to the staff portals, click **Portal Login** or go to `http://localhost:3000/login.html`:

| Role | Username | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin` | `admin123` |
| **Health Worker** | `worker1` | `worker123` |

---

## 📡 REST API Endpoints

### Authentication
- `POST /api/auth/login` - Authenticate staff and establish session
- `POST /api/auth/register` - Create user logins
- `POST /api/auth/logout` - Destroy session cookie
- `GET /api/auth/me` - Retrieve details of active logged-in profile

### Villages
- `GET /api/villages` - Fetch all village details including their current warning status
- `POST /api/villages` - Admin: Add new village coordinates
- `PUT /api/villages/:id` - Admin: Modify village details
- `DELETE /api/villages/:id` - Admin: Delete village and records
- `GET /api/villages/locations` - Fetch lists of states and districts

### Reports
- `GET /api/reports` - List reports (automatically filtered by health worker ID if logged in as a worker)
- `GET /api/reports/:id` - Fetch details of a single report
- `POST /api/reports` - Submit report (starts as *pending* for health workers, *approved* for admins)
- `PUT /api/reports/:id` - Edit a pending report
- `DELETE /api/reports/:id` - Delete a pending report
- `PATCH /api/reports/:id/approve` - Admin: Approve pending report (triggers EWS recalculation)

### Alerts (EWS)
- `GET /api/alerts` - List active or resolved warning alerts
- `PATCH /api/alerts/:id/resolve` - Admin: Mark an active alert as resolved

### Dashboards
- `GET /api/dashboard/stats` - Fetch KPIs and aggregate stats
- `GET /api/dashboard/charts` - Fetch processed historical data arrays for Chart.js renders

---

## 📐 System Architecture Diagram

```text
       +-------------------------------------------------------------+
       |                         Client Browser                      |
       |  (HTML5, Bootstrap 5 CSS, Leaflet.js Maps, Chart.js Charts) |
       +-------+---------------------+-----------------------+-------+
               |                     |                       |
               | (Auth Requests)     | (REST Queries)        | (Report Submissions)
               v                     v                       v
       +-------+---------------------+-----------------------+-------+
       |                          Web Server                         |
       |                     (Node.js & Express)                     |
       +-----------------------------+-------------------------------+
       |       authMiddleware        |       EWS Router / Logic      |
       +-----------------------------+-------------------------------+
                                     |
                                     | (SQL Database Queries)
                                     v
                       +-------------+---------------+
                       |         Database            |
                       |          (MySQL)            |
                       +-----------------------------+
```

---

## 📈 Future Scope

1. **SMS Notification Integration**: Send instant SMS alerts (e.g. Twilio API) to village heads and health workers when a danger threshold is crossed.
2. **Offline Data Syncing**: Enable Service Workers (PWA) so health workers in remote North-East regions with unstable cellular connectivity can log reports offline, automatically syncing when connection is restored.
3. **Advanced GIS Analysis**: Map historical vector layers to predict potential path vectors of water-borne contamination streams.
