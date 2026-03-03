#!/usr/bin/env node
// T1: Populate an existing Google Sheet with SheetFu template data
// Usage: SHEET_ID=xxx node scripts/create-template.mjs
// The sheet must be shared with the SA (editor access)

import { google } from 'googleapis'

const TEMPLATE_ID = process.env.SHEET_ID || process.argv[2]
if (!TEMPLATE_ID) { console.error('Usage: SHEET_ID=xxx node scripts/create-template.mjs'); process.exit(1) }

const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})
const sheets = google.sheets({ version: 'v4', auth })
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

// 1. Rename default sheet + add tabs
console.log('Setting up tabs...')
const { data: existing } = await sheets.spreadsheets.get({ spreadsheetId: TEMPLATE_ID, fields: 'sheets.properties' })
const existingTitles = existing.sheets.map(s => s.properties.title)
const firstSheetId = existing.sheets[0].properties.sheetId

const tabs = ['Getting Started', 'v2_交易紀錄', 'v2_投資組合', 'v2_資產負債表', 'v2_總覽', 'v2_持倉明細']
const requests = []

// Rename first sheet
if (existingTitles[0] !== tabs[0]) {
  requests.push({ updateSheetProperties: { properties: { sheetId: firstSheetId, title: tabs[0] }, fields: 'title' } })
}
// Add missing tabs
for (let i = 1; i < tabs.length; i++) {
  if (!existingTitles.includes(tabs[i])) {
    requests.push({ addSheet: { properties: { title: tabs[i], index: i } } })
  }
}
if (requests.length) await sheets.spreadsheets.batchUpdate({ spreadsheetId: TEMPLATE_ID, requestBody: { requests } })
await sleep(1000)

// 2. Getting Started
console.log('Writing Getting Started...')
await sheets.spreadsheets.values.update({
  spreadsheetId: TEMPLATE_ID, range: 'Getting Started!A1:B19', valueInputOption: 'USER_ENTERED',
  requestBody: { values: [
    ['🏠 SheetFu Basic Template', ''],
    ['家庭財務管理模板 Family Finance Template', ''],
    ['', ''],
    ['📋 使用步驟 Getting Started', ''],
    ['1. 點擊「建立副本」複製本 Sheet', 'Click "Make a copy"'],
    ['2. 刪除範例數據，填入自己的交易', 'Delete sample data, enter yours'],
    ['3. 設定 .env.local 中的 SHEET_ID', 'Set SHEET_ID in .env.local'],
    ['', ''],
    ['⚙️ 基礎貨幣設定', '在 v2_總覽 B1 修改 (預設 TWD)'],
    ['', ''],
    ['📊 支援市場', ''],
    ['市場 Market', 'GOOGLEFINANCE 語法'],
    ['US 美股', 'GOOGLEFINANCE("AAPL")'],
    ['TW 台股', 'GOOGLEFINANCE("TPE:2330")'],
    ['JP 日股', 'GOOGLEFINANCE("TYO:7203")'],
    ['HK 港股', 'GOOGLEFINANCE("HKG:0700")'],
    ['SG 新加坡', 'GOOGLEFINANCE("SGX:D05")'],
    ['', ''],
    ['🔗 GitHub', 'https://github.com/snese/sheetfu'],
  ] },
})
await sleep(2000)

// 3. Transactions
console.log('Writing Transactions...')
await sheets.spreadsheets.values.update({
  spreadsheetId: TEMPLATE_ID, range: 'v2_交易紀錄!A1:M11', valueInputOption: 'USER_ENTERED',
  requestBody: { values: [
    ['日期 Date','市場 Market','股票代碼 Symbol','名稱 Name','類型 Type','股數 Shares','價格 Price','幣別 Currency','匯率 FxRate','手續費 Fee','稅 Tax','總計TWD Total','備註 Note'],
    ['2025-01-15','US','AAPL','Apple Inc.','buy',10,185.5,'USD',31.2,0,0,'=F2*G2*I2+J2+K2','定期定額'],
    ['2025-02-01','TW','2330','台積電','buy',1000,580,'TWD',1,'=F3*G3*0.001425',0,'=F3*G3*I3+J3+K3',''],
    ['2025-02-15','US','MSFT','Microsoft','buy',5,410,'USD',31.5,0,0,'=F4*G4*I4+J4+K4',''],
    ['2025-03-01','TW','0050','元大台灣50','buy',500,142,'TWD',1,'=F5*G5*0.001425',0,'=F5*G5*I5+J5+K5','ETF'],
    ['2025-03-15','US','AAPL','Apple Inc.','dividend',10,0.25,'USD',31.3,0,'=F6*G6*0.3','=F6*G6*I6-K6','股利'],
    ['2025-04-01','TW','2330','台積電','buy',500,595,'TWD',1,'=F7*G7*0.001425',0,'=F7*G7*I7+J7+K7','加碼'],
    ['2025-04-15','US','NVDA','NVIDIA','buy',3,850,'USD',31.8,0,0,'=F8*G8*I8+J8+K8',''],
    ['2025-05-01','TW','2884','玉山金','buy',2000,26.5,'TWD',1,'=F9*G9*0.001425',0,'=F9*G9*I9+J9+K9','金融股'],
    ['2025-06-01','US','AAPL','Apple Inc.','sell',5,195,'USD',31.5,0,0,'=-(F10*G10*I10-J10)','獲利了結'],
    ['2025-06-15','TW','2330','台積電','dividend',1500,3.5,'TWD',1,0,0,'=F11*G11','現金股利'],
  ] },
})
await sleep(2000)

