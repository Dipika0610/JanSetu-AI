import React, { useState } from 'react';
import { useGrievances } from '../../context/GrievanceContext';

export const DuplicateClusters = () => {
  const { clusters, mergeCluster } = useGrievances();
  const [openClusterId, setOpenClusterId] = useState(null);

  const toggleCluster = (id) => {
    setOpenClusterId(openClusterId === id ? null : id);
  };

  return (
    <div className="panel" id="duplicateClustersPanel">
      <div className="panel-head">
        <h2>Duplicate clusters</h2>
        <span className="hint">Grouped by semantic AI embeddings</span>
      </div>

      <div className="cluster-list">
        {clusters.map(cluster => {
          const isOpen = openClusterId === cluster.id;

          return (
            <div key={cluster.id} className={`cluster ${isOpen ? 'open' : ''}`}>
              <div className="cluster-top" onClick={() => toggleCluster(cluster.id)}>
                <div>
                  <div className="cluster-title">{cluster.title}</div>
                  <div className="cluster-sub">
                    {cluster.ward} · {cluster.department} · {cluster.similarityScore}% similarity
                  </div>
                </div>
                <div className="cluster-count">
                  {cluster.count}
                  <span className="cluster-count-label">reports</span>
                </div>
              </div>

              <div className="sim-bar">
                <div className="sim-bar-fill" style={{ width: `${cluster.similarityScore}%` }}></div>
              </div>

              <div className="cluster-members">
                {cluster.members.map((m, i) => (
                  <div key={i} className="cluster-member">
                    <span>#{m.id} · {m.note}</span>
                    <span style={{ color: 'var(--ink-faint)' }}>{m.time}</span>
                  </div>
                ))}

                <button
                  type="button"
                  className={`merge-btn ${cluster.isMerged ? 'merged' : ''}`}
                  disabled={cluster.isMerged}
                  onClick={() => mergeCluster(cluster.id)}
                >
                  {cluster.isMerged ? '✓ Merged & Dispatched' : 'Confirm Merge & Assign (1 Work Order)'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
