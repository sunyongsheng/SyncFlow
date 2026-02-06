# SyncFlow（FileSynchronizer）

一个跨平台桌面文件同步工具，支持单向/双向同步、过滤忽略、删除策略、系统通知与会话持久化。前端使用 React + TypeScript + Vite，桌面端基于 Electron。

## 目录结构

```
FileSynchronizer/
├─ src/                      # 前端源码（React）
│  ├─ components/            # UI 组件（Radix UI + Tailwind）
│  ├─ pages/                 # 页面（Home/Settings）
│  ├─ store.ts               # 全局状态（Zustand）
│  ├─ i18n.ts                # 国际化配置（en/zh）
│  ├─ App.tsx                # 路由与应用骨架（HashRouter）
│  └─ main.tsx               # 前端入口（浏览器开发注入 Mock Electron API）
├─ electron/                 # Electron 主进程与预加载
│  ├─ main.ts                # 创建窗口、IPC、会话持久化（electron-store）
│  ├─ preload.ts             # 安全桥接暴露 API 到 window.electron
│  └─ syncService.ts         # 同步核心逻辑（chokidar）
├─ public/                   # 静态资源（图标等）
├─ dist/                     # 前端构建产物（vite build）
├─ dist-electron/            # Electron 进程编译输出（tsc）
├─ vite.config.ts            # Vite 配置（路径别名、Electron base）
├─ tsconfig*.json            # TypeScript 项目配置
├─ tailwind.config.js        # Tailwind 配置
├─ postcss.config.js         # PostCSS 配置（Autoprefixer）
├─ eslint.config.js          # ESLint 配置
├─ package.json              # 脚本、依赖与打包元数据
└─ README.md                 # 项目说明
```

## 技术栈

- 前端：React 18、TypeScript、Vite、Tailwind CSS、Radix UI、Framer Motion、React Router、i18next
- 状态管理：Zustand
- 桌面：Electron（主进程/预加载，Context Isolation）
- 文件监听与同步：chokidar
- 工具与质量：ESLint、TypeScript 项目检查、PostCSS（Autoprefixer）

## 核心特性

- 单向/双向同步：实时监听源/目标目录，支持文件与目录的新增、变更、删除同步
- 可配置删除策略：deleteOnSync 控制删除是否传播
- 过滤忽略：默认忽略 .DS_Store，支持自定义 include/exclude
- 回声抑制：避免自身写入触发的重复事件
- 最近活动与统计：事件列表、已同步/失败计数、最后同步时间
- 系统通知：可选显示同步成功/删除等通知，支持多语言
- 会话持久化与设置：electron-store 存储窗口状态、设置、最近会话
- 安全桥接：预加载暴露受控 API 到渲染进程，浏览器开发自动注入 Mock API
- 跨平台：支持 macOS、Windows、Linux

## 快速开始

环境要求：Node.js 18+，npm

```bash
# 安装依赖
npm install

# 开发模式（并行启动 Vite 与 Electron）
npm run dev

# 前端预览（构建后或独立预览）
npm run preview
```

开发流程说明：
- 运行 npm run dev 时，前端在 5173 端口启动；Electron 进程等待端口就绪后以开发模式加载 http://localhost:5173
- 若仅在浏览器中开发前端，预加载 API 不可用时，自动注入 Mock API 保证页面可运行

## 构建与打包

```bash
# 构建（前端 + Electron 进程 TS 编译）
npm run build
```

构建结果：
- 前端产物输出到 dist/
- Electron 主/预加载编译输出到 dist-electron/

应用打包元数据（package.json 的 build 字段）已配置 mac/win/linux 目标与图标等。若需要生成安装包（.dmg/.exe/.AppImage），建议添加 electron-builder 到 devDependencies，并新增打包脚本，例如：

```json
{
  "scripts": {
    "dist": "electron-builder"
  },
  "devDependencies": {
    "electron-builder": "^24.x"
  }
}
```

## 可用脚本

- dev：并行启动前端与 Electron 开发环境
- dev:vite：启动 Vite 开发服务器
- dev:electron：等待 5173 端口后编译 Electron 并以开发模式启动
- build：TypeScript 项目构建 + Vite 前端构建 + Electron TS 编译
- preview：Vite 预览（本地静态服务）
- lint：ESLint 全仓库检查
- check：TypeScript 项目检查（不生成输出）

## 配置与约定

- 路由：HashRouter，页面在 src/pages 下组织
- 别名：@ 指向 src（见 vite.config.ts）
- 主题与样式：Tailwind + Radix UI，支持浅/深色主题
- 国际化：i18next（英文/中文）
- 状态：Zustand 管理同步状态、设置与文件事件
- 代码质量：ESLint（React Hooks/Refresh 插件），TypeScript 严格模式建议开启

## 常见问题

- 开发环境通知不显示：macOS 开发模式下未签名应用可能受系统限制，建议打包后验证
- 预加载 API 未定义：在浏览器直接打开前端时使用 Mock API；Electron 环境由 preload.ts 注入 window.electron
- 删除行为不生效：检查设置 deleteOnSync 是否为 true，或对应目录/文件是否存在

## 许可证

本项目用于学习与演示，若需商业使用或二次分发，请根据实际情况补充许可证说明。
