import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { TrendingUp, BarChart2, Calendar, Filter, CheckCircle2, ArrowUpRight, ArrowDownRight, Clock, Award } from 'lucide-react';

const DEPARTMENTS = [
  { id: 'drainage', name: 'Drainage / Sewage', color: '#A8402A', baseline: 48 },
  { id: 'water', name: 'Water Supply', color: '#24425F', baseline: 36 },
  { id: 'roads', name: 'Roads & Traffic', color: '#A97A22', baseline: 42 },
  { id: 'streetlights', name: 'Streetlights & Power', color: '#D97706', baseline: 28 },
  { id: 'public-safety', name: 'Public Works & Safety', color: '#7C3AED', baseline: 22 },
  { id: 'garbage', name: 'Garbage & Waste', color: '#4C6E4F', baseline: 38 },
  { id: 'parks', name: 'Parks & Environment', color: '#059669', baseline: 16 }
];

// Timeframe datasets
const CHART_DATA = {
  weekly: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: {
      drainage: [34, 42, 38, 56, 68, 62, 48],
      water: [28, 32, 45, 40, 36, 30, 36],
      roads: [38, 40, 48, 52, 46, 38, 42],
      streetlights: [22, 26, 24, 30, 34, 28, 28],
      'public-safety': [18, 16, 24, 28, 22, 20, 22],
      garbage: [30, 35, 42, 38, 45, 40, 38],
      parks: [12, 14, 18, 16, 20, 15, 16]
    }
  },
  monthly: {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: {
      drainage: [145, 182, 210, 195],
      water: [120, 138, 150, 142],
      roads: [160, 175, 190, 168],
      streetlights: [95, 110, 125, 105],
      'public-safety': [78, 85, 92, 88],
      garbage: [130, 145, 160, 152],
      parks: [48, 55, 62, 58]
    }
  },
  yearly: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: {
      drainage: [320, 340, 410, 480, 560, 780, 890, 840, 620, 480, 390, 350],
      water: [450, 480, 560, 620, 680, 520, 480, 440, 410, 390, 420, 460],
      roads: [380, 390, 420, 460, 510, 720, 810, 790, 580, 460, 410, 390],
      streetlights: [280, 290, 310, 320, 340, 390, 420, 410, 360, 330, 300, 290],
      'public-safety': [180, 190, 210, 230, 250, 310, 340, 330, 280, 240, 200, 190],
      garbage: [340, 360, 390, 420, 450, 510, 540, 530, 470, 430, 390, 370],
      parks: [120, 130, 150, 170, 190, 240, 260, 250, 210, 180, 140, 130]
    }
  }
};

