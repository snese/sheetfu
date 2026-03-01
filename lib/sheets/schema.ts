export interface Transaction {
  date: string
  market: 'US' | 'TW'
  symbol: string
  name: string
  type: 'buy' | 'sell' | 'dividend' | 'stock_dividend'
  shares: number
  price: number
  currency: string
  fxRate: number
  fee: number
  tax: number
  totalTwd: number
  note: string
}

export interface PortfolioHolding {
  symbol: string
  name: string
  market: 'US' | 'TW'
  shares: number
  avgCost: number
  currentPrice: number
  currency: string
  fxRate: number
  costTwd: number
  valueTwd: number
  pnlTwd: number
  pnlPercent: number
  weight: number
  riskLevel: number
  lastUpdate: string
}

export interface BalanceSheetItem {
  category: string
  item: string
  currency: string
  amount: number
  amountTwd: number
  note: string
  lastUpdate: string
}

export interface DashboardSummary {
  netWorth: number
  totalInvestment: number
  totalCost: number
  totalPnl: number
  returnPercent: number
  riskScore: number
  baseCurrency: string
}

export const SHEET_TABS = {
  transactions: 'v2_交易紀錄',
  portfolio: 'v2_投資組合',
  balanceSheet: 'v2_資產負債表',
  overview: 'v2_總覽',
  holdings: 'v2_持倉明細',
  insurance: 'v2_保單管理',
} as const

export const SHEET_RANGES = {
  transactions: 'v2_交易紀錄!A2:M',
  portfolio: 'v2_投資組合!A2:O',
  balanceSheet: 'v2_資產負債表!A2:G',
  overview: 'v2_總覽!A1:B20',
} as const
