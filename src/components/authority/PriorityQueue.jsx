import React, { useState } from 'react';
import { useGrievances } from '../../context/GrievanceContext';
import { useLanguage } from '../../context/LanguageContext';
import { Layers, ArrowDownUp } from 'lucide-react';

const DEPT_CHIPS = [
  { id: 'all', labelKey: 'allDepts', defaultLabel: 'All departments' },
  { id: 'drainage', defaultLabel: 'Drainage / Sewage' },
  { id: 'water', defaultLabel: 'Water supply' },
  { id: 'roads', defaultLabel: 'Roads & Traffic' },
  { id: 'streetlights', defaultLabel: 'Streetlights' },
  { id: 'public-safety', defaultLabel: 'Public works & safety' },
  { id: 'garbage', defaultLabel: 'Garbage & Waste' }
];

export const PriorityQueue = ({ onSelectComplaint }) => {
  const {
    complaints,
    selectedDept,
    setSelectedDept,
    clusterFilter,
    setClusterFilter,
    selectedWard,
    searchQuery
  } = useGrievances();
  const { t } = useLanguage();

  const [sortBy, setSortBy] = useState('priority'); // 'priority' | 'cluster' | 'time'

  // Filter complaints
  let filtered = [...complaints];

  // 1. Department filter
  if (selectedDept !== 'all') {
    filtered = filtered.filter(c => {
      const cat = (c.category || '').toLowerCase();
      const dept = (c.department || '').toLowerCase();
      return cat.includes(selectedDept) || dept.includes(selectedDept);
    });
  }

  // 2. Ward filter
  if (selectedWard && selectedWard !== 'all') {
    filtered = filtered.filter(c => c.ward && c.ward.toLowerCase() === selectedWard.toLowerCase());
  }

  // 3. Cluster Size / Duplicate Count filter
  if (clusterFilter === 'grouped') {
    filtered = filtered.filter(c => (c.similarCount || c.upvotes || 0) >= 2);
  } else if (clusterFilter === 'high') {
    filtered = filtered.filter(c => (c.similarCount || c.upvotes || 0) >= 10);
  } else if (clusterFilter === 'major') {
    filtered = filtered.filter(c => (c.similarCount || c.upvotes || 0) >= 25);
  } else if (clusterFilter === 'standalone') {
    filtered = filtered.filter(c => !c.similarCount || c.similarCount <= 1);
  }

  // 4. Search query
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(c =>
      (c.original_text && c.original_text.toLowerCase().includes(q)) ||
      (c.id && c.id.toLowerCase().includes(q)) ||
      (c.ward && c.ward.toLowerCase().includes(q)) ||
      (c.category && c.category.toLowerCase().includes(q)) ||
      (c.department && c.department.toLowerCase().includes(q))
    );
  }

  // 5. Dynamic Sorting
  if (sortBy === 'cluster') {
    filtered.sort((a, b) => (b.similarCount || b.upvotes || 0) - (a.similarCount || a.upvotes || 0));
  } else if (sortBy === 'time') {
    filtered.sort((a, b) => new Date(b.reportedAt || 0) - new Date(a.reportedAt || 0));
  } else {
    // Default: priorityScore
    filtered.sort((a, b) => (b.priorityScore || 50) - (a.priorityScore || 50));
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'submitted': return <span className="status-pill status-unassigned">{t('stepSubmitted')}</span>;
      case 'assigned': return <span className="status-pill status-assigned">{t('stepAssigned')}</span>;
      case 'investigation': return <span className="status-pill status-progress">{t('stepInProgress')}</span>;
      case 'progress': return <span className="status-pill status-progress">{t('stepInProgress')}</span>;
      case 'resolved': return <span className="status-pill status-resolved">{t('stepResolved')}</span>;
      case 'closed': return <span className="status-pill status-resolved">{t('stepClosed')}</span>;
      case 'escalated': return <span className="status-pill status-unassigned" style={{ background: 'var(--brick)', color: '#fff' }}>Escalated</span>;
      default: return <span className="status-pill status-unassigned">{t('stepSubmitted')}</span>;
    }
  };

  return (
    <section className="panel" id="priorityQueuePanel">
      <div className="panel-head" style={{ flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2>{t('incomingComplaints')}</h2>
          <span className="hint">{t('queueSubHint')}</span>
        </div>

        {/* Cluster Filter & Sorting Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Cluster Filter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Layers size={13} style={{ color: 'var(--blue)' }} />
            <select
              className="select-ctrl"
              value={clusterFilter}
              onChange={(e) => setClusterFilter(e.target.value)}
              title="Filter complaints according to number of clusters"
              style={{ fontSize: '11.5px', padding: '4px 8px' }}
            >
              <option value="all">{t('allClusters')}</option>
              <option value="grouped">{t('groupedOnly')}</option>
              <option value="high">{t('highClusters')}</option>
              <option value="major">{t('majorClusters')}</option>
              <option value="standalone">{t('standaloneOnly')}</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <ArrowDownUp size={13} style={{ color: 'var(--ink-soft)' }} />
            <select
              className="select-ctrl"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ fontSize: '11.5px', padding: '4px 8px' }}
            >
              <option value="priority">Sort: Priority Score</option>
              <option value="cluster">Sort: Cluster Size (Max Reports)</option>
              <option value="time">Sort: Newest First</option>
            </select>
          </div>

          <span className="badge badge-blue">{filtered.length} {t('activeItems')}</span>
        </div>
      </div>

      {/* Department Filter Chips */}
      <div className="chips-filter">
        {DEPT_CHIPS.map(chip => (
          <div
            key={chip.id}
            className={`chip ${selectedDept === chip.id ? 'active' : ''}`}
            onClick={() => setSelectedDept(chip.id)}
          >
            {chip.labelKey ? t(chip.labelKey) : chip.defaultLabel}
          </div>
        ))}
      </div>

      {/* Queue Table (Desktop) & Mobile Cards */}
      <div className="queue-container">
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--ink-faint)' }}>
            {t('noMatches')}
          </div>
        ) : (
          <table className="queue-table">
            <thead>
              <tr>
                <th style={{ width: '40%' }}>{t('colComplaint')}</th>
                <th>{t('colWard')}</th>
                <th>{t('colReported')}</th>
                <th>{t('colSimilar')}</th>
                <th>{t('colStatus')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const prioClass = item.priority === 'Critical' || item.priority === 'High' ? 'prio-high' : item.priority === 'Medium' ? 'prio-med' : 'prio-low';
                const count = item.similarCount || item.upvotes || 0;
                const similarBadge = count > 1
                  ? <span className="similar-badge" style={{ background: count >= 10 ? 'var(--brick-soft)' : 'var(--ochre-soft)', color: count >= 10 ? 'var(--brick)' : 'var(--ochre-dim)', border: '1px solid currentColor' }}>{count} {t('similarBadge')}</span>
                  : <span className="similar-badge none">{t('noMatches')}</span>;

                return (
                  <tr
                    key={item.id}
                    className={`${prioClass} animate-fade-in`}
                    onClick={() => onSelectComplaint(item)}
                  >
                    <td>
                      <div className="complaint-title">
                        <span className="prio-dot" title={`${t('priority')}: ${item.priority} (Score: ${item.priorityScore})`}></span>
                        <span>{item.original_text || item.title}</span>
                      </div>
                      <div className="complaint-meta">
                        {item.category} · #{item.id} · <span style={{ fontWeight: 600 }}>Score: {item.priorityScore}</span>
                      </div>
                      <div className="mobile-row-footer">
                        <span className="ward-text" style={{ fontSize: '11.5px' }}>📍 {item.ward} · {item.timeAgo || 'Recent'}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {similarBadge}
                          {getStatusBadge(item.status)}
                        </div>
                      </div>
                    </td>
                    <td className="ward-text">{item.ward}</td>
                    <td className="age-text">{item.timeAgo || 'Recent'}</td>
                    <td>{similarBadge}</td>
                    <td>{getStatusBadge(item.status)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};
