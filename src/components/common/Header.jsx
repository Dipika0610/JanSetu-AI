import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGrievances } from '../../context/GrievanceContext';
import { useLanguage } from '../../context/LanguageContext';
import { WARDS } from '../../data/mockData';
import { Bell, ArrowRight, User, Globe, LogOut, ChevronDown, ArrowLeft } from 'lucide-react';

export const Header = ({ activeView, onViewChange }) => {
  const { currentUser, logout, isOfficer } = useAuth();
  const { selectedWard, setSelectedWard, showToast } = useGrievances();
  const { lang, setLanguage, t } = useLanguage();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const handleSignOut = () => {
    logout();
    setShowUserMenu(false);
    showToast(lang === 'hi' ? 'सफलतापूर्वक साइन आउट किया गया।' : lang === 'mr' ? 'यशस्वीरित्या साइन आउट केले.' : 'Signed out successfully.', 'info');
    onViewChange('auth');
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
        </div>
      </div>

      <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {/* Direct Back / Login Navigation Button */}
        {activeView === 'citizen' && (
          <button
            onClick={() => onViewChange('auth')}
            className="lang-btn"
            title="Go to Login / Register Hub"
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, background: 'var(--card)' }}
          >
            <ArrowLeft size={13} />
            <span className="hidden-mobile">Login Hub</span>
          </button>
        )}

        {/* User Account / Sign Out Section */}
        {currentUser ? (
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
        ) : (
          <button
            onClick={() => onViewChange('auth')}
            className="lang-btn"
            title="Sign In / Register"
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <User size={13} />
            <span>{t('signIn')}</span>
          </button>
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

        {/* View Switch Button (Citizen <-> Officer) */}
        {activeView === 'citizen' ? (
          <button
            onClick={() => onViewChange('authority')}
            className="portal-switch-btn"
            title="Switch to Municipal Officer Dashboard"
          >
            <span>{t('officer')}</span>
            <ArrowRight size={12} />
          </button>
        ) : (
          <button
            onClick={() => onViewChange('citizen')}
            className="portal-switch-btn"
            title="Switch to Citizen Grievance Portal"
          >
            <span>{t('citizen')}</span>
            <ArrowRight size={12} />
          </button>
        )}

        {/* Notification Bell */}
        <div
          className="bell"
          title="Active civic alerts in your ward"
          onClick={() => showToast('3 active work orders in progress in your ward.', 'info')}
        >
          <Bell size={16} />
          <span className="dot"></span>
        </div>
      </div>
    </header>
  );
};
