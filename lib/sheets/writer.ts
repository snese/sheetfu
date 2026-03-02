import { sheets, SHEET_ID } from './client'
import { SHEET_TABS, type Transaction } from './schema'

interface AddTransactionInput {
  date: string
  symbol: string
  type: Transaction['type']
  shares: number
  price?: number
  fee?: number
  note?: string
}

export async function addTransaction(input: AddTransactionInput): Promise<{ row: number }> {
  if (!input.date || !input.symbol || !input.type) throw new Error('Missing required fields')
  if (input.shares <= 0) throw new Error('Shares must be positive')

  const market: Transaction['market'] = /^\d/.test(input.symbol) ? 'TW' : 'US'
  const currency = market === 'TW' ? 'TWD' : 'USD'
  const fee = input.fee ?? (market === 'TW' ? (input.price ?? 0) * input.shares * 0.001425 : 0)

  const row = [
    input.date,
    market,
    input.symbol,
    '',  // name — Sheet formula fills
    input.type,
    input.shares,
    input.price ?? '',  // leave blank for GOOGLEFINANCE
    currency,
    '',  // fxRate — Sheet formula
    Math.round(fee * 100) / 100,
    '',  // tax — Sheet formula
    '',  // totalTwd — Sheet formula
    input.note ?? '',
  ]

  const res = await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_TABS.transactions}!A:M`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [row] },
  })

  const updatedRange = res.data.updates?.updatedRange ?? ''
  const rowNum = parseInt(updatedRange.match(/\d+$/)?.[0] ?? '0')
  return { row: rowNum }
}

export async function deleteRow(row: number): Promise<void> {
  const sheetId = await getSheetGid(SHEET_TABS.transactions)
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: [{
        deleteDimension: {
          range: { sheetId, dimension: 'ROWS', startIndex: row - 1, endIndex: row },
        },
      }],
    },
  })
}

async function getSheetGid(title: string): Promise<number> {
  const res = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID, fields: 'sheets.properties' })
  const sheet = res.data.sheets?.find((s) => s.properties?.title === title)
  return sheet?.properties?.sheetId ?? 0
}
