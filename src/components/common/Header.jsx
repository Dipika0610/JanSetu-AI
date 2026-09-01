import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGrievances } from '../../context/GrievanceContext';
import { WARDS } from '../../data/mockData';
import { Bell, ArrowRight, User, Globe } from 'lucide-react';

export const Header = ({ activeView, onViewChange, currentLang, onLangChange }) => {
  const { currentUser, isOfficer } = useAuth();
  const { selectedWard, setSelectedWard, showToast } = useGrievances();

  return (
    <header className="topbar">
      <div className="brand-mark" title="JanSetu AI Civic Intelligence">G</div>
      <div className="brand-text">
        <div className="name">
          <span>JanSetu AI</span>
          <span className="badge badge-blue" style={{ fontSize: '10px', padding: '1px 6px' }}>SIH26-S02</span>
        </div>
        <div className="ward-row">
          <select
            value={selectedWard}
            onChange={(e) => {
              setSelectedWard(e.target.value);
              showToast(`Active ward set to ${e.target.value}`, 'info');
            }}
            className="ward-select"
            title="Change active municipal ward"
          >
            {WARDS.map(w => (
              <option key={w.id} value={w.name}>{w.name}, Mumbai ▾</option>
            ))}
          </select>
        </div>
      </div>

      <div className="header-actions">
        {/* User Profile / Auth Switcher */}
        <button
          onClick={() => onViewChange('auth')}
          className="lang-btn"
          title="Switch User / Login Hub"
          style={{ cursor: 'pointer' }}
        >
          <User size={12} />
          <span>{currentUser ? currentUser.name.split(' ')[0] : 'Sign In'}</span>
        </button>

        {/* Language Switcher */}
        <button
          onClick={onLangChange}
          className="lang-btn"
          title="Switch Language"
        >
          <Globe size={12} />
          <span>{currentLang.code}</span>
        </button>

        {/* View Switch Button */}
        {activeView === 'citizen' ? (
          <button
            onClick={() => onViewChange('authority')}
            className="portal-switch-btn"
            title="Switch to Municipal Officer Dashboard"
          >
            <span>Officer</span>
            <ArrowRight size={12} />
          </button>
        ) : (
          <button
            onClick={() => onViewChange('citizen')}
            className="portal-switch-btn"
            title="Switch to Citizen Grievance Portal"
          >
            <span>Citizen</span>
            <ArrowRight size={12} />
          </button>
        )}

        {/* Notification Bell */}
        <div
          className="bell"
          title="3 active civic alerts in your ward"
          onClick={() => showToast('3 active work orders in progress in your ward.', 'info')}
        >
          <Bell size={16} />
          <span className="dot"></span>
        </div>
      </div>
    </header>
  );
};
