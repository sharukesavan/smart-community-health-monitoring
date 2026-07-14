const Alert = require('../models/Alert');

exports.getAlerts = async (req, res) => {
  try {
    const { status } = req.query; // 'active', 'resolved', or null
    const alerts = await Alert.getAll(status);
    res.json({ success: true, alerts });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching alerts.' });
  }
};

exports.resolveAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const resolved = await Alert.resolve(id);
    if (!resolved) {
      return res.status(404).json({ success: false, message: 'Alert not found.' });
    }
    res.json({ success: true, message: 'Alert resolved successfully.' });
  } catch (error) {
    console.error('Resolve alert error:', error);
    res.status(500).json({ success: false, message: 'Server error resolving alert.' });
  }
};
