import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Header } from './components/common/Header';
import { ToastContainer } from './components/common/Toast';
import { CitizenPortal } from './components/citizen/CitizenPortal';
import { AuthorityDashboard } from './components/authority/AuthorityDashboard';
import { AuthHub } from './components/auth/AuthHub';

export function App() {
  const { currentUser } = useAuth();
  const [activeView, setActiveView] = useState('citizen'); // 'citizen' | 'authority' | 'auth'

  return (
    <div className="jansetu-app">
      {/* Universal Responsive Topbar */}
      {activeView !== 'authority' && (
        <Header
          activeView={activeView}
          onViewChange={setActiveView}
        />
      )}

      {/* Main Views */}
      {activeView === 'citizen' && (
        <CitizenPortal onViewChange={setActiveView} />
      )}

      {activeView === 'authority' && (
        <AuthorityDashboard onViewChange={setActiveView} />
      )}

      {activeView === 'auth' && (
        <AuthHub
          onAuthenticated={(targetView) => setActiveView(targetView)}
          onBack={() => setActiveView('citizen')}
        />
      )}

      {/* Floating Toast System */}
      <ToastContainer />
    </div>
  );
}

export default App;
