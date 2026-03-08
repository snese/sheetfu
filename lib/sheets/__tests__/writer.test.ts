import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockAppend = vi.fn().mockResolvedValue({
  data: { updates: { updatedRange: 'v2_交易紀錄!A42:M42' } },
})

vi.mock('../client', () => ({
  sheets: {
    spreadsheets: {
      values: { append: (...args: unknown[]) => mockAppend(...args) },
    },
  },
  SHEET_ID: 'test-sheet-id',
}))

vi.mock('@/lib/api-error', () => ({
  ApiError: class ApiError extends Error {
    constructor(message: string, public code: string, public status = 400) {
      super(message)
    }
  },
}))

import { addTransaction } from '../writer'

beforeEach(() => mockAppend.mockClear())

describe('addTransaction row assembly', () => {
  it('US stock: correct market, currency, type mapping, row order', async () => {
    await addTransaction({ date: '2026-03-08', symbol: 'TSLA', type: 'buy', shares: 10, price: 250 })
    const row = mockAppend.mock.calls[0][0].requestBody.values[0]
    expect(row[0]).toBe('2026-03-08')  // date
    expect(row[2]).toBe('TSLA')        // symbol
    expect(row[3]).toBe('US')          // market
    expect(row[5]).toBe('買入')         // type mapped
    expect(row[6]).toBe(10)            // shares
    expect(row[7]).toBe(250)           // price
    expect(row[8]).toBe('USD')         // currency
    expect(row[10]).toBe(0)            // US fee = 0
    expect(row).toHaveLength(13)
  })

  it('TW stock: digit prefix → TW market, TWD, fee calculated', async () => {
    await addTransaction({ date: '2026-03-08', symbol: '2330', type: 'buy', shares: 1000, price: 600 })
    const row = mockAppend.mock.calls[0][0].requestBody.values[0]
    expect(row[3]).toBe('TW')
    expect(row[8]).toBe('TWD')
    expect(row[10]).toBe(Math.round(600 * 1000 * 0.001425 * 100) / 100) // 855
  })

  it('sell → 賣出, dividend → 股利', async () => {
    await addTransaction({ date: '2026-03-08', symbol: 'AAPL', type: 'sell', shares: 5, price: 180 })
    expect(mockAppend.mock.calls[0][0].requestBody.values[0][5]).toBe('賣出')

    mockAppend.mockClear()
    await addTransaction({ date: '2026-03-08', symbol: 'AAPL', type: 'dividend', shares: 5 })
    expect(mockAppend.mock.calls[0][0].requestBody.values[0][5]).toBe('股利')
  })

  it('explicit fee overrides auto-calc', async () => {
    await addTransaction({ date: '2026-03-08', symbol: '2330', type: 'buy', shares: 100, price: 600, fee: 20 })
    expect(mockAppend.mock.calls[0][0].requestBody.values[0][10]).toBe(20)
  })

  it('returns row number from Sheets API response', async () => {
    const result = await addTransaction({ date: '2026-03-08', symbol: 'TSLA', type: 'buy', shares: 1 })
    expect(result).toEqual({ row: 42 })
  })

  it('rejects invalid input', async () => {
    await expect(addTransaction({})).rejects.toThrow()
    await expect(addTransaction({ date: 'bad', symbol: 'X', type: 'buy', shares: -1 })).rejects.toThrow()
  })
})
