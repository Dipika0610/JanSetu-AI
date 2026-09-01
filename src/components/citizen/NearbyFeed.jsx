import React, { useState } from 'react';
import { useGrievances } from '../../context/GrievanceContext';

export const NearbyFeed = () => {
  const { complaints, selectedWard, joinCluster } = useGrievances();
  const [radius, setRadius] = useState('1000');
  const [votedIds, setVotedIds] = useState(new Set());

  const handleVote = (id, clusterId) => {
    setVotedIds(prev => new Set(prev).add(id));
    joinCluster(clusterId || id);
  };

  const nearbyItems = complaints.slice(0, 6);

  return (
    <div className="animate-fade-in">
      <div className="nearby-filter-bar">
        <span style={{ fontSize: '12px', color: 'var(--ink-soft)', fontWeight: 600 }}>Radius from your location:</span>
        <select
          className="distance-select"
          value={radius}
          onChange={(e) => setRadius(e.target.value)}
        >
          <option value="500">Within 500 metres</option>
          <option value="1000">Within 1 kilometre</option>
          <option value="3000">Within 3 kilometres</option>
        </select>
      </div>

      {/* Mini GIS Map */}
      <div className="nearby-map-container">
        <svg viewBox="0 0 424 170" width="100%" height="auto" style={{ display: 'block', background: '#E4E7DD' }}>
          <line x1="0" y1="40" x2="424" y2="30" stroke="#C4C9BC" strokeWidth="1.2" />
          <line x1="0" y1="95" x2="424" y2="105" stroke="#C4C9BC" strokeWidth="1.2" />
          <line x1="140" y1="0" x2="150" y2="170" stroke="#C4C9BC" strokeWidth="1.2" />
          <line x1="290" y1="0" x2="280" y2="170" stroke="#C4C9BC" strokeWidth="1.2" />

          {/* Hotspot Pins */}
          <circle cx="90" cy="55" r="15" fill="#A8402A" fillOpacity="0.25" />
          <circle cx="90" cy="55" r="6.5" fill="#A8402A" />

          <circle cx="210" cy="70" r="10" fill="#A97A22" fillOpacity="0.3" />
          <circle cx="210" cy="70" r="5" fill="#A97A22" />

          <circle cx="320" cy="50" r="8" fill="#4C6E4F" fillOpacity="0.3" />
          <circle cx="320" cy="50" r="4" fill="#4C6E4F" />

          <circle cx="175" cy="120" r="7" fill="#24425F" fillOpacity="0.3" />
          <circle cx="175" cy="120" r="3.5" fill="#24425F" />

          {/* Citizen Pin */}
          <circle cx="205" cy="88" r="5" fill="#24425F" stroke="#fff" strokeWidth="2" />
          <text x="205" y="106" textAnchor="middle" fontFamily="IBM Plex Sans" fontSize="9.5" fill="#24425F" fontWeight="600">
            You are here
          </text>
        </svg>
      </div>

      {/* Incident List */}
      <div>
        {nearbyItems.map(item => {
          const dotColor = item.priority === 'Critical' || item.priority === 'High' ? 'var(--brick)' : item.priority === 'Medium' ? 'var(--ochre)' : 'var(--moss)';
          const hasVoted = votedIds.has(item.id);

          return (
            <div key={item.id} className="nearby-item">
              <div className="nearby-dot" style={{ background: dotColor }}></div>
              <div style={{ flex: 1 }}>
                <div className="nearby-title">{item.original_text || item.title}</div>
                <div className="nearby-meta">{item.location} · {item.category} · {item.timeAgo || 'Recent'}</div>
              </div>
              <div className="nearby-count">
                <span style={{ fontWeight: 600 }}>{item.similarCount || item.upvotes || 1} reports</span>
                <button
                  type="button"
                  className={`me-too-btn ${hasVoted ? 'voted' : ''}`}
                  disabled={hasVoted}
                  onClick={() => handleVote(item.id, item.clusterId)}
                >
                  {hasVoted ? '✓ Supported' : '+1 Me Too'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
