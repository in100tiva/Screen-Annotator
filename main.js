const { app, BrowserWindow, globalShortcut, ipcMain, screen, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;
let tray = null;
let isDrawingMode = true;
let userShortcuts = {};

// Caminho para salvar configuracoes
const configPath = path.join(app.getPath('userData'), 'shortcuts.json');

// Carregar atalhos salvos
function loadShortcuts() {
    try {
        if (fs.existsSync(configPath)) {
            const data = fs.readFileSync(configPath, 'utf8');
            userShortcuts = JSON.parse(data);
        }
    } catch (e) {
        console.error('Erro ao carregar atalhos:', e);
        userShortcuts = {};
    }
}

// Salvar atalhos
function saveShortcuts(shortcuts) {
    try {
        fs.writeFileSync(configPath, JSON.stringify(shortcuts, null, 2));
        userShortcuts = shortcuts;
    } catch (e) {
        console.error('Erro ao salvar atalhos:', e);
    }
}

// Converter atalho para formato do Electron
function shortcutToAccelerator(shortcut) {
    if (!shortcut || !shortcut.key) return null;

    const parts = [];
    if (shortcut.ctrl) parts.push('CommandOrControl');
    if (shortcut.shift) parts.push('Shift');
    if (shortcut.alt) parts.push('Alt');

    // Mapear teclas especiais
    const keyMap = {
        'arrowup': 'Up',
        'arrowdown': 'Down',
        'arrowleft': 'Left',
        'arrowright': 'Right',
        'escape': 'Escape',
        'enter': 'Enter',
        'tab': 'Tab',
        'backspace': 'Backspace',
        'delete': 'Delete',
        'insert': 'Insert',
        'home': 'Home',
        'end': 'End',
        'pageup': 'PageUp',
        'pagedown': 'PageDown',
        ' ': 'Space'
    };

    const key = keyMap[shortcut.key.toLowerCase()] || shortcut.key.toUpperCase();
    parts.push(key);

    return parts.join('+');
}

function createWindow() {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;

    mainWindow = new BrowserWindow({
        width: width,
        height: height,
        x: 0,
        y: 0,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
        skipTaskbar: false,
        resizable: false,
        fullscreen: false,
        hasShadow: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.setIgnoreMouseEvents(false);
    mainWindow.loadFile('index.html');

    mainWindow.on('close', (event) => {
        if (!app.isQuitting) {
            event.preventDefault();
            mainWindow.hide();
        }
    });

    createTray();
    registerGlobalShortcuts();
}

function createTray() {
    const icon = nativeImage.createFromDataURL(`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAA7AAAAOwBeShxvQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAKkSURBVFiF7ZdLiFVRGMd/35kxHZsyK6eHDyhrISHRpk1QJBRJi8hFUNQiooVB7aJNq2oZtYkgqE0PchFBD6hFhEW0CNq0qJQeZpY5znhnzjm3xZk7c++ce+/MnYlW/eHAcL7v/L//d757LvwP/6nwT0O+BPXJ4K5JY7Fpl6j+o+nfAvwM7Ik0bk+L2QD8CDBExL0MPQc4ImL2VLZBMa8MXQX8ArwDHAfm5NLnkf+zWkj1x+AwcBDYDUhD8yJwDLgFeD0zfy9wLK3fDPQBl4BXRV1gMvAIcDlwGMCyNH4E+ABYYyZwCNgNrAF+z8w/BzwLPAm0lGhYAjyE8iLwdlr/CjAy2P8icANwO/BbZn5fxBGRC4CNwD0ot6bmfwVoA74FfjKzrAXWRuKtNO1y0vdK1F6hupuazEtl5l8A/gKcS4CXXBX1M/NfAi4DThvWJifwfmBjTvVfA78D7xJwLXB/TnYJMBnlS5Q3IuASlMdJHkR5L0LZBZyN8h6wA/gLZTtwTZayR2A8eFXm/5fABeCfTNoI4AjKN8DRKM+RvBixH5gAnA/sAHpQ9qOcA1yG8g7wdUR8lxh7IHZFyqeA80hOg3XA6cC3hFyYU+0VqifxXj5B+T1KN8oY4FhgM3AVcCXKN8DTwCkZ1RYBpxPwAMpU4CRgOXA88CtwdAR8AngTuBS4AeVZlBuBq4DLUb4l4H6Up0jORY0D1gBHAz+T/PdEYBJwNuH/t8Ai4EiSnxUnAecAe1B+R+pB+BOYR8APwBfALuD6dPtYB/QAl6LsJnkHVPcAJ6PsQ3kR+DGj2lyS/y1JAT4GRqfGfxN8gPJsRtYLnAH8RHIqbkK5DuXrjOrDKJMjdD/KvSgLgSU53T4AzgL+BC4EFuRk/2sI/u3yVvvtmLsAAAAASUVORK5CYII=`);

    tray = new Tray(icon);

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Mostrar/Ocultar',
            click: () => {
                if (mainWindow.isVisible()) {
                    mainWindow.hide();
                } else {
                    mainWindow.show();
                }
            }
        },
        {
            label: 'Modo Desenho',
            type: 'checkbox',
            checked: isDrawingMode,
            click: (menuItem) => {
                toggleDrawingMode();
                menuItem.checked = isDrawingMode;
            }
        },
        {
            label: 'Limpar Tela',
            click: () => {
                mainWindow.webContents.send('clear-canvas');
            }
        },
        { type: 'separator' },
        {
            label: 'Configurar Atalhos',
            click: () => {
                mainWindow.show();
                mainWindow.webContents.send('open-settings');
            }
        },
        { type: 'separator' },
        {
            label: 'Sair',
            click: () => {
                app.isQuitting = true;
                app.quit();
            }
        }
    ]);

    tray.setToolTip('Screen Annotator');
    tray.setContextMenu(contextMenu);

    tray.on('double-click', () => {
        if (mainWindow.isVisible()) {
            mainWindow.hide();
        } else {
            mainWindow.show();
        }
    });
}

// Registrar apenas atalhos globais essenciais
// Os outros atalhos sao gerenciados no renderer.js
function registerGlobalShortcuts() {
    // Toggle modo desenho - atalho global
    globalShortcut.register('CommandOrControl+Shift+D', () => {
        toggleDrawingMode();
    });

    // Mostrar/ocultar janela - atalho global essencial
    globalShortcut.register('CommandOrControl+Shift+A', () => {
        if (mainWindow.isVisible()) {
            mainWindow.hide();
        } else {
            mainWindow.show();
        }
    });
}

function toggleDrawingMode() {
    isDrawingMode = !isDrawingMode;
    mainWindow.setIgnoreMouseEvents(!isDrawingMode, { forward: true });
    mainWindow.webContents.send('drawing-mode-changed', isDrawingMode);
}

// IPC handlers
ipcMain.on('set-ignore-mouse', (event, ignore) => {
    mainWindow.setIgnoreMouseEvents(ignore, { forward: true });
});

ipcMain.on('minimize-to-tray', () => {
    mainWindow.hide();
});

ipcMain.on('toggle-drawing-mode', () => {
    toggleDrawingMode();
});

ipcMain.on('update-shortcuts', (event, shortcuts) => {
    saveShortcuts(shortcuts);
});

app.whenReady().then(() => {
    loadShortcuts();
    createWindow();
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
