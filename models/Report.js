const { dbStore, nextIds } = require('../config/mockDb');

const Report = {
  async getAll(filters = {}) {
    let list = dbStore.health_reports.map(r => {
      const v = dbStore.villages.find(vil => vil.id === r.village_id) || {};
      const d = dbStore.districts.find(dis => dis.id === v.district_id) || {};
      const s = dbStore.states.find(st => st.id === d.state_id) || {};
      const hw = dbStore.health_workers.find(worker => worker.id === r.health_worker_id) || {};

      return {
        ...r,
        village_name: v.name || '',
        district_name: d.name || '',
        state_name: s.name || '',
        worker_name: hw.name || 'System / Admin'
      };
    });

    // Apply filters
    if (filters.village) {
      list = list.filter(r => r.village_name.toLowerCase().includes(filters.village.toLowerCase()));
    }
    if (filters.district) {
      list = list.filter(r => r.district_name.toLowerCase().includes(filters.district.toLowerCase()));
    }
    if (filters.disease) {
      list = list.filter(r => r.disease_name === filters.disease);
    }
    if (filters.status) {
      list = list.filter(r => r.status === filters.status);
    }
    if (filters.startDate) {
      list = list.filter(r => new Date(r.report_date) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      list = list.filter(r => new Date(r.report_date) <= new Date(filters.endDate));
    }
    if (filters.health_worker_id) {
      list = list.filter(r => r.health_worker_id === parseInt(filters.health_worker_id));
    }

    // Sort: newest first
    return list.sort((a, b) => new Date(b.report_date) - new Date(a.report_date) || b.id - a.id);
  },

  async getById(id) {
    const reportId = parseInt(id);
    const r = dbStore.health_reports.find(rep => rep.id === reportId);
    if (!r) return null;

    const v = dbStore.villages.find(vil => vil.id === r.village_id) || {};
    const d = dbStore.districts.find(dis => dis.id === v.district_id) || {};
    const s = dbStore.states.find(st => st.id === d.state_id) || {};
    const hw = dbStore.health_workers.find(worker => worker.id === r.health_worker_id) || {};

    return {
      ...r,
      village_name: v.name || '',
      district_name: d.name || '',
      state_name: s.name || '',
      worker_name: hw.name || 'System / Admin'
    };
  },

  async create(data) {
    const newId = nextIds.health_reports++;
    const newReport = {
      id: newId,
      village_id: parseInt(data.village_id),
      health_worker_id: data.health_worker_id ? parseInt(data.health_worker_id) : 1,
      report_date: data.report_date,
      water_source: data.water_source,
      water_condition: data.water_condition,
      disease_name: data.disease_name,
      cases_count: parseInt(data.cases_count),
      children_affected: parseInt(data.children_affected || 0),
      adults_affected: parseInt(data.adults_affected || 0),
      remarks: data.remarks || null,
      status: data.status || 'pending',
      created_at: new Date()
    };

    dbStore.health_reports.push(newReport);

    if (newReport.status === 'approved') {
      await this.recalculateVillageStatusAndAlerts(newReport.village_id, newId);
    }

    return newId;
  },

  async update(id, data) {
    const reportId = parseInt(id);
    const r = dbStore.health_reports.find(rep => rep.id === reportId);
    if (!r) return false;

    r.village_id = parseInt(data.village_id);
    r.report_date = data.report_date;
    r.water_source = data.water_source;
    r.water_condition = data.water_condition;
    r.disease_name = data.disease_name;
    r.cases_count = parseInt(data.cases_count);
    r.children_affected = parseInt(data.children_affected || 0);
    r.adults_affected = parseInt(data.adults_affected || 0);
    r.remarks = data.remarks || null;
    r.status = data.status || 'pending';

    if (r.status === 'approved') {
      await this.recalculateVillageStatusAndAlerts(r.village_id, reportId);
    }

    return true;
  },

  async delete(id) {
    const reportId = parseInt(id);
    const index = dbStore.health_reports.findIndex(rep => rep.id === reportId);
    if (index === -1) return false;

    const villageId = dbStore.health_reports[index].village_id;

    // Delete associated alerts
    dbStore.alerts = dbStore.alerts.filter(a => a.report_id !== reportId);

    dbStore.health_reports.splice(index, 1);

    await this.recalculateVillageStatusAndAlerts(villageId);
    return true;
  },

  async approve(id) {
    const reportId = parseInt(id);
    const r = dbStore.health_reports.find(rep => rep.id === reportId);
    if (!r) return false;

    r.status = 'approved';
    await this.recalculateVillageStatusAndAlerts(r.village_id, reportId);
    return true;
  },

  async recalculateVillageStatusAndAlerts(villageId, reportId = null) {
    const v = dbStore.villages.find(vil => vil.id === villageId);
    if (!v) return;

    // Get the latest approved report
    const approved = dbStore.health_reports
      .filter(r => r.village_id === villageId && r.status === 'approved')
      .sort((a, b) => new Date(b.report_date) - new Date(a.report_date) || b.id - a.id);

    if (approved.length > 0) {
      const latest = approved[0];
      const cases = latest.cases_count;
      const disease = latest.disease_name;

      let currentStatus = 'safe';
      if (cases < 10) {
        currentStatus = 'safe';
      } else if (cases >= 10 && cases <= 20) {
        currentStatus = 'warning';
      } else {
        currentStatus = 'danger';
      }

      v.status = currentStatus;

      // Handle alerts
      if (cases >= 10) {
        let alertMessage = '';
        if (currentStatus === 'warning') {
          alertMessage = `Warning: Elevated cases of ${disease} (${cases} cases) in ${v.name}. Water contamination suspected.`;
        } else {
          alertMessage = `Danger: High risk of ${disease} detected in ${v.name} (${cases} cases). Immediate medical inspection required.`;
        }

        const existingAlert = dbStore.alerts.find(a => a.report_id === latest.id);
        if (!existingAlert) {
          const alertId = nextIds.alerts++;
          dbStore.alerts.push({
            id: alertId,
            village_id: villageId,
            report_id: latest.id,
            alert_date: latest.report_date,
            disease_name: disease,
            cases_count: cases,
            status: 'active',
            alert_message: alertMessage,
            created_at: new Date()
          });
        } else {
          existingAlert.alert_message = alertMessage;
          existingAlert.cases_count = cases;
          existingAlert.status = 'active';
        }
      } else {
        // Resolve alert if cases are safe now
        const existingAlert = dbStore.alerts.find(a => a.report_id === latest.id);
        if (existingAlert) {
          existingAlert.status = 'resolved';
        }
      }
    } else {
      // No approved reports, reset status to safe
      v.status = 'safe';
    }
  }
};

module.exports = Report;
