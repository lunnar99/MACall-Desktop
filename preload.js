const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getDesktopSources: () => ipcRenderer.invoke('get-desktop-sources'),
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    onUpdateReady: (callback) => ipcRenderer.on('update_ready', () => callback()),
    onUpdaterProgress: (callback) => ipcRenderer.on('updater_progress', (_event, percent) => callback(percent)),
    restartApp: () => ipcRenderer.send('restart_app'),
    setGlobalMuteShortcut: (shortcut) => ipcRenderer.send('set_global_mute_shortcut', shortcut),
    onToggleMuteGlobal: (callback) => ipcRenderer.on('toggle_mute_global', () => callback())
});
