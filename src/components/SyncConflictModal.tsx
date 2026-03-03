import React from 'react';
import { useTranslation } from 'react-i18next';
import { FilePlus, FileEdit } from 'lucide-react';
import { clsx } from 'clsx';
import { ConflictFile } from '../types/electron';

interface SyncConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSync: () => void;
  onSkip: () => void;
  conflicts: ConflictFile[];
}

export const SyncConflictModal: React.FC<SyncConflictModalProps> = ({
  isOpen,
  onClose,
  onSync,
  onSkip,
  conflicts
}) => {
  const { t } = useTranslation();

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'add': return <FilePlus className="w-4 h-4" />;
      case 'change': return <FileEdit className="w-4 h-4" />;
      default: return <FileEdit className="w-4 h-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'add':
        return 'text-green-600 bg-green-50';
      case 'change':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getEventLabel = (type: string) => {
    switch (type) {
      case 'add': return t('fileChangeList.created');
      case 'change': return t('fileChangeList.modified');
      default: return type;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">
            {t('syncConflict.title')}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
             {t('syncConflict.description')}
          </p>
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto p-0 bg-gray-50">
          <ul className="divide-y divide-gray-100">
            {conflicts.map((file, index) => (
              <li key={index} className="px-6 py-3 text-sm text-gray-700 break-all hover:bg-gray-100 transition-colors font-mono flex items-center gap-3">
                 <span className={clsx("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shrink-0", getEventColor(file.type))}>
                    {getEventIcon(file.type)}
                    {getEventLabel(file.type)}
                  </span>
                <span className="truncate">{file.path}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 border-t border-gray-100 bg-white flex items-center justify-end gap-3">
          <button
            onClick={onSkip}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium text-sm"
          >
            {t('syncConflict.skip')}
          </button>
          <button
            onClick={onSync}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm transition-colors font-medium text-sm flex items-center gap-2"
          >
            {t('syncConflict.sync')}
          </button>
        </div>
      </div>
    </div>
  );
};
