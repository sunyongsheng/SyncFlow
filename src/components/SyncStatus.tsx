import React from 'react';
import { Activity, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { useStore } from '../store';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';

export const SyncStatus: React.FC = () => {
  const { status, isSyncing } = useStore();
  const { t } = useTranslation();

  const getStatusColor = () => {
    if (status.error) return 'text-red-500 bg-red-50 border-red-100';
    if (isSyncing) return 'text-green-500 bg-green-50 border-green-100';
    return 'text-gray-900 bg-white border-gray-100';
  };

  const getStatusText = () => {
    if (status.error) return t('syncStatus.error');
    if (isSyncing) return t('syncStatus.syncing');
    return t('syncStatus.idle');
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status Card */}
        <div className={clsx("p-4 rounded-xl border flex items-center gap-3", getStatusColor())}>
          <div className="p-2 bg-white rounded-full shadow-sm">
            {status.error ? <AlertCircle className="w-5 h-5" /> : 
             isSyncing ? <Activity className="w-5 h-5 animate-pulse" /> : 
             <Clock className="w-5 h-5" />}
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider opacity-70">{t('home.statusOverview')}</p>
            <p className="font-bold text-lg">{getStatusText()}</p>
          </div>
        </div>

        {/* Synced Files */}
        <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm flex items-center gap-3">
          <div className="p-2 bg-teal-50 text-teal-600 rounded-full">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t('syncStatus.syncedFiles')}</p>
            <p className="font-bold text-lg text-gray-900">{status.syncedFiles}</p>
          </div>
        </div>

        {/* Errors/Failures */}
        <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm flex items-center gap-3">
          <div className="p-2 bg-red-50 text-red-600 rounded-full">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t('syncStatus.failures')}</p>
            <p className="font-bold text-lg text-gray-900">{status.failedFiles}</p>
          </div>
        </div>
      </div>

      {status.error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{status.error}</span>
        </div>
      )}
    </div>
  );
};
