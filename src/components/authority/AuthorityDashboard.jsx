import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGrievances } from '../../context/GrievanceContext';
import { useLanguage } from '../../context/LanguageContext';
import { WARDS } from '../../data/mockData';
import { Sidebar } from './Sidebar';
import { MetricsStrip } from './MetricsStrip';
import { PriorityQueue } from './PriorityQueue';
import { DuplicateClusters } from './DuplicateClusters';
import { GISHotspotMap } from './GISHotspotMap';
import { ActionDrawer } from './ActionDrawer';
import { MobileBottomNav } from './MobileBottomNav';
import { Menu, Search, Download, Globe, ChevronDown, LogOut, User } from 'lucide-react';

export const AuthorityDashboard = ({ onViewChange }) => {
  const { currentUser, logout } = useAuth();
  const {
    selectedWard,
    setSelectedWard,
    searchQuery,
    setSearchQuery,
    showToast
  } = useGrievances();
  const { lang, setLanguage, t } = useLanguage();

  const [activeSection, setActiveSection] = useState('queue');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const handleExportReport = () => {
    showToast('Exporting SIH26-S02 Municipal Resolution Report (CSV/PDF)...', 'info');
    setTimeout(() => {
      showToast('Resolution Report downloaded successfully!', 'success');
    }, 1000);
  };

  const handleSignOut = () => {
    logout();
    setShowUserMenu(false);
    showToast('Signed out from Officer account.', 'info');
    onViewChange('auth');
  };

  return (
    <div className="app">
      {/* Sidebar / Mobile Drawer */}
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onViewChange={onViewChange}
      />

      {/* Main Command Center Content */}
      <main className="main">
        {/* Header Topbar */}
        <header className="main-topbar">
          <button
            className="menu-toggle-btn"
            onClick={() => setSidebarOpen(true)}
            title="Toggle navigation menu"
          >
            <Menu size={18} />
          </button>

          <h1>{t('priorityQueue')}</h1>

          <div className="search">
            <Search size={14} />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="select-ctrl"
            value={selectedWard}
            onChange={(e) => {
              setSelectedWard(e.target.value);
              showToast(`${t('activeWard')}: ${e.target.value}`, 'info');
            }}
          >
            <option value="all">{t('allWards')}</option>
            {WARDS.map(w => (
              <option key={w.id} value={w.name}>{w.name}</option>
            ))}
          </select>

          {/* Trilingual Language Selector */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowLangMenu(!showLangMenu)}
              title="Change Language"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '7px 10px', fontSize: '12px', cursor: 'pointer' }}
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

          <button
            type="button"
            className="btn-secondary no-print"
            onClick={handleExportReport}
            title="Download Municipal Resolution Report"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', fontSize: '12px' }}
          >
            <Download size={13} />
            <span className="hidden-mobile">{t('exportReport')}</span>
          </button>

          {/* User Profile Avatar with Sign Out dropdown */}
          <div style={{ position: 'relative' }}>
            <div
              className="avatar-badge"
              title={`${currentUser?.name || 'Officer'} - Click for Account & Sign Out`}
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{ cursor: 'pointer' }}
            >
              {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'SK'}
            </div>

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
                  minWidth: 160,
                  zIndex: 100,
                  overflow: 'hidden'
                }}
              >
                <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--line)', fontSize: '11.5px', color: 'var(--ink-soft)' }}>
                  <strong>{currentUser?.name || 'S. Kulkarni'}</strong>
                  <div style={{ fontSize: '10.5px', color: 'var(--ink-faint)' }}>{currentUser?.designation || 'Ward Officer'}</div>
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
        </header>

        {/* Executive Metrics Row */}
        <MetricsStrip />

        {/* 2-Column Body Grid */}
        <div className="body-grid">
          {/* Left Panel: Priority Queue */}
          <PriorityQueue onSelectComplaint={(item) => setSelectedComplaint(item)} />

          {/* Right Stack: GIS Map & Duplicate Clusters */}
          <aside className="side-stack">
            <GISHotspotMap />
            <DuplicateClusters />
          </aside>
        </div>
      </main>

      {/* Mobile Bottom Quick App Navigation Bar */}
      <MobileBottomNav
        activeSection={activeSection}
        onSectionChange={(sec) => {
          setActiveSection(sec);
          if (sec === 'clusters') {
            document.getElementById('duplicateClustersPanel')?.scrollIntoView({ behavior: 'smooth' });
          } else if (sec === 'map') {
            document.getElementById('hotspotMapPanel')?.scrollIntoView({ behavior: 'smooth' });
          } else {
            document.getElementById('priorityQueuePanel')?.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        onViewChange={onViewChange}
      />

      {/* Action Drawer / Modal */}
      {selectedComplaint && (
        <ActionDrawer
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
        />
      )}
    </div>
  );
};
