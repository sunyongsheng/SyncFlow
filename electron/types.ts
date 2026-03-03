export interface SyncOptions {
  exclude?: string[];
  syncMode?: 'oneWay' | 'twoWay';
  deleteOnSync?: boolean;
  showNotifications?: boolean;
  language?: 'en' | 'zh';
  autoStart?: boolean;
  minimizeToTray?: boolean;
  include?: string[];
}

export interface FileLogEntry {
  type: 'add' | 'change' | 'unlink' | 'addDir' | 'unlinkDir' | 'skipped';
  path: string;
  timestamp: number;
  origin: 'source' | 'target';
  fromDir: string;
  toDir: string;
  labelStyle: 'oneWay' | 'twoWay';
  operation?: string;
}

export interface SyncStatus {
  isWatching?: boolean;
  isSyncing?: boolean;
  totalFiles?: number;
  syncedFiles?: number;
  failedFiles?: number;
  error?: string;
  lastSyncTime?: number;
  missingDir?: string;
}

export interface SessionData {
  sourcePath?: string;
  targetPath?: string;
  fileEvents?: FileLogEntry[];
  isSyncing?: boolean;
}

export interface ConflictFile {
  path: string;
  type: 'add' | 'change';
}
