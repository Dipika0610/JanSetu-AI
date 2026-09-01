import React from 'react';
import { useGrievances } from '../../context/GrievanceContext';
import { useLanguage } from '../../context/LanguageContext';
import { WARDS } from '../../data/mockData';

export const GISHotspotMap = () => {
  const { complaints, selectedWard, setSelectedWard, showToast } = useGrievances();
  const { t } = useLanguage();

  const handleWardNodeClick = (wardName) => {
    setSelectedWard(wardName);
    showToast(`Queue & Hotspots filtered to ${wardName}`, 'info');
  };

  // Dynamically compute live counts, colors, and radius for each ward from complaints
  const dynamicWards = WARDS.map(w => {
    const liveMatches = complaints.filter(c => c.ward && c.ward.toLowerCase() === w.name.toLowerCase());
    const count = (w.openCount || 20) + liveMatches.length;

    let densityColor = 'var(--moss)';
    let rawColor = '#4C6E4F';
    if (count >= 40) {
      densityColor = 'var(--brick)';
      rawColor = '#A8402A';
    } else if (count >= 30) {
      densityColor = 'var(--ochre)';
      rawColor = '#A97A22';
    }

    const radius = Math.min(Math.max(count / 3.4, 7), 20);
    const isSelected = selectedWard && selectedWard.toLowerCase() === w.name.toLowerCase();

    return {
      ...w,
      count,
      densityColor,
      rawColor,
      radius,
      isSelected
    };
  });

  return (
    <div className="panel" id="hotspotMapPanel">
      <div className="panel-head" style={{ flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h2>{t('hotspotTitle')}</h2>
          <span className="hint">Real-time dynamic GIS ward density · Automatically updates as complaints are filed</span>
        </div>
        <span className="badge badge-blue">
          {dynamicWards.reduce((acc, w) => acc + w.count, 0)} Total Ward Incidents
        </span>
      </div>

      <div className="map-wrap">
        <div className="map-svg-wrap">
          <svg viewBox="0 0 320 220" width="100%" height="auto" style={{ display: 'block', background: '#E4E7DD' }} id="gisMapSvg">
            {/* Coastline / Land boundary */}
            <path
              d="M40 10 L120 8 Q180 6 210 30 Q260 20 300 50 Q310 90 290 130 Q300 170 260 195 Q200 215 140 205 Q80 210 50 180 Q20 150 30 100 Q10 60 40 10 Z"
              fill="#E4E7DD"
              stroke="#C4C9BC"
              strokeWidth="1.2"
            />
            {/* Arabian Sea Coast Strip */}
            <path d="M0 0 L40 10 Q10 60 30 100 Q20 150 50 180 L0 220 Z" fill="#DCE4E8" />

            {/* Ward demarcation lines */}
            <line x1="120" y1="8" x2="130" y2="205" stroke="#C4C9BC" strokeWidth="0.8" strokeDasharray="2,3" />
            <line x1="40" y1="10" x2="220" y2="120" stroke="#C4C9BC" strokeWidth="0.8" strokeDasharray="2,3" />
            <line x1="210" y1="30" x2="140" y2="205" stroke="#C4C9BC" strokeWidth="0.8" strokeDasharray="2,3" />

            {/* Render Each Dynamic Ward Node */}
            {dynamicWards.map(w => {
              const cx = w.coords.x;
              const cy = w.coords.y;

              return (
                <g
                  key={w.id}
                  className="map-node"
                  onClick={() => handleWardNodeClick(w.name)}
                  style={{ cursor: 'pointer', opacity: w.isSelected ? 1 : 0.88, transition: 'all 0.2s ease' }}
                >
                  {/* Outer Pulsing Glow */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={w.radius + 6}
                    fill={w.rawColor}
                    fillOpacity="0.25"
                  />
                  {/* Center Dot */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={w.isSelected ? 7.5 : 5.5}
                    fill={w.rawColor}
                    stroke="#fff"
                    strokeWidth={w.isSelected ? 2.5 : 1}
                  />
                  {/* Dynamic Ward Label with Live Count */}
                  <text
                    x={cx}
                    y={cy + (w.id === 'worli' ? -10 : 22)}
                    textAnchor="middle"
                    fontFamily="IBM Plex Sans"
                    fontSize={w.isSelected ? '10' : '9'}
                    fill="#1B2320"
                    fontWeight={w.isSelected ? 700 : 600}
                  >
                    {w.name.split(' ')[0]} ({w.count})
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="legend" style={{ flexWrap: 'wrap', gap: 12 }}>
          <span><i style={{ background: 'var(--brick)' }}></i>{t('densityHigh')} (&gt;40)</span>
          <span><i style={{ background: 'var(--ochre)' }}></i>{t('densityMod')} (30-40)</span>
          <span><i style={{ background: 'var(--moss)' }}></i>{t('densityLow')} (&lt;30)</span>
        </div>
      </div>
    </div>
  );
};
