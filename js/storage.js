/**
 * JanSetu Storage & State Manager
 * Shared reactive state and authentication between Citizen Portal & Municipal Dashboard
 */

window.JanSetuStore = (function () {
  const STORAGE_KEY_COMPLAINTS = 'jansetu_complaints_v1';
  const STORAGE_KEY_CLUSTERS = 'jansetu_clusters_v1';
  const STORAGE_KEY_MY_REPORTS = 'jansetu_my_reports_v1';
  const STORAGE_KEY_WARD = 'jansetu_selected_ward';
  const STORAGE_KEY_USER = 'jansetu_active_user_v1';

  // Default seed user if none
  const DEFAULT_CITIZEN = {
    id: 'usr-cit-101',
    type: 'citizen',
    name: 'Karan Malhotra',
    phone: '+91 98201 44520',
    ward: 'Andheri West',
    language: 'English',
    email: 'karan.m@gmail.com'
  };

  const DEFAULT_OFFICER = {
    id: 'usr-off-201',
    type: 'staff',
    name: 'S. Kulkarni',
    designation: 'Ward Officer (Zone 4)',
    employeeId: 'MCGM-ENG-8402',
    email: 's.kulkarni@municipalcorp.gov.in',
    department: 'all',
    departmentName: 'General Administration',
    ward: 'Andheri West',
    role: 'Ward supervisor'
  };

  // Initialize storage with seed data if empty
  function initStore() {
    if (!localStorage.getItem(STORAGE_KEY_COMPLAINTS)) {
      localStorage.setItem(STORAGE_KEY_COMPLAINTS, JSON.stringify(JanSetuData.INITIAL_COMPLAINTS));
    }
    if (!localStorage.getItem(STORAGE_KEY_CLUSTERS)) {
      localStorage.setItem(STORAGE_KEY_CLUSTERS, JSON.stringify(JanSetuData.INITIAL_CLUSTERS));
    }
    if (!localStorage.getItem(STORAGE_KEY_MY_REPORTS)) {
      const citizenSeed = [
        JanSetuData.INITIAL_COMPLAINTS[0],
        JanSetuData.INITIAL_COMPLAINTS[7],
        JanSetuData.INITIAL_COMPLAINTS[6]
      ];
      localStorage.setItem(STORAGE_KEY_MY_REPORTS, JSON.stringify(citizenSeed));
    }
    if (!localStorage.getItem(STORAGE_KEY_USER)) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(DEFAULT_CITIZEN));
    }
  }

  initStore();

  /* ================= Auth Functions ================= */
  function getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_USER)) || DEFAULT_CITIZEN;
    } catch (e) {
      return DEFAULT_CITIZEN;
    }
  }

  function setCurrentUser(user) {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    if (user && user.ward) {
      setSelectedWard(user.ward);
    }
    window.dispatchEvent(new Event('jansetu_auth_changed'));
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY_USER);
    window.location.href = 'auth.html';
  }

  /* ================= Data Functions ================= */
  function getComplaints() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_COMPLAINTS)) || JanSetuData.INITIAL_COMPLAINTS;
    } catch (e) {
      return JanSetuData.INITIAL_COMPLAINTS;
    }
  }

  function saveComplaints(complaints) {
    localStorage.setItem(STORAGE_KEY_COMPLAINTS, JSON.stringify(complaints));
    window.dispatchEvent(new Event('jansetu_data_updated'));
  }

  function getClusters() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_CLUSTERS)) || JanSetuData.INITIAL_CLUSTERS;
    } catch (e) {
      return JanSetuData.INITIAL_CLUSTERS;
    }
  }

  function saveClusters(clusters) {
    localStorage.setItem(STORAGE_KEY_CLUSTERS, JSON.stringify(clusters));
    window.dispatchEvent(new Event('jansetu_data_updated'));
  }

  function getMyReports() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_MY_REPORTS)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveMyReports(reports) {
    localStorage.setItem(STORAGE_KEY_MY_REPORTS, JSON.stringify(reports));
    window.dispatchEvent(new Event('jansetu_data_updated'));
  }

  function getSelectedWard() {
    return localStorage.getItem(STORAGE_KEY_WARD) || 'Andheri West';
  }

  function setSelectedWard(ward) {
    localStorage.setItem(STORAGE_KEY_WARD, ward);
    window.dispatchEvent(new Event('jansetu_ward_changed'));
  }

  /**
   * Submits a fresh citizen complaint
   */
  function submitComplaint(complaintData) {
    const complaints = getComplaints();
    const myReports = getMyReports();
    const activeUser = getCurrentUser();

    const idNumber = 40225 + Math.floor(Math.random() * 80);
    const newId = `GRV-${idNumber}`;

    const newEntry = {
      id: newId,
      title: complaintData.title || (complaintData.description.slice(0, 48) + '...'),
      description: complaintData.description,
      department: complaintData.department || 'sanitation',
      departmentName: complaintData.departmentName || 'Sanitation',
      ward: complaintData.ward || getSelectedWard(),
      wardId: (complaintData.ward || getSelectedWard()).toLowerCase().replace(/\s+/g, '-'),
      location: complaintData.location || 'Near Link Road, Andheri West',
      reportedAt: new Date().toISOString(),
      timeAgo: 'Just now',
      priority: complaintData.priority || 'high',
      priorityScore: complaintData.priorityScore || 85,
      status: 'unassigned',
      assignedTo: null,
      similarCount: complaintData.similarCount || 0,
      clusterId: complaintData.clusterId || null,
      isDuplicate: false,
      photo: complaintData.photo || null,
      upvotes: 1,
      authorName: activeUser ? activeUser.name : 'Citizen'
    };

    complaints.unshift(newEntry);
    saveComplaints(complaints);

    myReports.unshift(newEntry);
    saveMyReports(myReports);

    return newEntry;
  }

  /**
   * Joins an existing duplicate cluster with "+1 Me Too" vote
   */
  function joinExistingCluster(clusterId, complaintData) {
    const complaints = getComplaints();
    const clusters = getClusters();
    const myReports = getMyReports();
    const activeUser = getCurrentUser();

    let targetComplaint = complaints.find(c => c.clusterId === clusterId || c.id === clusterId);
    let targetCluster = clusters.find(c => c.id === clusterId);

    if (targetComplaint) {
      targetComplaint.similarCount = (targetComplaint.similarCount || 1) + 1;
      targetComplaint.upvotes = (targetComplaint.upvotes || 1) + 1;
      targetComplaint.priorityScore = Math.min(targetComplaint.priorityScore + 2, 99);
      if (targetComplaint.priorityScore >= 78) targetComplaint.priority = 'high';
    }

    if (targetCluster) {
      targetCluster.count += 1;
      targetCluster.members.push({
        id: `GRV-${40230 + Math.floor(Math.random() * 50)}`,
        note: 'Citizen joined report via duplicate detection',
        time: 'Just now',
        author: activeUser ? activeUser.name : 'You (Citizen)'
      });
    }

    saveComplaints(complaints);
    saveClusters(clusters);

    if (targetComplaint) {
      const myRef = { ...targetComplaint, timeAgo: 'Just now', isGroupedJoined: true };
      myReports.unshift(myRef);
      saveMyReports(myReports);
    }

    return targetComplaint;
  }

  /**
   * Updates status and officer assignment
   */
  function updateComplaint(id, updates) {
    const complaints = getComplaints();
    const myReports = getMyReports();

    const idx = complaints.findIndex(c => c.id === id);
    if (idx !== -1) {
      complaints[idx] = { ...complaints[idx], ...updates };
      saveComplaints(complaints);
    }

    const myIdx = myReports.findIndex(c => c.id === id);
    if (myIdx !== -1) {
      myReports[myIdx] = { ...myReports[myIdx], ...updates };
      saveMyReports(myReports);
    }

    return complaints[idx];
  }

  /**
   * Merges a duplicate cluster in authority dashboard
   */
  function mergeCluster(clusterId) {
    const clusters = getClusters();
    const cluster = clusters.find(c => c.id === clusterId);
    if (cluster) {
      cluster.isMerged = true;
      saveClusters(clusters);
    }
    return cluster;
  }

  return {
    getCurrentUser,
    setCurrentUser,
    logout,
    DEFAULT_CITIZEN,
    DEFAULT_OFFICER,
    getComplaints,
    saveComplaints,
    getClusters,
    saveClusters,
    getMyReports,
    saveMyReports,
    getSelectedWard,
    setSelectedWard,
    submitComplaint,
    joinExistingCluster,
    updateComplaint,
    mergeCluster
  };
})();
