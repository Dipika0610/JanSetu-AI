import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Header } from './components/common/Header';
import { ToastContainer } from './components/common/Toast';
import { CitizenPortal } from './components/citizen/CitizenPortal';
import { AuthorityDashboard } from './components/authority/AuthorityDashboard';
import { AuthHub } from './components/auth/AuthHub';

const LANGUAGES = [
  { code: 'EN', name: 'English', heading: "What's the issue?", sub: "Describe it in your own words — Hindi, Marathi, or English all work." },
  { code: 'HI', name: 'हिन्दी', heading: "समस्या क्या है?", sub: "अपने शब्दों में लिखें — हिन्दी, मराठी या अंग्रेजी सभी स्वीकार्य हैं।" },
  { code: 'MR', name: 'मराठी', heading: "तक्रार काय आहे?", sub: "आपल्या स्वतःच्या शब्दात सांगा — मराठी, हिंदी किंवा इंग्रजी." }
];

export function App() {
  const { currentUser } = useAuth();
  const [activeView, setActiveView] = useState('citizen'); // 'citizen' | 'authority' | 'auth'
  const [langIndex, setLangIndex] = useState(0);

  const currentLang = LANGUAGES[langIndex];

  const handleLangToggle = () => {
    setLangIndex((prev) => (prev + 1) % LANGUAGES.length);
  };

  return (
    <div className="jansetu-app">
      {/* Universal Responsive Topbar */}
      {activeView !== 'authority' && (
        <Header
          activeView={activeView}
          onViewChange={setActiveView}
          currentLang={currentLang}
          onLangChange={handleLangToggle}
        />
      )}

      {/* Main Views */}
      {activeView === 'citizen' && (
        <CitizenPortal currentLang={currentLang} />
      )}

      {activeView === 'authority' && (
        <AuthorityDashboard onViewChange={setActiveView} />
      )}

      {activeView === 'auth' && (
        <AuthHub onAuthenticated={(targetView) => setActiveView(targetView)} />
      )}

      {/* Floating Toast System */}
      <ToastContainer />
    </div>
  );
}

export default App;
