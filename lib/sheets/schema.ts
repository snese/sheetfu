export interface Transaction {
  date: string
  broker: string
  symbol: string
  market: 'US' | 'TW'
  assetType: string
  type: '買入' | '賣出' | '股利' | string
  shares: number
  price: number
  currency: string
  totalCost: number
  fee: number
  fxRate: number
  note: string
}

export interface PortfolioHolding {
  symbol: string
  market: 'US' | 'TW'
  assetType: string
  currency: string
  shares: number
  currentPrice: number
  valueLocal: number
  fxRate: number
  valueTwd: number
  avgCost: number
  costTwd: number
  pnlTwd: number
  pnlPercent: number
  riskLevel: string
  totalPortfolio: number
}

export interface DashboardSummary {
  netWorth: number
  totalAssets: number
  totalLiabilities: number
  cash: number
  investment: number
  realEstate: number
  marketDistribution: { market: string; valueTwd: number }[]
}

export const SHEET_TABS = {
  transactions: 'v2_交易紀錄',
  portfolio: 'v2_投資組合',
  overview: 'v2_總覽',
} as const

export const SHEET_RANGES = {
  transactions: 'v2_交易紀錄!A2:M',
  portfolio: 'v2_投資組合!A2:O',
  overview: 'v2_總覽!A1:B20',
} as const
