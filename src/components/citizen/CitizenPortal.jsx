import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGrievances } from '../../context/GrievanceContext';
import { useLanguage } from '../../context/LanguageContext';
import { GrievanceForm } from './GrievanceForm';
import { MyComplaints } from './MyComplaints';
import { NearbyFeed } from './NearbyFeed';
import { DemoScenarios } from './DemoScenarios';
import { Plus, Sparkles, User, LogOut, ArrowLeft, CheckCircle2, ChevronRight } from 'lucide-react';

export const CitizenPortal = ({ onViewChange }) => {
  const { currentUser, logout } = useAuth();
  const { complaints, showToast } = useGrievances();
  const { lang, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('submit');

  const myCount = complaints.filter(c => c.similarCount > 0 || c.id.startsWith('GRV-2026-0001') || c.authorName === currentUser?.name).length;
  
  // Find resolved complaints requiring citizen rating
  const resolvedCount = complaints.filter(c => c.status === 'resolved' && (c.authorName === currentUser?.name || c.id.startsWith('GRV-2026-0001'))).length;

  const handleSignOut = () => {
    logout();
    showToast(lang === 'hi' ? 'सफलतापूर्वक साइन आउट किया गया।' : lang === 'mr' ? 'यशस्वीरित्या साइन आउट केले.' : 'Signed out successfully.', 'info');
    if (onViewChange) onViewChange('auth');
  };

  return (
    <div className="shell">
      {/* Citizen Profile & Back/SignOut Action Strip */}
      <div
        className="user-profile-strip animate-fade-in"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 18px',
          background: 'var(--card)',
          borderBottom: '1px solid var(--line)',
          fontSize: '12px',
          color: 'var(--ink-soft)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              background: 'var(--blue)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '11px'
            }}
          >
            {currentUser?.name ? currentUser.name[0] : 'C'}
          </div>
          <div>
            <strong style={{ color: 'var(--ink)' }}>{currentUser?.name || 'Citizen'}</strong>
            <span style={{ color: 'var(--ink-faint)', marginLeft: 6 }}>
              ({currentUser?.phone || '+91 98201 44520'})
            </span>
          </div>
        </div>

        {/* Back & Sign Out Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => onViewChange && onViewChange('auth')}
            style={{
              padding: '4px 8px',
              fontSize: '11.5px',
              margin: 0,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}
            title="Go back to Sign In / Role Selection"
          >
            <ArrowLeft size={12} />
            <span>{t('switchUser')}</span>
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            style={{
              padding: '4px 10px',
              fontSize: '11.5px',
              margin: 0,
              background: 'var(--brick-soft)',
              color: 'var(--brick)',
              border: '1px solid var(--brick-dim)',
              borderRadius: 4,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontWeight: 600
            }}
            title={t('signOut')}
          >
            <LogOut size={12} />
            <span>{t('signOut')}</span>
          </button>
        </div>
      </div>

      {/* Intro Header */}
      <div className="intro" style={{ padding: '14px 18px 0 18px' }}>
        <h1>{t('intakeHeading')}</h1>
        <p>{t('intakeSub')}</p>
      </div>

      {/* Completion Alert Bar on Portal if any complaint is marked resolved */}
      {resolvedCount > 0 && activeTab !== 'mine' && (
        <div
          onClick={() => setActiveTab('mine')}
          className="animate-fade-in"
          style={{
            margin: '12px 18px 4px 18px',
            padding: '10px 14px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#fff',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '12.5px', fontWeight: 600 }}>
            <CheckCircle2 size={18} />
            <span>🎉 {resolvedCount} {resolvedCount === 1 ? 'report has been resolved' : 'reports have been resolved'}! Tap to review &amp; rate resolution.</span>
          </div>
          <ChevronRight size={16} />
        </div>
      )}

      {/* Tab Navigation */}
      <nav className="tabs" role="tablist">
        <div
          className={`tab ${activeTab === 'submit' ? 'active' : ''}`}
          onClick={() => setActiveTab('submit')}
          role="tab"
        >
          <span>{t('tabReport')}</span>
        </div>

        <div
          className={`tab ${activeTab === 'mine' ? 'active' : ''}`}
          onClick={() => setActiveTab('mine')}
          role="tab"
        >
          <span>{t('tabMyComplaints')}</span>
          <span className="tab-badge">{myCount}</span>
        </div>

        <div
          className={`tab ${activeTab === 'nearby' ? 'active' : ''}`}
          onClick={() => setActiveTab('nearby')}
          role="tab"
        >
          <span>{t('tabNearby')}</span>
        </div>

        <div
          className={`tab ${activeTab === 'demo' ? 'active' : ''}`}
          onClick={() => setActiveTab('demo')}
          role="tab"
          title="SIH26-S02 Demonstration Scenarios"
        >
          <Sparkles size={11} />
          <span>{t('tabDemo')}</span>
        </div>
      </nav>

      {/* Tab Content Views */}
      <main style={{ padding: '12px 18px 100px 18px', flex: 1 }}>
        {activeTab === 'submit' && (
          <GrievanceForm onSubmitted={() => setActiveTab('mine')} />
        )}

        {activeTab === 'mine' && (
          <MyComplaints />
        )}

        {activeTab === 'nearby' && (
          <NearbyFeed />
        )}

        {activeTab === 'demo' && (
          <DemoScenarios />
        )}
      </main>

      {/* Floating Action Button */}
      <div
        className="fab"
        title={t('btnSubmitReport')}
        onClick={() => {
          setActiveTab('submit');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      >
        <Plus size={24} />
      </div>
    </div>
  );
};
