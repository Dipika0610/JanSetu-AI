import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGrievances } from '../../context/GrievanceContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  LayoutDashboard,
  ListOrdered,
  GitMerge,
  MapPin,
  Building2,
  BarChart3,
  ExternalLink,
  LogOut,
  X
} from 'lucide-react';

export const Sidebar = ({ activeSection, onSectionChange, isOpen, onClose, onViewChange }) => {
  const { currentUser, logout } = useAuth();
  const { complaints, clusters, showToast } = useGrievances();
  const { t } = useLanguage();

  const openCount = complaints.filter(c => c.status !== 'closed' && c.status !== 'resolved').length;

  const handleSignOut = () => {
    logout();
    onClose();
    showToast('Signed out from Officer account.', 'info');
    onViewChange('auth');
  };

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`} id="sidebar">
        <div className="brand">
          <div className="brand-left">
            <div className="brand-mark-gov">G</div>
            <div className="brand-title">{t('brandName')}</div>
            <div className="brand-sub">{t('subTitle')}</div>
          </div>
          <button className="close-sidebar-btn" onClick={onClose} title="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav>
          <div
            className={`nav-item ${activeSection === 'overview' ? 'active' : ''}`}
            onClick={() => { onSectionChange('overview'); onClose(); }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <LayoutDashboard className="nav-icon" size={16} />
              <span>{t('overview')}</span>
            </span>
          </div>

          <div
            className={`nav-item ${activeSection === 'queue' ? 'active' : ''}`}
            onClick={() => { onSectionChange('queue'); onClose(); }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ListOrdered className="nav-icon" size={16} />
              <span>{t('priorityQueue')}</span>
            </span>
            <span className="nav-count">{openCount}</span>
          </div>

          <div
            className={`nav-item ${activeSection === 'clusters' ? 'active' : ''}`}
            onClick={() => { onSectionChange('clusters'); onClose(); }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <GitMerge className="nav-icon" size={16} />
              <span>{t('duplicateClusters')}</span>
            </span>
            <span className="nav-count">{clusters.length}</span>
          </div>

          <div
            className={`nav-item ${activeSection === 'map' ? 'active' : ''}`}
            onClick={() => { onSectionChange('map'); onClose(); }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MapPin className="nav-icon" size={16} />
              <span>{t('hotspotMap')}</span>
            </span>
          </div>

          <div
            className={`nav-item ${activeSection === 'departments' ? 'active' : ''}`}
            onClick={() => { onSectionChange('departments'); onClose(); }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Building2 className="nav-icon" size={16} />
              <span>{t('departments')}</span>
            </span>
          </div>

          <div
            className={`nav-item ${activeSection === 'analytics' ? 'active' : ''}`}
            onClick={() => { onSectionChange('analytics'); onClose(); }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BarChart3 className="nav-icon" size={16} />
              <span>{t('analyticsImpact')}</span>
            </span>
          </div>

          <div className="nav-group-label">Public-Facing</div>
          <div
            className="nav-item"
            style={{ color: 'var(--blue-soft)' }}
            onClick={() => { onViewChange('citizen'); onClose(); }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ExternalLink className="nav-icon" size={16} />
              <span>{t('citizenPortalLink')}</span>
            </span>
          </div>
        </nav>

        <div className="sidebar-foot" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            {t('loggedInAs')}<br />
            <strong style={{ color: '#EDEFE9' }}>{currentUser?.name || 'S. Kulkarni'}</strong><br />
            <span style={{ fontSize: '10.5px', color: '#AEBBB4' }}>{currentUser?.designation || 'Ward Officer'}</span>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            title={t('signOut')}
            style={{
              background: 'rgba(168, 64, 42, 0.25)',
              border: '1px solid rgba(243, 225, 218, 0.4)',
              color: '#F3E1DA',
              fontSize: '11px',
              padding: '4px 8px',
              borderRadius: 4,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <LogOut size={11} />
            <span>{t('signOut')}</span>
          </button>
        </div>
      </aside>

      {/* Backdrop */}
      {isOpen && <div className="sidebar-backdrop open" onClick={onClose}></div>}
    </>
  );
};
