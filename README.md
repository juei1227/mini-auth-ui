# mini-auth-ui

簡易的 Vite 前端範例，用於與 `mini-auth-system` .NET 8 後端通訊。

## 功能

- 🔐 **用戶註冊**：支援用戶名、郵箱、密碼註冊
- 🔑 **JWT 登入**：登入後儲存 JWT Token 到 `localStorage`
- 🛡️ **權限請求**：向受保護 API 發送 `Authorization: Bearer <token>` 請求
- 🚪 **登出功能**：清除 Token 並重置狀態
- 🔄 **表單切換**：登入與註冊表單間無縫切換
- 📡 **API 代理**：使用 Vite proxy 將 `/api` 請求轉發到後端

## 快速啟動

```bash
cd e:\cursorProject\mini-auth-ui
npm install
npm run dev
```

然後打開瀏覽器：http://localhost:5173

## 使用說明

1. **註冊新帳號**：
   - 點擊「註冊」分頁
   - 填入用戶名、郵箱、密碼
   - 註冊成功後自動切換到登入頁面

2. **登入帳號**：
   - 點擊「登入」分頁
   - 輸入用戶名和密碼
   - 登入成功後 JWT Token 會儲存在瀏覽器中

3. **測試受保護 API**：
   - 使用登入後的 Token 測試個人資料和受保護資料端點

## 重要設定

`vite.config.js` 已配置：

```js
proxy: {
  '/api': {
    target: 'http://localhost:5130',
    changeOrigin: true,
    secure: false,
  },
}
```

> 如果後端實際啟動在其他 port，請將 `target` 改成後端實際地址。

## API 範例

- `POST /api/auth/register` - 用戶註冊
- `POST /api/auth/login` - 用戶登入
- `GET /api/protected/profile` - 受保護的個人資料
- `GET /api/protected/data` - 受保護的資料

## 說明

此專案與 `mini-auth-system` 後端獨立存在，兩者只透過 HTTP API 互相串接。