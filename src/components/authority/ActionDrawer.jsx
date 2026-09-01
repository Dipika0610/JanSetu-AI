import React, { useState } from 'react';
import { useGrievances } from '../../context/GrievanceContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { OFFICERS } from '../../data/mockData';
import { evaluateVolumePriorityCondition } from '../../services/aiEngine';
import {
  Sparkles, X, ArrowRight, Flame, Users, Clock, CheckCircle2,
  ShieldAlert, MessageSquare, Send, User, Shield
} from 'lucide-react';

export const ActionDrawer = ({ complaint, onClose }) => {
  const { updateComplaintStatus, addComment } = useGrievances();
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const [assignedOfficer, setAssignedOfficer] = useState(complaint?.assignedTo || '');
  const [status, setStatus] = useState(complaint?.status || 'assigned');
  const [actionNotes, setActionNotes] = useState(complaint?.notes || '');
  const [officerReplyText, setOfficerReplyText] = useState('');

  if (!complaint) return null;

  const commentsList = complaint.comments || [];
  const count = (complaint.similarCount || 0) > 0 ? complaint.similarCount : (complaint.upvotes || 1);
  const volumeRule = evaluateVolumePriorityCondition(count);

  let decidedPriority = complaint.priority;
  let decidedScore = complaint.priorityScore || 50;

  if (count >= 25) {
    decidedPriority = 'Critical';
    decidedScore = Math.max(decidedScore, 94);
  } else if (count >= 10) {
    if (decidedPriority === 'Low' || decidedPriority === 'Medium') decidedPriority = 'High';
    decidedScore = Math.max(decidedScore, 82);
  } else if (count >= 3) {
    if (decidedPriority === 'Low') decidedPriority = 'Medium';
    decidedScore = Math.max(decidedScore, 65);
  }

  const handleSave = () => {
    updateComplaintStatus(complaint.id, {
      assignedTo: assignedOfficer || null,
      status: status,
      notes: actionNotes || null
    });
    onClose();
  };

  const handleSendOfficerReply = () => {
    if (!officerReplyText || !officerReplyText.trim()) return;
    const officerName = currentUser?.name || assignedOfficer || 'Municipal Officer';
    addComment(complaint.id, officerName, 'Municipal Officer', officerReplyText);
    setOfficerReplyText('');
  };

  return (
    <div className="modal-backdrop open">
      <div className="modal-card" style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>{t('grievanceDetails')}</h3>
            <span style={{ fontSize: '11.5px', color: 'var(--ink-faint)', fontFamily: 'monospace' }}>
              #{complaint.id}
            </span>
          </div>
          <button type="button" className="btn-secondary" onClick={onClose} style={{ padding: '2px 8px' }}>
            <X size={15} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
          {/* Volume Decision Engine Breakdown Callout */}
          <div
            style={{
              background: count >= 25 ? 'var(--brick-soft)' : count >= 10 ? 'var(--brick-soft)' : 'var(--card)',
              border: `1.5px solid ${count >= 25 ? 'var(--brick)' : count >= 10 ? 'var(--brick-dim)' : 'var(--line)'}`,
              borderRadius: 8,
              padding: '12px 14px',
              marginBottom: 14
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '13px', color: count >= 10 ? 'var(--brick)' : 'var(--blue)' }}>
                {count >= 10 ? <Flame size={16} /> : <Users size={16} />}
                <span>Volume Priority Decision Breakdown</span>
              </div>
              <span
                style={{
                  background: count >= 25 ? 'var(--brick)' : count >= 10 ? 'var(--brick-dim)' : 'var(--ochre)',
                  color: '#fff',
                  padding: '3px 8px',
                  borderRadius: 12,
                  fontSize: '11px',
                  fontWeight: 700
                }}
              >
                {count} Reports Counted
              </span>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--ink-soft)', lineHeight: 1.45, marginBottom: 8 }}>
              <strong>Condition Evaluated:</strong> {volumeRule.ruleText}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '11.5px', background: 'var(--paper)', padding: '8px 10px', borderRadius: 6 }}>
              <div>
                <span style={{ color: 'var(--ink-faint)' }}>Decided Priority:</span><br />
                <strong style={{ color: decidedPriority === 'Critical' ? 'var(--brick)' : decidedPriority === 'High' ? 'var(--brick-dim)' : 'var(--moss)', fontSize: '12.5px' }}>
                  {decidedPriority.toUpperCase()} (Score: {decidedScore}/100)
                </strong>
              </div>
              <div>
                <span style={{ color: 'var(--ink-faint)' }}>Target SLA Response:</span><br />
                <strong style={{ color: 'var(--blue)', fontSize: '12.5px' }}>
                  <Clock size={12} style={{ display: 'inline', marginRight: 3 }} />
                  {volumeRule.slaHours} Hours Emergency
                </strong>
              </div>
            </div>
          </div>

          {/* Attached Photo */}
          {complaint.photo && (
            <div style={{ marginBottom: 14 }}>
              <label className="field-label">{t('photoLabel')}</label>
              <img
                src={complaint.photo}
                alt="Evidence"
                style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--line)' }}
              />
            </div>
          )}

          {/* Citizen Description */}
          <div style={{ marginBottom: 12 }}>
            <label className="field-label">{t('originalTextLabel')}</label>
            <div style={{ background: 'var(--paper)', padding: '10px 12px', borderRadius: '6px', fontSize: '13px', lineHeight: 1.4, border: '1px solid var(--line-strong)' }}>
              "{complaint.original_text || complaint.title}"
            </div>
          </div>

          {/* Normalized NLP Text */}
          {complaint.normalized_text && (
            <div style={{ marginBottom: 12 }}>
              <label className="field-label" style={{ color: 'var(--blue)' }}>
                <Sparkles size={11} style={{ display: 'inline', marginRight: 4 }} />
                {t('normalizedTextLabel')} ({complaint.language || 'English'})
              </label>
              <div style={{ background: 'var(--blue-soft)', color: 'var(--blue-dim)', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', fontStyle: 'italic' }}>
                {complaint.normalized_text}
              </div>
            </div>
          )}

          {/* Ward & Priority Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <div>
              <label className="field-label">{t('wardLocationLabel')}</label>
              <div style={{ fontSize: '12.5px', color: 'var(--ink-soft)', fontWeight: 500 }}>
                {complaint.location || complaint.ward}
              </div>
            </div>
            <div>
              <label className="field-label">{t('priorityScoreLabel')}</label>
              <div className={`badge ${decidedPriority === 'Critical' || decidedPriority === 'High' ? 'badge-brick' : 'badge-ochre'}`} style={{ fontSize: '11.5px' }}>
                {decidedPriority.toUpperCase()} (Score: {decidedScore} / 100)
              </div>
            </div>
          </div>

          {/* Citizen Feedback / Rating Display if closed */}
          {complaint.rating > 0 && (
            <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 6, padding: '10px 12px', marginBottom: 14, fontSize: '12px' }}>
              <div style={{ fontWeight: 600, color: 'var(--ochre)', marginBottom: 4 }}>
                Citizen Feedback Rating: {complaint.rating} ★
              </div>
              <div style={{ color: 'var(--ink-soft)' }}>"{complaint.feedback || 'Resolution verified'}"</div>
              {complaint.feedbackTags && complaint.feedbackTags.length > 0 && (
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
                  {complaint.feedbackTags.map((tag, idx) => (
                    <span key={idx} style={{ background: 'var(--blue-soft)', color: 'var(--blue)', fontSize: '10.5px', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= 2-WAY CITIZEN-OFFICER DISCUSSION THREAD ================= */}
          <div style={{ borderTop: '1px dashed var(--line)', paddingTop: 12, marginTop: 12, marginBottom: 14 }}>
            <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--ink)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <MessageSquare size={14} style={{ color: 'var(--blue)' }} />
              <span>{t('discussionThreadTitle')} ({commentsList.length})</span>
            </div>

            {/* Comments List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10, maxHeight: 180, overflowY: 'auto', background: 'var(--paper)', padding: '8px', borderRadius: 6, border: '1px solid var(--line)' }}>
              {commentsList.length === 0 ? (
                <div style={{ fontStyle: 'italic', color: 'var(--ink-faint)', fontSize: '11.5px' }}>
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
                        padding: '6px 10px',
                        borderRadius: 6,
                        border: isOfficer ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid var(--line)'
                      }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
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
                        {isOfficer ? <Shield size={11} /> : <User size={11} />}
                      </div>
                      <div style={{ flex: 1, fontSize: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 600, color: isOfficer ? 'var(--blue)' : 'var(--ink)' }}>
                            {comment.author}
                          </span>
                          <span style={{ fontSize: '9.5px', color: 'var(--ink-faint)' }}>
                            {comment.timestamp ? new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                          </span>
                        </div>
                        <div style={{ color: 'var(--ink)', marginTop: 2, lineHeight: 1.35 }}>
                          {comment.text}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Officer Reply Input */}
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                type="text"
                placeholder="Type an official reply or status update for citizen..."
                value={officerReplyText}
                onChange={(e) => setOfficerReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendOfficerReply();
                }}
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  fontSize: '12px',
                  borderRadius: 6,
                  border: '1px solid var(--line)',
                  background: 'var(--card)',
                  color: 'var(--ink)'
                }}
              />
              <button
                type="button"
                onClick={handleSendOfficerReply}
                style={{
                  padding: '6px 12px',
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
                <span>Reply</span>
              </button>
            </div>
          </div>

          {/* Action Form */}
          <div style={{ borderTop: '1px dashed var(--line)', paddingTop: 14, marginTop: 8 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <div>
                <label className="field-label" htmlFor="assignOfficerSelect">{t('assignFieldOfficer')}</label>
                <select
                  id="assignOfficerSelect"
                  className="select-ctrl"
                  style={{ width: '100%' }}
                  value={assignedOfficer}
                  onChange={(e) => setAssignedOfficer(e.target.value)}
                >
                  <option value="">{t('selectOfficerPlaceholder')}</option>
                  {OFFICERS.map(off => (
                    <option key={off.id} value={off.name}>{off.name} ({off.designation.split('(')[0]})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="field-label" htmlFor="updateStatusSelect">{t('updateStatus')}</label>
                <select
                  id="updateStatusSelect"
                  className="select-ctrl"
                  style={{ width: '100%' }}
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="submitted">{t('stepSubmitted')}</option>
                  <option value="assigned">{t('stepAssigned')}</option>
                  <option value="investigation">{t('stepInProgress')}</option>
                  <option value="progress">{t('stepInProgress')}</option>
                  <option value="resolved">{t('stepResolved')}</option>
                  <option value="closed">{t('stepClosed')}</option>
                  <option value="escalated">Escalated</option>
                </select>
              </div>
            </div>

            <div>
              <label className="field-label" htmlFor="officerActionNotes">{t('officerNotesLabel')}</label>
              <textarea
                id="officerActionNotes"
                rows="2"
                placeholder="e.g. Field inspection team dispatched. Suction vehicle deployed."
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
              ></textarea>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            {t('cancel')}
          </button>
          <button type="button" className="btn-primary" onClick={handleSave}>
            <span>{t('saveAndDispatch')}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
