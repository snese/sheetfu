# SheetFu 📊

> 用 Google Sheets 管理家庭財務，可選搭配 Next.js 儀表板。

## 為什麼選 SheetFu？

- Google Sheets 作為唯一資料來源（公式完成所有計算）
- 兩種模式：簡單模式（只用 Sheets）或進階模式（+ Web 儀表板）
- 通用：支援任何幣別、任何 GOOGLEFINANCE 支援的市場
- 行動裝置友善的 PWA，支援離線使用

## 快速開始

### 簡單模式（零設定）

1. [複製範本]({TEMPLATE_URL})
2. 刪除範例資料，輸入你自己的交易紀錄
3. 完成。投資組合、損益、資產負債表自動計算。

### 進階模式（Web 儀表板）

1. 複製範本（同上）
2. Clone 此 repo
3. 設定 Google Service Account（參見 [docs/setup.md](docs/setup.md)）
4. 部署到 Cloudflare（參見 [docs/deploy.md](docs/deploy.md)）

## 截圖

<!-- TODO: 新增截圖 (T4) -->

## 技術架構

- Google Sheets（GOOGLEFINANCE、SUMIFS、UNIQUE、XLOOKUP）
- Next.js 14 + Tailwind CSS + shadcn/ui
- PWA 離線支援
- Cloudflare Access（身份驗證）

## 文件

- [設定指南](docs/setup.md)
- [Sheet 範本指南](docs/sheet-template.md)
- [部署指南](docs/deploy.md)
- [常見問題](docs/faq.md)

## 貢獻

參見 [CONTRIBUTING.md](CONTRIBUTING.md)

## 給 AI Agent

參見 [AGENTS.md](AGENTS.md)

## 授權

MIT

---

[English](README.md)