// 4. Portfolio
console.log('Writing Portfolio...')
await sheets.spreadsheets.values.update({
  spreadsheetId: TEMPLATE_ID, range: 'v2_投資組合!A1:O7', valueInputOption: 'USER_ENTERED',
  requestBody: { values: [
    ['股票代碼 Symbol','名稱 Name','市場 Market','股數 Shares','均價 AvgCost','現價 Price','幣別 Currency','匯率 FxRate','成本TWD Cost','市值TWD Value','損益TWD PnL','報酬率 Return%','權重 Weight%','風險等級 Risk','更新 Updated'],
    ['AAPL','Apple Inc.','US',5,185.5,'=IFERROR(GOOGLEFINANCE("AAPL"),195)','USD',31.5,'=D2*E2*H2','=D2*F2*H2','=J2-I2','=IFERROR(K2/I2*100,0)','=IFERROR(J2/SUM(J$2:J$7)*100,0)',3,'=NOW()'],
    ['2330','台積電','TW',1500,585,'=IFERROR(GOOGLEFINANCE("TPE:2330"),600)','TWD',1,'=D3*E3*H3','=D3*F3*H3','=J3-I3','=IFERROR(K3/I3*100,0)','=IFERROR(J3/SUM(J$2:J$7)*100,0)',3,'=NOW()'],
    ['MSFT','Microsoft','US',5,410,'=IFERROR(GOOGLEFINANCE("MSFT"),420)','USD',31.5,'=D4*E4*H4','=D4*F4*H4','=J4-I4','=IFERROR(K4/I4*100,0)','=IFERROR(J4/SUM(J$2:J$7)*100,0)',3,'=NOW()'],
    ['0050','元大台灣50','TW',500,142,'=IFERROR(GOOGLEFINANCE("TPE:0050"),145)','TWD',1,'=D5*E5*H5','=D5*F5*H5','=J5-I5','=IFERROR(K5/I5*100,0)','=IFERROR(J5/SUM(J$2:J$7)*100,0)',2,'=NOW()'],
    ['NVDA','NVIDIA','US',3,850,'=IFERROR(GOOGLEFINANCE("NVDA"),900)','USD',31.8,'=D6*E6*H6','=D6*F6*H6','=J6-I6','=IFERROR(K6/I6*100,0)','=IFERROR(J6/SUM(J$2:J$7)*100,0)',4,'=NOW()'],
    ['2884','玉山金','TW',2000,26.5,'=IFERROR(GOOGLEFINANCE("TPE:2884"),27)','TWD',1,'=D7*E7*H7','=D7*F7*H7','=J7-I7','=IFERROR(K7/I7*100,0)','=IFERROR(J7/SUM(J$2:J$7)*100,0)',2,'=NOW()'],
  ] },
})
await sleep(2000)

// 5. Balance Sheet
console.log('Writing Balance Sheet...')
await sheets.spreadsheets.values.update({
  spreadsheetId: TEMPLATE_ID, range: 'v2_資產負債表!A1:G8', valueInputOption: 'USER_ENTERED',
  requestBody: { values: [
    ['分類 Category','項目 Item','幣別 Currency','金額 Amount','金額TWD AmountTWD','備註 Note','更新 Updated'],
    ['資產-投資','股票投資組合','TWD','=SUM(v2_投資組合!J2:J7)','=D2','自動計算','=NOW()'],
    ['資產-現金','台幣活存','TWD',500000,500000,'玉山銀行','2025-06-01'],
    ['資產-現金','美元活存','USD',5000,'=D4*31.5','玉山銀行','2025-06-01'],
    ['資產-保險','儲蓄險','TWD',200000,200000,'解約金','2025-01-01'],
    ['負債','房貸','TWD',-3000000,-3000000,'剩餘本金','2025-06-01'],
    ['負債','信用卡','TWD',-15000,-15000,'本月帳單','2025-06-15'],
    ['淨值 Net Worth','','TWD','','=SUM(E2:E7)','','=NOW()'],
  ] },
})
await sleep(2000)

