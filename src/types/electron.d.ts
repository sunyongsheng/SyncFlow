export interface ElectronAPI {
  selectDirectory: () => Promise<string | null>;
  startSync: (sourcePath: string, targetPath: string, options: any) => Promise<boolean>;
  stopSync: () => Promise<boolean>;
  getSettings: () => Promise<any>;
  saveSettings: (settings: any) => Promise<boolean>;
  getLastSession: () => Promise<any>;
  saveLastSession: (session: any) => Promise<boolean>;
  clearRecentActivity: () => Promise<boolean>;
  
  onSyncStatus: (callback: (status: any) => void) => () => void;
  onFileChange: (callback: (fileEvent: any) => void) => () => void;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}
