const Report = require('../models/Report');

exports.getReports = async (req, res) => {
  try {
    const filters = {};
    if (req.query.village) filters.village = req.query.village;
    if (req.query.district) filters.district = req.query.district;
    if (req.query.disease) filters.disease = req.query.disease;
    if (req.query.status) filters.status = req.query.status;
    if (req.query.startDate) filters.startDate = req.query.startDate;
    if (req.query.endDate) filters.endDate = req.query.endDate;

    // Health workers can only see their own reports (unless admin is viewing)
    if (req.session.user.role === 'health_worker') {
      filters.health_worker_id = req.session.user.worker_id;
    }

    const reports = await Report.getAll(filters);
    res.json({ success: true, reports });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching reports.' });
  }
};

exports.getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.getById(id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    // Health workers can only view their own reports
    if (req.session.user.role === 'health_worker' && report.health_worker_id !== req.session.user.worker_id) {
      return res.status(403).json({ success: false, message: 'Forbidden. Access to this report is restricted.' });
    }

    res.json({ success: true, report });
  } catch (error) {
    console.error('Get report detail error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching report details.' });
  }
};

exports.submitReport = async (req, res) => {
  try {
    const {
      village_id,
      report_date,
      water_source,
      water_condition,
      disease_name,
      cases_count,
      children_affected,
      adults_affected,
      remarks
    } = req.body;

    if (!village_id || !report_date || !water_source || !water_condition || !disease_name || cases_count === undefined) {
      return res.status(400).json({ success: false, message: 'Required fields are missing.' });
    }

    let status = 'pending';
    let health_worker_id = null;

    if (req.session.user.role === 'health_worker') {
      health_worker_id = req.session.user.worker_id;
      if (!health_worker_id) {
        return res.status(400).json({ success: false, message: 'Health worker profile not found for this user.' });
      }
    } else if (req.session.user.role === 'admin') {
      // If admin submits a report, we can associate with a default/system worker profile or allow selecting a worker
      // For simplicity, admins can also submit, and we assign to the default worker (ID: 1) and auto-approve it
      health_worker_id = req.body.health_worker_id || 1;
      status = 'approved'; // Auto-approve admin reports
    }

    const reportId = await Report.create({
      village_id,
      health_worker_id,
      report_date,
      water_source,
      water_condition,
      disease_name,
      cases_count: parseInt(cases_count, 10),
      children_affected: parseInt(children_affected || 0, 10),
      adults_affected: parseInt(adults_affected || 0, 10),
      remarks,
      status
    });

    res.status(201).json({
      success: true,
      message: `Report submitted successfully.${status === 'pending' ? ' Awaiting admin approval.' : ''}`,
      reportId
    });
  } catch (error) {
    console.error('Submit report error:', error);
    res.status(500).json({ success: false, message: 'Server error submitting report.' });
  }
};

exports.editReport = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.getById(id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    // Health workers can only edit their own reports AND only if they are still pending
    if (req.session.user.role === 'health_worker') {
      if (report.health_worker_id !== req.session.user.worker_id) {
        return res.status(403).json({ success: false, message: 'Forbidden. Access denied.' });
      }
      // If report is already approved, health worker cannot edit it (needs admin)
      if (report.status === 'approved') {
        return res.status(400).json({ success: false, message: 'Approved reports cannot be edited by health workers.' });
      }
    }

    const {
      village_id,
      report_date,
      water_source,
      water_condition,
      disease_name,
      cases_count,
      children_affected,
      adults_affected,
      remarks,
      status
    } = req.body;

    const dataToUpdate = {
      village_id: village_id || report.village_id,
      report_date: report_date || report.report_date,
      water_source: water_source || report.water_source,
      water_condition: water_condition || report.water_condition,
      disease_name: disease_name || report.disease_name,
      cases_count: cases_count !== undefined ? parseInt(cases_count, 10) : report.cases_count,
      children_affected: children_affected !== undefined ? parseInt(children_affected, 10) : report.children_affected,
      adults_affected: adults_affected !== undefined ? parseInt(adults_affected, 10) : report.adults_affected,
      remarks: remarks !== undefined ? remarks : report.remarks,
      // Status can only be changed by admin, or set back to pending on worker edit
      status: req.session.user.role === 'admin' ? (status || report.status) : 'pending'
    };

    const updated = await Report.update(id, dataToUpdate);
    if (!updated) {
      return res.status(500).json({ success: false, message: 'Failed to update report.' });
    }

    res.json({ success: true, message: 'Report updated successfully.' });
  } catch (error) {
    console.error('Edit report error:', error);
    res.status(500).json({ success: false, message: 'Server error updating report.' });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.getById(id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    // Health workers can only delete their own reports AND only if they are still pending
    if (req.session.user.role === 'health_worker') {
      if (report.health_worker_id !== req.session.user.worker_id) {
        return res.status(403).json({ success: false, message: 'Forbidden. Access denied.' });
      }
      if (report.status === 'approved') {
        return res.status(400).json({ success: false, message: 'Approved reports cannot be deleted by health workers.' });
      }
    }

    const deleted = await Report.delete(id);
    if (!deleted) {
      return res.status(500).json({ success: false, message: 'Failed to delete report.' });
    }

    res.json({ success: true, message: 'Report deleted successfully.' });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting report.' });
  }
};

exports.approveReport = async (req, res) => {
  try {
    const { id } = req.params;
    const approved = await Report.approve(id);
    if (!approved) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }
    res.json({ success: true, message: 'Report approved successfully.' });
  } catch (error) {
    console.error('Approve report error:', error);
    res.status(500).json({ success: false, message: 'Server error approving report.' });
  }
};
