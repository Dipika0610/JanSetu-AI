/**
 * JanSetu Municipal Authority Dashboard Controller
 * Queue management, AI severity ranking, duplicate cluster merging & GIS filtering
 * Fully optimized for both Desktop and Mobile / Tablet devices
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const queueTableBody = document.getElementById('queueTableBody');
  const queueSearchInput = document.getElementById('queueSearchInput');
  const wardFilterSelect = document.getElementById('wardFilterSelect');
  const deptChipsFilter = document.getElementById('deptChipsFilter');
  const duplicateClustersList = document.getElementById('duplicateClustersList');
  const queueTotalBadge = document.getElementById('queueTotalBadge');
  const navQueueCount = document.getElementById('navQueueCount');
  const navClustersCount = document.getElementById('navClustersCount');
  const mobileQueueBadge = document.getElementById('mobileQueueBadge');
  const metricNewCount = document.getElementById('metricNewCount');
  const metricHighCount = document.getElementById('metricHighCount');
  const metricMergedCount = document.getElementById('metricMergedCount');
  const navItems = document.querySelectorAll('.sidebar .nav-item[data-section]');
  
  // Mobile Drawer Elements
  const sidebar = document.getElementById('sidebar');
  const menuToggleBtn = document.getElementById('menuToggleBtn');
  const closeSidebarBtn = document.getElementById('closeSidebarBtn');
  const sidebarBackdrop = document.getElementById('sidebarBackdrop');
  const mobileNavBtns = document.querySelectorAll('.mobile-nav-btn[data-nav]');

  // Modal Elements
  const grievanceDetailModal = document.getElementById('grievanceDetailModal');
  const modalGrievanceTitle = document.getElementById('modalGrievanceTitle');
  const modalGrievanceId = document.getElementById('modalGrievanceId');
  const modalDescription = document.getElementById('modalDescription');
  const modalLocation = document.getElementById('modalLocation');
  const modalPriorityBadge = document.getElementById('modalPriorityBadge');
  const modalPhotoContainer = document.getElementById('modalPhotoContainer');
  const modalPhotoImg = document.getElementById('modalPhotoImg');
  const assignOfficerSelect = document.getElementById('assignOfficerSelect');
  const updateStatusSelect = document.getElementById('updateStatusSelect');
  const officerActionNotes = document.getElementById('officerActionNotes');
  const closeDetailModal = document.getElementById('closeDetailModal');
  const cancelDetailModal = document.getElementById('cancelDetailModal');
  const saveGrievanceActionBtn = document.getElementById('saveGrievanceActionBtn');

  // Filter State
  let activeDept = 'all';
  let activeWard = 'all';
  let searchQuery = '';
  let activeEditingComplaint = null;

  // 1. Mobile Drawer Navigation Toggle
  function openMobileSidebar() {
    sidebar.classList.add('open');
    sidebarBackdrop.classList.add('open');
  }

  function closeMobileSidebar() {
    sidebar.classList.remove('open');
    sidebarBackdrop.classList.remove('open');
  }

  if (menuToggleBtn) menuToggleBtn.addEventListener('click', openMobileSidebar);
  if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', closeMobileSidebar);
  if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeMobileSidebar);

  // 2. Sidebar & Mobile Bottom Nav Switching
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      const section = item.dataset.section;
      closeMobileSidebar();
      scrollToSection(section);
    });
  });

  mobileNavBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      mobileNavBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.dataset.nav;
      scrollToSection(target);
    });
  });

  function scrollToSection(section) {
    if (section === 'clusters') {
      const el = document.getElementById('duplicateClustersPanel');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (section === 'map') {
      const el = document.getElementById('hotspotMapPanel');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      const el = document.getElementById('priorityQueuePanel');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // 3. Department Filter Chips
  deptChipsFilter.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    activeDept = chip.dataset.dept;
    renderPriorityQueue();
  });

  // 4. Search & Ward Filter Listeners
  queueSearchInput.addEventListener('input', () => {
    searchQuery = queueSearchInput.value.trim().toLowerCase();
    renderPriorityQueue();
  });

  wardFilterSelect.addEventListener('change', () => {
    activeWard = wardFilterSelect.value;
    renderPriorityQueue();
  });

  // 5. Render Priority Queue Table (Responsive on Mobile and Desktop)
  function renderPriorityQueue() {
    let complaints = JanSetuStore.getComplaints();

    // Sort descending by priority score
    complaints.sort((a, b) => (b.priorityScore || 50) - (a.priorityScore || 50));

    // Filter by department
    if (activeDept !== 'all') {
      complaints = complaints.filter(c => c.department === activeDept);
    }

    // Filter by ward
    if (activeWard !== 'all') {
      complaints = complaints.filter(c => c.ward && c.ward.toLowerCase() === activeWard.toLowerCase());
    }

    // Filter by search query
    if (searchQuery) {
      complaints = complaints.filter(c => 
        (c.title && c.title.toLowerCase().includes(searchQuery)) ||
        (c.description && c.description.toLowerCase().includes(searchQuery)) ||
        (c.id && c.id.toLowerCase().includes(searchQuery)) ||
        (c.ward && c.ward.toLowerCase().includes(searchQuery)) ||
        (c.departmentName && c.departmentName.toLowerCase().includes(searchQuery))
      );
    }

    // Update Badges & Counters
    queueTotalBadge.textContent = `${complaints.length} active items`;
    if (mobileQueueBadge) mobileQueueBadge.textContent = complaints.length;
    navQueueCount.textContent = JanSetuStore.getComplaints().length;
    metricHighCount.textContent = JanSetuStore.getComplaints().filter(c => c.priority === 'high' && c.status !== 'resolved').length;

    if (complaints.length === 0) {
      queueTableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center;padding:28px;color:var(--ink-faint);">
            No complaints found matching the current filters.
          </td>
        </tr>
      `;
      return;
    }

    const isMobile = window.innerWidth <= 580;

    queueTableBody.innerHTML = complaints.map(item => {
      const prioClass = item.priority === 'high' ? 'prio-high' : item.priority === 'med' ? 'prio-med' : 'prio-low';
      const statusPillClass = getStatusPillClass(item.status);
      const statusLabel = getStatusLabel(item.status);
      const similarBadge = item.similarCount > 0 
        ? `<span class="similar-badge">${item.similarCount} similar</span>`
        : `<span class="similar-badge none">No matches</span>`;

      if (isMobile) {
        // Mobile-friendly card row
        return `
          <tr class="${prioClass} animate-fade-in" data-id="${item.id}" onclick="window.openGrievanceModal('${item.id}')">
            <td>
              <div class="complaint-title">
                <span class="prio-dot"></span>
                <span>${item.title}</span>
              </div>
              <div class="complaint-meta">${item.departmentName} · #${item.id}</div>
              <div class="mobile-row-footer">
                <span class="ward-text" style="font-size:11.5px;">📍 ${item.ward} · ${item.timeAgo || 'Recent'}</span>
                <div style="display:flex;align-items:center;gap:6px;">
                  ${similarBadge}
                  <span class="status-pill ${statusPillClass}">${statusLabel}</span>
                </div>
              </div>
            </td>
          </tr>
        `;
      }

      // Desktop table row
      return `
        <tr class="${prioClass} animate-fade-in" data-id="${item.id}" onclick="window.openGrievanceModal('${item.id}')">
          <td>
            <div class="complaint-title">
              <span class="prio-dot" title="Priority Score: ${item.priorityScore || 50}/100"></span>
              <span>${item.title}</span>
            </div>
            <div class="complaint-meta">${item.departmentName} · #${item.id}</div>
          </td>
          <td class="ward-text">${item.ward}</td>
          <td class="age-text">${item.timeAgo || 'Recent'}</td>
          <td>${similarBadge}</td>
          <td><span class="status-pill ${statusPillClass}">${statusLabel}</span></td>
        </tr>
      `;
    }).join('');
  }

  function getStatusPillClass(status) {
    switch (status) {
      case 'unassigned': return 'status-unassigned';
      case 'assigned': return 'status-assigned';
      case 'progress': return 'status-progress';
      case 'resolved': return 'status-resolved';
      default: return 'status-unassigned';
    }
  }

  function getStatusLabel(status) {
    switch (status) {
      case 'unassigned': return 'Unassigned';
      case 'assigned': return 'Assigned';
      case 'progress': return 'In progress';
      case 'resolved': return 'Resolved';
      default: return 'Unassigned';
    }
  }

  // 6. Render Duplicate Clusters Panel
  function renderDuplicateClusters() {
    const clusters = JanSetuStore.getClusters();
    navClustersCount.textContent = clusters.length;

    duplicateClustersList.innerHTML = clusters.map(cluster => {
      return `
        <div class="cluster ${cluster.isMerged ? 'merged-cluster' : ''}" data-cluster-id="${cluster.id}">
          <div class="cluster-top" onclick="this.parentElement.classList.toggle('open')">
            <div>
              <div class="cluster-title">${cluster.title}</div>
              <div class="cluster-sub">${cluster.ward} · ${cluster.departmentName} · ${cluster.similarityScore}% similarity</div>
            </div>
            <div class="cluster-count">
              ${cluster.count}
              <span class="cluster-count-label">reports</span>
            </div>
          </div>
          
          <div class="sim-bar">
            <div class="sim-bar-fill" style="width: ${cluster.similarityScore}%;"></div>
          </div>

          <div class="cluster-members">
            ${cluster.members.map(m => `
              <div class="cluster-member">
                <span>#${m.id} · ${m.note}</span>
                <span style="color:var(--ink-faint);">${m.time}</span>
              </div>
            `).join('')}

            <button class="merge-btn ${cluster.isMerged ? 'merged' : ''}" onclick="window.mergeClusterAction('${cluster.id}', this)">
              ${cluster.isMerged ? '✓ Merged & Dispatched' : 'Confirm Merge &amp; Assign to Team'}
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // 7. Modal Open & Save Actions
  window.openGrievanceModal = function (id) {
    const complaints = JanSetuStore.getComplaints();
    const item = complaints.find(c => c.id === id);
    if (!item) return;

    activeEditingComplaint = item;
    modalGrievanceTitle.textContent = item.title;
    modalGrievanceId.textContent = `#${item.id}`;
    modalDescription.textContent = item.description;
    modalLocation.textContent = `${item.location} (${item.ward})`;

    modalPriorityBadge.textContent = `Score: ${item.priorityScore || 60} / 100 (${(item.priority || 'med').toUpperCase()})`;
    modalPriorityBadge.className = `badge ${item.priority === 'high' ? 'badge-brick' : item.priority === 'med' ? 'badge-ochre' : 'badge-moss'}`;

    if (item.photo) {
      modalPhotoImg.src = item.photo;
      modalPhotoContainer.style.display = 'block';
    } else {
      modalPhotoContainer.style.display = 'none';
    }

    assignOfficerSelect.value = item.assignedTo || '';
    updateStatusSelect.value = item.status || 'unassigned';
    officerActionNotes.value = item.notes || '';

    grievanceDetailModal.classList.add('open');
  };

  function closeGrievanceModal() {
    grievanceDetailModal.classList.remove('open');
    activeEditingComplaint = null;
  }

  closeDetailModal.addEventListener('click', closeGrievanceModal);
  cancelDetailModal.addEventListener('click', closeGrievanceModal);

  saveGrievanceActionBtn.addEventListener('click', () => {
    if (!activeEditingComplaint) return;

    const assignedOfficer = assignOfficerSelect.value;
    const newStatus = updateStatusSelect.value;
    const notes = officerActionNotes.value.trim();

    JanSetuStore.updateComplaint(activeEditingComplaint.id, {
      assignedTo: assignedOfficer || null,
      status: newStatus,
      notes: notes || null
    });

    closeGrievanceModal();
    renderPriorityQueue();
    showToast(`Updated #${activeEditingComplaint.id} → Status: ${newStatus.toUpperCase()}`, 'success');
  });

  // 8. Cluster Merge Action
  window.mergeClusterAction = function (clusterId, btn) {
    JanSetuStore.mergeCluster(clusterId);
    btn.textContent = '✓ Merged & Dispatched';
    btn.classList.add('merged');
    metricMergedCount.textContent = '613';
    showToast(`Cluster ${clusterId} merged! Citizens notified.`, 'success');
  };

  // 9. Hotspot GIS Map Filter
  document.querySelectorAll('.map-node').forEach(node => {
    node.addEventListener('click', () => {
      const ward = node.dataset.ward;
      wardFilterSelect.value = ward;
      activeWard = ward;
      renderPriorityQueue();
      showToast(`Filtered queue to ${ward}`, 'info');
      scrollToSection('queue');
    });
  });

  // 10. Toast Helper
  function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconSvg = '';
    if (type === 'success') {
      iconSvg = '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';
    } else if (type === 'warning') {
      iconSvg = '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
    } else {
      iconSvg = '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
    }

    toast.innerHTML = `${iconSvg}<span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  }

  // Staff Officer Session Initialization
  function initOfficerSession() {
    const user = JanSetuStore.getCurrentUser();
    const nameEl = document.getElementById('officerNameSidebar');
    const roleEl = document.getElementById('officerRoleSidebar');
    const avatarEl = document.getElementById('officerAvatarBadge');

    if (user && user.type === 'staff') {
      if (nameEl) nameEl.textContent = user.name;
      if (roleEl) roleEl.textContent = `${user.designation || 'Officer'} · ${user.ward || 'Mumbai'}`;
      if (avatarEl) {
        const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'OF';
        avatarEl.textContent = initials;
        avatarEl.title = `${user.name} (${user.designation || 'Officer'})`;
      }
      if (user.ward && user.ward !== 'All' && user.role === 'Field officer') {
        wardFilterSelect.value = user.ward;
        activeWard = user.ward;
      }
    }
  }

  // Cross-tab reactive listener & window resize listener
  window.addEventListener('jansetu_data_updated', () => {
    renderPriorityQueue();
    renderDuplicateClusters();
  });

  window.addEventListener('jansetu_auth_changed', () => {
    initOfficerSession();
    renderPriorityQueue();
    renderDuplicateClusters();
  });

  window.addEventListener('resize', () => {
    renderPriorityQueue();
  });

  // Initial setup & renders
  initOfficerSession();
  renderPriorityQueue();
  renderDuplicateClusters();
});
