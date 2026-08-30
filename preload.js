const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getDesktopSources: () => ipcRenderer.invoke('get-desktop-sources'),
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    onUpdateReady: (callback) => ipcRenderer.on('update_ready', () => callback()),
    restartApp: () => ipcRenderer.send('restart_app')
});
