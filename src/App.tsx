import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Sidebar } from './components/Sidebar';
import Home from './pages/Home';
import Settings from './pages/Settings';

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 ml-64 overflow-y-auto h-screen">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
        <Toaster position="top-center" expand={true} richColors />
      </div>
    </Router>
  );
};

export default App;
