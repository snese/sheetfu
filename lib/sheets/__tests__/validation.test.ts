import { describe, it, expect } from 'vitest'
import { TransactionInput } from '../validation'

describe('TransactionInput', () => {
  const valid = { date: '2026-03-04', symbol: 'TSLA', type: 'buy' as const, shares: 10 }

  it('accepts valid minimal input', () => {
    expect(TransactionInput.safeParse(valid).success).toBe(true)
  })

  it('accepts full input with optional fields', () => {
    const full = { ...valid, price: 250.5, fee: 1.5, broker: 'Firstrade', assetType: 'ETF', note: 'test' }
    expect(TransactionInput.safeParse(full).success).toBe(true)
  })

  it('rejects wrong date format', () => {
    expect(TransactionInput.safeParse({ ...valid, date: '2026/3/4' }).success).toBe(false)
    expect(TransactionInput.safeParse({ ...valid, date: '03-04-2026' }).success).toBe(false)
    expect(TransactionInput.safeParse({ ...valid, date: '' }).success).toBe(false)
  })

  it('rejects invalid type', () => {
    expect(TransactionInput.safeParse({ ...valid, type: 'transfer' }).success).toBe(false)
  })

  it('rejects zero or negative shares', () => {
    expect(TransactionInput.safeParse({ ...valid, shares: 0 }).success).toBe(false)
    expect(TransactionInput.safeParse({ ...valid, shares: -1 }).success).toBe(false)
  })

  it('rejects negative price/fee', () => {
    expect(TransactionInput.safeParse({ ...valid, price: -10 }).success).toBe(false)
    expect(TransactionInput.safeParse({ ...valid, fee: -1 }).success).toBe(false)
  })

  it('rejects missing required fields', () => {
    expect(TransactionInput.safeParse({}).success).toBe(false)
    expect(TransactionInput.safeParse({ date: '2026-03-04' }).success).toBe(false)
  })
})
