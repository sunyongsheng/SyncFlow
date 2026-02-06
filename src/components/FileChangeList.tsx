import React from 'react';
import { FilePlus, FileEdit, Trash2, FolderPlus, FolderMinus, FileX } from 'lucide-react';
import { useStore, FileEvent } from '../store';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';

type EventWithSnapshot = FileEvent & {
  origin?: 'source' | 'target';
  fromDir?: string;
  toDir?: string;
  labelStyle?: 'oneWay' | 'twoWay';
};

export const FileChangeList: React.FC = () => {
  const { fileEvents, setFileEvents, updateStatus } = useStore();
  const { t } = useTranslation();

  const getEventIcon = (type: FileEvent['type']) => {
    switch (type) {
      case 'add': return <FilePlus className="w-4 h-4" />;
      case 'change': return <FileEdit className="w-4 h-4" />;
      case 'unlink': return <Trash2 className="w-4 h-4" />;
      case 'addDir': return <FolderPlus className="w-4 h-4" />;
      case 'unlinkDir': return <FolderMinus className="w-4 h-4" />;
      case 'skipped': return <FileX className="w-4 h-4" />;
      default: return <FileEdit className="w-4 h-4" />;
    }
  };

  const getEventColor = (type: FileEvent['type']) => {
    switch (type) {
      case 'add':
      case 'addDir':
        return 'text-green-600 bg-green-50';
      case 'change':
        return 'text-blue-600 bg-blue-50';
      case 'unlink':
      case 'unlinkDir':
        return 'text-red-600 bg-red-50';
      case 'skipped':
        return 'text-gray-500 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getEventLabel = (type: FileEvent['type']) => {
    switch (type) {
      case 'add': return t('fileChangeList.created');
      case 'change': return t('fileChangeList.modified');
      case 'unlink': return t('fileChangeList.deleted');
      case 'addDir': return t('fileChangeList.dirCreated');
      case 'unlinkDir': return t('fileChangeList.dirDeleted');
      case 'skipped': return t('fileChangeList.skipped');
      default: return type;
    }
  };

  const DirectionText = ({ origin, fromDir, toDir, labelStyle }: { origin?: 'source' | 'target', fromDir?: string, toDir?: string, labelStyle?: 'oneWay' | 'twoWay' }) => {
    const isTwoWay = labelStyle === 'twoWay';
    let fromLabel = '';
    let toLabel = '';
    if (isTwoWay) {
      if (origin === 'target') {
        fromLabel = t('directorySelector.dir2Label');
        toLabel = t('directorySelector.dir1Label');
      } else {
        fromLabel = t('directorySelector.dir1Label');
        toLabel = t('directorySelector.dir2Label');
      }
    } else {
      fromLabel = t('directorySelector.sourceLabel');
      toLabel = t('directorySelector.targetLabel');
    }
    return (
      <span 
        className="inline-flex items-center gap-1 text-xs font-medium text-slate-700"
        title={`${fromDir ?? ''} → ${toDir ?? ''}`}
      >
        {fromLabel} → {toLabel}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[300px]">
      <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
        <h3 className="font-semibold text-gray-700">{t('home.recentActivity')}</h3>
        <button
          onClick={async () => {
            setFileEvents([]);
            updateStatus({ syncedFiles: 0 });
            if (window.electron?.clearRecentActivity) {
              await window.electron.clearRecentActivity();
            }
          }}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title={t('home.clearRecentActivity')}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <div className="overflow-y-auto flex-1 p-0">
        {fileEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <ActivityIcon className="w-12 h-12 mb-3 opacity-20" />
            <p>{t('fileChangeList.noChanges')}</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-medium sticky top-0 z-10">
              <tr>
                <th className="px-4 py-2">{t('fileChangeList.type')}</th>
                <th className="px-4 py-2">{t('fileChangeList.direction')}</th>
                <th className="px-4 py-2">{t('fileChangeList.path')}</th>
                <th className="px-4 py-2 text-right">{t('fileChangeList.time')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {fileEvents.map((ev, index) => {
                const event = ev as EventWithSnapshot;
                return (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="inline-flex items-center gap-2">
                      <span className={clsx("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", getEventColor((event as any).operation ?? event.type))}>
                        {getEventIcon(((event as any).operation ?? event.type) as FileEvent['type'])}
                        {getEventLabel(((event as any).operation ?? event.type) as FileEvent['type'])}
                      </span>
                      {event.type === 'skipped' && (
                        <span className={clsx("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", getEventColor('skipped'))}>
                          {getEventIcon('skipped')}
                          {getEventLabel('skipped')}
                        </span>
                      )}
                    </div>
                  </td>
                  <td 
                    className="px-4 py-3 whitespace-nowrap"
                    title={`${event.fromDir ?? ''} → ${event.toDir ?? ''}`}
                  >
                    <DirectionText origin={event.origin} fromDir={event.fromDir} toDir={event.toDir} labelStyle={event.labelStyle} />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600 truncate max-w-[200px]" title={event.path}>
                    {event.path}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400 text-xs whitespace-nowrap">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

function ActivityIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}
