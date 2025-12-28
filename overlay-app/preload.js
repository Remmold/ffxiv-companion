/**
 * Preload script for Electron overlay
 * Exposes safe APIs to the renderer process
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to the renderer
contextBridge.exposeInMainWorld('electronAPI', {
    platform: process.platform,
    closeWindow: () => ipcRenderer.send('close-window')
});
