import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGrievances } from '../../context/GrievanceContext';
import { WARDS } from '../../data/mockData';
import { Sidebar } from './Sidebar';
import { MetricsStrip } from './MetricsStrip';
import { PriorityQueue } from './PriorityQueue';
import { DuplicateClusters } from './DuplicateClusters';
import { GISHotspotMap } from './GISHotspotMap';
import { ActionDrawer } from './ActionDrawer';
import { MobileBottomNav } from './MobileBottomNav';
import { Menu, Search, Download } from 'lucide-react';

export const AuthorityDashboard = ({ onViewChange }) => {
  const { currentUser } = useAuth();
  const {
    selectedWard,
    setSelectedWard,
    searchQuery,
    setSearchQuery,
    showToast
  } = useGrievances();

  const [activeSection, setActiveSection] = useState('queue');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const handleExportReport = () => {
    showToast('Exporting SIH26-S02 Municipal Resolution Report (CSV/PDF)...', 'info');
    setTimeout(() => {
      showToast('Resolution Report downloaded successfully!', 'success');
    }, 1000);
  };

  return (
    <div className="app">
      {/* Sidebar / Mobile Drawer */}
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onViewChange={onViewChange}
      />

      {/* Main Command Center Content */}
      <main className="main">
        {/* Header Topbar */}
        <header className="main-topbar">
          <button
            className="menu-toggle-btn"
            onClick={() => setSidebarOpen(true)}
            title="Toggle navigation menu"
          >
            <Menu size={18} />
          </button>

          <h1>Priority Queue</h1>

          <div className="search">
            <Search size={14} />
            <input
              type="text"
              placeholder="Search complaints, ward, or #GRV ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="select-ctrl"
            value={selectedWard}
            onChange={(e) => {
              setSelectedWard(e.target.value);
              showToast(`Ward filter: ${e.target.value}`, 'info');
            }}
          >
            <option value="all">All Wards</option>
            {WARDS.map(w => (
              <option key={w.id} value={w.name}>{w.name}</option>
            ))}
          </select>

          <button
            type="button"
            className="btn-secondary no-print"
            onClick={handleExportReport}
            title="Download Municipal Resolution Report"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', fontSize: '12px' }}
          >
            <Download size={13} />
            <span className="hidden-mobile">Export Report</span>
          </button>

          <div
            className="avatar-badge"
            title={`${currentUser?.name || 'Officer'} - Click to switch profile`}
            onClick={() => onViewChange('auth')}
            style={{ cursor: 'pointer' }}
          >
            {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'SK'}
          </div>
        </header>

        {/* Executive Metrics Row */}
        <MetricsStrip />

        {/* 2-Column Body Grid */}
        <div className="body-grid">
          {/* Left Panel: Priority Queue */}
          <PriorityQueue onSelectComplaint={(item) => setSelectedComplaint(item)} />

          {/* Right Stack: GIS Map & Duplicate Clusters */}
          <aside className="side-stack">
            <GISHotspotMap />
            <DuplicateClusters />
          </aside>
        </div>
      </main>

      {/* Mobile Bottom Quick App Navigation Bar */}
      <MobileBottomNav
        activeSection={activeSection}
        onSectionChange={(sec) => {
          setActiveSection(sec);
          if (sec === 'clusters') {
            document.getElementById('duplicateClustersPanel')?.scrollIntoView({ behavior: 'smooth' });
          } else if (sec === 'map') {
            document.getElementById('hotspotMapPanel')?.scrollIntoView({ behavior: 'smooth' });
          } else {
            document.getElementById('priorityQueuePanel')?.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        onViewChange={onViewChange}
      />

      {/* Action Drawer / Modal */}
      {selectedComplaint && (
        <ActionDrawer
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
        />
      )}
    </div>
  );
};
