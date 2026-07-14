const { dbStore } = require('../config/mockDb');

exports.getStats = async (req, res) => {
  try {
    const total_villages = dbStore.villages.length;
    const total_workers = dbStore.health_workers.length;
    
    const total_cases = dbStore.health_reports
      .filter(r => r.status === 'approved')
      .reduce((sum, r) => sum + r.cases_count, 0);

    const safe_villages = dbStore.villages.filter(v => v.status === 'safe').length;
    const warning_villages = dbStore.villages.filter(v => v.status === 'warning').length;
    const danger_villages = dbStore.villages.filter(v => v.status === 'danger').length;

    // Recent reports
    const recent_reports = dbStore.health_reports
      .map(r => {
        const v = dbStore.villages.find(vil => vil.id === r.village_id) || {};
        const hw = dbStore.health_workers.find(worker => worker.id === r.health_worker_id) || {};
        return {
          ...r,
          village_name: v.name || '',
          worker_name: hw.name || 'System / Admin'
        };
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 6);

    // Recent active alerts
    const recent_alerts = dbStore.alerts
      .filter(a => a.status === 'active')
      .map(a => {
        const v = dbStore.villages.find(vil => vil.id === a.village_id) || {};
        return {
          ...a,
          village_name: v.name || ''
        };
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);

    res.json({
      success: true,
      stats: {
        total_villages,
        total_workers,
        total_cases,
        safe_villages,
        warning_villages,
        danger_villages,
        recent_reports,
        recent_alerts
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, message: 'Server error loading dashboard stats.' });
  }
};

exports.getCharts = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const approvedReports = dbStore.health_reports.filter(r => r.status === 'approved');

    // 1. Cases by Month (Current year)
    const monthlyCasesMap = {};
    approvedReports.forEach(r => {
      const date = new Date(r.report_date);
      if (date.getFullYear() === currentYear) {
        const m = date.getMonth() + 1; // 1-indexed
        monthlyCasesMap[m] = (monthlyCasesMap[m] || 0) + r.cases_count;
      }
    });
    const monthlyCases = Object.keys(monthlyCasesMap).map(m => ({
      month: parseInt(m),
      cases: monthlyCasesMap[m]
    }));

    // 2. Disease Type Distribution
    const diseaseMap = {};
    approvedReports.forEach(r => {
      diseaseMap[r.disease_name] = (diseaseMap[r.disease_name] || 0) + r.cases_count;
    });
    const diseaseDistribution = Object.keys(diseaseMap).map(name => ({
      disease_name: name,
      cases: diseaseMap[name]
    }));

    // 3. Water Source Condition Distribution
    const waterQualityMap = {};
    approvedReports.forEach(r => {
      const key = `${r.water_source}_${r.water_condition}`;
      waterQualityMap[key] = (waterQualityMap[key] || 0) + 1;
    });
    const waterQuality = Object.keys(waterQualityMap).map(key => {
      const [source, condition] = key.split('_');
      return {
        water_source: source,
        water_condition: condition,
        count: waterQualityMap[key]
      };
    });

    // 4. Village Comparison (cases count)
    const villageCasesMap = {};
    approvedReports.forEach(r => {
      const v = dbStore.villages.find(vil => vil.id === r.village_id);
      if (v) {
        villageCasesMap[v.name] = (villageCasesMap[v.name] || 0) + r.cases_count;
      }
    });
    const villageCases = Object.keys(villageCasesMap)
      .map(name => ({
        village_name: name,
        cases: villageCasesMap[name]
      }))
      .sort((a, b) => b.cases - a.cases)
      .slice(0, 8);

    // 5. Village Warning Status distribution
    const statusMap = { safe: 0, warning: 0, danger: 0 };
    dbStore.villages.forEach(v => {
      statusMap[v.status] = (statusMap[v.status] || 0) + 1;
    });
    const statusDistribution = Object.keys(statusMap).map(status => ({
      status,
      count: statusMap[status]
    }));

    res.json({
      success: true,
      data: {
        monthlyCases,
        diseaseDistribution,
        waterQuality,
        villageCases,
        statusDistribution
      }
    });
  } catch (error) {
    console.error('Get charts error:', error);
    res.status(500).json({ success: false, message: 'Server error loading chart data.' });
  }
};
