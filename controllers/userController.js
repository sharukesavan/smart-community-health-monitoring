const User = require('../models/User');

exports.getWorkers = async (req, res) => {
  try {
    const workers = await User.getAllWorkers();
    res.json({ success: true, workers });
  } catch (error) {
    console.error('Get workers error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching health workers.' });
  }
};

exports.addWorker = async (req, res) => {
  try {
    const { username, password, name, phone, email, assigned_village_id } = req.body;

    if (!username || !password || !name) {
      return res.status(400).json({ success: false, message: 'Username, password, and name are required.' });
    }

    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username already exists.' });
    }

    const workerId = await User.createWorker({
      username,
      password,
      name,
      phone,
      email,
      assigned_village_id
    });

    res.status(201).json({ success: true, message: 'Health worker created successfully.', workerId });
  } catch (error) {
    console.error('Add worker error:', error);
    res.status(500).json({ success: false, message: 'Server error creating health worker.' });
  }
};

exports.editWorker = async (req, res) => {
  try {
    const { id } = req.params; // Health worker ID
    const { name, phone, email, assigned_village_id } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required.' });
    }

    const updated = await User.updateWorker(id, { name, phone, email, assigned_village_id });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Health worker not found.' });
    }

    res.json({ success: true, message: 'Health worker updated successfully.' });
  } catch (error) {
    console.error('Edit worker error:', error);
    res.status(500).json({ success: false, message: 'Server error updating health worker.' });
  }
};

exports.deleteWorker = async (req, res) => {
  try {
    const { id } = req.params; // User ID (we delete the user, and Cascade deletes the worker)
    const deleted = await User.delete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, message: 'Health worker and user account deleted successfully.' });
  } catch (error) {
    console.error('Delete worker error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting health worker.' });
  }
};
