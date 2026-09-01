import React, { useState } from 'react';
import { useGrievances } from '../../context/GrievanceContext';
import { useLanguage } from '../../context/LanguageContext';

export const DuplicateClusters = () => {
  const { clusters, mergeCluster } = useGrievances();
  const { t } = useLanguage();
  const [openClusterId, setOpenClusterId] = useState(null);

  const toggleCluster = (id) => {
    setOpenClusterId(openClusterId === id ? null : id);
  };

  return (
    <div className="panel" id="duplicateClustersPanel">
      <div className="panel-head">
        <h2>{t('clusterPanelTitle')}</h2>
        <span className="hint">{t('clusterPanelSub')}</span>
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
                    {cluster.ward} · {cluster.department} · {cluster.similarityScore}% {t('clusterSimilarity')}
                  </div>
                </div>
                <div className="cluster-count">
                  {cluster.count}
                  <span className="cluster-count-label">{t('reportsCount')}</span>
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
                  {cluster.isMerged ? t('btnMergedDone') : t('btnConfirmMerge')}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
