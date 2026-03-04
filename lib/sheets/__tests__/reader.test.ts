import { describe, it, expect } from 'vitest'
import { normalizeDate, parseDate, parseTwd, pctToNum } from '../reader'

describe('normalizeDate', () => {
  it('converts YYYY/M/D to YYYY-MM-DD', () => {
    expect(normalizeDate('2026/3/4')).toBe('2026-03-04')
    expect(normalizeDate('2025/11/2')).toBe('2025-11-02')
    expect(normalizeDate('2026/2/23')).toBe('2026-02-23')
  })
  it('passes through YYYY-MM-DD unchanged', () => {
    expect(normalizeDate('2026-03-04')).toBe('2026-03-04')
  })
  it('handles YYYY/MM/DD (with leading zeros)', () => {
    expect(normalizeDate('2026/03/04')).toBe('2026-03-04')
  })
  it('returns empty string for empty input', () => {
    expect(normalizeDate('')).toBe('')
  })
  it('returns original for unparseable input', () => {
    expect(normalizeDate('not-a-date')).toBe('not-a-date')
  })
})

describe('parseDate', () => {
  it('parses YYYY/M/D correctly', () => {
    expect(parseDate('2026/3/4')).toBe(new Date('2026-03-04').getTime())
  })
  it('parses YYYY-MM-DD correctly', () => {
    expect(parseDate('2026-03-04')).toBe(new Date('2026-03-04').getTime())
  })
  it('sorts dates correctly', () => {
    const dates = ['2025/11/2', '2026/2/23', '2025/11/21']
    const sorted = dates.sort((a, b) => parseDate(b) - parseDate(a))
    expect(sorted).toEqual(['2026/2/23', '2025/11/21', '2025/11/2'])
  })
  it('returns 0 for empty string', () => {
    expect(parseDate('')).toBe(0)
  })
})

describe('parseTwd', () => {
  it('parses plain number', () => {
    expect(parseTwd('1000')).toBe(1000)
  })
  it('parses NT$ formatted', () => {
    expect(parseTwd('NT$1,234,567')).toBe(1234567)
  })
  it('parses negative', () => {
    expect(parseTwd('-500')).toBe(-500)
    expect(parseTwd('NT$-1,000')).toBe(-1000)
  })
  it('returns 0 for empty', () => {
    expect(parseTwd('')).toBe(0)
  })
})

describe('pctToNum', () => {
  it('parses percentage string', () => {
    expect(pctToNum('12.5%')).toBe(12.5)
  })
  it('parses plain number', () => {
    expect(pctToNum('8.3')).toBe(8.3)
  })
  it('returns 0 for empty', () => {
    expect(pctToNum('')).toBe(0)
  })
})
