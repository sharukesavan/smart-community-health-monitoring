require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const villageRoutes = require('./routes/villageRoutes');
const reportRoutes = require('./routes/reportRoutes');
const alertRoutes = require('./routes/alertRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Config
app.use(session({
  secret: process.env.SESSION_SECRET || 'health_monitoring_secret_key_123',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // Set to true if running on HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 1 day default
  }
}));

// Serve Static Assets
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/villages', villageRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);

// Root Redirect to Public Viewer Page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'public.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'An unexpected server error occurred.' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
