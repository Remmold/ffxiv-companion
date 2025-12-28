/**
 * FFXIV Companion Overlay - Electron Main Process
 * 
 * Creates an always-on-top window that displays the overlay page
 * from the running web app or a built version.
 */

const { app, BrowserWindow, Tray, Menu, globalShortcut, nativeImage, screen, ipcMain } = require('electron');
const path = require('path');

// Configuration
const DEV_URL = 'http://localhost:5173/overlay';
const PROD_URL = 'http://135.236.154.112:3000/overlay';

let mainWindow = null;
let tray = null;
let isVisible = true;

// Check if running in dev mode
const isDev = process.argv.includes('--dev');

function createWindow() {
    // Get primary display dimensions for positioning
    const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

    // Window dimensions - compact overlay size
    const windowWidth = 300;
    const windowHeight = 339;

    mainWindow = new BrowserWindow({
        width: windowWidth,
        height: windowHeight,
        x: screenWidth - windowWidth - 20, // Position in bottom-right
        y: screenHeight - windowHeight - 20,
        alwaysOnTop: true,
        frame: false, // Frameless window
        transparent: true, // Allows for rounded corners/transparency in the web content
        resizable: true,
        skipTaskbar: false, // Show in taskbar
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    // Load the overlay page
    const url = isDev ? DEV_URL : PROD_URL;
    mainWindow.loadURL(url);

    // Handle window closed
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Prevent refresh from losing always-on-top
    mainWindow.on('blur', () => {
        if (mainWindow) {
            mainWindow.setAlwaysOnTop(true, 'screen-saver');
        }
    });
}

function createTray() {
    // Create a simple tray icon (you can replace with a custom icon)
    const iconPath = path.join(__dirname, 'icon.ico');
    let trayIcon;

    try {
        trayIcon = nativeImage.createFromPath(iconPath);
    } catch {
        // Fallback: create a simple colored icon if no icon file exists
        trayIcon = nativeImage.createEmpty();
    }

    tray = new Tray(trayIcon.isEmpty() ? nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAADlSURBVDiNpZMxDoJAEEXfLBQmFDbewMbGwsLCgspb2FhYWngLG68gR6AgFBY0JEQKGgsLYmFiQiyIhYR1C1azEJZ18yeb/TP/z8wOAP8G4TjOqt/vf0gpb9M0nQMAIcQ5SZKt67rPssdbxfVQShUAoJTqMsZeMv4FLQSAZVmrIAgupJSCMXajtT7OAoxGo8E8SZJtmqZzKeVNKeVmNBo9ygI8z7sBAKXUnZTy0m637+Vy+VKr1e75fH53rG1dF4nj+KWU6qZp+rrb7V5d151XKpVLuVw+FYvFZeZXBQCMMft+l/+EL1VDUhCHf9/0AAAAAElFTkSuQmCC') : trayIcon);

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show/Hide (Ctrl+Shift+G)',
            click: toggleVisibility
        },
        {
            label: 'Reset Position',
            click: resetPosition
        },
        { type: 'separator' },
        {
            label: 'Always on Top',
            type: 'checkbox',
            checked: true,
            click: (menuItem) => {
                if (mainWindow) {
                    mainWindow.setAlwaysOnTop(menuItem.checked, 'screen-saver');
                }
            }
        },
        { type: 'separator' },
        {
            label: 'Quit',
            click: () => {
                app.quit();
            }
        }
    ]);

    tray.setToolTip('FFXIV Companion Overlay');
    tray.setContextMenu(contextMenu);

    tray.on('click', toggleVisibility);
}

function toggleVisibility() {
    if (!mainWindow) return;

    if (isVisible) {
        mainWindow.hide();
    } else {
        mainWindow.show();
        mainWindow.setAlwaysOnTop(true, 'screen-saver');
    }
    isVisible = !isVisible;
}

function resetPosition() {
    if (!mainWindow) return;

    const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
    const [windowWidth, windowHeight] = mainWindow.getSize();

    mainWindow.setPosition(
        screenWidth - windowWidth - 20,
        screenHeight - windowHeight - 20
    );
}

function registerShortcuts() {
    // Global shortcut to toggle overlay visibility
    globalShortcut.register('CommandOrControl+Shift+G', toggleVisibility);
}

// App lifecycle
app.whenReady().then(() => {
    createWindow();
    createTray();
    registerShortcuts();

    // Handle close-window IPC from renderer
    ipcMain.on('close-window', () => {
        app.quit();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        if (mainWindow) {
            if (!isVisible) {
                mainWindow.show();
                isVisible = true;
            }
            mainWindow.focus();
        }
    });
}
