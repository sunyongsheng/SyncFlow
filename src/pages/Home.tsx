import React, { useEffect } from 'react';
import { Play, Square, RefreshCw } from 'lucide-react';
import { useStore } from '../store';
import { DirectorySelector } from '../components/DirectorySelector';
import { SyncStatus } from '../components/SyncStatus';
import { FileChangeList } from '../components/FileChangeList';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';

export const Home: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { 
    sourcePath, 
    targetPath, 
    isSyncing, 
    settings,
    setSourcePath,
    setTargetPath,
    setSyncing, 
    updateStatus, 
    addFileEvent,
    setFileEvents,
    fileEvents,
    resetStats,
    setSettings
  } = useStore();

  useEffect(() => {
    // Load settings first to apply language
    window.electron.getSettings().then((savedSettings) => {
      if (savedSettings) {
        setSettings(savedSettings);
        // Only update language if different to avoid redundant updates
        if (savedSettings.language && savedSettings.language !== i18n.language) {
          i18n.changeLanguage(savedSettings.language);
        }
      }
    });

    // Load last session on mount
    window.electron.getLastSession().then((session) => {
      if (session) {
        if (session.sourcePath) setSourcePath(session.sourcePath);
        if (session.targetPath) setTargetPath(session.targetPath);
        if (session.fileEvents && Array.isArray(session.fileEvents)) {
           setFileEvents(session.fileEvents);
           const unique = new Set<string>();
           for (const e of session.fileEvents) {
             if (e?.type === 'add' || e?.type === 'change' || e?.type === 'unlink') {
               if (typeof e?.path === 'string') {
                 unique.add(e.path);
               }
             }
           }
           updateStatus({ syncedFiles: unique.size });
        }
        // Restore sync status if it was active
        if (session.isSyncing) {
          // If restoring active sync session, we need to restart the watcher with current settings
          // But we need to make sure settings are loaded first, which is handled above
          // However, to be safe, we might just set the UI state and let user restart or handle it better
          // For now, let's just set the state to true, but we actually need to re-trigger startSync if it's not running in background
          // Since our backend service keeps running, we just need to update UI state
          setSyncing(true);
        }
      }
    });
  }, []); // Run only once on mount

  useEffect(() => {
    // Listen for status updates
    const cleanupStatus = window.electron.onSyncStatus((status) => {
      updateStatus(status);
      if (status.isSyncing !== undefined) {
        setSyncing(status.isSyncing);
      }
    });

    // Listen for file events
    const cleanupFiles = window.electron.onFileChange((event) => {
      addFileEvent(event);
      try {
        const pending = [event, ...fileEvents];
        const unique = new Set<string>();
        for (const ev of pending) {
          if (ev?.type === 'add' || ev?.type === 'change' || ev?.type === 'unlink') {
            if (typeof ev?.path === 'string') {
              unique.add(ev.path);
            }
          }
        }
        updateStatus({ syncedFiles: unique.size });
      } catch {}
    });

    return () => {
      cleanupStatus();
      cleanupFiles();
    };
  }, [updateStatus, setSyncing, addFileEvent]);

  // Save session state when key values change
  useEffect(() => {
    if (sourcePath || targetPath || fileEvents.length > 0) {
      window.electron.saveLastSession({
        sourcePath,
        targetPath,
        fileEvents
      });
    }
  }, [sourcePath, targetPath, fileEvents]);

  const handleStartSync = async () => {
    if (!sourcePath || !targetPath) return;
    try {
      resetStats();
      
      // Explicitly construct options object to ensure flat structure
      const syncOptions = {
        exclude: settings.fileFilters.exclude || [],
        include: settings.fileFilters.include || [],
        deleteOnSync: settings.deleteOnSync,
        showNotifications: settings.showNotifications,
        language: settings.language, // Pass current language to backend
        syncMode: settings.syncMode
      };

      console.log('Starting sync with options:', syncOptions);

      const success = await window.electron.startSync(sourcePath, targetPath, syncOptions);
      if (success) {
        setSyncing(true);
      }
    } catch (error) {
      console.error('Failed to start sync:', error);
      updateStatus({ error: 'Failed to start synchronization' });
    }
  };

  const handleStopSync = async () => {
    try {
      const success = await window.electron.stopSync();
      if (success) {
        setSyncing(false);
      }
    } catch (error) {
      console.error('Failed to stop sync:', error);
    }
  };

  const canStart = sourcePath && targetPath && !isSyncing;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between drag-region pt-12 px-6 pb-6">
        <div className="select-none">
          <h1 className="text-2xl font-bold text-gray-900">{t('home.title')}</h1>
          <p className="text-gray-500 mt-1">{t('home.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3 no-drag">
           {isSyncing ? (
             <button
               onClick={handleStopSync}
               className="btn btn-danger"
             >
               <Square className="w-4 h-4 fill-current mr-2" />
               {t('home.stopSync')}
             </button>
           ) : (
             <button
               onClick={handleStartSync}
               disabled={!canStart}
               className={clsx(
                 "btn",
                 canStart 
                   ? "btn-primary" 
                   : "bg-gray-100 text-gray-400 cursor-not-allowed"
               )}
             >
               <Play className="w-4 h-4 fill-current mr-2" />
               {t('home.startSync')}
             </button>
           )}
        </div>
      </div>

      {/* Directory Selection */}
      <section className="px-6 pb-6 space-y-8">
        {/* Sync Mode Toggle */}
        <div className="card p-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">{t('home.syncModeLabel')}</label>
          <div className="inline-flex rounded-lg overflow-hidden border border-slate-200">
            <button
              className={clsx(
                "px-4 py-2 text-sm",
                settings.syncMode === 'oneWay' ? "bg-cyan-600 text-white" : "bg-white text-gray-700",
                isSyncing && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => {
                setSettings({ syncMode: 'oneWay' });
                window.electron.saveSettings({ ...settings, syncMode: 'oneWay' });
              }}
              disabled={isSyncing}
            >
              {t('home.syncOneWay')}
            </button>
            <button
              className={clsx(
                "px-4 py-2 text-sm border-l border-slate-200",
                settings.syncMode === 'twoWay' ? "bg-cyan-600 text-white" : "bg-white text-gray-700",
                isSyncing && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => {
                setSettings({ syncMode: 'twoWay' });
                window.electron.saveSettings({ ...settings, syncMode: 'twoWay' });
              }}
              disabled={isSyncing}
            >
              {t('home.syncTwoWay')}
            </button>
          </div>
        </div>
        <DirectorySelector />

      {/* Status Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">{t('home.statusOverview')}</h2>
          <button 
            onClick={resetStats}
            className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
            title={t('home.resetStats')}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <SyncStatus />
      </div>

      {/* Recent Activity */}
      <div>
        <FileChangeList />
      </div>
      </section>
    </div>
  );
};

export default Home;
