import { create } from 'zustand';

export interface FileEvent {
  type: 'add' | 'change' | 'unlink' | 'addDir' | 'unlinkDir' | 'skipped';
  path: string;
  timestamp: number;
  origin?: 'source' | 'target';
}

export interface SyncStatus {
  isWatching: boolean;
  isSyncing: boolean;
  totalFiles: number;
  syncedFiles: number;
  failedFiles: number;
  lastSyncTime?: number;
  error?: string;
}

export interface UserSettings {
  sourceDirectory: string;
  targetDirectory: string;
  autoStart: boolean;
  minimizeToTray: boolean;
  showNotifications: boolean;
  syncDelay: number;
  fileFilters: {
    include: string[];
    exclude: string[];
  };
  deleteOnSync: boolean;
  theme: 'light' | 'dark';
  language: 'en' | 'zh';
  syncMode: 'oneWay' | 'twoWay';
}

interface AppState {
  sourcePath: string;
  targetPath: string;
  isSyncing: boolean;
  status: SyncStatus;
  fileEvents: FileEvent[];
  settings: UserSettings;
  
  setSourcePath: (path: string) => void;
  setTargetPath: (path: string) => void;
  setSyncing: (isSyncing: boolean) => void;
  updateStatus: (status: Partial<SyncStatus>) => void;
  addFileEvent: (event: FileEvent) => void;
  setFileEvents: (events: FileEvent[]) => void;
  setSettings: (settings: Partial<UserSettings>) => void;
  resetStats: () => void;
}

const defaultSettings: UserSettings = {
  sourceDirectory: '',
  targetDirectory: '',
  autoStart: false,
  minimizeToTray: true,
  showNotifications: true,
  syncDelay: 100,
  fileFilters: {
    include: [],
    exclude: ['.DS_Store']
  },
  deleteOnSync: true,
  theme: 'light',
  language: 'en',
  syncMode: 'oneWay'
};

export const useStore = create<AppState>((set) => ({
  sourcePath: '',
  targetPath: '',
  isSyncing: false,
  status: {
    isWatching: false,
    isSyncing: false,
    totalFiles: 0,
    syncedFiles: 0,
    failedFiles: 0,
  },
  fileEvents: [],
  settings: defaultSettings,

  setSourcePath: (path) => set({ sourcePath: path }),
  setTargetPath: (path) => set({ targetPath: path }),
  setSyncing: (isSyncing) => set({ isSyncing }),
  updateStatus: (newStatus) => set((state) => ({
    status: { ...state.status, ...newStatus }
  })),
  addFileEvent: (event) => set((state) => ({
    fileEvents: [event, ...state.fileEvents].slice(0, 100) // Keep last 100 events
  })),
  setFileEvents: (events) => set({ fileEvents: events }),
  setSettings: (newSettings) => set((state) => ({
    settings: { ...state.settings, ...newSettings }
  })),
  resetStats: () => set((state) => ({
    status: {
      ...state.status,
      totalFiles: 0,
      syncedFiles: 0,
      failedFiles: 0,
      error: undefined
    }
  }))
}));
