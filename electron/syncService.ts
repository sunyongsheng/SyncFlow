import { FSWatcher } from 'chokidar';
import chokidar from 'chokidar';
import fs from 'fs';
import path from 'path';
import { BrowserWindow, Notification } from 'electron';
import log from 'electron-log';
import { SyncOptions, FileLogEntry, SyncStatus } from './types';

export class SyncService {
  private watcher: FSWatcher | null = null; // one-way watcher
  private watcherSource: FSWatcher | null = null; // two-way mode: watcher for sourcePath
  private watcherTarget: FSWatcher | null = null; // two-way mode: watcher for targetPath
  private sourcePath: string = '';
  private targetPath: string = '';
  private options: SyncOptions = {};
  public mainWindow: BrowserWindow;
  private isSyncing: boolean = false;
  private suppressSet: Set<string> = new Set(); // suppress events caused by our own writes

  private recentLogs: FileLogEntry[] = [];
  private stats: { syncedFiles: number; failedFiles: number } = { syncedFiles: 0, failedFiles: 0 };

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  public getRecentLogs() {
    return this.recentLogs;
  }

  public clearRecentLogs() {
    this.recentLogs = [];
  }

  private addLog(log: FileLogEntry) {
    this.recentLogs.unshift(log);
    if (this.recentLogs.length > 100) {
      this.recentLogs.pop();
    }
  }

  private shouldIgnore(filePath: string): boolean {
    const baseExclude = ['.DS_Store'];
    const excludeList = Array.from(new Set([...(this.options.exclude || []), ...baseExclude]));
    const fileName = path.basename(filePath);
    const lowerName = fileName.toLowerCase();

    const isIgnored = excludeList.some((pattern: string) => {
      const cleanPattern = pattern.trim().toLowerCase();
      if (!cleanPattern) return false;

      if (lowerName.endsWith(cleanPattern)) {
        return true;
      }

      if (lowerName === cleanPattern) {
        return true;
      }

      return false;
    });

    if (isIgnored) {
      log.info(`[Watcher] Ignoring file: ${filePath}`);
    }
    return isIgnored;
  }

  async startSync(sourcePath: string, targetPath: string, options: SyncOptions) {
    if (this.watcher) {
      await this.stopSync();
    }
    if (this.watcherSource || this.watcherTarget) {
      await this.stopSync();
    }

    this.sourcePath = sourcePath;
    this.targetPath = targetPath;
    this.options = options || {};
    
    log.info('Starting sync with options:', JSON.stringify(this.options));
    log.info(`Delete on Sync: ${this.options.deleteOnSync}`);

    this.isSyncing = true;
    
    // Reset stats on start
    this.stats = { syncedFiles: 0, failedFiles: 0 };
    this.suppressSet.clear();

    // Send initial status
    this.sendStatus({ isWatching: true, isSyncing: true, totalFiles: 0, syncedFiles: 0, failedFiles: 0 });

    const commonWatcherOptions = {
      ignored: (filePath: string) => this.shouldIgnore(filePath),
      persistent: true,
      ignoreInitial: true,
      followSymlinks: false,
      depth: 99
    };

    if (this.options.syncMode === 'twoWay') {
      this.watcherSource = chokidar.watch(sourcePath, commonWatcherOptions);
      this.watcherTarget = chokidar.watch(targetPath, commonWatcherOptions);

      this.watcherSource
        .on('add', (filePath: string) => this.handleFileChangeTwoWay('source', 'add', filePath))
        .on('change', (filePath: string) => this.handleFileChangeTwoWay('source', 'change', filePath))
        .on('unlink', (filePath: string) => this.handleFileChangeTwoWay('source', 'unlink', filePath))
        .on('addDir', (filePath: string) => this.handleFileChangeTwoWay('source', 'addDir', filePath))
        .on('unlinkDir', (filePath: string) => this.handleFileChangeTwoWay('source', 'unlinkDir', filePath))
        .on('error', (error: unknown) => this.handleError(error));

      this.watcherTarget
        .on('add', (filePath: string) => this.handleFileChangeTwoWay('target', 'add', filePath))
        .on('change', (filePath: string) => this.handleFileChangeTwoWay('target', 'change', filePath))
        .on('unlink', (filePath: string) => this.handleFileChangeTwoWay('target', 'unlink', filePath))
        .on('addDir', (filePath: string) => this.handleFileChangeTwoWay('target', 'addDir', filePath))
        .on('unlinkDir', (filePath: string) => this.handleFileChangeTwoWay('target', 'unlinkDir', filePath))
        .on('error', (error: unknown) => this.handleError(error));

      log.info(`Started two-way watching ${sourcePath} <-> ${targetPath}`);
    } else {
      this.watcher = chokidar.watch(sourcePath, commonWatcherOptions);
      this.watcher
        .on('add', (filePath: string) => this.handleFileChange('add', filePath))
        .on('change', (filePath: string) => this.handleFileChange('change', filePath))
        .on('unlink', (filePath: string) => this.handleFileChange('unlink', filePath))
        .on('addDir', (filePath: string) => this.handleFileChange('addDir', filePath))
        .on('unlinkDir', (filePath: string) => this.handleFileChange('unlinkDir', filePath))
        .on('error', (error: unknown) => this.handleError(error));
      log.info(`Started watching ${sourcePath}`);
    }
  }

