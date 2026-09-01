import React, { useState } from 'react';
import { useGrievances } from '../../context/GrievanceContext';
import { useLanguage } from '../../context/LanguageContext';
import { OFFICERS, WARDS, CATEGORIES } from '../../data/mockData';
import { evaluateVolumePriorityCondition } from '../../services/aiEngine';
import { Sparkles, X, ArrowRight, Flame, Users, Clock, CheckCircle2, ShieldAlert, MapPin, Building2 } from 'lucide-react';

export const ActionDrawer = ({ complaint, onClose }) => {
  const { updateComplaintStatus } = useGrievances();
  const { t } = useLanguage();

  const [assignedOfficer, setAssignedOfficer] = useState(complaint?.assignedTo || '');
  const [status, setStatus] = useState(complaint?.status || 'assigned');
  const [selectedWard, setSelectedWard] = useState(complaint?.ward || 'Andheri West');
  const [selectedDept, setSelectedDept] = useState(complaint?.department || 'Drainage & Sewage');
  const [actionNotes, setActionNotes] = useState(complaint?.notes || '');

  if (!complaint) return null;

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
      ward: selectedWard,
      department: selectedDept,
      notes: actionNotes || null
    });
    onClose();
  };

  return (
    <div className="modal-backdrop open">
      <div className="modal-card">
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

        <div className="modal-body">
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

          {/* Dynamic Ward & Department Re-Routing Options */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div>
              <label className="field-label" htmlFor="editWardSelect">
                <MapPin size={12} style={{ display: 'inline', marginRight: 3 }} />
                Assigned Ward (GIS Dynamic)
              </label>
              <select
                id="editWardSelect"
                className="select-ctrl"
                style={{ width: '100%' }}
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
              >
                {WARDS.map(w => (
                  <option key={w.id} value={w.name}>{w.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="field-label" htmlFor="editDeptSelect">
                <Building2 size={12} style={{ display: 'inline', marginRight: 3 }} />
                Department Routing
              </label>
              <select
                id="editDeptSelect"
                className="select-ctrl"
                style={{ width: '100%' }}
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
              >
                <option value="Drainage & Sewage">Drainage &amp; Sewage</option>
                <option value="Water Supply">Water Supply</option>
                <option value="Roads & Traffic">Roads &amp; Traffic</option>
                <option value="Streetlights & Power">Streetlights &amp; Power</option>
                <option value="Garbage & Waste">Garbage &amp; Waste</option>
                <option value="Public Works & Safety">Public Works &amp; Safety</option>
              </select>
            </div>
          </div>

          {/* Action Form: Officer Assignment & Status */}
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
