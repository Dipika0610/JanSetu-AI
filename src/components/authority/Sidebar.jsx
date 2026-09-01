import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGrievances } from '../../context/GrievanceContext';
import {
  LayoutDashboard,
  ListOrdered,
  GitMerge,
  MapPin,
  Building2,
  BarChart3,
  ExternalLink,
  X
} from 'lucide-react';

export const Sidebar = ({ activeSection, onSectionChange, isOpen, onClose, onViewChange }) => {
  const { currentUser } = useAuth();
  const { complaints, clusters } = useGrievances();

  const openCount = complaints.filter(c => c.status !== 'closed' && c.status !== 'resolved').length;

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`} id="sidebar">
        <div className="brand">
          <div className="brand-left">
            <div className="brand-mark-gov">G</div>
            <div className="brand-title">JanSetu AI</div>
            <div className="brand-sub">Municipal Corporation · Mumbai</div>
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
              <span>Overview</span>
            </span>
          </div>

          <div
            className={`nav-item ${activeSection === 'queue' ? 'active' : ''}`}
            onClick={() => { onSectionChange('queue'); onClose(); }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ListOrdered className="nav-icon" size={16} />
              <span>Priority Queue</span>
            </span>
            <span className="nav-count">{openCount}</span>
          </div>

          <div
            className={`nav-item ${activeSection === 'clusters' ? 'active' : ''}`}
            onClick={() => { onSectionChange('clusters'); onClose(); }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <GitMerge className="nav-icon" size={16} />
              <span>Duplicate Clusters</span>
            </span>
            <span className="nav-count">{clusters.length}</span>
          </div>

          <div
            className={`nav-item ${activeSection === 'map' ? 'active' : ''}`}
            onClick={() => { onSectionChange('map'); onClose(); }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MapPin className="nav-icon" size={16} />
              <span>Hotspot Map</span>
            </span>
          </div>

          <div
            className={`nav-item ${activeSection === 'departments' ? 'active' : ''}`}
            onClick={() => { onSectionChange('departments'); onClose(); }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Building2 className="nav-icon" size={16} />
              <span>Departments</span>
            </span>
          </div>

          <div
            className={`nav-item ${activeSection === 'analytics' ? 'active' : ''}`}
            onClick={() => { onSectionChange('analytics'); onClose(); }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BarChart3 className="nav-icon" size={16} />
              <span>Analytics &amp; Impact</span>
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
              <span>Citizen Portal</span>
            </span>
          </div>
        </nav>

        <div className="sidebar-foot" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            Logged in as<br />
            <strong style={{ color: '#EDEFE9' }}>{currentUser?.name || 'S. Kulkarni'}</strong><br />
            <span style={{ fontSize: '10.5px', color: '#AEBBB4' }}>{currentUser?.designation || 'Ward Officer'}</span>
          </div>
          <button
            type="button"
            onClick={() => onViewChange('auth')}
            style={{ background: 'transparent', border: 'none', color: '#DEE6EC', fontSize: '11px', textDecoration: 'underline', cursor: 'pointer' }}
          >
            Switch
          </button>
        </div>
      </aside>

      {/* Backdrop */}
      {isOpen && <div className="sidebar-backdrop open" onClick={onClose}></div>}
    </>
  );
};
