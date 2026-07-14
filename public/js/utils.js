// Shared Utilities and Session Handlers

const Utils = {
  // Check auth status
  async checkSession() {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Session check failed:', error);
      return { success: false };
    }
  },

  // Logout handler
  async logout() {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        window.location.href = '/login.html';
      } else {
        alert('Logout failed: ' + data.message);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  // Inject beautiful, responsive sidebar dynamically based on role
  async initPage(activePage) {
    const session = await this.checkSession();
    const currentPage = window.location.pathname.split('/').pop() || 'public.html';

    // Access control lists
    const adminPages = ['admin.html'];
    const workerPages = ['worker.html'];
    const authRequiredPages = ['admin.html', 'worker.html', 'reports.html'];

    if (authRequiredPages.includes(currentPage) && !session.success) {
      // Redirect to login if trying to access auth pages without login
      window.location.href = '/login.html';
      return;
    }

    if (adminPages.includes(currentPage) && session.user?.role !== 'admin') {
      window.location.href = '/login.html';
      return;
    }

    if (workerPages.includes(currentPage) && session.user?.role !== 'health_worker') {
      window.location.href = '/login.html';
      return;
    }

    // Render Navbar & Sidebar
    this.renderSidebar(session.user, activePage);
    this.renderTopBar(session.user);
  },

  renderSidebar(user, activePage) {
    const sidebarEl = document.getElementById('sidebar-container');
    if (!sidebarEl) return;

    let menuItems = '';

    if (user && user.role === 'admin') {
      menuItems = `
        <li class="${activePage === 'dashboard' ? 'active' : ''}"><a href="/admin.html"><i class="bi bi-grid-fill"></i> Dashboard</a></li>
        <li class="${activePage === 'map' ? 'active' : ''}"><a href="/map.html"><i class="bi bi-map-fill"></i> Village Map</a></li>
        <li class="${activePage === 'reports' ? 'active' : ''}"><a href="/reports.html"><i class="bi bi-file-earmark-bar-graph-fill"></i> Reports</a></li>
        <li class="${activePage === 'alerts' ? 'active' : ''}"><a href="/alerts.html"><i class="bi bi-bell-fill"></i> Alerts <span id="sidebar-alert-badge" class="badge bg-danger rounded-pill float-end d-none">0</span></a></li>
      `;
    } else if (user && user.role === 'health_worker') {
      menuItems = `
        <li class="${activePage === 'worker' ? 'active' : ''}"><a href="/worker.html"><i class="bi bi-file-earmark-plus-fill"></i> Submit Report</a></li>
        <li class="${activePage === 'map' ? 'active' : ''}"><a href="/map.html"><i class="bi bi-map-fill"></i> Village Map</a></li>
        <li class="${activePage === 'reports' ? 'active' : ''}"><a href="/reports.html"><i class="bi bi-file-earmark-bar-graph-fill"></i> My Reports</a></li>
        <li class="${activePage === 'alerts' ? 'active' : ''}"><a href="/alerts.html"><i class="bi bi-bell-fill"></i> Alerts</a></li>
      `;
    } else {
      // Public viewer menu
      menuItems = `
        <li class="${activePage === 'public' ? 'active' : ''}"><a href="/public.html"><i class="bi bi-house-door-fill"></i> Home Stats</a></li>
        <li class="${activePage === 'map' ? 'active' : ''}"><a href="/map.html"><i class="bi bi-map-fill"></i> Public Map</a></li>
        <li class="${activePage === 'alerts' ? 'active' : ''}"><a href="/alerts.html"><i class="bi bi-bell-fill"></i> Active Alerts</a></li>
      `;
    }

    const logoutBtn = user 
      ? `<a href="#" onclick="Utils.logout()" class="btn btn-outline-danger w-100"><i class="bi bi-box-arrow-right"></i> Log Out</a>`
      : `<a href="/login.html" class="btn btn-primary w-100"><i class="bi bi-box-arrow-in-right"></i> Staff Login</a>`;

    sidebarEl.innerHTML = `
      <div class="sidebar">
        <div class="brand">
          <i class="bi bi-heart-pulse-fill"></i>
          <span>Health Monitor NE</span>
        </div>
        <ul class="sidebar-menu">
          ${menuItems}
        </ul>
        <div class="sidebar-footer">
          <div class="text-muted small mb-2">${user ? `Logged in as: <strong>${user.username}</strong>` : 'Public Mode'}</div>
          ${logoutBtn}
        </div>
      </div>
    `;

    // Fetch alerts count if logged in to show badge
    if (user) {
      this.updateSidebarAlertBadge();
    }
  },

  async updateSidebarAlertBadge() {
    try {
      const res = await fetch('/api/alerts?status=active');
      const data = await res.json();
      if (data.success && data.alerts.length > 0) {
        const badge = document.getElementById('sidebar-alert-badge');
        if (badge) {
          badge.textContent = data.alerts.length;
          badge.classList.remove('d-none');
        }
      }
    } catch (e) {
      console.error(e);
    }
  },

  renderTopBar(user) {
    const topBarEl = document.getElementById('top-bar-container');
    if (!topBarEl) return;

    let greeting = 'Guest User';
    if (user) {
      greeting = user.role === 'admin' ? 'Administrator' : `Health Worker: ${user.name || user.username}`;
    }

    topBarEl.innerHTML = `
      <div class="top-bar">
        <div class="d-flex align-items-center gap-3">
          <button class="btn btn-link text-dark d-lg-none p-0 no-print" onclick="document.querySelector('.sidebar').classList.toggle('show')">
            <i class="bi bi-list fs-3"></i>
          </button>
          <h1>Smart Community Health Monitoring</h1>
        </div>
        <div class="d-flex align-items-center gap-3">
          <span class="badge bg-light text-dark border p-2 d-none d-md-inline-block">
            <i class="bi bi-calendar-event text-primary me-1"></i> ${new Date().toLocaleDateString('en-IN', { dateStyle: 'medium' })}
          </span>
          <div class="dropdown no-print">
            <button class="btn btn-light border dropdown-toggle" type="button" data-bs-toggle="dropdown">
              <i class="bi bi-person-circle text-primary me-1"></i> ${greeting}
            </button>
            <ul class="dropdown-menu dropdown-menu-end shadow border-0 mt-2">
              ${user ? `
                <li><a class="dropdown-item py-2" href="#" onclick="Utils.logout()"><i class="bi bi-box-arrow-right text-danger me-2"></i> Log Out</a></li>
              ` : `
                <li><a class="dropdown-item py-2" href="/login.html"><i class="bi bi-box-arrow-in-right text-primary me-2"></i> Portal Login</a></li>
              `}
            </ul>
          </div>
        </div>
      </div>
    `;
  },

  // Formatting helpers
  formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  },

  // Alert/Toast Notification
  showNotification(message, type = 'success') {
    const container = document.getElementById('notification-container');
    if (!container) {
      const div = document.createElement('div');
      div.id = 'notification-container';
      div.className = 'position-fixed top-0 end-0 p-3 no-print';
      div.style.zIndex = '9999';
      document.body.appendChild(div);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type === 'error' ? 'danger' : type} border-0 show mb-2`;
    toast.role = 'alert';
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">
          <i class="bi ${type === 'danger' || type === 'error' ? 'bi-exclamation-triangle-fill' : 'bi-check-circle-fill'} me-2"></i>
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    `;
    
    document.getElementById('notification-container').appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 4000);
  }
};
