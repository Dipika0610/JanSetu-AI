import React, { useState } from 'react';
import { useGrievances } from '../../context/GrievanceContext';
import { useLanguage } from '../../context/LanguageContext';
import { evaluateVolumePriorityCondition } from '../../services/aiEngine';
import {
  Layers,
  ArrowDownUp,
  Info,
  Flame,
  AlertOctagon,
  Users,
  CheckCircle2,
  LayoutGrid,
  List,
  Clock,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

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

  const [viewMode, setViewMode] = useState('matrix'); // 'matrix' (Differentiated Tier Cards) | 'table' (Standard List)
  const [selectedTier, setSelectedTier] = useState('all'); // 'all' | 'tier1' | 'tier2' | 'tier3' | 'tier4'
  const [sortBy, setSortBy] = useState('priority'); // 'priority' | 'cluster' | 'time'
  const [showRulesInfo, setShowRulesInfo] = useState(false);

  // 1. Dynamic Report Count & Priority Decision Logic for every complaint
  const processedComplaints = complaints.map(item => {
    // Count exact number of reports (cluster duplicates + upvotes)
    const reportCount = (item.similarCount || 0) > 0 ? item.similarCount : (item.upvotes || 1);
    const volumeDecision = evaluateVolumePriorityCondition(reportCount);

    // Compute decided dynamic priority & score based on report count
    let decidedPriority = item.priority;
    let decidedScore = item.priorityScore || 50;

    if (reportCount >= 25) {
      decidedPriority = 'Critical';
      decidedScore = Math.max(decidedScore, 94);
    } else if (reportCount >= 10) {
      if (decidedPriority === 'Low' || decidedPriority === 'Medium') decidedPriority = 'High';
      decidedScore = Math.max(decidedScore, 82);
    } else if (reportCount >= 3) {
      if (decidedPriority === 'Low') decidedPriority = 'Medium';
      decidedScore = Math.max(decidedScore, 65);
    }

    return {
      ...item,
      reportCount,
      volumeDecision,
      decidedPriority,
      decidedScore
    };
  });

  // 2. Filter complaints
  let filtered = [...processedComplaints];

  // Department filter
  if (selectedDept !== 'all') {
    filtered = filtered.filter(c => {
      const cat = (c.category || '').toLowerCase();
      const dept = (c.department || '').toLowerCase();
      return cat.includes(selectedDept) || dept.includes(selectedDept);
    });
  }

  // Ward filter
  if (selectedWard && selectedWard !== 'all') {
    filtered = filtered.filter(c => c.ward && c.ward.toLowerCase() === selectedWard.toLowerCase());
  }

  // Cluster Size / Duplicate Count filter
  if (clusterFilter === 'grouped') {
    filtered = filtered.filter(c => c.reportCount >= 2);
  } else if (clusterFilter === 'high') {
    filtered = filtered.filter(c => c.reportCount >= 10);
  } else if (clusterFilter === 'major') {
    filtered = filtered.filter(c => c.reportCount >= 25);
  } else if (clusterFilter === 'standalone') {
    filtered = filtered.filter(c => c.reportCount <= 1);
  }

  // Tier Filter
  if (selectedTier === 'tier1') {
    filtered = filtered.filter(c => c.reportCount >= 25);
  } else if (selectedTier === 'tier2') {
    filtered = filtered.filter(c => c.reportCount >= 10 && c.reportCount < 25);
  } else if (selectedTier === 'tier3') {
    filtered = filtered.filter(c => c.reportCount >= 3 && c.reportCount < 10);
  } else if (selectedTier === 'tier4') {
    filtered = filtered.filter(c => c.reportCount < 3);
  }

  // Search query
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

  // Dynamic Sorting
  if (sortBy === 'cluster') {
    filtered.sort((a, b) => b.reportCount - a.reportCount);
  } else if (sortBy === 'time') {
    filtered.sort((a, b) => new Date(b.reportedAt || 0) - new Date(a.reportedAt || 0));
  } else {
    // Default: decidedScore
    filtered.sort((a, b) => b.decidedScore - a.decidedScore);
  }

  // Calculate Tier Counts for summary strip
  const tier1Count = processedComplaints.filter(c => c.reportCount >= 25).length;
  const tier2Count = processedComplaints.filter(c => c.reportCount >= 10 && c.reportCount < 25).length;
  const tier3Count = processedComplaints.filter(c => c.reportCount >= 3 && c.reportCount < 10).length;
  const tier4Count = processedComplaints.filter(c => c.reportCount < 3).length;

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
      {/* Header with Title & View Mode Toggle */}
      <div className="panel-head" style={{ flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 style={{ margin: 0 }}>{t('incomingComplaints')}</h2>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setShowRulesInfo(!showRulesInfo)}
              style={{ padding: '2px 6px', fontSize: '11px', margin: 0, display: 'inline-flex', alignItems: 'center', gap: 3 }}
              title="View Prioritization Conditional Rules"
            >
              <Info size={12} />
              <span>Prioritization Rules</span>
            </button>
          </div>
          <span className="hint">{t('queueSubHint')}</span>
        </div>

        {/* View Mode Toggle & Filter Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* View Mode Buttons (Matrix Cards vs Tabular) */}
          <div style={{ display: 'flex', background: 'var(--paper)', padding: '2px', borderRadius: 6, border: '1px solid var(--line-strong)' }}>
            <button
              type="button"
              onClick={() => setViewMode('matrix')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 8px',
                fontSize: '11.5px',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                background: viewMode === 'matrix' ? 'var(--card)' : 'transparent',
                color: viewMode === 'matrix' ? 'var(--blue)' : 'var(--ink-soft)',
                fontWeight: viewMode === 'matrix' ? 600 : 400,
                boxShadow: viewMode === 'matrix' ? 'var(--shadow-sm)' : 'none'
              }}
              title="Volume Prioritization Matrix View"
            >
              <LayoutGrid size={13} />
              <span>Volume Matrix</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 8px',
                fontSize: '11.5px',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                background: viewMode === 'table' ? 'var(--card)' : 'transparent',
                color: viewMode === 'table' ? 'var(--blue)' : 'var(--ink-soft)',
                fontWeight: viewMode === 'table' ? 600 : 400,
                boxShadow: viewMode === 'table' ? 'var(--shadow-sm)' : 'none'
              }}
              title="Standard Table View"
            >
              <List size={13} />
              <span>Table</span>
            </button>
          </div>

          {/* Sort Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <ArrowDownUp size={13} style={{ color: 'var(--ink-soft)' }} />
            <select
              className="select-ctrl"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ fontSize: '11.5px', padding: '4px 8px' }}
            >
              <option value="priority">Sort: Priority Score (Decided)</option>
              <option value="cluster">Sort: Report Count (Highest)</option>
              <option value="time">Sort: Newest First</option>
            </select>
          </div>

          <span className="badge badge-blue">{filtered.length} {t('activeItems')}</span>
        </div>
      </div>

      {/* Differentiated Interactive Volume Priority Tiers Summary Strip */}
      <div
        className="volume-tiers-strip animate-fade-in"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: 8,
          marginBottom: 12,
          padding: '10px',
          background: 'var(--card)',
          borderRadius: 8,
          border: '1px solid var(--line)'
        }}
      >
        {/* Tier 1 */}
        <div
          onClick={() => setSelectedTier(selectedTier === 'tier1' ? 'all' : 'tier1')}
          style={{
            padding: '8px 10px',
            borderRadius: 6,
            cursor: 'pointer',
            border: `1.5px solid ${selectedTier === 'tier1' ? 'var(--brick)' : 'var(--brick-dim)'}`,
            background: selectedTier === 'tier1' ? 'var(--brick-soft)' : 'var(--paper)',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--brick)' }}>🚨 &ge;25 Reports</span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--brick)' }}>{tier1Count}</span>
          </div>
          <div style={{ fontSize: '10.5px', color: 'var(--ink-soft)', marginTop: 2 }}>
            <strong>CRITICAL</strong> · 2h SLA
          </div>
        </div>

        {/* Tier 2 */}
        <div
          onClick={() => setSelectedTier(selectedTier === 'tier2' ? 'all' : 'tier2')}
          style={{
            padding: '8px 10px',
            borderRadius: 6,
            cursor: 'pointer',
            border: `1.5px solid ${selectedTier === 'tier2' ? 'var(--brick-dim)' : 'var(--line-strong)'}`,
            background: selectedTier === 'tier2' ? 'var(--brick-soft)' : 'var(--paper)',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--brick-dim)' }}>🔥 10-24 Reports</span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--brick-dim)' }}>{tier2Count}</span>
          </div>
          <div style={{ fontSize: '10.5px', color: 'var(--ink-soft)', marginTop: 2 }}>
            <strong>HIGH</strong> · 6h SLA
          </div>
        </div>

        {/* Tier 3 */}
        <div
          onClick={() => setSelectedTier(selectedTier === 'tier3' ? 'all' : 'tier3')}
          style={{
            padding: '8px 10px',
            borderRadius: 6,
            cursor: 'pointer',
            border: `1.5px solid ${selectedTier === 'tier3' ? 'var(--ochre)' : 'var(--line-strong)'}`,
            background: selectedTier === 'tier3' ? 'var(--ochre-soft)' : 'var(--paper)',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ochre-dim)' }}>👥 3-9 Reports</span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ochre-dim)' }}>{tier3Count}</span>
          </div>
          <div style={{ fontSize: '10.5px', color: 'var(--ink-soft)', marginTop: 2 }}>
            <strong>MEDIUM</strong> · 24h SLA
          </div>
        </div>

        {/* Tier 4 */}
        <div
          onClick={() => setSelectedTier(selectedTier === 'tier4' ? 'all' : 'tier4')}
          style={{
            padding: '8px 10px',
            borderRadius: 6,
            cursor: 'pointer',
            border: `1.5px solid ${selectedTier === 'tier4' ? 'var(--blue)' : 'var(--line-strong)'}`,
            background: selectedTier === 'tier4' ? 'var(--blue-soft)' : 'var(--paper)',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--blue-dim)' }}>👤 1-2 Reports</span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--blue-dim)' }}>{tier4Count}</span>
          </div>
          <div style={{ fontSize: '10.5px', color: 'var(--ink-soft)', marginTop: 2 }}>
            <strong>STANDARD</strong> · 48-72h SLA
          </div>
        </div>
      </div>

      {/* Conditional Rules Info Banner */}
      {showRulesInfo && (
        <div
          className="animate-fade-in"
          style={{
            background: 'var(--paper)',
            border: '1px solid var(--line-strong)',
            borderRadius: 8,
            padding: '12px 14px',
            marginBottom: 12,
            fontSize: '12px'
          }}
        >
          <strong style={{ color: 'var(--blue)', display: 'block', marginBottom: 6 }}>
            ⚖️ Volume Decision Engine (Counts Total Reports &rarr; Decides Priority):
          </strong>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
            <div style={{ background: 'var(--brick-soft)', padding: '6px 8px', borderRadius: 6, border: '1px solid var(--brick-dim)', color: 'var(--brick)' }}>
              <strong>1. If Count &ge; 25:</strong>
              <div style={{ fontSize: '11px' }}>Decides: <strong>CRITICAL (Score &ge; 94)</strong> · 2-hr SLA · Commissioner Escalation</div>
            </div>
            <div style={{ background: 'var(--brick-soft)', padding: '6px 8px', borderRadius: 6, border: '1px solid var(--brick-dim)', color: 'var(--brick-dim)' }}>
              <strong>2. If Count 10 to 24:</strong>
              <div style={{ fontSize: '11px' }}>Decides: <strong>HIGH (Score &ge; 82)</strong> · 6-hr SLA · Batch Field Crew</div>
            </div>
            <div style={{ background: 'var(--ochre-soft)', padding: '6px 8px', borderRadius: 6, border: '1px solid var(--ochre)', color: 'var(--ochre-dim)' }}>
              <strong>3. If Count 3 to 9:</strong>
              <div style={{ fontSize: '11px' }}>Decides: <strong>MEDIUM (Score &ge; 65)</strong> · 24-hr SLA · Consensus Verification</div>
            </div>
            <div style={{ background: 'var(--blue-soft)', padding: '6px 8px', borderRadius: 6, border: '1px solid var(--blue-dim)', color: 'var(--blue)' }}>
              <strong>4. If Count 1 to 2:</strong>
              <div style={{ fontSize: '11px' }}>Decides: <strong>STANDARD (Score 40-55)</strong> · 48-72h SLA · Regular Routine</div>
            </div>
          </div>
        </div>
      )}

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

      {/* ================= DIFFERENTIATED VIEW MODE 1: VOLUME MATRIX CARDS ================= */}
      {viewMode === 'matrix' ? (
        <div className="volume-matrix-grid animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--ink-faint)' }}>
              {t('noMatches')}
            </div>
          ) : (
            filtered.map(item => {
              const count = item.reportCount;
              const rule = item.volumeDecision;
              const isCritical = item.decidedPriority === 'Critical';
              const isHigh = item.decidedPriority === 'High';

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectComplaint(item)}
                  style={{
                    background: 'var(--card)',
                    border: `1.5px solid ${isCritical ? 'var(--brick)' : isHigh ? 'var(--brick-dim)' : 'var(--line)'}`,
                    borderRadius: 8,
                    padding: '14px 16px',
                    cursor: 'pointer',
                    boxShadow: isCritical ? '0 3px 12px rgba(168,64,42,0.12)' : 'var(--shadow-sm)',
                    transition: 'all 0.18s ease'
                  }}
                  className="volume-matrix-card"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 260 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span
                          className={`badge ${isCritical ? 'badge-brick' : isHigh ? 'badge-brick' : 'badge-ochre'}`}
                          style={{ fontWeight: 700, fontSize: '11px' }}
                        >
                          {item.decidedPriority.toUpperCase()} (Score: {item.decidedScore})
                        </span>
                        <span style={{ fontSize: '11.5px', color: 'var(--ink-faint)', fontFamily: 'monospace' }}>
                          #{item.id}
                        </span>
                        <span style={{ fontSize: '11.5px', color: 'var(--ink-soft)' }}>
                          📍 {item.location || item.ward}
                        </span>
                      </div>

                      <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--ink)', lineHeight: 1.35, marginBottom: 6 }}>
                        {item.original_text || item.title}
                      </div>

                      <div style={{ fontSize: '11.5px', color: 'var(--ink-soft)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span><strong>Dept:</strong> {item.department}</span>
                        <span>·</span>
                        <span><strong>Reported:</strong> {item.timeAgo || 'Recent'}</span>
                        <span>·</span>
                        <span><strong>Assigned:</strong> {item.assignedTo || 'Pending Dispatch'}</span>
                      </div>
                    </div>

                    {/* Right Side: Prominent Dynamic Report Counter & SLA Meter */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                      {/* Big Report Count Badge */}
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          background: count >= 25 ? 'var(--brick)' : count >= 10 ? 'var(--brick-dim)' : count >= 3 ? 'var(--ochre)' : 'var(--blue-soft)',
                          color: count >= 3 ? '#fff' : 'var(--blue)',
                          padding: '6px 12px',
                          borderRadius: 20,
                          fontWeight: 700,
                          fontSize: '12.5px',
                          boxShadow: 'var(--shadow-sm)'
                        }}
                      >
                        {count >= 10 ? <Flame size={14} /> : <Users size={14} />}
                        <span>{count} {count === 1 ? 'Report' : 'Reports Submitted'}</span>
                      </div>

                      {/* Rule Decision & SLA Timer */}
                      <div style={{ fontSize: '11px', color: count >= 10 ? 'var(--brick)' : 'var(--ink-soft)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={12} />
                        <span>SLA: <strong>{rule.slaHours} Hours</strong></span>
                        <span>·</span>
                        {getStatusBadge(item.status)}
                      </div>
                    </div>
                  </div>

                  {/* Volume Decision Reason Footer */}
                  <div
                    style={{
                      marginTop: 10,
                      paddingTop: 8,
                      borderTop: '1px dashed var(--line)',
                      fontSize: '11.5px',
                      color: 'var(--ink-soft)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 6
                    }}
                  >
                    <span style={{ fontStyle: 'italic', color: 'var(--blue-dim)' }}>
                      💡 {rule.ruleText}
                    </span>
                    <span style={{ color: 'var(--blue)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      Inspect Volume Calculation <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* ================= VIEW MODE 2: STANDARD TABULAR LIST ================= */
        <div className="queue-container animate-fade-in">
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--ink-faint)' }}>
              {t('noMatches')}
            </div>
          ) : (
            <table className="queue-table">
              <thead>
                <tr>
                  <th style={{ width: '38%' }}>{t('colComplaint')}</th>
                  <th>{t('colWard')}</th>
                  <th>{t('colReported')}</th>
                  <th>Report Count &amp; Rule</th>
                  <th>Decided Priority</th>
                  <th>{t('colStatus')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => {
                  const count = item.reportCount;
                  const volumeRule = item.volumeDecision;
                  const prioClass = item.decidedPriority === 'Critical' || item.decidedPriority === 'High' ? 'prio-high' : item.decidedPriority === 'Medium' ? 'prio-med' : 'prio-low';

                  return (
                    <tr
                      key={item.id}
                      className={`${prioClass} animate-fade-in`}
                      onClick={() => onSelectComplaint(item)}
                    >
                      <td>
                        <div className="complaint-title">
                          <span className="prio-dot" title={`${t('priority')}: ${item.decidedPriority} (Score: ${item.decidedScore})`}></span>
                          <span>{item.original_text || item.title}</span>
                        </div>
                        <div className="complaint-meta">
                          {item.category} · #{item.id} · <span style={{ fontWeight: 600 }}>Score: {item.decidedScore}</span>
                        </div>
                      </td>
                      <td className="ward-text">{item.ward}</td>
                      <td className="age-text">{item.timeAgo || 'Recent'}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span className={`badge ${volumeRule.badgeClass}`} style={{ fontSize: '11px', width: 'fit-content', fontWeight: 600 }}>
                            {count} Reports Submitted
                          </span>
                          <span style={{ fontSize: '10px', color: 'var(--ink-faint)' }}>
                            SLA: {volumeRule.slaHours}h · {volumeRule.conditionMet}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${item.decidedPriority === 'Critical' || item.decidedPriority === 'High' ? 'badge-brick' : 'badge-ochre'}`}>
                          {item.decidedPriority} ({item.decidedScore})
                        </span>
                      </td>
                      <td>{getStatusBadge(item.status)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </section>
  );
};
