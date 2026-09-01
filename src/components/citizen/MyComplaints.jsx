import React, { useState } from 'react';
import { useGrievances } from '../../context/GrievanceContext';
import { useAuth } from '../../context/AuthContext';
import { Clock, CheckCircle, AlertCircle, Share2, Star, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

export const MyComplaints = () => {
  const { complaints, rateResolution, reopenComplaint, showToast } = useGrievances();
  const { currentUser } = useAuth();
  const [expandedAiId, setExpandedAiId] = useState(null);

  // Filter complaints belonging to current user or top relevant
  const myReports = complaints.filter(c => c.authorName === currentUser?.name || c.id.startsWith('GRV-2026-0001') || c.similarCount > 0);

  const getStepIndex = (status) => {
    switch (status) {
      case 'submitted': return 0;
      case 'ai_processed': return 1;
      case 'assigned': return 2;
      case 'acknowledged': return 2;
      case 'investigation': return 3;
      case 'progress': return 3;
      case 'resolved': return 4;
      case 'confirmed': return 4;
      case 'closed': return 4;
      case 'escalated': return 2;
      default: return 2;
    }
  };

  const handleShare = (id) => {
    navigator.clipboard?.writeText(window.location.href);
    showToast(`Tracking link for #${id} copied to clipboard!`, 'info');
  };

  const handleReopen = (id) => {
    const reason = prompt('Please describe why the issue is unresolved or unsatisfactory:', 'Work was incomplete.');
    if (reason) {
      reopenComplaint(id, reason);
    }
  };

  const handleRating = (id, stars) => {
    rateResolution(id, stars, 'Citizen confirmed completion.');
  };

  if (myReports.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--ink-soft)' }}>
        <p style={{ fontSize: '15px', fontWeight: 600 }}>No complaints filed yet</p>
        <p style={{ fontSize: '12.5px', color: 'var(--ink-faint)', marginTop: 4 }}>
          When you report an issue, you can track its real-time AI classification, department assignment, and resolution here.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {myReports.map(item => {
        const stepIdx = getStepIndex(item.status);
        const isAiExpanded = expandedAiId === item.id;

        return (
          <div key={item.id} className="complaint-card animate-fade-in">
            <div className="cc-top">
              <div>
                <div className="cc-title">{item.original_text || item.title}</div>
                <div className="cc-meta">
                  <span>{item.category}</span> · <span>{item.ward}</span> · <span>{item.timeAgo || 'Recent'}</span>
                </div>
              </div>
              <div className="cc-id">#{item.id}</div>
            </div>

            {/* Stepper Pipeline */}
            <div className="stepper">
              <div className={`step ${stepIdx >= 0 ? 'done' : ''} ${stepIdx === 0 ? 'current' : ''}`}>
                <div className="step-dot"></div>
                <div className="step-label">Submitted</div>
              </div>
              <div className={`step ${stepIdx >= 1 ? 'done' : ''} ${stepIdx === 1 ? 'current' : ''}`}>
                <div className="step-line"></div>
                <div className="step-dot"></div>
                <div className="step-label">AI Routed</div>
              </div>
              <div className={`step ${stepIdx >= 2 ? 'done' : ''} ${stepIdx === 2 ? 'current' : ''}`}>
                <div className="step-line"></div>
                <div className="step-dot"></div>
                <div className="step-label">Assigned</div>
              </div>
              <div className={`step ${stepIdx >= 3 ? 'done' : ''} ${stepIdx === 3 ? 'current' : ''}`}>
                <div className="step-line"></div>
                <div className="step-dot"></div>
                <div className="step-label">In Progress</div>
              </div>
              <div className={`step ${stepIdx >= 4 ? 'done' : ''} ${stepIdx === 4 ? 'current' : ''}`}>
                <div className="step-line"></div>
                <div className="step-dot"></div>
                <div className="step-label">Resolved</div>
              </div>
            </div>

            {/* Duplicate Cluster Note */}
            {item.similarCount > 1 && (
              <div className="similar-note">
                <Clock size={14} />
                <span>Grouped with {item.similarCount - 1} other citizen reports — raised priority to {item.priority.toUpperCase()}</span>
              </div>
            )}

            {/* Officer Assignment Info */}
            <div style={{ fontSize: '11.8px', color: 'var(--ink-soft)', marginTop: 10, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
              <div>
                <strong>Assigned to:</strong> {item.assignedTo || 'Ward Dispatch Engine'} ({item.department})
              </div>
              <div>
                <strong>Priority:</strong> <span style={{ color: item.priority === 'Critical' ? 'var(--brick)' : item.priority === 'High' ? 'var(--brick-dim)' : 'var(--moss)', fontWeight: 600 }}>{item.priority} (Score {item.priorityScore})</span>
              </div>
            </div>

            {/* Explainable AI Toggle */}
            <div style={{ marginTop: 10, borderTop: '1px dashed var(--line)', paddingTop: 8 }}>
              <button
                type="button"
                className="ticket-action-btn"
                onClick={() => setExpandedAiId(isAiExpanded ? null : item.id)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--blue-soft)', color: 'var(--blue)', border: 'none' }}
              >
                <Sparkles size={12} />
                <span>Explainable AI Insights</span>
                {isAiExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>

              {isAiExpanded && (
                <div className="animate-fade-in" style={{ background: 'var(--paper)', borderRadius: 6, padding: '10px 12px', marginTop: 8, fontSize: '12px' }}>
                  <div style={{ fontWeight: 600, color: 'var(--blue)', marginBottom: 4 }}>Why Priority is {item.priority}:</div>
                  <ul style={{ paddingLeft: 16, marginBottom: 8, color: 'var(--ink-soft)' }}>
                    {(item.explanation || ['Location sensitivity verified.', 'Category matched to civic department.']).map((exp, i) => (
                      <li key={i}>{exp}</li>
                    ))}
                  </ul>

                  <div style={{ fontWeight: 600, color: 'var(--blue)', marginBottom: 4 }}>Recommended Municipal Actions:</div>
                  <ul style={{ paddingLeft: 16, color: 'var(--ink-soft)' }}>
                    {(item.recommended_action || ['Inspect site.', 'Assign technician.']).map((act, i) => (
                      <li key={i}>{act}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="ticket-actions">
              {item.status === 'resolved' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>Rate Fix:</span>
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      size={14}
                      style={{ cursor: 'pointer', fill: (item.rating || 0) >= star ? 'var(--ochre)' : 'none', color: 'var(--ochre)' }}
                      onClick={() => handleRating(item.id, star)}
                    />
                  ))}
                </div>
              ) : null}

              {item.status === 'resolved' || item.status === 'closed' ? (
                <button className="ticket-action-btn" onClick={() => handleReopen(item.id)}>
                  Reopen Appeal
                </button>
              ) : null}

              <button className="ticket-action-btn" onClick={() => handleShare(item.id)}>
                <Share2 size={11} style={{ display: 'inline', marginRight: 3 }} />
                Share Tracking Link
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
