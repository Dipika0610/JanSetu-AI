import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { GrievanceProvider } from './context/GrievanceContext.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <LanguageProvider>
        <GrievanceProvider>
          <App />
        </GrievanceProvider>
      </LanguageProvider>
    </AuthProvider>
  </React.StrictMode>
);
