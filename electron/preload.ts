import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  startSync: (sourcePath: string, targetPath: string, options: any) => ipcRenderer.invoke('start-sync', sourcePath, targetPath, options),
  stopSync: () => ipcRenderer.invoke('stop-sync'),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: any) => ipcRenderer.invoke('save-settings', settings),
  getLastSession: () => ipcRenderer.invoke('get-last-session'),
  saveLastSession: (session: any) => ipcRenderer.invoke('save-last-session', session),
  clearRecentActivity: () => ipcRenderer.invoke('clear-recent-activity'),
  
  onSyncStatus: (callback: (status: any) => void) => {
    const subscription = (_event: any, status: any) => callback(status);
    ipcRenderer.on('sync-status', subscription);
    return () => ipcRenderer.removeListener('sync-status', subscription);
  },
  
  onFileChange: (callback: (fileEvent: any) => void) => {
    const subscription = (_event: any, fileEvent: any) => callback(fileEvent);
    ipcRenderer.on('file-change', subscription);
    return () => ipcRenderer.removeListener('file-change', subscription);
  }
});
