const { app, BrowserWindow, Tray, Menu, ipcMain, Notification, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let tray;
let isQuitting = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 300,
    height: 200,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    icon: path.join(__dirname, '../assets/icon.png'),
    skipTaskbar: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.on('minimize', (event) => {
    event.preventDefault();
    mainWindow.hide();
  });

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

}

ipcMain.on('start-drag', () => {
  mainWindow?.webContents.send('on-drag-start');
});

function createTray() {
  try {
    const trayIconPath = path.resolve(__dirname, '../assets/icon-tray.png');
   // console.log("Tray icon path:", trayIconPath);
    
    if (!fs.existsSync(trayIconPath)) {
      throw new Error('Tray icon file does not exist');
    }

    const image = nativeImage.createFromPath(trayIconPath);
    if (image.isEmpty()) {
      throw new Error('Tray icon image is empty');
    }

    tray = new Tray(image);

    if (process.platform === 'darwin') {
      const pressedImage = nativeImage.createFromPath(trayIconPath);
      tray.setPressedImage(pressedImage);
    }

  } catch (error) {
    console.error('Tray icon error:', error.message);

    const fallbackIcon = nativeImage.createFromBitmap(
      Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABZSURBVDhPY2RgYPjPQApgYGBgYqAEMDEx/QdR/////w9XgA5Q5YH4P5ECgJiRFAF0cQYGBgZGYgSAgImUQCAqGoD4P1FhQKwAEH8kKgyIFQDiT0SFAYkCQIwAAGjzIox0VY1uAAAAAElFTkSuQmCC',
        'base64'
      ),
      { width: 16, height: 16 }
    );

    tray = new Tray(fallbackIcon);
  }

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: () => {
        mainWindow?.show();
        mainWindow?.restore();
        mainWindow?.focus();
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip('20-20-20 Eye Strain Timer');
  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    mainWindow?.show();
    mainWindow?.restore();
    mainWindow?.focus();
  });
}

// IPC handlers
ipcMain.on('minimize-window', () => mainWindow?.minimize());
ipcMain.on('close-window', () => mainWindow?.hide());
ipcMain.on('restore-window', () => {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.restore();
    mainWindow.focus();

    if (process.platform === 'win32') {
      mainWindow.flashFrame(true);
      setTimeout(() => mainWindow.flashFrame(false), 3000);
    }
  }
});
ipcMain.on('show-notification', (_, title, body) => {
  if (Notification.isSupported()) {
    const notification = new Notification({
      title,
      body,
      icon: path.join(__dirname, '../assets/icon.png'),
      sound: 'default'
    });

    notification.show();

    notification.on('click', () => {
      mainWindow?.show();
      mainWindow?.restore();
      mainWindow?.focus();
    });
  } else {
    console.warn('Notifications not supported');
    mainWindow?.show();
    mainWindow?.restore();
    mainWindow?.focus();
  }
});

app.whenReady().then(() => {
  createWindow();
  createTray();

  if (process.platform === 'darwin') {
    app.dock.hide();
    Notification.requestPermission?.().then((permission) => {
      if (permission !== 'granted') {
        console.warn('Notification permission not granted');
      }
    });
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  // Keep running in tray
});

app.on('before-quit', () => {
  isQuitting = true;
});

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
}
