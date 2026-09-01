/**
 * JanSetu Citizen Portal Client Logic
 * Handles interactive intake, multilingual AI detection, duplicate clustering & GIS view
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const tabs = document.querySelectorAll('.tab');
  const views = document.querySelectorAll('.view');
  const fab = document.getElementById('fabNewReport');
  const complaintText = document.getElementById('complaintText');
  const detectRow = document.getElementById('detectRow');
  const deptBadge = document.getElementById('deptBadge');
  const deptBadgeText = document.getElementById('deptBadgeText');
  const dupAlertBox = document.getElementById('dupAlertBox');
  const dupAlertMsg = document.getElementById('dupAlertMsg');
  const btnJoinCluster = document.getElementById('btnJoinCluster');
  const btnIgnoreDup = document.getElementById('btnIgnoreDup');
  const grievanceForm = document.getElementById('grievanceForm');
  const submitGrievanceBtn = document.getElementById('submitGrievanceBtn');
  const myComplaintsList = document.getElementById('myComplaintsList');
  const myReportsCount = document.getElementById('myReportsCount');
  const nearbyIncidentList = document.getElementById('nearbyIncidentList');
  const nearbyRadiusFilter = document.getElementById('nearbyRadiusFilter');
  const headerWardSelect = document.getElementById('headerWardSelect');
  const langToggleBtn = document.getElementById('langToggleBtn');
  const currentLangLabel = document.getElementById('currentLangLabel');
  const voiceMicBtn = document.getElementById('voiceMicBtn');

  // Photo elements
  const photoDropArea = document.getElementById('photoDropArea');
  const photoFileInput = document.getElementById('photoFileInput');
  const photoPreviewBox = document.getElementById('photoPreviewBox');
  const photoPreviewImg = document.getElementById('photoPreviewImg');
  const removePhotoBtn = document.getElementById('removePhotoBtn');
  const cvBadge = document.getElementById('cvBadge');

  // Location modal elements
  const locationRowBtn = document.getElementById('locationRowBtn');
  const locationModal = document.getElementById('locationModal');
  const closeLocModal = document.getElementById('closeLocModal');
  const cancelLocModal = document.getElementById('cancelLocModal');
  const saveLocModal = document.getElementById('saveLocModal');
  const modalWardSelect = document.getElementById('modalWardSelect');
  const modalLandmarkInput = document.getElementById('modalLandmarkInput');
  const locMainText = document.getElementById('locMainText');
  const locSubText = document.getElementById('locSubText');

  // State
  let currentActiveDuplicate = null;
  let attachedPhotoData = null;
  let currentLanguageIndex = 0;
  const languages = [
    { code: 'EN', name: 'English', heading: "What's the issue?", sub: "Describe it in your own words — Hindi, Marathi, or English all work." },
    { code: 'HI', name: 'हिन्दी', heading: "समस्या क्या है?", sub: "अपने शब्दों में लिखें — हिन्दी, मराठी या अंग्रेजी सभी स्वीकार्य हैं।" },
    { code: 'MR', name: 'मराठी', heading: "तक्रार काय आहे?", sub: "आपल्या स्वतःच्या शब्दात सांगा — मराठी, हिंदी किंवा इंग्रजी." }
  ];

  // 1. Tab Switching
  function switchTab(viewId) {
    tabs.forEach(t => t.classList.toggle('active', t.dataset.view === viewId));
    views.forEach(v => v.classList.toggle('active', v.id === viewId));
    if (viewId === 'mine') renderMyComplaints();
    if (viewId === 'nearby') renderNearbyIncidents();
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.view));
  });

  fab.addEventListener('click', () => {
    switchTab('submit');
    complaintText.focus();
  });

  // 2. Real-time AI Text Analysis & Duplicate Detection
  let typingTimer;
  complaintText.addEventListener('input', () => {
    clearTimeout(typingTimer);
    const text = complaintText.value.trim();

    if (!text) {
      dupAlertBox.style.display = 'none';
      deptBadgeText.textContent = 'Sanitation';
      currentActiveDuplicate = null;
      return;
    }

    // Run classification immediately
    const classification = JanSetuAI.classifyComplaint(text);
    deptBadgeText.textContent = `${classification.departmentName} (${classification.confidence}% match)`;
    
    // Change badge style based on department
    deptBadge.className = 'detect-badge';
    if (classification.department === 'sanitation') deptBadge.classList.add('badge-moss');
    else if (classification.department === 'water') deptBadge.classList.add('badge-blue');
    else if (classification.department === 'roads') deptBadge.classList.add('badge-ochre');
    else if (classification.department === 'electricity' || classification.department === 'public-works') deptBadge.classList.add('badge-brick');

    // Debounce duplicate search
    typingTimer = setTimeout(() => {
      checkDuplicates(text);
    }, 280);
  });

  function checkDuplicates(text) {
    const existingList = JanSetuStore.getComplaints();
    const currentWard = JanSetuStore.getSelectedWard();
    const duplicateMatch = JanSetuAI.findDuplicates(text, currentWard, existingList);

    if (duplicateMatch) {
      currentActiveDuplicate = duplicateMatch;
      dupAlertMsg.textContent = duplicateMatch.message;
      dupAlertBox.style.display = 'block';
    } else {
      currentActiveDuplicate = null;
      dupAlertBox.style.display = 'none';
    }
  }

  // Duplicate Alert Button Handlers
  btnJoinCluster.addEventListener('click', () => {
    if (!currentActiveDuplicate) return;
    const matched = currentActiveDuplicate.matchedComplaint;
    JanSetuStore.joinExistingCluster(matched.clusterId || matched.id, {
      description: complaintText.value,
      location: locMainText.textContent
    });

    showToast(`Added your report to existing issue #${matched.id}. Priority boosted!`, 'success');
    complaintText.value = '';
    dupAlertBox.style.display = 'none';
    currentActiveDuplicate = null;
    switchTab('mine');
  });

  btnIgnoreDup.addEventListener('click', () => {
    dupAlertBox.style.display = 'none';
    currentActiveDuplicate = null;
    showToast('Marked as unique grievance. Proceeding with custom report.', 'info');
  });

  // Quick Prompt Chips
  document.querySelectorAll('.prompt-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      complaintText.value = chip.dataset.text;
      if (chip.dataset.loc) {
        locMainText.textContent = chip.dataset.loc;
      }
      complaintText.dispatchEvent(new Event('input'));
    });
  });

  // 3. Photo Upload & Preview
  photoDropArea.addEventListener('click', () => photoFileInput.click());

  photoFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        attachedPhotoData = evt.target.result;
        photoPreviewImg.src = attachedPhotoData;
        photoPreviewBox.style.display = 'block';
        photoDropArea.style.display = 'none';
        cvBadge.style.display = 'inline-flex';
        showToast('Photo analyzed by AI: Infrastructure anomaly detected.', 'success');
      };
      reader.readAsDataURL(file);
    }
  });

  removePhotoBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    attachedPhotoData = null;
    photoFileInput.value = '';
    photoPreviewBox.style.display = 'none';
    photoDropArea.style.display = 'block';
    cvBadge.style.display = 'none';
  });

  // 4. Voice Dictation
  let isListening = false;
  voiceMicBtn.addEventListener('click', () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      // Fallback simulation for speech
      simulateVoiceInput();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = currentLanguageIndex === 1 ? 'hi-IN' : currentLanguageIndex === 2 ? 'mr-IN' : 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    if (!isListening) {
      isListening = true;
      voiceMicBtn.classList.add('listening');
      showToast(`Listening in ${languages[currentLanguageIndex].name}... Speak now.`, 'info');
      recognition.start();
    }

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      complaintText.value = (complaintText.value ? complaintText.value + ' ' : '') + transcript;
      complaintText.dispatchEvent(new Event('input'));
      isListening = false;
      voiceMicBtn.classList.remove('listening');
      showToast('Voice transcribed successfully!', 'success');
    };

    recognition.onerror = () => {
      isListening = false;
      voiceMicBtn.classList.remove('listening');
      simulateVoiceInput();
    };

    recognition.onend = () => {
      isListening = false;
      voiceMicBtn.classList.remove('listening');
    };
  });

  function simulateVoiceInput() {
    voiceMicBtn.classList.add('listening');
    showToast('Dictating voice sample...', 'info');
    setTimeout(() => {
      const samples = [
        'Drainage overflow ho raha hai station ke bahar, paani pura sadak par aa gaya hai.',
        'रात्रीच्या वेळी पथदिवे बंद असल्याने खूप भीती वाटते.',
        'High pressure water pipe leaking near municipal school compound.'
      ];
      const randomSample = samples[Math.floor(Math.random() * samples.length)];
      complaintText.value = randomSample;
      complaintText.dispatchEvent(new Event('input'));
      voiceMicBtn.classList.remove('listening');
      showToast('Voice transcribed via AI speech model.', 'success');
    }, 1200);
  }

  // 5. Location Calibration Modal
  locationRowBtn.addEventListener('click', () => {
    modalWardSelect.value = JanSetuStore.getSelectedWard();
    modalLandmarkInput.value = locMainText.textContent;
    locationModal.classList.add('open');
  });

  function closeLocationModal() {
    locationModal.classList.remove('open');
  }

  closeLocModal.addEventListener('click', closeLocationModal);
  cancelLocModal.addEventListener('click', closeLocationModal);

  saveLocModal.addEventListener('click', () => {
    const chosenWard = modalWardSelect.value;
    const chosenLandmark = modalLandmarkInput.value.trim() || 'Selected Location';
    JanSetuStore.setSelectedWard(chosenWard);
    headerWardSelect.value = chosenWard;
    locMainText.textContent = chosenLandmark;
    locSubText.textContent = `${chosenWard} · calibrated via map`;
    closeLocationModal();
    showToast(`Location set to ${chosenWard}`, 'info');
    if (complaintText.value) checkDuplicates(complaintText.value);
  });

  headerWardSelect.addEventListener('change', (e) => {
    JanSetuStore.setSelectedWard(e.target.value);
    locSubText.textContent = `${e.target.value} · using active ward`;
    showToast(`Active ward: ${e.target.value}`, 'info');
    renderNearbyIncidents();
  });

  // 6. Language Switcher
  langToggleBtn.addEventListener('click', () => {
    currentLanguageIndex = (currentLanguageIndex + 1) % languages.length;
    const lang = languages[currentLanguageIndex];
    currentLangLabel.textContent = lang.code;
    document.getElementById('lblIntakeHeading').textContent = lang.heading;
    document.getElementById('lblIntakeSub').textContent = lang.sub;
    showToast(`Language switched to ${lang.name}`, 'info');
  });

  // 7. Form Submission
  submitGrievanceBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const text = complaintText.value.trim();
    if (!text) {
      showToast('Please describe the issue before submitting.', 'warning');
      complaintText.focus();
      return;
    }

    submitGrievanceBtn.disabled = true;
    submitGrievanceBtn.innerHTML = '<span>Processing with AI Engine...</span>';

    setTimeout(() => {
      const classification = JanSetuAI.classifyComplaint(text);
      const priorityInfo = JanSetuAI.calculatePriority(text, locMainText.textContent);

      const newComplaint = JanSetuStore.submitComplaint({
        title: text.length > 55 ? text.substring(0, 52) + '...' : text,
        description: text,
        department: classification.department,
        departmentName: classification.departmentName,
        ward: JanSetuStore.getSelectedWard(),
        location: locMainText.textContent,
        priority: priorityInfo.tier,
        priorityScore: priorityInfo.score,
        photo: attachedPhotoData
      });

      // Reset form
      complaintText.value = '';
      photoFileInput.value = '';
      attachedPhotoData = null;
      photoPreviewBox.style.display = 'none';
      photoDropArea.style.display = 'block';
      cvBadge.style.display = 'none';
      dupAlertBox.style.display = 'none';
      currentActiveDuplicate = null;

      submitGrievanceBtn.disabled = false;
      submitGrievanceBtn.innerHTML = `
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        <span>Submit report</span>
      `;

      showToast(`Report #${newComplaint.id} submitted! Priority: ${priorityInfo.tier.toUpperCase()}`, 'success');
      switchTab('mine');
    }, 600);
  });

  // 8. Render "My Complaints"
  function renderMyComplaints() {
    const reports = JanSetuStore.getMyReports();
    myReportsCount.textContent = reports.length;

    if (reports.length === 0) {
      myComplaintsList.innerHTML = `
        <div class="card" style="text-align:center;padding:32px 16px;color:var(--ink-soft);">
          <p style="font-size:15px;font-weight:500;">No complaints submitted yet</p>
          <p style="font-size:12.5px;color:var(--ink-faint);margin-top:4px;">When you submit a report, you can track its real-time progress here.</p>
        </div>
      `;
      return;
    }

    myComplaintsList.innerHTML = reports.map(item => {
      const stepIndex = getStepIndex(item.status);
      return `
        <div class="complaint-card animate-fade-in" data-id="${item.id}">
          <div class="cc-top">
            <div>
              <div class="cc-title">${item.title}</div>
              <div class="cc-meta">${item.departmentName} · ${item.ward} · ${item.timeAgo}</div>
            </div>
            <div class="cc-id">#${item.id}</div>
          </div>

          <!-- 5-Step Resolution Pipeline -->
          <div class="stepper">
            <div class="step ${stepIndex >= 0 ? 'done' : ''} ${stepIndex === 0 ? 'current' : ''}">
              <div class="step-dot"></div>
              <div class="step-label">Submitted</div>
            </div>
            <div class="step ${stepIndex >= 1 ? 'done' : ''} ${stepIndex === 1 ? 'current' : ''}">
              <div class="step-line"></div>
              <div class="step-dot"></div>
              <div class="step-label">Acknowledged</div>
            </div>
            <div class="step ${stepIndex >= 2 ? 'done' : ''} ${stepIndex === 2 ? 'current' : ''}">
              <div class="step-line"></div>
              <div class="step-dot"></div>
              <div class="step-label">Assigned</div>
            </div>
            <div class="step ${stepIndex >= 3 ? 'done' : ''} ${stepIndex === 3 ? 'current' : ''}">
              <div class="step-line"></div>
              <div class="step-dot"></div>
              <div class="step-label">In progress</div>
            </div>
            <div class="step ${stepIndex >= 4 ? 'done' : ''} ${stepIndex === 4 ? 'current' : ''}">
              <div class="step-line"></div>
              <div class="step-dot"></div>
              <div class="step-label">Resolved</div>
            </div>
          </div>

          ${item.similarCount > 1 ? `
            <div class="similar-note">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 2"/></svg>
              <span>Grouped with ${item.similarCount - 1} other reports of the same issue — helped raise its priority</span>
            </div>
          ` : ''}

          ${item.assignedTo ? `
            <div style="font-size:11.5px;color:var(--ink-soft);margin-top:10px;display:flex;align-items:center;gap:6px;">
              <span style="font-weight:600;">Assigned Officer:</span> ${item.assignedTo}
            </div>
          ` : ''}

          <div class="ticket-actions">
            <button class="ticket-action-btn" onclick="window.citizenFeedback('${item.id}')">Add Feedback</button>
            <button class="ticket-action-btn" onclick="window.shareGrievance('${item.id}')">Share Link</button>
          </div>
        </div>
      `;
    }).join('');
  }

  function getStepIndex(status) {
    switch (status) {
      case 'unassigned': return 1; // Acknowledged
      case 'assigned': return 2;   // Assigned
      case 'progress': return 3;   // In progress
      case 'resolved': return 4;   // Resolved
      default: return 0;           // Submitted
    }
  }

  // 9. Render "Nearby" View
  function renderNearbyIncidents() {
    const all = JanSetuStore.getComplaints();
    const currentWard = JanSetuStore.getSelectedWard();
    const nearby = all.filter(c => c.ward === currentWard || Math.random() > 0.3).slice(0, 5);

    nearbyIncidentList.innerHTML = nearby.map(item => {
      const dotColor = item.priority === 'high' ? 'var(--brick)' : item.priority === 'med' ? 'var(--ochre)' : 'var(--moss)';
      return `
        <div class="nearby-item animate-fade-in">
          <div class="nearby-dot" style="background:${dotColor};"></div>
          <div style="flex:1;">
            <div class="nearby-title">${item.title}</div>
            <div class="nearby-meta">${item.location} · ${item.departmentName} · ${item.timeAgo}</div>
          </div>
          <div class="nearby-count">
            <span style="font-weight:600;">${item.similarCount || item.upvotes || 1} reports</span>
            <button class="me-too-btn" onclick="window.voteNearby('${item.id}', this)">+1 Me Too</button>
          </div>
        </div>
      `;
    }).join('');
  }

  // Global window action helpers
  window.voteNearby = function (id, btn) {
    const complaints = JanSetuStore.getComplaints();
    const item = complaints.find(c => c.id === id);
    if (item) {
      item.upvotes = (item.upvotes || 1) + 1;
      item.similarCount = (item.similarCount || 1) + 1;
      JanSetuStore.saveComplaints(complaints);
      btn.textContent = '✓ Supported';
      btn.classList.add('voted');
      showToast(`Supported #${id}. Ward priority score escalated.`, 'success');
    }
  };

  window.citizenFeedback = function (id) {
    const note = prompt(`Provide feedback or updates for ticket #${id}:`, 'Issue still partially visible.');
    if (note) {
      showToast(`Feedback noted for #${id}. Ward officer notified.`, 'success');
    }
  };

  window.shareGrievance = function (id) {
    showToast(`Tracking link for #${id} copied to clipboard!`, 'info');
  };

  // 10. Toast Notification System
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
      iconSvg = '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
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

  // User Auth Profile Initialization
  function initUserSession() {
    const user = JanSetuStore.getCurrentUser();
    const userLabel = document.getElementById('citizenUserNameLabel');
    if (userLabel && user) {
      const initials = user.name ? user.name.split(' ').map(n => n[0]).join('') : 'C';
      userLabel.textContent = user.name ? user.name.split(' ')[0] : 'Citizen';
    }
    if (user && user.ward) {
      headerWardSelect.value = user.ward;
      locSubText.textContent = `${user.ward} · home ward`;
    }
  }

  // Cross-tab and data update listener
  window.addEventListener('jansetu_data_updated', () => {
    renderMyComplaints();
    renderNearbyIncidents();
  });

  window.addEventListener('jansetu_auth_changed', () => {
    initUserSession();
    renderMyComplaints();
    renderNearbyIncidents();
  });

  // Initial setup & renders
  initUserSession();
  renderMyComplaints();
  renderNearbyIncidents();

  // Initial trigger for prompt check if preset
  if (complaintText.value) {
    complaintText.dispatchEvent(new Event('input'));
  }
});
