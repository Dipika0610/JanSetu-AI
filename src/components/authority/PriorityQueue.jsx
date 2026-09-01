import React from 'react';
import { useGrievances } from '../../context/GrievanceContext';

const DEPT_CHIPS = [
  { id: 'all', label: 'All departments' },
  { id: 'drainage', label: 'Drainage / Sewage' },
  { id: 'water', label: 'Water supply' },
  { id: 'roads', label: 'Roads & Traffic' },
  { id: 'streetlights', label: 'Streetlights' },
  { id: 'public-safety', label: 'Public works & safety' },
  { id: 'garbage', label: 'Garbage & Waste' }
];

export const PriorityQueue = ({ onSelectComplaint }) => {
  const {
    complaints,
    selectedDept,
    setSelectedDept,
    selectedWard,
    searchQuery
  } = useGrievances();

  // Filter complaints
  let filtered = [...complaints];

  // Sort descending by priorityScore
  filtered.sort((a, b) => (b.priorityScore || 50) - (a.priorityScore || 50));

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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'submitted': return <span className="status-pill status-unassigned">Submitted</span>;
      case 'assigned': return <span className="status-pill status-assigned">Assigned</span>;
      case 'investigation': return <span className="status-pill status-progress">Investigation</span>;
      case 'progress': return <span className="status-pill status-progress">In Progress</span>;
      case 'resolved': return <span className="status-pill status-resolved">Resolved</span>;
      case 'closed': return <span className="status-pill status-resolved">Closed</span>;
      case 'escalated': return <span className="status-pill status-unassigned" style={{ background: 'var(--brick)', color: '#fff' }}>Escalated</span>;
      default: return <span className="status-pill status-unassigned">Unassigned</span>;
    }
  };

  return (
    <section className="panel" id="priorityQueuePanel">
      <div className="panel-head">
        <div>
          <h2>Incoming complaints</h2>
          <span className="hint">Sorted dynamically by severity score &amp; urgency multiplier</span>
        </div>
        <span className="badge badge-blue">{filtered.length} active items</span>
      </div>

      {/* Department Filter Chips */}
      <div className="chips-filter">
        {DEPT_CHIPS.map(chip => (
          <div
            key={chip.id}
            className={`chip ${selectedDept === chip.id ? 'active' : ''}`}
            onClick={() => setSelectedDept(chip.id)}
          >
            {chip.label}
          </div>
        ))}
      </div>

      {/* Queue Table (Desktop) & Mobile Cards */}
      <div className="queue-container">
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--ink-faint)' }}>
            No complaints match the selected filter criteria.
          </div>
        ) : (
          <table className="queue-table">
            <thead>
              <tr>
                <th style={{ width: '40%' }}>Complaint &amp; ID</th>
                <th>Ward</th>
                <th>Reported</th>
                <th>Similar Reports</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const prioClass = item.priority === 'Critical' || item.priority === 'High' ? 'prio-high' : item.priority === 'Medium' ? 'prio-med' : 'prio-low';
                const similarBadge = item.similarCount > 0
                  ? <span className="similar-badge">{item.similarCount} similar</span>
                  : <span className="similar-badge none">No matches</span>;

                return (
                  <tr
                    key={item.id}
                    className={`${prioClass} animate-fade-in`}
                    onClick={() => onSelectComplaint(item)}
                  >
                    <td>
                      <div className="complaint-title">
                        <span className="prio-dot" title={`Priority: ${item.priority} (Score: ${item.priorityScore})`}></span>
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
