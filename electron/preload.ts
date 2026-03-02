import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { SyncOptions, SyncStatus, FileLogEntry, SessionData } from './types';

contextBridge.exposeInMainWorld('electron', {
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  startSync: (sourcePath: string, targetPath: string, options: SyncOptions) => ipcRenderer.invoke('start-sync', sourcePath, targetPath, options),
  stopSync: () => ipcRenderer.invoke('stop-sync'),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: SyncOptions) => ipcRenderer.invoke('save-settings', settings),
  getLastSession: () => ipcRenderer.invoke('get-last-session'),
  saveLastSession: (session: SessionData) => ipcRenderer.invoke('save-last-session', session),
  clearRecentActivity: () => ipcRenderer.invoke('clear-recent-activity'),
  
  onSyncStatus: (callback: (status: SyncStatus) => void) => {
    const subscription = (_event: IpcRendererEvent, status: SyncStatus) => callback(status);
    ipcRenderer.on('sync-status', subscription);
    return () => ipcRenderer.removeListener('sync-status', subscription);
  },
  
  onFileChange: (callback: (fileEvent: FileLogEntry) => void) => {
    const subscription = (_event: IpcRendererEvent, fileEvent: FileLogEntry) => callback(fileEvent);
    ipcRenderer.on('file-change', subscription);
    return () => ipcRenderer.removeListener('file-change', subscription);
  }
});
