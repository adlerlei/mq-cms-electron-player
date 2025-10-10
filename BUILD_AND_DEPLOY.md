# 📦 MQ Player 打包與部署指南

## 版本: 1.4.0

### 本次更新內容
- ✅ 修正 URL: `/display` → `/display.html`
- ✅ 每次啟動自動清除所有緩存
- ✅ 停用 Electron 緩存 (cache: false)
- ✅ 添加調試日誌和錯誤監聽

---

## 🔨 步驟 1: 在 Mac 上打包

在你的 Mac 上執行：

```bash
# 1. 進入播放器目錄
cd ~/Documents/mq-cms-cloudflare/mq-cms-electron-player

# 2. 確保依賴已安裝
npm install

# 3. 打包為 .deb（for 樹莓派）
npm run make

# 4. 等待打包完成（可能需要幾分鐘）
# 成功後會顯示：
# ✔ Making for the following targets: deb
# ✔ Done making
```

### 打包結果位置

打包完成後，.deb 文件會在：

```
~/Documents/mq-cms-cloudflare/mq-cms-electron-player/out/make/deb/arm64/
```

文件名類似：
```
mq-player_1.4.0_arm64.deb
```

---

## 📤 步驟 2: 傳送到樹莓派

### 方法 A: 使用 SCP（推薦）⭐

在 Mac 終端執行：

```bash
# 傳送 .deb 文件到樹莓派
scp ~/Documents/mq-cms-cloudflare/mq-cms-electron-player/out/make/deb/arm64/mq-player_1.4.0_arm64.deb mq@pi:~/
```

### 方法 B: 使用 USB 隨身碟

1. 將 .deb 文件複製到 USB 隨身碟
2. 插入樹莓派
3. 在樹莓派上掛載並複製文件

### 方法 C: 使用 VNC 文件傳輸

1. 使用 VNC Viewer 連接
2. 使用文件傳輸功能上傳 .deb

---

## 🔧 步驟 3: 在樹莓派上安裝

### SSH 連接到樹莓派

```bash
ssh mq@pi
```

### 安裝步驟

```bash
# 1. 停止當前播放器
pkill electron || true

# 2. 清除舊緩存
rm -rf ~/.cache/electron*
rm -rf ~/.config/Electron
rm -rf ~/.config/mq-cms-player

# 3. 卸載舊版本（如果需要）
sudo dpkg -r mq-player

# 4. 安裝新版本
sudo dpkg -i ~/mq-player_1.4.0_arm64.deb

# 5. 修復依賴（如果有提示）
sudo apt-get install -f

# 6. 驗證安裝
which mq-player
mq-player --version

# 7. 重啟播放器
cd ~/mq-cms-electron-player
./kiosk.sh
```

---

## 📊 步驟 4: 驗證更新

啟動後，終端應該顯示：

```
Using existing device ID: xxx-xxx-xxx
Clearing all caches...               ← 新增！
Cache cleared successfully           ← 新增！
Storage data cleared                 ← 新增！
Loading URL: https://mq-cms.adler-lei.workers.dev/display.html?deviceId=xxx  ← 修正！
Page loaded successfully             ← 新增！
```

播放器螢幕應該正常顯示：
- ✅ 頁首影片正常播放
- ✅ **群組圖片正常輪播**（之前無法顯示）
- ✅ 所有區塊內容正常顯示

---

## 🐛 疑難排解

### 問題 1: 打包失敗

**錯誤**: `npm run make` 失敗

**解決方法**:
```bash
# 清除並重新安裝依賴
rm -rf node_modules package-lock.json
npm install
npm run make
```

### 問題 2: 安裝失敗（依賴問題）

**錯誤**: dpkg 提示缺少依賴

**解決方法**:
```bash
sudo apt-get update
sudo apt-get install -f
sudo dpkg -i ~/mq-player_1.4.0_arm64.deb
```

### 問題 3: 安裝後還是舊版本

**解決方法**:
```bash
# 完全卸載舊版本
sudo dpkg -r mq-player
sudo dpkg --purge mq-player

# 清除所有緩存和配置
rm -rf ~/.cache/electron*
rm -rf ~/.config/Electron
rm -rf ~/.config/mq-cms-player
rm -rf ~/.local/share/mq-player

# 重新安裝
sudo dpkg -i ~/mq-player_1.4.0_arm64.deb
```

### 問題 4: 播放器還是顯示破圖

**原因**: 群組內的圖片記錄已損壞

**解決方法**:
1. 到管理後台
2. 編輯群組
3. 移除所有圖片
4. 重新上傳新圖片
5. 保存並重新指派

---

## 🔄 未來更新流程

每次更新 `main.js` 後：

1. 更新 `package.json` 中的版本號
2. 在 Mac 上執行 `npm run make`
3. SCP 傳送 .deb 到樹莓派
4. SSH 連接樹莓派
5. 卸載舊版本
6. 安裝新版本
7. 清除緩存
8. 重啟播放器

---

## 📝 快速命令集合

### Mac 端（打包 + 傳送）
```bash
cd ~/Documents/mq-cms-cloudflare/mq-cms-electron-player
npm run make
scp out/make/deb/arm64/mq-player_1.4.0_arm64.deb mq@pi:~/
```

### 樹莓派端（安裝 + 啟動）
```bash
pkill electron
rm -rf ~/.cache/electron*
sudo dpkg -r mq-player && sudo dpkg -i ~/mq-player_1.4.0_arm64.deb
./kiosk.sh
```

---

## ⚙️ 自動化腳本（可選）

創建 `deploy.sh` 在 Mac 上：

```bash
#!/bin/bash
set -e

echo "📦 Building MQ Player..."
cd ~/Documents/mq-cms-cloudflare/mq-cms-electron-player
npm run make

echo "📤 Uploading to Raspberry Pi..."
scp out/make/deb/arm64/mq-player_*.deb mq@pi:~/

echo "🔧 Installing on Raspberry Pi..."
ssh mq@pi << 'EOF'
pkill electron || true
rm -rf ~/.cache/electron*
sudo dpkg -r mq-player || true
sudo dpkg -i ~/mq-player_*.deb
sudo apt-get install -f -y
echo "✅ Installation complete!"
EOF

echo "🎉 Deployment finished!"
echo "Now SSH to the Pi and run: ./kiosk.sh"
```

使用方法：
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 📞 需要幫助？

如果遇到問題，請提供：
1. 錯誤訊息的完整輸出
2. `dpkg -l | grep mq-player` 的結果
3. 播放器終端的完整日誌

祝部署順利！🚀