  public getIsSyncing(): boolean {
    return this.isSyncing;
  }

  async stopSync() {
    try {
      if (this.watcher) {
        await this.watcher.close();
        this.watcher = null;
      }
      if (this.watcherSource) {
        await this.watcherSource.close();
        this.watcherSource = null;
      }
      if (this.watcherTarget) {
        await this.watcherTarget.close();
        this.watcherTarget = null;
      }
    } finally {
      this.isSyncing = false;
      this.sendStatus({ isWatching: false, isSyncing: false });
      console.log('Stopped watching');
    }
  }

  private async handleFileChange(type: string, filePath: string) {
    if (!this.isSyncing) return;

    // Check if file should be ignored (Force recompile)
    if (this.shouldIgnore(filePath)) {
      const relativePath = path.relative(this.sourcePath, filePath);
      const logEntry = this.createLogEntry('skipped', relativePath, 'source', type);
      this.addLog(logEntry);
      this.notifyFileChange(logEntry);
      return;
    }

    log.info(`File change detected: ${type} ${filePath}`);

    const relativePath = path.relative(this.sourcePath, filePath);
    const targetFile = path.join(this.targetPath, relativePath);

    try {
      if (type === 'add' || type === 'change') {
        const logEntry = this.createLogEntry(type, relativePath, 'source');
        this.addLog(logEntry);
        this.notifyFileChange(logEntry);
        // Ensure target directory exists
        const targetDir = path.dirname(targetFile);
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }
        
        // Add suppress entry for destination to avoid echo
        this.suppressSet.add(targetFile);
        fs.copyFileSync(filePath, targetFile);
        log.info(`Synced: ${filePath} -> ${targetFile}`);
        this.notifySyncSuccess(relativePath, 'copy');
      } else if (type === 'unlink') {
        // Check deleteOnSync option (default to true if undefined)
        const deleteOnSync = this.options.deleteOnSync !== false;
        
        if (!deleteOnSync) {
          const skipped = this.createLogEntry('skipped', relativePath, 'source', 'unlink');
          this.addLog(skipped);
          this.notifyFileChange(skipped);
          log.info(`Skipped deletion (deleteOnSync disabled): ${targetFile}`);
          return;
        }
        
        const delLog = this.createLogEntry('unlink', relativePath, 'source');
        this.addLog(delLog);
        this.notifyFileChange(delLog);
        
        if (deleteOnSync && fs.existsSync(targetFile)) {
          this.suppressSet.add(targetFile);
          fs.unlinkSync(targetFile);
          log.info(`Deleted: ${targetFile}`);
          this.notifySyncSuccess(relativePath, 'delete');
        }
      } else if (type === 'addDir') {
        const logEntry = this.createLogEntry(type, relativePath, 'source');
        this.addLog(logEntry);
        this.notifyFileChange(logEntry);
        if (!fs.existsSync(targetFile)) {
          fs.mkdirSync(targetFile, { recursive: true });
        }
      } else if (type === 'unlinkDir') {
        // Check deleteOnSync option for directories too
        const deleteOnSync = this.options.deleteOnSync !== false;

        if (!deleteOnSync) {
          const skipped = this.createLogEntry('skipped', relativePath, 'source', 'unlinkDir');
          this.addLog(skipped);
          this.notifyFileChange(skipped);
          return;
        }
        
        const delLog = this.createLogEntry('unlinkDir', relativePath, 'source');
        this.addLog(delLog);
        this.notifyFileChange(delLog);
        
        if (deleteOnSync && fs.existsSync(targetFile)) {
          // Suppress all files under this directory on destination side
          this.suppressSet.add(targetFile);
          fs.rmSync(targetFile, { recursive: true, force: true });
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log.error(`Error syncing ${filePath}:`, error);
      this.notifySyncError(relativePath, errorMessage);
    }
  }

  private async handleFileChangeTwoWay(origin: 'source' | 'target', type: string, filePath: string) {
    if (!this.isSyncing) return;

    // Suppress if this path is flagged (echo from our own write)
    if (this.suppressSet.has(filePath)) {
      this.suppressSet.delete(filePath);
      return;
    }

    // Ignore filters
    if (this.shouldIgnore(filePath)) {
      const baseRoot = origin === 'source' ? this.sourcePath : this.targetPath;
      const relativePath = path.relative(baseRoot, filePath);
      const logEntry = this.createLogEntry('skipped', relativePath, origin, type);
      this.addLog(logEntry);
      this.notifyFileChange(logEntry);
      return;
    }

    const fromRoot = origin === 'source' ? this.sourcePath : this.targetPath;
    const toRoot = origin === 'source' ? this.targetPath : this.sourcePath;

    const relativePath = path.relative(fromRoot, filePath);
    const destFile = path.join(toRoot, relativePath);

    try {
      if (type === 'add' || type === 'change') {
        const logEntry = this.createLogEntry(type, relativePath, origin);
        this.addLog(logEntry);
        this.notifyFileChange(logEntry);
        const destDir = path.dirname(destFile);
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }
        this.suppressSet.add(destFile);
        fs.copyFileSync(filePath, destFile);
        log.info(`Two-way synced: ${filePath} -> ${destFile}`);
        this.notifySyncSuccess(relativePath, 'copy');
      } else if (type === 'unlink') {
        const deleteOnSync = this.options.deleteOnSync !== false;
        if (!deleteOnSync) {
          const skipped = this.createLogEntry('skipped', relativePath, origin, 'unlink');
          this.addLog(skipped);
          this.notifyFileChange(skipped);
        } else if (deleteOnSync && fs.existsSync(destFile)) {
          const delLog = this.createLogEntry('unlink', relativePath, origin);
          this.addLog(delLog);
          this.notifyFileChange(delLog);
          this.suppressSet.add(destFile);
          fs.unlinkSync(destFile);
          log.info(`Two-way deleted: ${destFile}`);
          this.notifySyncSuccess(relativePath, 'delete');
        }
      } else if (type === 'addDir') {
        const logEntry = this.createLogEntry(type, relativePath, origin);
        this.addLog(logEntry);
        this.notifyFileChange(logEntry);
        if (!fs.existsSync(destFile)) {
          fs.mkdirSync(destFile, { recursive: true });
        }
      } else if (type === 'unlinkDir') {
        const deleteOnSync = this.options.deleteOnSync !== false;
        if (!deleteOnSync) {
          const skipped = this.createLogEntry('skipped', relativePath, origin, 'unlinkDir');
          this.addLog(skipped);
          this.notifyFileChange(skipped);
        } else if (deleteOnSync && fs.existsSync(destFile)) {
          const delLog = this.createLogEntry('unlinkDir', relativePath, origin);
          this.addLog(delLog);
          this.notifyFileChange(delLog);
          this.suppressSet.add(destFile);
          fs.rmSync(destFile, { recursive: true, force: true });
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log.error(`Error two-way syncing ${filePath}:`, error);
      this.notifySyncError(relativePath, errorMessage);
    }
  }

  private createLogEntry(
    type: string,
    relativePath: string,
    origin: 'source' | 'target',
    operation?: string
  ): FileLogEntry {
    return {
      type: type as FileLogEntry['type'],
      path: relativePath,
      timestamp: Date.now(),
      origin,
      fromDir: origin === 'source' ? this.sourcePath : this.targetPath,
      toDir: origin === 'source' ? this.targetPath : this.sourcePath,
      labelStyle: this.options.syncMode === 'twoWay' ? 'twoWay' : 'oneWay',
      operation: operation || type
    };
  }

  private handleError(error: unknown) {
    log.error('Watcher error:', error);
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.mainWindow.webContents.send('sync-status', { error: errorMessage });
    }
  }

  private sendStatus(status: SyncStatus) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('sync-status', status);
    }
  }

  private notifyFileChange(logEntry: FileLogEntry) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('file-change', logEntry);
    }
  }

  private notifySyncSuccess(filePath: string, operation: string) {
    // We could send a more detailed update here
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      // Calculate sync stats
      // Since we don't track state persistently in SyncService yet, we just increment counter
      // But we can't easily increment a stateless counter.
      // However, frontend is listening to 'sync-status' and merges it.
      // So if we send { syncedFiles: 1 } (increment) vs { syncedFiles: N } (absolute), it matters.
      
      // Frontend updateStatus implementation:
      // updateStatus: (newStatus) => set((state) => ({ status: { ...state.status, ...newStatus } }))
      // This is a merge, not an increment.
      
      // So we need to either:
      // 1. Keep track of stats in SyncService (better)
      // 2. Send an event that frontend interprets as increment
      
      // Let's implement option 1 briefly
      if (!this.stats) {
        this.stats = { syncedFiles: 0, failedFiles: 0 };
      }
      this.stats.syncedFiles++;

      this.mainWindow.webContents.send('sync-status', {
        lastSyncTime: Date.now(),
        syncedFiles: this.stats.syncedFiles
      });
    }

    // Check settings and show notification
    if (this.options.showNotifications) {
      // Use options.language to determine notification content, default to 'en'
      const lang = this.options.language || 'en';
      const isZh = lang === 'zh';
      
      const title = isZh ? '文件已同步' : 'File Synced';
      const operationText = operation === 'copy' 
        ? (isZh ? '已同步' : 'Synced') 
        : (isZh ? '已删除' : 'Deleted');
      
      const isWinOrLinux = process.platform === 'win32' || process.platform === 'linux';
      let iconPath: string | undefined;
      if (isWinOrLinux) {
        const devIcon = path.join(__dirname, '../public/app-icon.png');
        if (fs.existsSync(devIcon)) {
          iconPath = devIcon;
        }
      }
      const opts: Electron.NotificationConstructorOptions = {
        title: title,
        body: `${operationText}: ${filePath}`,
        silent: true
      };
      if (iconPath) {
        opts.icon = iconPath;
      }
      const notification = new Notification(opts);
      notification.show();
    }
  }

  private notifySyncError(filePath: string, error: string) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.stats.failedFiles++;
      this.mainWindow.webContents.send('sync-status', {
        error: `Failed to sync ${filePath}: ${error}`,
        failedFiles: this.stats.failedFiles
      });
    }
  }
}
