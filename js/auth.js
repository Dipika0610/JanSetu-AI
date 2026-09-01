/**
 * JanSetu Authentication & Registration Controller
 * Handles Citizen OTP verification, Staff provisioning & cross-portal session routing
 */

document.addEventListener('DOMContentLoaded', () => {
  // Mode Pickers
  const btnPickerCitizen = document.getElementById('btnPickerCitizen');
  const btnPickerStaff = document.getElementById('btnPickerStaff');
  const citizenStage = document.getElementById('citizenStage');
  const staffStage = document.getElementById('staffStage');

  // Citizen Wizard Elements
  const citizenStep1 = document.getElementById('citizen-step-1');
  const citizenStep2 = document.getElementById('citizen-step-2');
  const citizenStep3 = document.getElementById('citizen-step-3');
  const btnSendOtp = document.getElementById('btnSendOtp');
  const btnVerifyOtp = document.getElementById('btnVerifyOtp');
  const btnBackToStep1 = document.getElementById('btnBackToStep1');
  const btnResendOtp = document.getElementById('btnResendOtp');
  const btnCompleteRegistration = document.getElementById('btnCompleteRegistration');
  const citizenFullName = document.getElementById('citizenFullName');
  const citizenPhone = document.getElementById('citizenPhone');
  const citizenWardSelect = document.getElementById('citizenWardSelect');
  const citizenEmail = document.getElementById('citizenEmail');
  const otpTargetPhone = document.getElementById('otpTargetPhone');
  const otpTimer = document.getElementById('otpTimer');
  const otpBoxes = document.querySelectorAll('.otp-box');
  const authLangChips = document.querySelectorAll('#authLangGrid .lang-chip');
  const demoCitizenBtn = document.getElementById('demoCitizenBtn');
  const toggleCitizenLoginMode = document.getElementById('toggleCitizenLoginMode');

  // Staff Elements
  const tabStaffLogin = document.getElementById('tabStaffLogin');
  const tabStaffRegister = document.getElementById('tabStaffRegister');
  const staffLoginView = document.getElementById('staffLoginView');
  const staffRegisterView = document.getElementById('staffRegisterView');
  const btnStaffLoginSubmit = document.getElementById('btnStaffLoginSubmit');
  const staffLoginEmail = document.getElementById('staffLoginEmail');
  const demoOfficerKulkarni = document.getElementById('demoOfficerKulkarni');
  const demoOfficerPatil = document.getElementById('demoOfficerPatil');
  const btnCreateStaffAccount = document.getElementById('btnCreateStaffAccount');
  const staffRegName = document.getElementById('staffRegName');
  const staffRegDesignation = document.getElementById('staffRegDesignation');
  const staffRegEmpId = document.getElementById('staffRegEmpId');
  const staffRegEmail = document.getElementById('staffRegEmail');
  const staffRegDept = document.getElementById('staffRegDept');
  const staffRegWard = document.getElementById('staffRegWard');
  const roleOptions = document.querySelectorAll('.role-option');

  let selectedLanguage = 'English';
  let otpInterval;

  // 1. Role Picker Toggle
  btnPickerCitizen.addEventListener('click', () => {
    btnPickerCitizen.classList.add('active');
    btnPickerStaff.classList.remove('active');
    citizenStage.classList.add('active');
    staffStage.classList.remove('active');
  });

  btnPickerStaff.addEventListener('click', () => {
    btnPickerStaff.classList.add('active');
    btnPickerCitizen.classList.remove('active');
    staffStage.classList.add('active');
    citizenStage.classList.remove('active');
  });

  // Auto-switch based on URL query param (e.g. ?role=staff)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('role') === 'staff') {
    btnPickerStaff.click();
  }

  // 2. Citizen Registration Flow
  btnSendOtp.addEventListener('click', () => {
    const name = citizenFullName.value.trim();
    const phone = citizenPhone.value.trim();

    if (!name) {
      showToast('Please enter your full name.', 'warning');
      citizenFullName.focus();
      return;
    }
    if (!phone || phone.length < 8) {
      showToast('Please enter a valid 10-digit mobile number.', 'warning');
      citizenPhone.focus();
      return;
    }

    otpTargetPhone.textContent = `+91 ${phone}`;
    citizenStep1.style.display = 'none';
    citizenStep2.style.display = 'block';
    startOtpCountdown();
    if (otpBoxes[0]) otpBoxes[0].focus();
    showToast(`Verification OTP sent to +91 ${phone}`, 'success');
  });

  btnBackToStep1.addEventListener('click', () => {
    clearInterval(otpInterval);
    citizenStep2.style.display = 'none';
    citizenStep1.style.display = 'block';
  });

  btnResendOtp.addEventListener('click', () => {
    startOtpCountdown();
    showToast('New 4-digit code dispatched via SMS.', 'info');
  });

  // OTP Box Auto-Advance Logic
  otpBoxes.forEach((box, idx) => {
    box.addEventListener('input', (e) => {
      if (box.value.length === 1 && idx < otpBoxes.length - 1) {
        otpBoxes[idx + 1].focus();
      }
    });

    box.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !box.value && idx > 0) {
        otpBoxes[idx - 1].focus();
      }
    });
  });

  function startOtpCountdown() {
    clearInterval(otpInterval);
    let secondsLeft = 252; // 04:12
    otpInterval = setInterval(() => {
      secondsLeft--;
      if (secondsLeft <= 0) {
        clearInterval(otpInterval);
        otpTimer.textContent = 'Code expired';
        return;
      }
      const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
      const secs = String(secondsLeft % 60).padStart(2, '0');
      otpTimer.textContent = `Code expires in ${mins}:${secs}`;
    }, 1000);
  }

  btnVerifyOtp.addEventListener('click', () => {
    let enteredCode = '';
    otpBoxes.forEach(b => enteredCode += b.value);

    // Accept 4 digits or any entered code for seamless test demonstration
    if (enteredCode.length < 4 && enteredCode.length > 0) {
      showToast('Please enter the full 4-digit code.', 'warning');
      return;
    }

    clearInterval(otpInterval);
    citizenStep2.style.display = 'none';
    citizenStep3.style.display = 'block';
    showToast('Phone number verified successfully!', 'success');
  });

  // Language Chips
  authLangChips.forEach(chip => {
    chip.addEventListener('click', () => {
      authLangChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      selectedLanguage = chip.dataset.lang;
    });
  });

  // Complete Registration
  btnCompleteRegistration.addEventListener('click', () => {
    const newUser = {
      id: `usr-cit-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'citizen',
      name: citizenFullName.value.trim() || 'Citizen',
      phone: `+91 ${citizenPhone.value.trim()}`,
      ward: citizenWardSelect.value,
      language: selectedLanguage,
      email: citizenEmail.value.trim() || null
    };

    JanSetuStore.setCurrentUser(newUser);
    showToast(`Welcome, ${newUser.name}! Setting up your civic dashboard...`, 'success');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 800);
  });

  // Direct 1-Click Demo Citizen
  demoCitizenBtn.addEventListener('click', () => {
    JanSetuStore.setCurrentUser(JanSetuStore.DEFAULT_CITIZEN);
    showToast(`Signed in as ${JanSetuStore.DEFAULT_CITIZEN.name}`, 'success');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 600);
  });

  toggleCitizenLoginMode.addEventListener('click', (e) => {
    e.preventDefault();
    demoCitizenBtn.click();
  });

  // 3. Staff Flow Controls
  tabStaffLogin.addEventListener('click', () => {
    tabStaffLogin.style.background = 'var(--card)';
    tabStaffLogin.style.borderColor = 'var(--blue)';
    tabStaffLogin.style.color = 'var(--blue)';
    tabStaffLogin.style.fontWeight = '600';

    tabStaffRegister.style.background = 'var(--paper)';
    tabStaffRegister.style.borderColor = 'var(--line-strong)';
    tabStaffRegister.style.color = 'var(--ink-soft)';
    tabStaffRegister.style.fontWeight = '500';

    staffLoginView.style.display = 'block';
    staffRegisterView.style.display = 'none';
  });

  tabStaffRegister.addEventListener('click', () => {
    tabStaffRegister.style.background = 'var(--card)';
    tabStaffRegister.style.borderColor = 'var(--blue)';
    tabStaffRegister.style.color = 'var(--blue)';
    tabStaffRegister.style.fontWeight = '600';

    tabStaffLogin.style.background = 'var(--paper)';
    tabStaffLogin.style.borderColor = 'var(--line-strong)';
    tabStaffLogin.style.color = 'var(--ink-soft)';
    tabStaffLogin.style.fontWeight = '500';

    staffRegisterView.style.display = 'block';
    staffLoginView.style.display = 'none';
  });

  // Role Option Radio Click
  roleOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      roleOptions.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      const radio = opt.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });

  // Staff Sign In
  btnStaffLoginSubmit.addEventListener('click', () => {
    const email = staffLoginEmail.value.trim();
    const officer = {
      ...JanSetuStore.DEFAULT_OFFICER,
      email: email || JanSetuStore.DEFAULT_OFFICER.email
    };
    JanSetuStore.setCurrentUser(officer);
    showToast(`Authenticated as ${officer.name} (${officer.designation})`, 'success');
    setTimeout(() => {
      window.location.href = 'authority.html';
    }, 700);
  });

  demoOfficerKulkarni.addEventListener('click', () => {
    JanSetuStore.setCurrentUser(JanSetuStore.DEFAULT_OFFICER);
    showToast(`Signed in as S. Kulkarni (Ward Officer)`, 'success');
    setTimeout(() => {
      window.location.href = 'authority.html';
    }, 600);
  });

  demoOfficerPatil.addEventListener('click', () => {
    const patil = {
      id: 'usr-off-202',
      type: 'staff',
      name: 'JE Nilesh Patil',
      designation: 'Junior Engineer (Sanitation)',
      employeeId: 'MCGM-SWM-4190',
      email: 'nilesh.patil@municipalcorp.gov.in',
      department: 'sanitation',
      departmentName: 'Sanitation',
      ward: 'Andheri West',
      role: 'Field officer'
    };
    JanSetuStore.setCurrentUser(patil);
    showToast(`Signed in as JE Nilesh Patil`, 'success');
    setTimeout(() => {
      window.location.href = 'authority.html';
    }, 600);
  });

  // Create Staff Account
  btnCreateStaffAccount.addEventListener('click', () => {
    const name = staffRegName.value.trim();
    const empId = staffRegEmpId.value.trim();
    const email = staffRegEmail.value.trim();
    const dept = staffRegDept.value;
    const ward = staffRegWard.value;
    const checkedRole = document.querySelector('input[name="accessRole"]:checked');
    const role = checkedRole ? checkedRole.value : 'Field officer';

    if (!name || !empId || !email) {
      showToast('Please fill out all mandatory fields marked with *.', 'warning');
      return;
    }

    const newStaff = {
      id: `usr-off-${Math.floor(2000 + Math.random() * 8000)}`,
      type: 'staff',
      name: name,
      designation: staffRegDesignation.value.trim() || 'Officer',
      employeeId: empId,
      email: email,
      department: dept,
      departmentName: staffRegDept.options[staffRegDept.selectedIndex].text,
      ward: ward,
      role: role
    };

    JanSetuStore.setCurrentUser(newStaff);
    showToast(`Staff Account created for ${name}! Redirecting to Command Center...`, 'success');
    setTimeout(() => {
      window.location.href = 'authority.html';
    }, 900);
  });

  // Toast Helper
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
      iconSvg = '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="8"/></svg>';
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
});
