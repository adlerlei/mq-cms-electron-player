const { app, BrowserWindow, session } = require('electron');
const Store = require('electron-store');
const { v4: uuidv4 } = require('uuid');

// --> 強制停用硬體加速 <--
app.disableHardwareAcceleration();

const path = require('path');
const store = new Store.default();

function createWindow() {
  // Generate or retrieve device ID
  let deviceId = store.get('deviceId');
  if (!deviceId) {
    deviceId = uuidv4();
    store.set('deviceId', deviceId);
    console.log('Generated new device ID:', deviceId);
  } else {
    console.log('Using existing device ID:', deviceId);
  }

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    // width: 800,
    // height: 600,
    fullscreen: true, // 新增這一行來啟用全螢幕
    backgroundColor: '#000000',
    webPreferences: {
      // 停用緩存以確保總是載入最新版本
      cache: false,
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // 清除所有緩存（每次啟動時）
  console.log('Clearing all caches...');
  session.defaultSession.clearCache().then(() => {
    console.log('Cache cleared successfully');
  }).catch(err => {
    console.error('Failed to clear cache:', err);
  });

  // 也清除 Storage Data
  session.defaultSession.clearStorageData({
    storages: ['cachestorage', 'serviceworkers']
  }).then(() => {
    console.log('Storage data cleared');
  }).catch(err => {
    console.error('Failed to clear storage:', err);
  });

  // 修正 URL：添加 .html 擴展名
  const displayUrl = `https://mq-cms.adler-lei.workers.dev/display.html?deviceId=${deviceId}`;
  console.log('Loading URL:', displayUrl);
  
  mainWindow.loadURL(displayUrl);

  // 當頁面內容載入完成後，執行 JavaScript 來隱藏滑鼠游標
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page loaded successfully');
    mainWindow.webContents.executeJavaScript('document.body.style.cursor = "none";');
  });

  // 監聽頁面載入錯誤
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load page:', errorCode, errorDescription);
  });

  // Open the DevTools (可選 - 用於調試)
  // mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});