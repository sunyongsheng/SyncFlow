import React from 'react';
import { FolderOpen, ArrowRight, ArrowLeftRight } from 'lucide-react';
import { useStore } from '../store';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';

export const DirectorySelector: React.FC = () => {
  const { sourcePath, targetPath, setSourcePath, setTargetPath, isSyncing, settings } = useStore();
  const { t } = useTranslation();

  const handleSelectSource = async () => {
    if (isSyncing) return;
    try {
      const path = await window.electron.selectDirectory();
      if (path) setSourcePath(path);
    } catch (error) {
      console.error('Failed to select source directory:', error);
    }
  };

  const handleSelectTarget = async () => {
    if (isSyncing) return;
    try {
      const path = await window.electron.selectDirectory();
      if (path) setTargetPath(path);
    } catch (error) {
      console.error('Failed to select target directory:', error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full">
      {/* Source/Dir1 */}
      <div className="flex-1 card p-4 hover:shadow-md">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {settings.syncMode === 'twoWay' ? t('directorySelector.dir1Label') : t('directorySelector.sourceLabel')}
        </label>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-cyan-50 rounded-lg">
            <FolderOpen className="w-5 h-5 text-cyan-600" />
          </div>
          <div 
            className={clsx(
              "flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm truncate cursor-pointer hover:bg-slate-100 transition-colors",
              !sourcePath && "text-slate-400 italic",
              isSyncing && "opacity-50 cursor-not-allowed"
            )}
            onClick={handleSelectSource}
            title={sourcePath}
          >
            {sourcePath || (settings.syncMode === 'twoWay' ? t('directorySelector.selectDir1') : t('directorySelector.selectSource'))}
          </div>
        </div>
      </div>

      <div className="hidden md:flex items-center justify-center">
        {settings.syncMode === 'twoWay' ? (
          <ArrowLeftRight className="w-6 h-6 text-slate-400" />
        ) : (
          <ArrowRight className="w-6 h-6 text-slate-400" />
        )}
      </div>

      {/* Target/Dir2 */}
      <div className="flex-1 card p-4 hover:shadow-md">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {settings.syncMode === 'twoWay' ? t('directorySelector.dir2Label') : t('directorySelector.targetLabel')}
        </label>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-orange-50 rounded-lg">
            <FolderOpen className="w-5 h-5 text-orange-500" />
          </div>
          <div 
            className={clsx(
              "flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm truncate cursor-pointer hover:bg-slate-100 transition-colors",
              !targetPath && "text-slate-400 italic",
              isSyncing && "opacity-50 cursor-not-allowed"
            )}
            onClick={handleSelectTarget}
            title={targetPath}
          >
            {targetPath || (settings.syncMode === 'twoWay' ? t('directorySelector.selectDir2') : t('directorySelector.selectTarget'))}
          </div>
        </div>
      </div>
    </div>
  );
};
