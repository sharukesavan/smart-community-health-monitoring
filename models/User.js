const bcrypt = require('bcryptjs');
const { dbStore, nextIds } = require('../config/mockDb');

const User = {
  async findByUsername(username) {
    const user = dbStore.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    return user || null;
  },

  async findById(id) {
    const user = dbStore.users.find(u => u.id === parseInt(id));
    if (!user) return null;
    return { id: user.id, username: user.username, role: user.role, created_at: user.created_at };
  },

  async create({ username, password, role }) {
    const hash = await bcrypt.hash(password, 10);
    const newId = nextIds.users++;
    const newUser = {
      id: newId,
      username,
      password_hash: hash,
      role,
      created_at: new Date()
    };
    dbStore.users.push(newUser);
    return newId;
  },

  async getAll() {
    return dbStore.users.map(u => ({ id: u.id, username: u.username, role: u.role, created_at: u.created_at }));
  },

  async delete(id) {
    const userId = parseInt(id);
    const index = dbStore.users.findIndex(u => u.id === userId);
    if (index === -1) return false;
    
    // Delete associated health worker details if it exists
    const workerIndex = dbStore.health_workers.findIndex(w => w.user_id === userId);
    if (workerIndex !== -1) {
      dbStore.health_workers.splice(workerIndex, 1);
    }
    
    dbStore.users.splice(index, 1);
    return true;
  },

  // Health Worker Specific Queries
  async getAllWorkers() {
    return dbStore.health_workers.map(hw => {
      const u = dbStore.users.find(user => user.id === hw.user_id) || {};
      const v = dbStore.villages.find(vil => vil.id === hw.assigned_village_id) || {};
      return {
        ...hw,
        username: u.username || '',
        village_name: v.name || ''
      };
    });
  },

  async findWorkerByUserId(userId) {
    const hw = dbStore.health_workers.find(w => w.user_id === parseInt(userId));
    if (!hw) return null;
    const u = dbStore.users.find(user => user.id === hw.user_id) || {};
    const v = dbStore.villages.find(vil => vil.id === hw.assigned_village_id) || {};
    return {
      ...hw,
      username: u.username || '',
      village_name: v.name || ''
    };
  },

  async createWorker({ username, password, name, phone, email, assigned_village_id }) {
    const hash = await bcrypt.hash(password, 10);
    const userId = nextIds.users++;
    
    const newUser = {
      id: userId,
      username,
      password_hash: hash,
      role: 'health_worker',
      created_at: new Date()
    };
    dbStore.users.push(newUser);

    const workerId = nextIds.health_workers++;
    const newWorker = {
      id: workerId,
      user_id: userId,
      name,
      phone: phone || null,
      email: email || null,
      assigned_village_id: assigned_village_id ? parseInt(assigned_village_id) : null,
      created_at: new Date()
    };
    dbStore.health_workers.push(newWorker);
    return workerId;
  },

  async updateWorker(id, { name, phone, email, assigned_village_id }) {
    const workerId = parseInt(id);
    const hw = dbStore.health_workers.find(w => w.id === workerId);
    if (!hw) return false;

    hw.name = name;
    hw.phone = phone || null;
    hw.email = email || null;
    hw.assigned_village_id = assigned_village_id ? parseInt(assigned_village_id) : null;
    return true;
  }
};

module.exports = User;
