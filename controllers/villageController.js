const Village = require('../models/Village');

exports.getVillages = async (req, res) => {
  try {
    const villages = await Village.getAll();
    res.json({ success: true, villages });
  } catch (error) {
    console.error('Get villages error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching villages.' });
  }
};

exports.addVillage = async (req, res) => {
  try {
    const { name, district_id, latitude, longitude } = req.body;

    if (!name || !district_id || !latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const villageId = await Village.create({ name, district_id, latitude, longitude });
    res.status(201).json({
      success: true,
      message: 'Village added successfully.',
      villageId
    });
  } catch (error) {
    console.error('Add village error:', error);
    res.status(500).json({ success: false, message: 'Server error adding village.' });
  }
};

exports.editVillage = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, district_id, latitude, longitude } = req.body;

    if (!name || !district_id || !latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const updated = await Village.update(id, { name, district_id, latitude, longitude });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Village not found.' });
    }

    res.json({ success: true, message: 'Village updated successfully.' });
  } catch (error) {
    console.error('Edit village error:', error);
    res.status(500).json({ success: false, message: 'Server error updating village.' });
  }
};

exports.deleteVillage = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Village.delete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Village not found.' });
    }
    res.json({ success: true, message: 'Village deleted successfully.' });
  } catch (error) {
    console.error('Delete village error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting village.' });
  }
};

exports.getLocations = async (req, res) => {
  try {
    const data = await Village.getStatesAndDistricts();
    res.json({ success: true, ...data });
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching location structures.' });
  }
};
