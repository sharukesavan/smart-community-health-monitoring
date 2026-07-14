const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {
  try {
    const { username, password, role, rememberMe } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    if (user.role !== role) {
      return res.status(403).json({ success: false, message: `Access denied. Selected role does not match user profile.` });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    // Set session details
    req.session.user = {
      id: user.id,
      username: user.username,
      role: user.role
    };

    // If health worker, fetch and attach worker profile ID
    if (user.role === 'health_worker') {
      const worker = await User.findWorkerByUserId(user.id);
      if (worker) {
        req.session.user.worker_id = worker.id;
        req.session.user.name = worker.name;
        req.session.user.village_id = worker.assigned_village_id;
      }
    }

    // Handle "Remember Me"
    if (rememberMe) {
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    } else {
      req.session.cookie.expires = false; // Session cookie
    }

    res.json({
      success: true,
      message: 'Login successful.',
      user: req.session.user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

exports.register = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username is already taken.' });
    }

    const userId = await User.create({ username, password, role });
    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      userId
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Could not log out.' });
    }
    res.clearCookie('connect.sid');
    res.json({ success: true, message: 'Logged out successfully.' });
  });
};

exports.me = (req, res) => {
  if (req.session && req.session.user) {
    return res.json({ success: true, user: req.session.user });
  }
  res.json({ success: false, message: 'Not authenticated.' });
};