// 6. Overview
console.log('Writing Overview...')
await sheets.spreadsheets.values.update({
  spreadsheetId: TEMPLATE_ID, range: 'v2_總覽!A1:B12', valueInputOption: 'USER_ENTERED',
  requestBody: { values: [
    ['基礎貨幣 Base Currency','TWD'],
    ['',''],
    ['淨值 Net Worth','=v2_資產負債表!E8'],
    ['投資市值 Investment Value','=SUM(v2_投資組合!J2:J7)'],
    ['投資成本 Investment Cost','=SUM(v2_投資組合!I2:I7)'],
    ['投資損益 Total PnL','=B4-B5'],
    ['報酬率 Return %','=IFERROR(B6/B5*100,0)'],
    ['現金部位 Cash','=SUMIFS(v2_資產負債表!E2:E7,v2_資產負債表!A2:A7,"資產-現金")'],
    ['負債總額 Total Debt','=SUMIFS(v2_資產負債表!E2:E7,v2_資產負債表!A2:A7,"負債")'],
    ['風險分數 Risk Score','=IFERROR(SUMPRODUCT(v2_投資組合!M2:M7/100*v2_投資組合!N2:N7),0)'],
    ['',''],
    ['更新時間 Updated','=NOW()'],
  ] },
})
await sleep(2000)

// 7. Holdings Detail
console.log('Writing Holdings Detail...')
await sheets.spreadsheets.values.update({
  spreadsheetId: TEMPLATE_ID, range: 'v2_持倉明細!A1:H10', valueInputOption: 'USER_ENTERED',
  requestBody: { values: [
    ['市場 Market','股票代碼 Symbol','名稱 Name','股數 Shares','現價 Price','市值TWD Value','損益% Return','權重% Weight'],
    ['🇺🇸 US 美股','','','','','','',''],
    ['US','=v2_投資組合!A2','=v2_投資組合!B2','=v2_投資組合!D2','=v2_投資組合!F2','=v2_投資組合!J2','=v2_投資組合!L2','=v2_投資組合!M2'],
    ['US','=v2_投資組合!A4','=v2_投資組合!B4','=v2_投資組合!D4','=v2_投資組合!F4','=v2_投資組合!J4','=v2_投資組合!L4','=v2_投資組合!M4'],
    ['US','=v2_投資組合!A6','=v2_投資組合!B6','=v2_投資組合!D6','=v2_投資組合!F6','=v2_投資組合!J6','=v2_投資組合!L6','=v2_投資組合!M6'],
    ['','','','','','','',''],
    ['🇹🇼 TW 台股','','','','','','',''],
    ['TW','=v2_投資組合!A3','=v2_投資組合!B3','=v2_投資組合!D3','=v2_投資組合!F3','=v2_投資組合!J3','=v2_投資組合!L3','=v2_投資組合!M3'],
    ['TW','=v2_投資組合!A5','=v2_投資組合!B5','=v2_投資組合!D5','=v2_投資組合!F5','=v2_投資組合!J5','=v2_投資組合!L5','=v2_投資組合!M5'],
    ['TW','=v2_投資組合!A7','=v2_投資組合!B7','=v2_投資組合!D7','=v2_投資組合!F7','=v2_投資組合!J7','=v2_投資組合!L7','=v2_投資組合!M7'],
  ] },
})
await sleep(1000)

// 8. Freeze headers
console.log('Freezing headers...')
const { data: final } = await sheets.spreadsheets.get({ spreadsheetId: TEMPLATE_ID, fields: 'sheets.properties' })
const freezeReqs = final.sheets
  .filter(s => s.properties.title !== 'Getting Started')
  .map(s => ({
    updateSheetProperties: {
      properties: { sheetId: s.properties.sheetId, gridProperties: { frozenRowCount: 1 } },
      fields: 'gridProperties.frozenRowCount',
    },
  }))
if (freezeReqs.length) await sheets.spreadsheets.batchUpdate({ spreadsheetId: TEMPLATE_ID, requestBody: { requests: freezeReqs } })

const copyUrl = `https://docs.google.com/spreadsheets/d/${TEMPLATE_ID}/copy`
console.log('\n✅ Template populated!')
console.log(`Sheet: https://docs.google.com/spreadsheets/d/${TEMPLATE_ID}/edit`)
console.log(`Copy URL: ${copyUrl}`)
