import React, { useState } from 'react';
import { useGrievances } from '../../context/GrievanceContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Clock, CheckCircle, CheckCircle2, AlertCircle, Share2, Star, Sparkles,
  ChevronDown, ChevronUp, MessageSquare, Send, User, Shield
} from 'lucide-react';

export const MyComplaints = () => {
  const { complaints, rateResolution, reopenComplaint, addComment, showToast } = useGrievances();
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const [expandedAiId, setExpandedAiId] = useState(null);
  const [expandedCommentsId, setExpandedCommentsId] = useState(null);
  
  // Rating & Feedback State per complaint
  const [ratingsMap, setRatingsMap] = useState({}); // { [complaintId]: number }
  const [feedbackTextMap, setFeedbackTextMap] = useState({}); // { [complaintId]: string }
  const [selectedTagsMap, setSelectedTagsMap] = useState({}); // { [complaintId]: string[] }

  // Reply input state
  const [replyInputMap, setReplyInputMap] = useState({}); // { [complaintId]: string }

  // Filter complaints belonging to current user or top relevant
  const myReports = complaints.filter(
    c => c.authorName === currentUser?.name || c.id.startsWith('GRV-2026-0001') || c.similarCount > 0
  );

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

  const handleStarClick = (id, starValue) => {
    setRatingsMap(prev => ({ ...prev, [id]: starValue }));
  };

  const handleTagToggle = (id, tagLabel) => {
    setSelectedTagsMap(prev => {
      const current = prev[id] || [];
      if (current.includes(tagLabel)) {
        return { ...prev, [id]: current.filter(t => t !== tagLabel) };
      } else {
        return { ...prev, [id]: [...current, tagLabel] };
      }
    });
  };

  const handleSubmitFeedback = (id) => {
    const rating = ratingsMap[id] || 5;
    const text = feedbackTextMap[id] || '';
    const tags = selectedTagsMap[id] || [];

    rateResolution(id, rating, text || 'Citizen reviewed completion.', tags);

    // Reset local state for this ID
    setRatingsMap(prev => ({ ...prev, [id]: 0 }));
    setFeedbackTextMap(prev => ({ ...prev, [id]: '' }));
    setSelectedTagsMap(prev => ({ ...prev, [id]: [] }));
  };

  const handleSendReply = (complaintId) => {
    const text = replyInputMap[complaintId];
    if (!text || !text.trim()) return;

    addComment(complaintId, currentUser?.name || 'Citizen', 'Citizen', text);
    setReplyInputMap(prev => ({ ...prev, [complaintId]: '' }));
    setExpandedCommentsId(complaintId); // Ensure thread remains open
  };

  if (myReports.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--ink-soft)' }}>
        <p style={{ fontSize: '15px', fontWeight: 600 }}>{t('noComplaintsYet')}</p>
        <p style={{ fontSize: '12.5px', color: 'var(--ink-faint)', marginTop: 4 }}>
          {t('noComplaintsSub')}
        </p>
      </div>
    );
  }

  const feedbackTagOptions = [
    { key: 'tagPromptAction', label: t('tagPromptAction') },
    { key: 'tagGoodQuality', label: t('tagGoodQuality') },
    { key: 'tagPoliteOfficer', label: t('tagPoliteOfficer') },
    { key: 'tagNeedsFollowup', label: t('tagNeedsFollowup') }
  ];

  return (
    <div className="animate-fade-in">
      {myReports.map(item => {
        const stepIdx = getStepIndex(item.status);
        const isAiExpanded = expandedAiId === item.id;
        const isCommentsExpanded = expandedCommentsId === item.id;
        const commentsList = item.comments || [];
        const isResolved = item.status === 'resolved';
        const isClosed = item.status === 'closed';

        const currentRating = ratingsMap[item.id] !== undefined ? ratingsMap[item.id] : (item.rating || 0);
        const currentFeedbackText = feedbackTextMap[item.id] || '';
        const currentTags = selectedTagsMap[item.id] || [];

        return (
          <div key={item.id} className="complaint-card animate-fade-in" style={{ position: 'relative' }}>
            
            {/* Top Header */}
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
                <div className="step-label">{t('stepSubmitted')}</div>
              </div>
              <div className={`step ${stepIdx >= 1 ? 'done' : ''} ${stepIdx === 1 ? 'current' : ''}`}>
                <div className="step-line"></div>
                <div className="step-dot"></div>
                <div className="step-label">{t('stepAiProcessed')}</div>
              </div>
              <div className={`step ${stepIdx >= 2 ? 'done' : ''} ${stepIdx === 2 ? 'current' : ''}`}>
                <div className="step-line"></div>
                <div className="step-dot"></div>
                <div className="step-label">{t('stepAssigned')}</div>
              </div>
              <div className={`step ${stepIdx >= 3 ? 'done' : ''} ${stepIdx === 3 ? 'current' : ''}`}>
                <div className="step-line"></div>
                <div className="step-dot"></div>
                <div className="step-label">{t('stepInProgress')}</div>
              </div>
              <div className={`step ${stepIdx >= 4 ? 'done' : ''} ${stepIdx === 4 ? 'current' : ''}`}>
                <div className="step-line"></div>
                <div className="step-dot"></div>
                <div className="step-label">{t('stepResolved')}</div>
              </div>
            </div>

            {/* ================= 1. COMPLETION ALERT BANNER ================= */}
            {isResolved && (
              <div
                className="animate-fade-in"
                style={{
                  margin: '12px 0',
                  padding: '12px 14px',
                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.12), rgba(16, 185, 129, 0.06))',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  borderRadius: 8,
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start'
                }}
              >
                <CheckCircle2 size={20} style={{ color: '#16a34a', flexShrink: 0, marginTop: 2 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#15803d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{t('completionAlertTitle')}</span>
                    <span style={{ fontSize: '10.5px', background: '#16a34a', color: '#fff', padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Resolved</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: 3, lineHeight: 1.4 }}>
                    {t('completionAlertDesc')}
                  </p>
                </div>
              </div>
            )}

            {/* Closed / Completed Badge */}
            {isClosed && (
              <div
                style={{
                  margin: '10px 0',
                  padding: '8px 12px',
                  background: 'var(--paper)',
                  border: '1px solid var(--line)',
                  borderRadius: 6,
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <CheckCircle size={15} style={{ color: 'var(--moss)' }} />
                <span>
                  <strong>Closed:</strong> Rated {item.rating || 5}★ by citizen ({item.feedback || 'Resolution verified'}).
                </span>
              </div>
            )}

            {/* ================= 2. RESOLUTION RATING & FEEDBACK FORM ================= */}
            {isResolved && (
              <div
                className="animate-fade-in"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--line)',
                  borderRadius: 8,
                  padding: '14px',
                  marginTop: 10,
                  marginBottom: 10
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--ink)', marginBottom: 8 }}>
                  {t('rateResolutionTitle')}
                </div>

                {/* Stars */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => handleStarClick(item.id, star)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                    >
                      <Star
                        size={22}
                        style={{
                          fill: currentRating >= star ? 'var(--ochre)' : 'none',
                          color: currentRating >= star ? 'var(--ochre)' : 'var(--ink-faint)',
                          transition: 'transform 0.15s ease'
                        }}
                      />
                    </button>
                  ))}
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ochre)', marginLeft: 6 }}>
                    {currentRating > 0 ? `${currentRating} / 5 Stars` : 'Select rating'}
                  </span>
                </div>

                {/* Quick Feedback Chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                  {feedbackTagOptions.map(tagObj => {
                    const isSelected = currentTags.includes(tagObj.label);
                    return (
                      <button
                        key={tagObj.key}
                        type="button"
                        onClick={() => handleTagToggle(item.id, tagObj.label)}
                        style={{
                          padding: '4px 10px',
                          fontSize: '11.5px',
                          borderRadius: 14,
                          border: isSelected ? '1px solid var(--blue)' : '1px solid var(--line)',
                          background: isSelected ? 'var(--blue-soft)' : 'var(--paper)',
                          color: isSelected ? 'var(--blue)' : 'var(--ink-soft)',
                          cursor: 'pointer',
                          fontWeight: isSelected ? 600 : 400
                        }}
                      >
                        {tagObj.label}
                      </button>
                    );
                  })}
                </div>

                {/* Optional Comment Input */}
                <textarea
                  rows={2}
                  placeholder={t('feedbackCommentPlaceholder')}
                  value={currentFeedbackText}
                  onChange={(e) => setFeedbackTextMap(prev => ({ ...prev, [item.id]: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    fontSize: '12px',
                    borderRadius: 6,
                    border: '1px solid var(--line)',
                    background: 'var(--paper)',
                    color: 'var(--ink)',
                    marginBottom: 10,
                    resize: 'none',
                    boxSizing: 'border-box'
                  }}
                />

                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => handleSubmitFeedback(item.id)}
                  style={{ fontSize: '12px', padding: '6px 14px' }}
                >
                  <CheckCircle2 size={14} />
                  <span>{t('submitFeedbackBtn')}</span>
                </button>
              </div>
            )}

            {/* Duplicate Cluster Note */}
            {item.similarCount > 1 && (
              <div className="similar-note">
                <Clock size={14} />
                <span>{t('groupedWith')} {item.similarCount - 1} {t('otherReports')} {item.priority.toUpperCase()}</span>
              </div>
            )}

            {/* Officer Assignment Info */}
            <div style={{ fontSize: '11.8px', color: 'var(--ink-soft)', marginTop: 10, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
              <div>
                <strong>{t('assignedTo')}:</strong> {item.assignedTo || 'Ward Dispatch Engine'} ({item.department})
              </div>
              <div>
                <strong>{t('priority')}:</strong> <span style={{ color: item.priority === 'Critical' ? 'var(--brick)' : item.priority === 'High' ? 'var(--brick-dim)' : 'var(--moss)', fontWeight: 600 }}>{item.priority} (Score {item.priorityScore})</span>
              </div>
            </div>

            {/* AI Audit & Discussion Toggles Bar */}
            <div style={{ marginTop: 12, paddingTop: 8, borderTop: '1px dashed var(--line)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {/* AI Audit Rationale Toggle */}
              <button
                type="button"
                className="ticket-action-btn"
                onClick={() => setExpandedAiId(isAiExpanded ? null : item.id)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--blue-soft)', color: 'var(--blue)', border: 'none' }}
              >
                <Sparkles size={12} />
                <span>{t('explainableAiBtn')}</span>
                {isAiExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>

              {/* Citizen-Authority Discussion Thread Toggle */}
              <button
                type="button"
                className="ticket-action-btn"
                onClick={() => setExpandedCommentsId(isCommentsExpanded ? null : item.id)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: commentsList.length > 0 ? 'var(--paper)' : 'none', border: '1px solid var(--line)' }}
              >
                <MessageSquare size={12} />
                <span>{t('discussionThreadTitle')} ({commentsList.length})</span>
                {isCommentsExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            </div>

            {/* Explainable AI Rationale Accordion */}
            {isAiExpanded && (
              <div className="animate-fade-in" style={{ background: 'var(--paper)', borderRadius: 6, padding: '10px 12px', marginTop: 8, fontSize: '12px' }}>
                <div style={{ fontWeight: 600, color: 'var(--blue)', marginBottom: 4 }}>{t('whyPriorityIs')} {item.priority}:</div>
                <ul style={{ paddingLeft: 16, marginBottom: 8, color: 'var(--ink-soft)' }}>
                  {(item.explanation || ['Location sensitivity verified.', 'Category matched to civic department.']).map((exp, i) => (
                    <li key={i}>{exp}</li>
                  ))}
                </ul>

                <div style={{ fontWeight: 600, color: 'var(--blue)', marginBottom: 4 }}>{t('recommendedActions')}:</div>
                <ul style={{ paddingLeft: 16, color: 'var(--ink-soft)' }}>
                  {(item.recommended_action || ['Inspect site.', 'Assign technician.']).map((act, i) => (
                    <li key={i}>{act}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* ================= 3. CITIZEN-AUTHORITY TWO-WAY REPLY THREAD ================= */}
            {isCommentsExpanded && (
              <div
                className="animate-fade-in"
                style={{
                  background: 'var(--paper)',
                  border: '1px solid var(--line)',
                  borderRadius: 8,
                  padding: '12px',
                  marginTop: 10,
                  fontSize: '12px'
                }}
              >
                <div style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MessageSquare size={14} style={{ color: 'var(--blue)' }} />
                  <span>{t('discussionThreadTitle')}</span>
                </div>

                {/* Comment List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12, maxHeight: 220, overflowY: 'auto', paddingRight: 4 }}>
                  {commentsList.length === 0 ? (
                    <div style={{ fontStyle: 'italic', color: 'var(--ink-faint)', padding: '6px 0' }}>
                      {t('noCommentsYet')}
                    </div>
                  ) : (
                    commentsList.map(comment => {
                      const isOfficer = comment.role !== 'Citizen';
                      return (
                        <div
                          key={comment.id}
                          style={{
                            display: 'flex',
                            gap: 8,
                            alignItems: 'flex-start',
                            background: isOfficer ? 'var(--blue-soft)' : 'var(--card)',
                            padding: '8px 10px',
                            borderRadius: 6,
                            border: isOfficer ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid var(--line)'
                          }}
                        >
                          <div
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: '50%',
                              background: isOfficer ? 'var(--blue)' : 'var(--ink-soft)',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '10px',
                              fontWeight: 700,
                              flexShrink: 0
                            }}
                          >
                            {isOfficer ? <Shield size={12} /> : <User size={12} />}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                              <span style={{ fontWeight: 600, color: isOfficer ? 'var(--blue)' : 'var(--ink)' }}>
                                {comment.author}
                              </span>
                              <span
                                style={{
                                  fontSize: '10px',
                                  padding: '1px 5px',
                                  borderRadius: 3,
                                  background: isOfficer ? 'var(--blue)' : 'var(--line)',
                                  color: isOfficer ? '#fff' : 'var(--ink-soft)',
                                  fontWeight: 600
                                }}
                              >
                                {isOfficer ? t('badgeOfficer') : t('badgeCitizen')}
                              </span>
                            </div>
                            <div style={{ color: 'var(--ink)', fontSize: '12px', lineHeight: 1.4 }}>
                              {comment.text}
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--ink-faint)', marginTop: 3 }}>
                              {comment.timestamp ? new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Reply Form */}
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    type="text"
                    placeholder={t('typeReplyPlaceholder')}
                    value={replyInputMap[item.id] || ''}
                    onChange={(e) => setReplyInputMap(prev => ({ ...prev, [item.id]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendReply(item.id);
                    }}
                    style={{
                      flex: 1,
                      padding: '7px 10px',
                      fontSize: '12px',
                      borderRadius: 6,
                      border: '1px solid var(--line)',
                      background: 'var(--card)',
                      color: 'var(--ink)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleSendReply(item.id)}
                    style={{
                      padding: '7px 12px',
                      fontSize: '12px',
                      background: 'var(--blue)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontWeight: 600
                    }}
                  >
                    <Send size={12} />
                    <span>{t('sendReplyBtn')}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Actions Bar */}
            <div className="ticket-actions" style={{ marginTop: 10 }}>
              {(isResolved || isClosed) && (
                <button className="ticket-action-btn" onClick={() => handleReopen(item.id)}>
                  {t('reopenAppeal')}
                </button>
              )}

              <button className="ticket-action-btn" onClick={() => handleShare(item.id)}>
                <Share2 size={11} style={{ display: 'inline', marginRight: 3 }} />
                {t('shareLink')}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
