/**
 * Preload script for Electron overlay
 * Exposes safe APIs to the renderer process
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to the renderer
contextBridge.exposeInMainWorld('electronAPI', {
    platform: process.platform,
    closeWindow: () => ipcRenderer.send('close-window'),
    // Price preference API
    getPricePreference: () => ipcRenderer.invoke('get-price-preference'),
    onPricePreferenceChanged: (callback) => {
        ipcRenderer.on('price-preference-changed', (event, value) => callback(value));
    }
});
