import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Settings } from 'lucide-react';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';

export const Sidebar: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 border-r border-slate-800">
      <div className="pt-12 pb-6 px-6 flex items-center gap-3 drag-region select-none">
        <div className="w-8 h-8 rounded-lg overflow-hidden ring-1 ring-slate-700 shadow-lg shadow-slate-900/20">
          <img src="/app-icon.svg" alt="SyncFlow" className="w-full h-full" />
        </div>
        <span className="font-bold text-lg tracking-tight text-slate-100">SyncFlow</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        <NavLink 
          to="/" 
          className={({ isActive }) => clsx(
            "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
            isActive 
              ? "bg-cyan-600 text-white shadow-lg shadow-cyan-900/20" 
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          )}
        >
          <Home className="w-5 h-5" />
          <span className="font-medium">{t('sidebar.dashboard')}</span>
        </NavLink>

        <NavLink 
          to="/settings" 
          className={({ isActive }) => clsx(
            "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
            isActive 
              ? "bg-cyan-600 text-white shadow-lg shadow-cyan-900/20" 
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          )}
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">{t('sidebar.settings')}</span>
        </NavLink>
      </nav>

      <div className="p-6 border-t border-slate-800">
        <p className="text-xs text-slate-500">{t('sidebar.version', { version: '1.0.0' })}</p>
      </div>
    </div>
  );
};
