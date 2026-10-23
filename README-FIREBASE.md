# AI共和國1.0・Firebase 串接說明

本 repo 已有學生端 Firebase 連接程式、教師頁面與 Firestore rules，但在 Firebase 專案建立及授權之前 **Firebase 並未啟用**。

## 啟用順序
1. 開啟 https://console.firebase.google.com/ ，建立 Firebase 專案（可命名 ai-republic-school）。
2. 新增 Web 應用程式，複製 Web app firebaseConfig (apiKey, authDomain, projectId, appId 等)，填入根目錄 `firebase-config.js`，將 `null` 改成設定物件。這是可公開的 Web config；**絕對不要上傳 service account 私鑰**。
3. Authentication → Sign-in method → 啟用「匿名」與「Google」登入。Authentication → Settings → Authorized domains 加入 `superterry0927.github.io`。
4. Cloud Firestore → 建立資料庫（建議鎖定模式），把根目錄 `firestore.rules` 內容複製到 Firestore → Rules 並發布；不要使用全公開測試規則。
5. 在 Authentication → Users 找到教師 Google 登入後的 UID。到 Firestore 主控台手動建立 `admins/{該 UID}` 文件，例如 `{role:"teacher"}`。學生端無法自己建立此文件。
6. 開啟 https://superterry0927.github.io/ai-republic/ 建立小隊，測試作答是否出現在 `teams/{匿名UID}/submissions/{taskId}`。
7. 開啟 https://superterry0927.github.io/ai-republic/teacher.html ，使用已授權 Google 帳號審核。

## 資料及安全性
- 學生端以匿名 Firebase Auth UID 為小隊文件 ID，同一瀏覽器維持紀錄。不同裝置目前不會共用同一小隊；正式跨裝置小隊加入碼需另外製作安全後端。
- 小隊名稱請用代號，避免輸入學生全名。所有資料儲存於你的 Firebase 專案。
- 答案一律上傳標記 `submitted`；教師改為 `approved` 或 `returned`。學生不可自行將雲端紀錄改成 `approved`。
- `answerKeys` 是教師私有的預留集合；正式「伺服器自動答案檢核」要加上 Cloud Functions，避免將正解寫在公開前端。現階段是教師手動審核，**不是自動批改**。
- GitHub Pages 僅提供靜態網站託管；Firebase 專案與 Firestore Rules 需在 Firebase 控制台另外啟用。

## 補充
原 PDF 有 43 頁；本站包含封面、五區地圖、原版題目頁面，以及晶晶圖像。第 43 頁為補充複製頁，原預覽素材保留前 42 頁。
