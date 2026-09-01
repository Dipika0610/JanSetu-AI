import React from 'react';
import { ListOrdered, GitMerge, MapPin, ExternalLink } from 'lucide-react';
import { useGrievances } from '../../context/GrievanceContext';
import { useLanguage } from '../../context/LanguageContext';

export const MobileBottomNav = ({ activeSection, onSectionChange, onViewChange }) => {
  const { complaints } = useGrievances();
  const { t } = useLanguage();
  const openCount = complaints.filter(c => c.status !== 'resolved' && c.status !== 'closed').length;

  return (
    <nav className="mobile-bottom-nav">
      <div className="mobile-nav-items">
        <button
          className={`mobile-nav-btn ${activeSection === 'queue' ? 'active' : ''}`}
          onClick={() => onSectionChange('queue')}
        >
          <ListOrdered size={18} />
          <span>{t('priorityQueue')}</span>
          <span className="mobile-nav-badge">{openCount}</span>
        </button>

        <button
          className={`mobile-nav-btn ${activeSection === 'clusters' ? 'active' : ''}`}
          onClick={() => onSectionChange('clusters')}
        >
          <GitMerge size={18} />
          <span>{t('duplicateClusters')}</span>
        </button>

        <button
          className={`mobile-nav-btn ${activeSection === 'map' ? 'active' : ''}`}
          onClick={() => onSectionChange('map')}
        >
          <MapPin size={18} />
          <span>{t('hotspotMap')}</span>
        </button>

        <button
          className="mobile-nav-btn"
          onClick={() => onViewChange('citizen')}
        >
          <ExternalLink size={18} />
          <span>{t('citizen')}</span>
        </button>
      </div>
    </nav>
  );
};
