# mini-auth-ui

簡易的 Vite 前端範例，用於與 `mini-auth-system` .NET 8 後端通訊。

## 功能

- 登入並儲存 JWT Token 到 `localStorage`
- 向受保護 API 發送 `Authorization: Bearer <token>` 請求
- 登出時清除 Token
- 使用 Vite proxy 將 `/api` 請求轉發到後端

## 快速啟動

```bash
cd e:\cursorProject\mini-auth-ui
npm install
npm run dev
```

然後打開瀏覽器：http://localhost:5173

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

- 登入：`POST /api/auth/login`
- 受保護資料：`GET /api/protected/profile`
- 受保護資料：`GET /api/protected/data`

## 說明

此專案與 `mini-auth-system` 後端獨立存在，兩者只透過 HTTP API 互相串接。