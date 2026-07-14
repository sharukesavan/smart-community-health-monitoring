const { dbStore } = require('../config/mockDb');

const Alert = {
  async getAll(status = null) {
    let list = dbStore.alerts.map(a => {
      const v = dbStore.villages.find(vil => vil.id === a.village_id) || {};
      const d = dbStore.districts.find(dis => dis.id === v.district_id) || {};
      const s = dbStore.states.find(st => st.id === d.state_id) || {};

      return {
        ...a,
        village_name: v.name || '',
        district_name: d.name || '',
        state_name: s.name || ''
      };
    });

    if (status) {
      list = list.filter(a => a.status === status);
    }

    // Sort newest first
    return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at) || b.id - a.id);
  },

  async resolve(id) {
    const alertId = parseInt(id);
    const alert = dbStore.alerts.find(a => a.id === alertId);
    if (!alert) return false;

    alert.status = 'resolved';
    return true;
  }
};

module.exports = Alert;
