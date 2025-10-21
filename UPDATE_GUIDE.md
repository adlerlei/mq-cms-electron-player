# 🔄 樹莓派播放器更新指南

## 最新版本: v1.4.1 (2025-10-21)

### 主要更新
- 🐛 修復：移除不存在的 preload.js 引用
- ✨ 支援：新增 driving_school 模板
- 🔧 優化：改善 webPreferences 配置

---

## 問題
樹莓派播放器使用舊版本緩存，無法顯示群組輪播圖片或新版面模板。

## 解決方案

### 方法 1: 使用 SSH 遠程更新（推薦）⭐

在你的電腦上執行（不是樹莓派）：

```bash
# 1. 複製更新後的 main.js 到樹莓派
scp ~/Documents/mq-cms-cloudflare/mq-cms-electron-player/main.js mq@pi:~/mq-cms-electron-player/

# 2. SSH 連接到樹莓派
ssh mq@pi

# 3. 停止播放器（如果正在運行）
pkill electron || pkill node

# 4. 清除所有緩存
rm -rf ~/.cache/electron*
rm -rf ~/.config/Electron
rm -rf ~/.config/mq-cms-player

# 5. 重啟播放器
cd ~/mq-cms-electron-player
./kiosk.sh
```

### 方法 2: 在樹莓派上直接操作

在樹莓派上：

```bash
# 1. 停止播放器
# 按 Ctrl+C 或
pkill electron

# 2. 備份舊的 main.js
cd ~/mq-cms-electron-player
cp main.js main.js.backup

# 3. 下載新的 main.js（使用 nano 或 vim 編輯）
nano main.js
# 然後複製新的內容進去

# 4. 清除緩存
rm -rf ~/.cache/electron*
rm -rf ~/.config/Electron
rm -rf ~/.config/mq-cms-player

# 5. 重啟播放器
./kiosk.sh
```

### 方法 3: 使用 Git 更新（如果使用 Git）

```bash
# 在樹莓派上
cd ~/mq-cms-electron-player
git pull origin main
rm -rf ~/.cache/electron*
./kiosk.sh
```

---

## 🔍 驗證更新是否成功

重啟播放器後，應該在終端看到：

```
Using existing device ID: xxx-xxx-xxx
Clearing all caches...
Cache cleared successfully
Storage data cleared
Loading URL: https://mq-cms.adler-lei.workers.dev/display.html?deviceId=xxx
Page loaded successfully
```

如果看到這些日誌，說明更新成功！

---

## ⚠️ 如果還是不行

### 調試步驟：

1. **啟用開發者工具**（查看控制台）

   修改 main.js，找到這行：
   ```javascript
   // mainWindow.webContents.openDevTools();
   ```
   
   改為：
   ```javascript
   mainWindow.webContents.openDevTools();
   ```
   
   重啟後會顯示開發者工具。

2. **檢查日誌**

   在終端查看完整日誌：
   ```bash
   cd ~/mq-cms-electron-player
   ./kiosk.sh 2>&1 | tee player.log
   ```

3. **手動測試瀏覽器**

   在樹莓派瀏覽器中訪問：
   ```
   https://mq-cms.adler-lei.workers.dev/display.html?deviceId=你的設備ID
   ```
   
   看看是否正常顯示。

---

## 📝 主要更新內容

1. **修正 URL**：`/display` → `/display.html`
2. **每次啟動清除緩存**：確保總是使用最新版本
3. **停用 Electron 緩存**：`cache: false`
4. **添加調試日誌**：方便排查問題
5. **監聽載入錯誤**：及時發現問題
