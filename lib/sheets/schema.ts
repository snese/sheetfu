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

export interface RiskBucket {
  level: string
  valueTwd: number
}

export interface InvestmentPerformance {
  totalValue: number
  totalCost: number
  totalPnl: number
  returnPercent: number
}

export interface DashboardSummary {
  netWorth: number
  totalAssets: number
  totalLiabilities: number
  cash: number
  investment: number
  realEstate: number
  marketDistribution: { market: string; valueTwd: number }[]
  riskDistribution: RiskBucket[]
  riskScore: number
  performance: InvestmentPerformance
}

export interface BalanceSheetItem {
  category: string
  subCategory: string
  description: string
  currency: string
  amountLocal: number
  amountTwd: number
  lastUpdate: string
  note: string
}

export interface HistoryPoint {
  date: string
  totalAssets: number
  totalLiabilities: number
  netWorth: number
}

export interface Mortgage {
  name: string
  bank: string
  principal: number
  rate: number
  termMonths: number
  startDate: string
  gracePeriodMonths: number
  monthlyPayment: number
  paidPeriods: number
  paidPrincipal: number
  remainingPrincipal: number
}

export interface InsurancePolicy {
  insured: string
  company: string
  policyName: string
  coverage: string
  amount: string
  annualPremium: number
  cycle: string
  paymentMethod: string
  startDate: string
  endDate: string
  nextPayment: string
  note: string
}

export const SHEET_TABS = {
  transactions: 'v2_交易紀錄',
  portfolio: 'v2_投資組合',
  overview: 'v2_總覽',
  balanceSheet: 'v2_資產負債表',
  history: 'v2_歷史紀錄',
  insurance: 'v2_保單管理',
  mortgage: 'v2_房貸',
} as const

export const SHEET_RANGES = {
  transactions: 'v2_交易紀錄!A2:M',
  portfolio: 'v2_投資組合!A2:O',
  overview: 'v2_總覽!A1:B33',
  balanceSheet: 'v2_資產負債表!A1:H15',
  history: 'v2_歷史紀錄!A1:D',
  insurance: 'v2_保單管理!A2:L',
  mortgage: 'v2_房貸!A2:L',
} as const
