# SheetFu Basic Template

## 一鍵複製

> 👉 [一鍵複製 Template](https://docs.google.com/spreadsheets/d/1mhyRhg0tdiNKGIXblZqlO-ppId9yVqY3wgnDZEszCjA/copy)

```
https://docs.google.com/spreadsheets/d/1mhyRhg0tdiNKGIXblZqlO-ppId9yVqY3wgnDZEszCjA/copy
```

## Tab 結構

| Tab | 說明 | 資料來源 |
|-----|------|--------|
| Getting Started | 使用說明 + 市場代碼表 | 靜態 |
| v2_交易紀錄 | 交易記錄（A-M） | 手動輸入 |
| v2_投資組合 | 持倉彙總（A-O） | 公式自動計算 |
| v2_資產負債表 | 資產負債（A-G） | 投資自動 + 現金手動 |
| v2_總覽 | Dashboard 數據 | 公式引用其他 tab |
| v2_持倉明細 | 按市場分組明細 | 公式引用投資組合 |

## 欄位對照（schema.ts ↔ Sheet）

### Transaction (v2_交易紀錄 A-M)
| 欄 | schema 欄位 | Sheet Header |
|----|------------|-------------|
| A | date | 日期 Date |
| B | market | 市場 Market |
| C | symbol | 股票代碼 Symbol |
| D | name | 名稱 Name |
| E | type | 類型 Type |
| F | shares | 股數 Shares |
| G | price | 價格 Price |
| H | currency | 幣別 Currency |
| I | fxRate | 匯率 FxRate |
| J | fee | 手續費 Fee |
| K | tax | 稅 Tax |
| L | totalTwd | 總計TWD Total |
| M | note | 備註 Note |

### PortfolioHolding (v2_投資組合 A-O)
| 欄 | schema 欄位 | Sheet Header |
|----|------------|-------------|
| A | symbol | 股票代碼 Symbol |
| B | name | 名稱 Name |
| C | market | 市場 Market |
| D | shares | 股數 Shares |
| E | avgCost | 均價 AvgCost |
| F | currentPrice | 現價 Price |
| G | currency | 幣別 Currency |
| H | fxRate | 匯率 FxRate |
| I | costTwd | 成本TWD Cost |
| J | valueTwd | 市值TWD Value |
| K | pnlTwd | 損益TWD PnL |
| L | pnlPercent | 報酬率 Return% |
| M | weight | 權重 Weight% |
| N | riskLevel | 風險等級 Risk |
| O | lastUpdate | 更新 Updated |

## 支援市場

| 市場 | GOOGLEFINANCE 語法 |
|------|-------------------|
| US 美股 | `GOOGLEFINANCE("AAPL")` |
| TW 台股 | `GOOGLEFINANCE("TPE:2330")` |
| JP 日股 | `GOOGLEFINANCE("TYO:7203")` |
| HK 港股 | `GOOGLEFINANCE("HKG:0700")` |
| SG 新加坡 | `GOOGLEFINANCE("SGX:D05")` |

## 使用步驟

1. 點擊上方「一鍵複製」連結
2. 刪除範例數據
3. 在 v2_交易紀錄 填入自己的交易
4. v2_投資組合、v2_總覽 會自動計算
5. 在 `.env.local` 設定 `SHEET_ID` 為你複製的 Sheet ID
