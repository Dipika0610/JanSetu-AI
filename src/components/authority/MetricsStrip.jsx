import React from 'react';
import { useGrievances } from '../../context/GrievanceContext';

export const MetricsStrip = () => {
  const { complaints, clusters } = useGrievances();

  const totalToday = 186 + complaints.length;
  const criticalCount = complaints.filter(c => (c.priority === 'Critical' || c.priority === 'High') && c.status !== 'resolved' && c.status !== 'closed').length;
  const mergedTotal = 612 + clusters.filter(c => c.isMerged).length;

  return (
    <section className="metrics-strip">
      <div className="metric-card">
        <div className="metric-label">Total / New complaints today</div>
        <div className="metric-value">
          <span>{totalToday}</span>
          <span className="metric-delta up">↑ 12%</span>
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-label">High &amp; Critical, open</div>
        <div className="metric-value">
          <span>{criticalCount}</span>
          <span className="metric-delta up">↑ {criticalCount > 40 ? 5 : 2}</span>
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-label">Avg. resolution time</div>
        <div className="metric-value">
          3.2<span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--ink-soft)' }}>&nbsp;days</span>
          <span className="metric-delta down">↓ 0.4</span>
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-label">Duplicates auto-merged</div>
        <div className="metric-value">
          <span>{mergedTotal}</span>
          <span className="metric-delta down" style={{ fontSize: '11px' }}>saved 4.9h</span>
        </div>
      </div>
    </section>
  );
};
