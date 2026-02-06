import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      sidebar: {
        title: "SyncFlow",
        dashboard: "Dashboard",
        settings: "Settings",
        version: "Version {{version}}"
      },
      home: {
        title: "Dashboard",
        subtitle: "Manage your file synchronization tasks",
        startSync: "Start Sync",
        stopSync: "Stop Sync",
        statusOverview: "Status Overview",
        recentActivity: "Recent Activity",
        resetStats: "Reset Stats",
        clearRecentActivity: "Clear Recent Activity",
        syncModeLabel: "Sync Mode",
        syncOneWay: "One-way",
        syncTwoWay: "Two-way"
      },
      directorySelector: {
        sourceLabel: "Source Directory",
        targetLabel: "Target Directory",
        selectSource: "Select source folder...",
        selectTarget: "Select target folder...",
        dir1Label: "Directory 1",
        dir2Label: "Directory 2",
        selectDir1: "Select directory 1...",
        selectDir2: "Select directory 2..."
      },
      syncStatus: {
        idle: "Idle",
        syncing: "Syncing Active",
        error: "Error",
        syncedFiles: "Synced Files",
        failures: "Failures"
      },
      fileChangeList: {
        created: "Created",
        modified: "Modified",
        deleted: "Deleted",
        dirCreated: "Dir Created",
        dirDeleted: "Dir Deleted",
        skipped: "Skipped",
        type: "Type",
        direction: "Direction",
        path: "Path",
        time: "Time",
        noChanges: "No changes detected yet"
      },
      settings: {
        title: "Settings",
        subtitle: "Configure application preferences",
        save: "Save Changes",
        saved: "Settings saved!",
        general: "General",
        autoStart: "Auto Start",
        autoStartDesc: "Launch application on system startup",
        minimizeToTray: "Minimize to Tray",
        minimizeToTrayDesc: "Keep application running in background when closed",
        showNotifications: "Show Notifications",
        showNotificationsDesc: "Get notified when files are synced",
        language: "Language",
        languageDesc: "Select application language",
        syncRules: "Sync Rules",
        deleteOnSync: "Delete on Sync",
        deleteOnSyncDesc: "Remove files in target when deleted from source",
        enabled: "Enabled",
        disabled: "Disabled",
        excludeFiles: "Exclude Files (Extensions)",
        excludeFilesDesc: "Comma separated list (e.g. .tmp, .log, .DS_Store)"
      }
    }
  },
  zh: {
    translation: {
      sidebar: {
        title: "同步流",
        dashboard: "仪表盘",
        settings: "设置",
        version: "版本 {{version}}"
      },
      home: {
        title: "仪表盘",
        subtitle: "管理您的文件同步任务",
        startSync: "开始同步",
        stopSync: "停止同步",
        statusOverview: "状态概览",
        recentActivity: "最近活动",
        resetStats: "重置统计",
        clearRecentActivity: "清理最近活动",
        syncModeLabel: "同步模式",
        syncOneWay: "单向同步",
        syncTwoWay: "双向同步"
      },
      directorySelector: {
        sourceLabel: "源目录",
        targetLabel: "目标目录",
        selectSource: "选择源文件夹...",
        selectTarget: "选择目标文件夹...",
        dir1Label: "目录 1",
        dir2Label: "目录 2",
        selectDir1: "选择目录 1...",
        selectDir2: "选择目录 2..."
      },
      syncStatus: {
        idle: "空闲",
        syncing: "同步中",
        error: "错误",
        syncedFiles: "已同步文件",
        failures: "失败"
      },
      fileChangeList: {
        created: "新建",
        modified: "修改",
        deleted: "删除",
        dirCreated: "新建目录",
        dirDeleted: "删除目录",
        skipped: "跳过",
        type: "类型",
        direction: "方向",
        path: "路径",
        time: "时间",
        noChanges: "暂无检测到变更"
      },
      settings: {
        title: "设置",
        subtitle: "配置应用偏好",
        save: "保存更改",
        saved: "设置已保存！",
        general: "常规",
        autoStart: "开机自启",
        autoStartDesc: "系统启动时自动运行应用",
        minimizeToTray: "最小化到托盘",
        minimizeToTrayDesc: "关闭窗口时保持后台运行",
        showNotifications: "显示通知",
        showNotificationsDesc: "文件同步时发送通知",
        language: "语言",
        languageDesc: "选择应用语言",
        syncRules: "同步规则",
        deleteOnSync: "同步删除",
        deleteOnSyncDesc: "当源文件删除时，删除目标文件",
        enabled: "启用",
        disabled: "禁用",
        excludeFiles: "排除文件 (扩展名)",
        excludeFilesDesc: "逗号分隔列表 (例如 .tmp, .log, .DS_Store)"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
