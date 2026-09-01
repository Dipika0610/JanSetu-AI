import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGrievances } from '../../context/GrievanceContext';
import { useLanguage } from '../../context/LanguageContext';
import { WARDS, CATEGORIES } from '../../data/mockData';
import { Sidebar } from './Sidebar';
import { MetricsStrip } from './MetricsStrip';
import { PriorityQueue } from './PriorityQueue';
import { DuplicateClusters } from './DuplicateClusters';
import { GISHotspotMap } from './GISHotspotMap';
import { AnalyticsView } from './AnalyticsView';
import { ActionDrawer } from './ActionDrawer';
import { MobileBottomNav } from './MobileBottomNav';
import {
  Menu,
  Search,
  Globe,
  ChevronDown,
  LogOut,
  User,
  ListOrdered,
  GitMerge,
  MapPin,
  Building2,
  BarChart3,
  Flame,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';

export const AuthorityDashboard = ({ onViewChange }) => {
  const { currentUser, logout } = useAuth();
  const {
    complaints,
    clusters,
    selectedWard,
    setSelectedWard,
    searchQuery,
    setSearchQuery,
    showToast
  } = useGrievances();
  const { lang, setLanguage, t } = useLanguage();

  // Default to 'overview' so that Priority Queue is only visible when explicitly clicked
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const handleSignOut = () => {
    logout();
    setShowUserMenu(false);
    showToast('Signed out from Officer account.', 'info');
    onViewChange('auth');
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'queue': return t('priorityQueue');
      case 'clusters': return t('duplicateClusters');
      case 'map': return t('hotspotMap');
      case 'departments': return t('departments');
      case 'analytics': return t('analyticsImpact');
      default: return t('overview');
    }
  };

  return (
    <div className="app">
      {/* Sidebar / Mobile Drawer */}
      <Sidebar
        activeSection={activeSection}
        onSectionChange={(sec) => {
          setActiveSection(sec);
          setSidebarOpen(false);
        }}
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

          <h1>{getSectionTitle()}</h1>

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

        {/* ================= CONDITIONAL VIEW SWITCHER ================= */}

        {/* 1. PRIORITY QUEUE VIEW: Visible ONLY when "Priority Queue" option is clicked */}
        {activeSection === 'queue' && (
          <div className="animate-fade-in" style={{ marginTop: 14 }}>
            <PriorityQueue onSelectComplaint={(item) => setSelectedComplaint(item)} />
          </div>
        )}

        {/* 2. OVERVIEW DASHBOARD VIEW */}
        {activeSection === 'overview' && (
          <div className="animate-fade-in" style={{ marginTop: 14 }}>
            {/* Quick Action Banner to Open Priority Queue */}
            <div
              style={{
                background: 'var(--card)',
                border: '1.5px solid var(--brick)',
                borderRadius: 8,
                padding: '14px 18px',
                marginBottom: 16,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12,
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--brick)', fontWeight: 700, fontSize: '13.5px' }}>
                  <Flame size={16} />
                  <span>Incoming Priority Dispatch Queue Active</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: 2 }}>
                  {complaints.length} grievances dynamically evaluated and sorted by volume frequency &amp; severity.
                </div>
              </div>
              <button
                type="button"
                className="btn-primary"
                onClick={() => setActiveSection('queue')}
                style={{
                  margin: 0,
                  width: 'auto',
                  padding: '8px 14px',
                  fontSize: '12.5px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <ListOrdered size={14} />
                <span>Open Priority Queue ({complaints.length})</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* 2-Column Overview Grid: Hotspot Map & Duplicate Clusters */}
            <div className="body-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <GISHotspotMap />
              <DuplicateClusters />
            </div>
          </div>
        )}

        {/* 3. DUPLICATE CLUSTERS VIEW */}
        {activeSection === 'clusters' && (
          <div className="animate-fade-in" style={{ marginTop: 14 }}>
            <DuplicateClusters />
          </div>
        )}

        {/* 4. HOTSPOT MAP VIEW */}
        {activeSection === 'map' && (
          <div className="animate-fade-in" style={{ marginTop: 14 }}>
            <GISHotspotMap />
          </div>
        )}

        {/* 5. DEPARTMENTS & SLA ROUTING MATRIX VIEW */}
        {activeSection === 'departments' && (
          <div className="animate-fade-in panel" style={{ marginTop: 14 }}>
            <div className="panel-head">
              <div>
                <h2>{t('departments')} &amp; SLA Routing Matrix</h2>
                <span className="hint">Department accountability and escalation mapping (SIH26-S02 Module 7)</span>
              </div>
            </div>
            <div style={{ padding: '16px' }}>
              <table className="queue-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Subcategory Issue</th>
                    <th>Responsible Department</th>
                    <th>Escalation Authority</th>
                    <th>Target SLA</th>
                  </tr>
                </thead>
                <tbody>
                  {CATEGORIES.map(cat => (
                    <tr key={cat.id}>
                      <td><strong>{cat.name}</strong></td>
                      <td style={{ color: 'var(--ink-soft)' }}>{cat.subcategory}</td>
                      <td><span className="badge badge-blue">{cat.department}</span></td>
                      <td><span className="badge badge-ochre">{cat.escalationDept}</span></td>
                      <td><span className="badge badge-moss">24 - 48 Hours</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. ANALYTICS & IMPACT VIEW WITH MULTI-COLORED DEPARTMENT GRAPH (Weekly, Monthly, Yearly) */}
        {activeSection === 'analytics' && (
          <AnalyticsView />
        )}
      </main>

      {/* Mobile Bottom Quick App Navigation Bar */}
      <MobileBottomNav
        activeSection={activeSection}
        onSectionChange={(sec) => setActiveSection(sec)}
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
