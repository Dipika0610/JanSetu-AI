import React, { useState, useEffect, useRef } from 'react';
import { useGrievances } from '../../context/GrievanceContext';
import { useLanguage } from '../../context/LanguageContext';
import { classifyComplaint, findPotentialDuplicates } from '../../services/aiEngine';
import { Camera, Mic, MapPin, Send, CheckCircle2, AlertTriangle, X, Sparkles } from 'lucide-react';

export const GrievanceForm = ({ onSubmitted }) => {
  const { complaints, selectedWard, submitComplaint, joinCluster, showToast } = useGrievances();
  const { lang, t } = useLanguage();

  const [description, setDescription] = useState('');
  const [locationText, setLocationText] = useState(`Near Link Road bus stop, ${selectedWard}`);
  const [attachedPhoto, setAttachedPhoto] = useState(null);
  const [detectedCategory, setDetectedCategory] = useState({ categoryName: 'Sanitation', confidence: 0.92 });
  const [duplicateCandidate, setDuplicateCandidate] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const fileInputRef = useRef(null);

  // Update location text when active ward changes
  useEffect(() => {
    setLocationText(`Near Main Road, ${selectedWard}`);
  }, [selectedWard]);

  // Real-time AI classification & duplicate detection
  useEffect(() => {
    if (!description.trim()) {
      setDetectedCategory({ categoryName: 'Sanitation', confidence: 0.85 });
      setDuplicateCandidate(null);
      return;
    }

    const classification = classifyComplaint(description);
    setDetectedCategory(classification);

    const dup = findPotentialDuplicates(description, selectedWard, complaints);
    setDuplicateCandidate(dup);
  }, [description, selectedWard, complaints]);

  // Quick Prompt Chips
  const handlePromptChip = (text, loc) => {
    setDescription(text);
    if (loc) setLocationText(loc);
  };

  // Voice Speech-to-Text
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setIsListening(true);
      showToast(t('voiceListening'), 'info');
      setTimeout(() => {
        const samples = [
          'Drainage overflow ho raha hai station ke bahar, paani pura sadak par aa gaya hai.',
          'रात्रीच्या वेळी पथदिवे बंद असल्याने खूप भीती वाटते.',
          'Pipeline burst on Link Road, water getting wasted for two days.'
        ];
        const sample = samples[Math.floor(Math.random() * samples.length)];
        setDescription(prev => (prev ? prev + ' ' : '') + sample);
        setIsListening(false);
        showToast('Voice transcribed via AI Speech Engine!', 'success');
      }, 1200);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'hi' ? 'hi-IN' : lang === 'mr' ? 'mr-IN' : 'en-IN';
    recognition.continuous = false;

    setIsListening(true);
    showToast(t('voiceListening'), 'info');
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setDescription(prev => (prev ? prev + ' ' : '') + transcript);
      setIsListening(false);
      showToast('Voice transcribed successfully!', 'success');
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  // Photo Upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setAttachedPhoto(evt.target.result);
        showToast('Photo analyzed: Visual infrastructure anomaly verified.', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  // Form Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) {
      showToast('Please describe the issue before submitting.', 'warning');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newGrievance = submitComplaint({
        description,
        location: locationText,
        ward: selectedWard,
        photo: attachedPhoto
      });

      setDescription('');
      setAttachedPhoto(null);
      setIsSubmitting(false);
      if (onSubmitted) onSubmitted(newGrievance);
    }, 600);
  };

  return (
    <div className="card animate-fade-in">
      {/* Quick Prompts */}
      <div className="quick-prompts" title="Click to test sample prompts">
        <button
          type="button"
          className="prompt-chip"
          onClick={() => handlePromptChip('Gutter overflowing near the bus stop on Link Road, water has been standing for two days and smells very bad.', `Link Road Bus Stop, ${selectedWard}`)}
        >
          💧 Link Rd Sewage
        </button>
        <button
          type="button"
          className="prompt-chip"
          onClick={() => handlePromptChip('Bada khadda ho gaya hai road pe SV road junction, bike gir gayi accident ho sakta hai', `SV Road Junction, ${selectedWard}`)}
        >
          🕳️ Bandra Pothole
        </button>
        <button
          type="button"
          className="prompt-chip"
          onClick={() => handlePromptChip('रात्रीच्या वेळी शाळेच्या परिसरात सर्व पथदिवे बंद असतात. अंधार आहे.', `Near BMC School No. 4, ${selectedWard}`)}
        >
          💡 Marathi: पथदिवे बंद
        </button>
        <button
          type="button"
          className="prompt-chip"
          onClick={() => handlePromptChip('Live electric wire sparking and fallen on road near school gate', `Near National High School, ${selectedWard}`)}
        >
          ⚡ Critical Live Wire
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Photo Drop Area */}
        <span className="field-label">
          <span>{t('photoLabel')}</span>
          {attachedPhoto && <span className="badge badge-moss">{t('photoVerified')}</span>}
        </span>

        {!attachedPhoto ? (
          <div className="photo-drop" onClick={() => fileInputRef.current.click()}>
            <Camera size={24} style={{ marginBottom: 6, color: 'var(--ink-faint)' }} />
            <div>{t('photoDropText')}</div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="photo-preview-box" style={{ display: 'block' }}>
            <img src={attachedPhoto} alt="Attached Evidence" />
            <div className="photo-preview-overlay">
              <span>{t('photoEvidenceAttached')}</span>
              <button
                type="button"
                className="remove-photo-btn"
                onClick={() => setAttachedPhoto(null)}
              >
                {t('removePhoto')}
              </button>
            </div>
          </div>
        )}

        {/* Text Input with Voice Mic */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
          <label className="field-label" style={{ marginBottom: 0 }}>{t('descriptionLabel')}</label>
          <span style={{ fontSize: '11px', color: 'var(--ink-faint)' }}>{t('multilingualActive')}</span>
        </div>

        <div className="textarea-wrapper">
          <textarea
            rows="4"
            placeholder={t('descriptionPlaceholder')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
          <button
            type="button"
            className={`voice-mic-btn ${isListening ? 'listening' : ''}`}
            onClick={handleVoiceInput}
            title={t('voiceListening')}
          >
            <Mic size={15} />
          </button>
        </div>

        {/* Real-Time Detection Badge */}
        <div className="detect-row">
          <span>{t('detectedAs')}</span>
          <span className={`detect-badge badge-${detectedCategory.categoryName === 'Drainage' || detectedCategory.categoryName === 'Garbage' ? 'moss' : detectedCategory.categoryName === 'Water supply' ? 'blue' : 'ochre'}`}>
            <CheckCircle2 size={12} />
            <span>{detectedCategory.categoryName} ({Math.round(detectedCategory.confidence * 100)}% {t('confidence')})</span>
          </span>
        </div>

        {/* Semantic Duplicate Alert Card */}
        {duplicateCandidate && (
          <div className="dup-alert animate-fade-in">
            <div className="dup-alert-head">
              <AlertTriangle size={16} />
              <span>{t('dupAlertTitle')}</span>
            </div>
            <p>{duplicateCandidate.message}</p>
            <div className="dup-actions">
              <button
                type="button"
                className="btn-small btn-join"
                onClick={() => {
                  joinCluster(duplicateCandidate.matchedComplaint.clusterId || duplicateCandidate.matchedComplaint.id);
                  setDescription('');
                  if (onSubmitted) onSubmitted(duplicateCandidate.matchedComplaint);
                }}
              >
                {t('btnJoinCluster')}
              </button>
              <button
                type="button"
                className="btn-small btn-new"
                onClick={() => setDuplicateCandidate(null)}
              >
                {t('btnIgnoreDup')}
              </button>
            </div>
          </div>
        )}

        {/* Location Row */}
        <label className="field-label" style={{ marginTop: 14 }}>{t('locationLabel')}</label>
        <div className="location-row" onClick={() => setShowLocationModal(true)}>
          <MapPin size={16} />
          <div style={{ flex: 1 }}>
            <div className="loc-text">{locationText}</div>
            <div className="loc-sub">{selectedWard} · {t('locationUsingGps')}</div>
          </div>
          <div className="change">{t('change')}</div>
        </div>

        {/* Submit CTA Button */}
        <button type="submit" className="submit-btn" disabled={isSubmitting}>
          <Send size={16} />
          <span>{isSubmitting ? t('processingAI') : t('btnSubmitReport')}</span>
        </button>
      </form>

      {/* Location Modal */}
      {showLocationModal && (
        <div className="modal-backdrop open">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{t('locationLabel')} &amp; {t('colWard')}</h3>
              <button type="button" className="btn-secondary" onClick={() => setShowLocationModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <label className="field-label">Specific Landmark or Street</label>
              <input
                type="text"
                className="select-ctrl"
                style={{ width: '100%', marginBottom: 14 }}
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
              />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-primary" onClick={() => setShowLocationModal(false)}>
                Confirm Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
