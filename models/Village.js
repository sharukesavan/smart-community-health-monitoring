const { dbStore, nextIds } = require('../config/mockDb');

const Village = {
  async getAll() {
    return dbStore.villages.map(v => {
      const d = dbStore.districts.find(dis => dis.id === v.district_id) || {};
      const s = dbStore.states.find(st => st.id === d.state_id) || {};
      
      // Get the latest approved report for this village
      const approvedReports = dbStore.health_reports
        .filter(r => r.village_id === v.id && r.status === 'approved')
        .sort((a, b) => new Date(b.report_date) - new Date(a.report_date) || b.id - a.id);
      
      const latestReport = approvedReports[0] || {};

      return {
        ...v,
        district_name: d.name || '',
        state_name: s.name || '',
        water_source: latestReport.water_source || null,
        water_condition: latestReport.water_condition || null,
        disease_name: latestReport.disease_name || null,
        cases_count: latestReport.cases_count !== undefined ? latestReport.cases_count : null
      };
    });
  },

  async getById(id) {
    const villageId = parseInt(id);
    const v = dbStore.villages.find(vil => vil.id === villageId);
    if (!v) return null;

    const d = dbStore.districts.find(dis => dis.id === v.district_id) || {};
    const s = dbStore.states.find(st => st.id === d.state_id) || {};

    return {
      ...v,
      district_name: d.name || '',
      state_name: s.name || '',
      state_id: d.state_id || null
    };
  },

  async create({ name, district_id, latitude, longitude }) {
    const newId = nextIds.villages++;
    const newVillage = {
      id: newId,
      name,
      district_id: parseInt(district_id),
      status: 'safe',
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude)
    };
    dbStore.villages.push(newVillage);
    return newId;
  },

  async update(id, { name, district_id, latitude, longitude }) {
    const villageId = parseInt(id);
    const v = dbStore.villages.find(vil => vil.id === villageId);
    if (!v) return false;

    v.name = name;
    v.district_id = parseInt(district_id);
    v.latitude = parseFloat(latitude);
    v.longitude = parseFloat(longitude);
    return true;
  },

  async updateStatus(id, status) {
    const villageId = parseInt(id);
    const v = dbStore.villages.find(vil => vil.id === villageId);
    if (!v) return false;

    v.status = status;
    return true;
  },

  async delete(id) {
    const villageId = parseInt(id);
    const index = dbStore.villages.findIndex(v => v.id === villageId);
    if (index === -1) return false;

    // Delete associated alerts and reports
    dbStore.health_reports = dbStore.health_reports.filter(r => r.village_id !== villageId);
    dbStore.alerts = dbStore.alerts.filter(a => a.village_id !== villageId);

    // Unassign health workers assigned to this village
    dbStore.health_workers.forEach(hw => {
      if (hw.assigned_village_id === villageId) {
        hw.assigned_village_id = null;
      }
    });

    dbStore.villages.splice(index, 1);
    return true;
  },

  async getStatesAndDistricts() {
    return {
      states: dbStore.states,
      districts: dbStore.districts
    };
  }
};

module.exports = Village;