export const AnalyticsView = () => {
  const { t } = useLanguage();
  const [timeframe, setTimeframe] = useState('weekly'); // 'weekly' | 'monthly' | 'yearly'
  const [visibleDepts, setVisibleDepts] = useState({
    drainage: true,
    water: true,
    roads: true,
    streetlights: true,
    'public-safety': true,
    garbage: true,
    parks: true
  });
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const toggleDept = (id) => {
    setVisibleDepts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const activeData = CHART_DATA[timeframe];
  const labels = activeData.labels;

  // Compute maximum value for SVG scaling
  let maxVal = 10;
  Object.keys(activeData.datasets).forEach(deptId => {
    if (visibleDepts[deptId]) {
      const vals = activeData.datasets[deptId];
      const m = Math.max(...vals);
      if (m > maxVal) maxVal = m;
    }
  });
  maxVal = Math.ceil(maxVal * 1.15); // headroom

  // SVG Chart Dimensions
  const svgWidth = 800;
  const svgHeight = 280;
  const paddingLeft = 50;
  const paddingRight = 30;
  const paddingTop = 25;
  const paddingBottom = 40;

  const chartW = svgWidth - paddingLeft - paddingRight;
  const chartH = svgHeight - paddingTop - paddingBottom;

  const getX = (index) => paddingLeft + (index / (labels.length - 1)) * chartW;
  const getY = (val) => paddingTop + chartH - (val / maxVal) * chartH;

  return (
    <div className="panel animate-fade-in" style={{ marginTop: 14 }}>
      {/* Panel Header */}
      <div className="panel-head" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2>{t('analyticsImpact')} &amp; Department Performance Trends</h2>
          <span className="hint">
            Multi-department grievance trajectory tracking across Mumbai wards
          </span>
        </div>

        {/* Timeframe Filter Buttons: Weekly / Monthly / Yearly */}
        <div style={{ display: 'flex', background: 'var(--paper)', padding: 3, borderRadius: 6, border: '1px solid var(--line-strong)' }}>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => setTimeframe('weekly')}
            style={{
              margin: 0,
              padding: '5px 12px',
              fontSize: '12px',
              fontWeight: timeframe === 'weekly' ? 700 : 500,
              background: timeframe === 'weekly' ? 'var(--card)' : 'transparent',
              color: timeframe === 'weekly' ? 'var(--blue)' : 'var(--ink-soft)',
              borderRadius: 4,
              boxShadow: timeframe === 'weekly' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            Weekly (7 Days)
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => setTimeframe('monthly')}
            style={{
              margin: 0,
              padding: '5px 12px',
              fontSize: '12px',
              fontWeight: timeframe === 'monthly' ? 700 : 500,
              background: timeframe === 'monthly' ? 'var(--card)' : 'transparent',
              color: timeframe === 'monthly' ? 'var(--blue)' : 'var(--ink-soft)',
              borderRadius: 4,
              boxShadow: timeframe === 'monthly' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            Monthly (4 Weeks)
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => setTimeframe('yearly')}
            style={{
              margin: 0,
              padding: '5px 12px',
              fontSize: '12px',
              fontWeight: timeframe === 'yearly' ? 700 : 500,
              background: timeframe === 'yearly' ? 'var(--card)' : 'transparent',
              color: timeframe === 'yearly' ? 'var(--blue)' : 'var(--ink-soft)',
              borderRadius: 4,
              boxShadow: timeframe === 'yearly' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            Yearly (12 Months)
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, padding: '14px 18px', background: 'var(--paper)', borderBottom: '1px solid var(--line)' }}>
        <div style={{ background: 'var(--card)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--line)' }}>
          <div style={{ fontSize: '11.5px', color: 'var(--ink-soft)' }}>Duplicate Reduction</div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--moss)', marginTop: 2 }}>76.4%</div>
          <div style={{ fontSize: '10.5px', color: 'var(--ink-faint)' }}>612 duplicate reports auto-merged</div>
        </div>
        <div style={{ background: 'var(--card)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--line)' }}>
          <div style={{ fontSize: '11.5px', color: 'var(--ink-soft)' }}>Officer Hours Saved</div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--blue)', marginTop: 2 }}>4.9 hrs/wk</div>
          <div style={{ fontSize: '10.5px', color: 'var(--ink-faint)' }}>Zero redundant engineer dispatches</div>
        </div>
        <div style={{ background: 'var(--card)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--line)' }}>
          <div style={{ fontSize: '11.5px', color: 'var(--ink-soft)' }}>Avg. Resolution Time</div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--ochre-dim)', marginTop: 2 }}>3.2 Days</div>
          <div style={{ fontSize: '10.5px', color: 'var(--ink-faint)' }}>Down from 5.8 days baseline</div>
        </div>
        <div style={{ background: 'var(--card)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--line)' }}>
          <div style={{ fontSize: '11.5px', color: 'var(--ink-soft)' }}>Citizen Satisfaction</div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--moss)', marginTop: 2 }}>4.7 ★</div>
          <div style={{ fontSize: '10.5px', color: 'var(--ink-faint)' }}>Across 1,280 SMS verified resolutions</div>
        </div>
      </div>

      {/* Interactive Department Checkbox Toggles Legend */}
      <div style={{ padding: '12px 18px', display: 'flex', flexWrap: 'wrap', gap: 8, borderBottom: '1px solid var(--line)' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)', alignSelf: 'center', marginRight: 4 }}>
          Toggle Departments:
        </span>
        {DEPARTMENTS.map(dept => {
          const isVisible = visibleDepts[dept.id];
          return (
            <button
              key={dept.id}
              type="button"
              onClick={() => toggleDept(dept.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                borderRadius: 20,
                fontSize: '11.5px',
                border: `1.5px solid ${dept.color}`,
                background: isVisible ? `${dept.color}15` : 'transparent',
                color: isVisible ? dept.color : 'var(--ink-faint)',
                cursor: 'pointer',
                fontWeight: isVisible ? 600 : 400,
                transition: 'all 0.15s ease'
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: isVisible ? dept.color : 'var(--line-strong)' }}></span>
              <span>{dept.name}</span>
            </button>
          );
        })}
      </div>

      {/* Multi-Line Graph Area */}
      <div style={{ padding: '18px', background: 'var(--card)', position: 'relative', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} width="100%" height="auto" style={{ minWidth: 600, display: 'block' }}>
          {/* Horizontal Grid lines & Y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = paddingTop + chartH * (1 - ratio);
            const val = Math.round(maxVal * ratio);
            return (
              <g key={i}>
                <line x1={paddingLeft} y1={y} x2={svgWidth - paddingRight} y2={y} stroke="#E2E5DC" strokeDasharray="3,3" />
                <text x={paddingLeft - 8} y={y + 3.5} textAnchor="end" fontSize="10" fill="#8C958F" fontFamily="IBM Plex Sans">
                  {val}
                </text>
              </g>
            );
          })}

          {/* X-axis labels */}
          {labels.map((label, i) => {
            const x = getX(i);
            return (
              <g key={i}>
                <line x1={x} y1={paddingTop + chartH} x2={x} y2={paddingTop + chartH + 5} stroke="#8C958F" />
                <text x={x} y={paddingTop + chartH + 20} textAnchor="middle" fontSize="11" fill="#5B655F" fontWeight="500" fontFamily="IBM Plex Sans">
                  {label}
                </text>
              </g>
            );
          })}

          {/* Render Multi-Line Polylines for each visible department */}
          {DEPARTMENTS.map(dept => {
            if (!visibleDepts[dept.id]) return null;
            const vals = activeData.datasets[dept.id] || [];
            const pointsStr = vals.map((v, i) => `${getX(i)},${getY(v)}`).join(' ');

            return (
              <g key={dept.id} className="dept-line-group">
                {/* Glow / Backdrop Path */}
                <polyline
                  fill="none"
                  stroke={dept.color}
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={pointsStr}
                />

                {/* Data Points */}
                {vals.map((v, i) => {
                  const cx = getX(i);
                  const cy = getY(v);
                  return (
                    <circle
                      key={i}
                      cx={cx}
                      cy={cy}
                      r="4.5"
                      fill={dept.color}
                      stroke="#fff"
                      strokeWidth="2"
                      style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
                      onMouseEnter={() => setHoveredPoint({ dept: dept.name, color: dept.color, label: labels[i], val: v })}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        {hoveredPoint && (
          <div
            className="animate-fade-in"
            style={{
              position: 'absolute',
              top: 24,
              right: 24,
              background: 'var(--paper)',
              border: `1.5px solid ${hoveredPoint.color}`,
              borderRadius: 6,
              padding: '6px 12px',
              fontSize: '12px',
              boxShadow: 'var(--shadow-md)',
              pointerEvents: 'none'
            }}
          >
            <div style={{ color: hoveredPoint.color, fontWeight: 700 }}>{hoveredPoint.dept}</div>
            <div style={{ color: 'var(--ink-soft)' }}>{hoveredPoint.label}: <strong>{hoveredPoint.val} Complaints</strong></div>
          </div>
        )}
      </div>

      {/* Department SLA & Performance Matrix Table */}
      <div style={{ padding: '16px 18px', borderTop: '1px solid var(--line)' }}>
        <h3 style={{ fontSize: '14px', margin: '0 0 10px 0', color: 'var(--blue)' }}>
          Department Complaint Volume &amp; SLA Compliance Table ({timeframe.toUpperCase()})
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="queue-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Volume Trend</th>
                <th>Avg. SLA Turnaround</th>
                <th>Resolution Rate</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {DEPARTMENTS.map(dept => {
                const vals = activeData.datasets[dept.id] || [0];
                const latest = vals[vals.length - 1];
                const prev = vals[vals.length - 2] || latest;
                const delta = latest - prev;

                return (
                  <tr key={dept.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: dept.color }}></span>
                        <strong>{dept.name}</strong>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{latest} complaints</span>
                      <span className={`metric-delta ${delta >= 0 ? 'up' : 'down'}`} style={{ marginLeft: 6, fontSize: '11px' }}>
                        {delta >= 0 ? `↑ +${delta}` : `↓ ${delta}`}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--ink-soft)' }}>
                        {dept.id === 'public-safety' ? '1.8 Days' : dept.id === 'drainage' ? '2.4 Days' : '3.1 Days'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--moss)' }}>91.4%</span>
                    </td>
                    <td>
                      <span className="badge badge-moss">
                        <CheckCircle2 size={11} style={{ marginRight: 3 }} />
                        Within SLA
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
