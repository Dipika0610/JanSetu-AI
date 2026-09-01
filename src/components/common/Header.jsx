import React, { useState } from 'react';
import { useAuth, DEFAULT_OFFICER } from '../../context/AuthContext';
import { useGrievances } from '../../context/GrievanceContext';
import { useLanguage } from '../../context/LanguageContext';
import { WARDS } from '../../data/mockData';
import { Bell, ArrowRight, User, Globe, LogOut, ChevronDown, ArrowLeft, ShieldCheck, Lock, X } from 'lucide-react';

export const Header = ({ activeView, onViewChange }) => {
  const { currentUser, loginStaff, logout } = useAuth();
  const { selectedWard, setSelectedWard, showToast } = useGrievances();
  const { lang, setLanguage, t } = useLanguage();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [enteredPasscode, setEnteredPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');

  const handleSignOut = () => {
    logout();
    setShowUserMenu(false);
    showToast(lang === 'hi' ? 'सफलतापूर्वक साइन आउट किया गया।' : lang === 'mr' ? 'यशस्वीरित्या साइन आउट केले.' : 'Signed out successfully.', 'info');
    onViewChange('auth');
  };

  const handleSwitchToOfficer = () => {
    if (currentUser?.type === 'staff') {
      onViewChange('authority');
      return;
    }
    setEnteredPasscode('');
    setPasscodeError('');
    setShowPasscodeModal(true);
  };

  const handleVerifyPasscode = (e) => {
    e.preventDefault();
    if (enteredPasscode.trim() === '12345678') {
      loginStaff(DEFAULT_OFFICER);
      setShowPasscodeModal(false);
      showToast('Security Passcode Verified (12345678) — Welcome Officer S. Kulkarni!', 'success');
      onViewChange('authority');
    } else {
      setPasscodeError('Invalid Security Passcode! Required: 12345678');
      showToast('Access Denied: Invalid Security Code! (Use: 12345678)', 'warning');
    }
  };

  return (
    <header className="topbar">
      {/* Brand & Active Ward */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="brand-mark" title="JanSetu AI Civic Intelligence">G</div>
        <div className="brand-text">
          <div className="name">
            <span>{t('brandName')}</span>
            <span className="badge badge-blue" style={{ fontSize: '10px', padding: '1px 6px' }}>{t('sihBadge')}</span>
          </div>
          {activeView !== 'auth' && (
            <div className="ward-row">
              <select
                value={selectedWard}
                onChange={(e) => {
                  setSelectedWard(e.target.value);
                  showToast(`${t('activeWard')}: ${e.target.value}`, 'info');
                }}
                className="ward-select"
                title={t('activeWard')}
              >
                {WARDS.map(w => (
                  <option key={w.id} value={w.name}>{w.name}, Mumbai ▾</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {/* User Account / Sign Out Section (When logged in and not on auth) */}
        {currentUser && activeView !== 'auth' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {/* User Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="lang-btn"
                title="Account Menu"
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <User size={13} />
                <span>{currentUser.name ? currentUser.name.split(' ')[0] : 'User'}</span>
                <ChevronDown size={11} />
              </button>

              {showUserMenu && (
                <div
                  className="animate-fade-in"
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: 6,
                    background: 'var(--card)',
                    border: '1px solid var(--line)',
                    borderRadius: 8,
                    boxShadow: 'var(--shadow-md)',
                    minWidth: 170,
                    zIndex: 100,
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--line)', fontSize: '11.5px', color: 'var(--ink-soft)' }}>
                    <strong>{currentUser.name}</strong>
                    <div style={{ fontSize: '10.5px', color: 'var(--ink-faint)' }}>{currentUser.phone || currentUser.email || currentUser.type}</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      onViewChange('auth');
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 12px',
                      background: 'none',
                      border: 'none',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      color: 'var(--ink)'
                    }}
                  >
                    <User size={13} />
                    <span>{t('switchUser')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 12px',
                      background: 'none',
                      border: 'none',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      color: 'var(--brick)',
                      borderTop: '1px solid var(--line)'
                    }}
                  >
                    <LogOut size={13} />
                    <span style={{ fontWeight: 600 }}>{t('signOut')}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Direct 1-Click Sign Out Button in Topbar */}
            <button
              onClick={handleSignOut}
              className="lang-btn"
              title="1-Click Sign Out"
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                color: 'var(--brick)',
                borderColor: 'var(--brick-dim)',
                background: 'var(--card)'
              }}
            >
              <LogOut size={13} />
              <span style={{ fontWeight: 600 }}>{t('signOut')}</span>
            </button>
          </div>
        )}

        {/* Trilingual Language Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="lang-btn"
            title="Select Language (English / हिन्दी / मराठी)"
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <Globe size={13} />
            <span style={{ fontWeight: 700 }}>{lang.toUpperCase()}</span>
            <ChevronDown size={11} />
          </button>

          {showLangMenu && (
            <div
              className="animate-fade-in"
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: 6,
                background: 'var(--card)',
                border: '1px solid var(--line)',
                borderRadius: 8,
                boxShadow: 'var(--shadow-md)',
                minWidth: 120,
                zIndex: 100,
                overflow: 'hidden'
              }}
            >
              {[
                { code: 'en', label: 'English' },
                { code: 'hi', label: 'हिन्दी (Hindi)' },
                { code: 'mr', label: 'मराठी (Marathi)' }
              ].map(item => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    setLanguage(item.code);
                    setShowLangMenu(false);
                    showToast(`Language set to ${item.label}`, 'info');
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 12px',
                    background: lang === item.code ? 'var(--blue-soft)' : 'none',
                    color: lang === item.code ? 'var(--blue)' : 'var(--ink)',
                    fontWeight: lang === item.code ? 600 : 400,
                    border: 'none',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View Switch Button (Citizen <-> Officer) with Security Passcode (Only on citizen portal) */}
        {activeView === 'citizen' && (
          <button
            onClick={handleSwitchToOfficer}
            className="portal-switch-btn"
            title="Switch to Municipal Officer Dashboard (Requires Passcode: 12345678)"
          >
            <ShieldCheck size={13} />
            <span>{t('officer')}</span>
            <ArrowRight size={12} />
          </button>
        )}

        {/* Notification Bell (Only on citizen portal) */}
        {activeView === 'citizen' && (
          <div
            className="bell"
            title="Active civic alerts in your ward"
            onClick={() => showToast('3 active work orders in progress in your ward.', 'info')}
          >
            <Bell size={16} />
            <span className="dot"></span>
          </div>
        )}
      </div>

      {/* Official Security Passcode Verification Modal (12345678) */}
      {showPasscodeModal && (
        <div className="modal-backdrop open">
          <div className="modal-card" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Lock size={16} style={{ color: 'var(--blue)' }} />
                <h3 style={{ margin: 0, fontSize: '15px' }}>Officer Security Passcode</h3>
              </div>
              <button type="button" className="btn-secondary" onClick={() => setShowPasscodeModal(false)}>
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleVerifyPasscode}>
              <div className="modal-body">
                <p style={{ fontSize: '12.5px', color: 'var(--ink-soft)', marginTop: 0, marginBottom: 12 }}>
                  Access to the Municipal Command Center &amp; Priority Queue requires official authorization.
                </p>

                <div className="field">
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)', display: 'block', marginBottom: 4 }}>
                    Enter 8-Digit Access Code <span style={{ color: 'var(--brick)' }}>*</span>
                  </label>
                  <input
                    type="password"
                    maxLength="8"
                    placeholder="Enter 12345678"
                    value={enteredPasscode}
                    onChange={(e) => {
                      setEnteredPasscode(e.target.value);
                      setPasscodeError('');
                    }}
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontSize: '15px',
                      letterSpacing: '3px',
                      textAlign: 'center',
                      fontFamily: 'monospace',
                      borderRadius: 6,
                      border: passcodeError ? '1.5px solid var(--brick)' : '1px solid var(--line-strong)',
                      background: 'var(--paper)'
                    }}
                  />
                  {passcodeError && (
                    <div style={{ color: 'var(--brick)', fontSize: '11.5px', marginTop: 4, fontWeight: 500 }}>
                      {passcodeError}
                    </div>
                  )}
                  <div style={{ fontSize: '11px', color: 'var(--ink-faint)', marginTop: 6 }}>
                    Official demo code: <strong style={{ color: 'var(--blue)', fontFamily: 'monospace' }}>12345678</strong>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowPasscodeModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ width: 'auto', margin: 0 }}>
                  <span>Verify &amp; Enter Dashboard</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
