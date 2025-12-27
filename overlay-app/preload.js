/**
 * Preload script for Electron overlay
 * Exposes safe APIs to the renderer process
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to the renderer
contextBridge.exposeInMainWorld('electronAPI', {
    // Add any IPC methods here if needed later
    platform: process.platform
});
