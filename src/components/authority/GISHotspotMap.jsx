import React from 'react';
import { useGrievances } from '../../context/GrievanceContext';
import { useLanguage } from '../../context/LanguageContext';

export const GISHotspotMap = () => {
  const { selectedWard, setSelectedWard, showToast } = useGrievances();
  const { t } = useLanguage();

  const handleWardNodeClick = (wardName) => {
    setSelectedWard(wardName);
    showToast(`Queue & Hotspots filtered to ${wardName}`, 'info');
  };

  return (
    <div className="panel" id="hotspotMapPanel">
      <div className="panel-head">
        <h2>{t('hotspotTitle')}</h2>
        <span className="hint">{t('hotspotSub')}</span>
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

            {/* Hotspot Markers (Interactive) */}
            {/* Andheri West */}
            <g
              className="map-node"
              onClick={() => handleWardNodeClick('Andheri West')}
              style={{ cursor: 'pointer', opacity: selectedWard === 'Andheri West' ? 1 : 0.85 }}
            >
              <circle cx="88" cy="55" r={selectedWard === 'Andheri West' ? 18 : 15} fill="#A8402A" fillOpacity="0.28" />
              <circle cx="88" cy="55" r="7" fill="#A8402A" stroke="#fff" strokeWidth={selectedWard === 'Andheri West' ? 2 : 0} />
              <text x="88" y="80" textAnchor="middle" fontFamily="IBM Plex Sans" fontSize="9.5" fill="#1B2320" fontWeight="600">
                Andheri W. (48)
              </text>
            </g>

            {/* Bandra West */}
            <g
              className="map-node"
              onClick={() => handleWardNodeClick('Bandra West')}
              style={{ cursor: 'pointer', opacity: selectedWard === 'Bandra West' ? 1 : 0.85 }}
            >
              <circle cx="185" cy="60" r="11" fill="#A97A22" fillOpacity="0.3" />
              <circle cx="185" cy="60" r="5" fill="#A97A22" stroke="#fff" strokeWidth={selectedWard === 'Bandra West' ? 2 : 0} />
              <text x="185" y="80" textAnchor="middle" fontFamily="IBM Plex Sans" fontSize="9" fill="#5B655F">
                Bandra W. (36)
              </text>
            </g>

            {/* Kurla */}
            <g
              className="map-node"
              onClick={() => handleWardNodeClick('Kurla')}
              style={{ cursor: 'pointer', opacity: selectedWard === 'Kurla' ? 1 : 0.85 }}
            >
              <circle cx="235" cy="105" r="14" fill="#A8402A" fillOpacity="0.28" />
              <circle cx="235" cy="105" r="6.5" fill="#A8402A" stroke="#fff" strokeWidth={selectedWard === 'Kurla' ? 2 : 0} />
              <text x="235" y="128" textAnchor="middle" fontFamily="IBM Plex Sans" fontSize="9.5" fill="#1B2320" fontWeight="600">
                Kurla (52)
              </text>
            </g>

            {/* Dadar */}
            <g
              className="map-node"
              onClick={() => handleWardNodeClick('Dadar')}
              style={{ cursor: 'pointer', opacity: selectedWard === 'Dadar' ? 1 : 0.85 }}
            >
              <circle cx="105" cy="120" r="8" fill="#4C6E4F" fillOpacity="0.3" />
              <circle cx="105" cy="120" r="4" fill="#4C6E4F" stroke="#fff" strokeWidth={selectedWard === 'Dadar' ? 2 : 0} />
              <text x="105" y="140" textAnchor="middle" fontFamily="IBM Plex Sans" fontSize="9" fill="#5B655F">
                Dadar (29)
              </text>
            </g>

            {/* Chembur */}
            <g
              className="map-node"
              onClick={() => handleWardNodeClick('Chembur')}
              style={{ cursor: 'pointer', opacity: selectedWard === 'Chembur' ? 1 : 0.85 }}
            >
              <circle cx="205" cy="160" r="10" fill="#A97A22" fillOpacity="0.3" />
              <circle cx="205" cy="160" r="4.5" fill="#A97A22" stroke="#fff" strokeWidth={selectedWard === 'Chembur' ? 2 : 0} />
              <text x="205" y="180" textAnchor="middle" fontFamily="IBM Plex Sans" fontSize="9" fill="#5B655F">
                Chembur (33)
              </text>
            </g>

            {/* Worli */}
            <g
              className="map-node"
              onClick={() => handleWardNodeClick('Worli')}
              style={{ cursor: 'pointer', opacity: selectedWard === 'Worli' ? 1 : 0.85 }}
            >
              <circle cx="140" cy="45" r="7" fill="#4C6E4F" fillOpacity="0.3" />
              <circle cx="140" cy="45" r="3.5" fill="#4C6E4F" stroke="#fff" strokeWidth={selectedWard === 'Worli' ? 2 : 0} />
              <text x="140" y="35" textAnchor="middle" fontFamily="IBM Plex Sans" fontSize="9" fill="#5B655F">
                Worli (20)
              </text>
            </g>
          </svg>
        </div>

        <div className="legend">
          <span><i style={{ background: 'var(--brick)' }}></i>{t('densityHigh')}</span>
          <span><i style={{ background: 'var(--ochre)' }}></i>{t('densityMod')}</span>
          <span><i style={{ background: 'var(--moss)' }}></i>{t('densityLow')}</span>
        </div>
      </div>
    </div>
  );
};
