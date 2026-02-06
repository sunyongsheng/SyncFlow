import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n' // Import i18n configuration

// Mock Electron API for browser development
if (!window.electron) {
  window.electron = {
    selectDirectory: async () => {
      console.log('Mock: selectDirectory');
      return '/mock/path';
    },
    startSync: async (source, target, options) => {
      console.log('Mock: startSync', source, target, options);
      return true;
    },
    stopSync: async () => {
      console.log('Mock: stopSync');
      return true;
    },
    getSettings: async () => {
      console.log('Mock: getSettings');
      return {};
    },
    saveSettings: async (settings) => {
      console.log('Mock: saveSettings', settings);
      return true;
    },
    getLastSession: async () => {
      console.log('Mock: getLastSession');
      return {};
    },
    saveLastSession: async (session) => {
      console.log('Mock: saveLastSession', session);
      return true;
    },
    clearRecentActivity: async () => {
      console.log('Mock: clearRecentActivity');
      return true;
    },
    onSyncStatus: (callback) => {
      console.log('Mock: onSyncStatus subscribed');
      return () => {};
    },
    onFileChange: (callback) => {
      console.log('Mock: onFileChange subscribed');
      return () => {};
    }
  };
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
