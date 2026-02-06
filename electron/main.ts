import { app, BrowserWindow, ipcMain, dialog, powerSaveBlocker, nativeImage } from 'electron';
import path from 'path';
import fs from 'fs';
import Store from 'electron-store';
import { SyncService } from './syncService';
import log from 'electron-log';

// Configure logging
log.transports.file.level = 'info';
log.transports.console.level = 'info';

// Prevent app suspension
const id = powerSaveBlocker.start('prevent-app-suspension');
log.info(`Power save blocker started with id: ${id}`);

// Initialize store
const store: any = new Store();

let mainWindow: BrowserWindow | null = null;
let syncService: SyncService | null = null;

// Set application ID for Windows notifications and other OS integrations
if (process.platform === 'win32') {
  app.setAppUserModelId('top.aengus.filesync');
} else if (process.platform === 'darwin') {
  // macOS specific settings for notifications
  // In development, notifications might not show without a signed app bundle
  // But we can try to set the bundle ID manually if needed, though usually handled by Info.plist
}

function setDevBranding() {
  app.setName('SyncFlow');
  const devIconPath = path.join(__dirname, '../public/app-icon.png');
  if (process.platform === 'darwin' && fs.existsSync(devIconPath)) {
    const img = nativeImage.createFromPath(devIconPath);
    if (!img.isEmpty()) {
      app.dock?.setIcon(img);
    }
  }
}

function createWindow() {
  const windowState = store.get('windowState', {
    width: 1024,
    height: 768
  });

  const devIconPath = path.join(__dirname, '../public/app-icon.png');
  const windowIcon = fs.existsSync(devIconPath) ? devIconPath : undefined;

  mainWindow = new BrowserWindow({
    width: windowState.width,
    height: windowState.height,
    x: windowState.x,
    y: windowState.y,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarStyle: 'hiddenInset', // Mac style
    icon: windowIcon
  });

  // Save window state on close
  mainWindow.on('close', () => {
    if (mainWindow) {
      const bounds = mainWindow.getBounds();
      store.set('windowState', bounds);
    }
  });

  // Development or Production
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  if (!syncService) {
    syncService = new SyncService(mainWindow);
  } else {
    // Update window reference if service already exists
    syncService['mainWindow'] = mainWindow;
  }
}

app.whenReady().then(() => {
  setDevBranding();
  createWindow();
});

app.on('window-all-closed', () => {
  const settings = store.get('settings', {});
  const minimizeToTray = settings.minimizeToTray ?? true;

  if (!minimizeToTray) {
    app.quit();
  } else if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Handlers
ipcMain.handle('select-directory', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('start-sync', async (_event, sourcePath, targetPath, options) => {
  if (syncService) {
    await syncService.startSync(sourcePath, targetPath, options);
    return true;
  }
  return false;
});

ipcMain.handle('stop-sync', async () => {
  if (syncService) {
    await syncService.stopSync();
    return true;
  }
  return false;
});

ipcMain.handle('get-settings', () => {
  return store.get('settings', {});
});

ipcMain.handle('save-settings', (_event, settings) => {
  store.set('settings', settings);
  
  // Update auto launch settings
  if (typeof settings.autoStart === 'boolean') {
    app.setLoginItemSettings({
      openAtLogin: settings.autoStart,
      path: app.getPath('exe')
    });
    log.info(`Auto start set to: ${settings.autoStart}`);
  }
  
  return true;
});

ipcMain.handle('get-last-session', () => {
  const session = store.get('lastSession', {});
  // Inject current sync status and recent logs
  const result = { ...session };
  if (syncService) {
    if (syncService.getIsSyncing()) {
      result.isSyncing = true;
    }
    // Merge recent logs from memory if available
    const recentLogs = syncService.getRecentLogs();
    const clearAt = store.get('clearRecentAt', 0);
    const filtered = Array.isArray(recentLogs)
      ? recentLogs.filter((l: any) => typeof l?.timestamp === 'number' ? l.timestamp >= clearAt : true)
      : [];
    if (filtered.length > 0) {
      result.fileEvents = filtered;
    }
  }
  return result;
});

ipcMain.handle('save-last-session', (_event, session) => {
  store.set('lastSession', session);
  return true;
});

ipcMain.handle('clear-recent-activity', () => {
  if (syncService) {
    syncService.clearRecentLogs();
  }
  // Also clear persisted session events
  const session = store.get('lastSession', {});
  store.set('lastSession', { ...session, fileEvents: [] });
  // Mark clear time to filter in-memory logs on next load
  store.set('clearRecentAt', Date.now());
  return true;
});
