import React, { useState } from 'react';
import { useGrievances } from '../../context/GrievanceContext';
import { useLanguage } from '../../context/LanguageContext';
import { GrievanceForm } from './GrievanceForm';
import { MyComplaints } from './MyComplaints';
import { NearbyFeed } from './NearbyFeed';
import { DemoScenarios } from './DemoScenarios';
import { Plus, Sparkles } from 'lucide-react';

export const CitizenPortal = () => {
  const { complaints } = useGrievances();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('submit');

  const myCount = complaints.filter(c => c.similarCount > 0 || c.id.startsWith('GRV-2026-0001')).length;

  return (
    <div className="shell">
      {/* Intro Header */}
      <div className="intro" style={{ padding: '4px 18px 0 18px' }}>
        <h1>{t('intakeHeading')}</h1>
        <p>{t('intakeSub')}</p>
      </div>

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
