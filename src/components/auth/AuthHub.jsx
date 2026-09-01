import React, { useState, useEffect } from 'react';
import { useAuth, DEFAULT_CITIZEN, DEFAULT_OFFICER } from '../../context/AuthContext';
import { useGrievances } from '../../context/GrievanceContext';
import { WARDS } from '../../data/mockData';
import { User, Shield, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export const AuthHub = ({ onAuthenticated }) => {
  const { loginCitizen, loginStaff } = useAuth();
  const { showToast } = useGrievances();

  const [roleMode, setRoleMode] = useState('citizen'); // 'citizen' | 'staff'
  const [citizenStep, setCitizenStep] = useState(1);
  const [staffTab, setStaffTab] = useState('login'); // 'login' | 'register'

  // Citizen Form State
  const [citizenName, setCitizenName] = useState('Karan Malhotra');
  const [citizenPhone, setCitizenPhone] = useState('98201 44520');
  const [citizenWard, setCitizenWard] = useState('Andheri West');
  const [citizenLang, setCitizenLang] = useState('English');
  const [citizenEmail, setCitizenEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState(['1', '2', '3', '4']);
  const [otpSeconds, setOtpSeconds] = useState(252);

  // Staff Form State
  const [staffEmail, setStaffEmail] = useState('s.kulkarni@municipalcorp.gov.in');
  const [staffName, setStaffName] = useState('Anand Deshmukh');
  const [staffEmpId, setStaffEmpId] = useState('MCGM-ENG-9102');
  const [staffDept, setStaffDept] = useState('sanitation');
  const [staffWard, setStaffWard] = useState('Andheri West');
  const [staffRole, setStaffRole] = useState('Field officer');

  // OTP Countdown timer
  useEffect(() => {
    if (citizenStep !== 2) return;
    const interval = setInterval(() => {
      setOtpSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [citizenStep]);

  const handleOtpChange = (index, value) => {
    const updated = [...otpDigits];
    updated[index] = value.slice(-1);
    setOtpDigits(updated);

    // Auto advance focus
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-box-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleCompleteCitizenReg = () => {
    const user = loginCitizen({
      name: citizenName,
      phone: `+91 ${citizenPhone}`,
      ward: citizenWard,
      language: citizenLang,
      email: citizenEmail
    });
    showToast(`Welcome, ${user.name}! Account registered.`, 'success');
    onAuthenticated('citizen');
  };

  const handleStaffLogin = () => {
    const officer = loginStaff({
      email: staffEmail,
      name: staffEmail.includes('kulkarni') ? 'S. Kulkarni' : 'JE Nilesh Patil',
      designation: staffEmail.includes('kulkarni') ? 'Ward Executive Officer' : 'Junior Engineer (Sanitation)'
    });
    showToast(`Signed in as ${officer.name} (${officer.designation})`, 'success');
    onAuthenticated('authority');
  };

  const handleStaffRegister = () => {
    const newOfficer = loginStaff({
      name: staffName,
      employeeId: staffEmpId,
      email: `${staffName.toLowerCase().replace(/\s+/g, '.')}@municipalcorp.gov.in`,
      department: staffDept,
      ward: staffWard,
      role: staffRole,
      designation: staffRole === 'Admin' ? 'Zonal Administrator' : staffRole === 'Ward supervisor' ? 'Ward Supervisor' : 'Field Officer'
    });
    showToast(`Staff Account created for ${newOfficer.name}! Entering Command Center...`, 'success');
    onAuthenticated('authority');
  };

  return (
    <div className="auth-container animate-fade-in" style={{ padding: '16px 0' }}>
      {/* Role Picker */}
      <div className="picker">
        <button
          type="button"
          className={`picker-btn ${roleMode === 'citizen' ? 'active' : ''}`}
          onClick={() => setRoleMode('citizen')}
        >
          <User size={15} />
          <span>Citizen Access</span>
        </button>
        <button
          type="button"
          className={`picker-btn ${roleMode === 'staff' ? 'active' : ''}`}
          onClick={() => setRoleMode('staff')}
        >
          <Shield size={15} />
          <span>Municipal Staff</span>
        </button>
      </div>

      {/* ================= CITIZEN FLOW ================= */}
      {roleMode === 'citizen' && (
        <div className="stage active">
          <div className="lockup">
            <div className="mark">G</div>
            <div>
              <div className="name">JanSetu Citizen Portal</div>
              <div className="sub">Municipal Corporation · Mumbai</div>
            </div>
          </div>

          {/* Step 1: Name & Phone */}
          {citizenStep === 1 && (
            <div className="animate-fade-in">
              <div className="progress"><i className="current"></i><i></i><i></i></div>
              <h1>Let's get you registered</h1>
              <p className="lede">Just your phone number to start — you'll verify it with a one-time code.</p>

              <div className="card">
                <div className="field">
                  <label>Full name <span className="req">*</span></label>
                  <input
                    type="text"
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    placeholder="As you'd like it to appear on complaints"
                  />
                </div>
                <div className="field">
                  <label>Mobile number <span className="req">*</span></label>
                  <div className="phone-row">
                    <input type="text" className="cc" value="+91" readOnly />
                    <input
                      type="tel"
                      value={citizenPhone}
                      onChange={(e) => setCitizenPhone(e.target.value)}
                      placeholder="98765 43210"
                    />
                  </div>
                  <div className="field-hint">Used to sign in and send live status updates via SMS.</div>
                </div>

                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    if (!citizenName || !citizenPhone) {
                      showToast('Please enter your name and phone number.', 'warning');
                      return;
                    }
                    setCitizenStep(2);
                    showToast(`OTP dispatched to +91 ${citizenPhone}`, 'info');
                  }}
                >
                  <span>Send verification code</span>
                  <ArrowRight size={16} />
                </button>
              </div>

              {/* 1-Click Demo Citizen Login */}
              <div className="demo-accounts">
                <div className="demo-title">⚡ 1-Click Quick Demo Login</div>
                <div className="demo-btn-group">
                  <button
                    type="button"
                    className="demo-btn"
                    onClick={() => {
                      loginCitizen(DEFAULT_CITIZEN);
                      showToast(`Signed in as ${DEFAULT_CITIZEN.name}`, 'success');
                      onAuthenticated('citizen');
                    }}
                  >
                    Log in as Karan M. (Citizen)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: 4-Digit OTP */}
          {citizenStep === 2 && (
            <div className="animate-fade-in">
              <div className="progress"><i className="done"></i><i className="current"></i><i></i></div>
              <h1>Enter the code</h1>
              <p className="lede">We've sent a 4-digit code by SMS to <strong>+91 {citizenPhone}</strong>.</p>

              <div className="card">
                <div className="field">
                  <label>Verification code</label>
                  <div className="otp-row">
                    {[0, 1, 2, 3].map(idx => (
                      <input
                        key={idx}
                        id={`otp-box-${idx}`}
                        className="otp-box"
                        maxLength="1"
                        value={otpDigits[idx] || ''}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                      />
                    ))}
                  </div>
                  <div className="otp-meta">
                    <span className="timer">
                      Code expires in {String(Math.floor(otpSeconds / 60)).padStart(2, '0')}:{String(otpSeconds % 60).padStart(2, '0')}
                    </span>
                    <span
                      className="resend"
                      onClick={() => {
                        setOtpSeconds(252);
                        showToast('New 4-digit code dispatched via SMS.', 'info');
                      }}
                    >
                      Resend code
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-primary"
                  style={{ marginTop: 18 }}
                  onClick={() => {
                    setCitizenStep(3);
                    showToast('Phone verified successfully!', 'success');
                  }}
                >
                  <span>Verify &amp; continue</span>
                  <CheckCircle2 size={16} />
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setCitizenStep(1)}
                >
                  Change number
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Ward & Language */}
          {citizenStep === 3 && (
            <div className="animate-fade-in">
              <div className="progress"><i className="done"></i><i className="done"></i><i className="current"></i></div>
              <h1>Almost done</h1>
              <p className="lede">This helps us route your complaints to the right municipal office, in your preferred language.</p>

              <div className="card">
                <div className="field">
                  <label>Your home ward <span className="req">*</span></label>
                  <select
                    value={citizenWard}
                    onChange={(e) => setCitizenWard(e.target.value)}
                  >
                    {WARDS.map(w => (
                      <option key={w.id} value={w.name}>{w.name} (Auto-detected)</option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label>Preferred language <span className="req">*</span></label>
                  <div className="lang-grid">
                    {['English', 'हिंदी', 'मराठी'].map(lang => (
                      <div
                        key={lang}
                        className={`lang-chip ${citizenLang === lang ? 'active' : ''}`}
                        onClick={() => setCitizenLang(lang)}
                      >
                        {lang}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="field">
                  <label>Email <span className="optional-tag">(optional)</span></label>
                  <input
                    type="email"
                    value={citizenEmail}
                    onChange={(e) => setCitizenEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>

                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleCompleteCitizenReg}
                >
                  <span>Create account &amp; enter portal</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= STAFF FLOW ================= */}
      {roleMode === 'staff' && (
        <div className="stage active animate-fade-in">
          <div className="lockup">
            <div className="mark">G</div>
            <div>
              <div className="name">JanSetu Command Center</div>
              <div className="sub">Municipal Staff &amp; Officer Management</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
            <button
              type="button"
              className="btn-ghost"
              style={{
                flex: 1,
                margin: 0,
                fontWeight: 600,
                background: staffTab === 'login' ? 'var(--card)' : 'var(--paper)',
                borderColor: staffTab === 'login' ? 'var(--blue)' : 'var(--line-strong)',
                color: staffTab === 'login' ? 'var(--blue)' : 'var(--ink-soft)'
              }}
              onClick={() => setStaffTab('login')}
            >
              Officer Sign In
            </button>
            <button
              type="button"
              className="btn-ghost"
              style={{
                flex: 1,
                margin: 0,
                fontWeight: 600,
                background: staffTab === 'register' ? 'var(--card)' : 'var(--paper)',
                borderColor: staffTab === 'register' ? 'var(--blue)' : 'var(--line-strong)',
                color: staffTab === 'register' ? 'var(--blue)' : 'var(--ink-soft)'
              }}
              onClick={() => setStaffTab('register')}
            >
              Staff Provisioning
            </button>
          </div>

          {staffTab === 'login' && (
            <div className="animate-fade-in">
              <h1>Officer sign in</h1>
              <p className="lede">Sign in with your official municipal credentials to access the priority dispatch queue.</p>

              <div className="card">
                <div className="field">
                  <label>Official email or Employee ID <span className="req">*</span></label>
                  <input
                    type="text"
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                    placeholder="name@municipalcorp.gov.in"
                  />
                </div>
                <div className="field">
                  <label>Password <span className="req">*</span></label>
                  <input type="password" value="••••••••" readOnly />
                </div>

                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleStaffLogin}
                >
                  <span>Sign In to Dashboard</span>
                  <ArrowRight size={16} />
                </button>
              </div>

              {/* 1-Click Demo Officer Logins */}
              <div className="demo-accounts">
                <div className="demo-title">⚡ 1-Click Demo Officer Logins</div>
                <div className="demo-btn-group" style={{ flexDirection: 'column', gap: 6 }}>
                  <button
                    type="button"
                    className="demo-btn"
                    onClick={() => {
                      loginStaff(DEFAULT_OFFICER);
                      showToast(`Signed in as S. Kulkarni (Ward Officer)`, 'success');
                      onAuthenticated('authority');
                    }}
                  >
                    Login as S. Kulkarni (Ward Officer · Andheri W)
                  </button>
                  <button
                    type="button"
                    className="demo-btn"
                    onClick={() => {
                      loginStaff({
                        id: 'usr-off-202',
                        name: 'JE Nilesh Patil',
                        designation: 'Junior Engineer (Sanitation)',
                        employeeId: 'MCGM-SWM-4190',
                        email: 'nilesh.patil@municipalcorp.gov.in',
                        department: 'sanitation',
                        ward: 'Andheri West'
                      });
                      showToast(`Signed in as JE Nilesh Patil`, 'success');
                      onAuthenticated('authority');
                    }}
                  >
                    Login as JE Nilesh Patil (Sanitation · Andheri W)
                  </button>
                </div>
              </div>
            </div>
          )}

          {staffTab === 'register' && (
            <div className="animate-fade-in">
              <h1>Provision staff account</h1>
              <p className="lede">Staff accounts are authorized by a ward administrator.</p>

              <div className="admin-banner">
                <AlertCircle size={17} />
                <span>You're creating this account as an administrator. The employee will receive login credentials at their official email.</span>
              </div>

              <div className="card">
                <div className="field">
                  <label>Full name <span className="req">*</span></label>
                  <input
                    type="text"
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    placeholder="Employee's full name"
                  />
                </div>
                <div className="field">
                  <label>Employee ID <span className="req">*</span></label>
                  <input
                    type="text"
                    value={staffEmpId}
                    onChange={(e) => setStaffEmpId(e.target.value)}
                    placeholder="e.g. MCGM-ENG-9102"
                  />
                </div>
                <div className="field">
                  <label>Department <span className="req">*</span></label>
                  <select
                    value={staffDept}
                    onChange={(e) => setStaffDept(e.target.value)}
                  >
                    <option value="sanitation">Sanitation &amp; Waste</option>
                    <option value="water">Water Supply</option>
                    <option value="roads">Roads &amp; Traffic</option>
                    <option value="electricity">Electricity</option>
                    <option value="public-works">Public Works &amp; Safety</option>
                  </select>
                </div>
                <div className="field">
                  <label>Ward of jurisdiction <span className="req">*</span></label>
                  <select
                    value={staffWard}
                    onChange={(e) => setStaffWard(e.target.value)}
                  >
                    {WARDS.map(w => (
                      <option key={w.id} value={w.name}>{w.name}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Access level <span className="req">*</span></label>
                  <div className="role-options">
                    {['Field officer', 'Ward supervisor', 'Admin'].map(role => (
                      <label
                        key={role}
                        className={`role-option ${staffRole === role ? 'active' : ''}`}
                        onClick={() => setStaffRole(role)}
                      >
                        <input type="radio" name="accessRole" checked={staffRole === role} readOnly />
                        <div>
                          <div className="r-title">{role}</div>
                          <div className="r-desc">
                            {role === 'Field officer' && 'Views assigned complaints and updates their status.'}
                            {role === 'Ward supervisor' && 'Can reassign complaints, confirm duplicate merges, view analytics.'}
                            {role === 'Admin' && 'Full access across wards, including staff provisioning.'}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleStaffRegister}
                >
                  <span>Create staff account</span>
                  <CheckCircle2 size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
