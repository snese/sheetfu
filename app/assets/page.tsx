import { formatCurrency } from '@/lib/utils'
import { getBalanceSheet, getMortgages } from '@/lib/sheets/reader'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/ErrorState'

export const revalidate = 600

export default async function AssetsPage() {
  let items: Awaited<ReturnType<typeof getBalanceSheet>> = []
  let mortgages: Awaited<ReturnType<typeof getMortgages>> = []
  try {
    [items, mortgages] = await Promise.all([getBalanceSheet(), getMortgages()])
  } catch (e) {
    console.error('[Assets] Failed to load:', e)
    return <ErrorState message="無法載入資產資料" />
  }

  const liabilityCategories = new Set(['長期負債', '短期負債'])
  const assets = items.filter(i => !liabilityCategories.has(i.category))
  const liabilities = items.filter(i => liabilityCategories.has(i.category))

  const grouped = assets.reduce<Record<string, typeof items>>((acc, i) => {
    ;(acc[i.category] ??= []).push(i)
    return acc
  }, {})

  const total = assets.reduce((s, i) => s + i.amountTwd, 0)
  const totalLiabilities = liabilities.reduce((s, i) => s + i.amountTwd, 0)

  const categoryEmoji: Record<string, string> = { '現金': '💵', '投資': '📈', '不動產': '🏠', '長期負債': '🏦' }

  return (
    <div className="space-y-5">
      <PageHeader title="資產總覽" subtitle={`${items.length} 筆項目`} />
      <div className="rounded-2xl border border-border bg-card p-5 text-center">
        <p className="text-xs text-muted-foreground">資產總額</p>
        <p className="text-2xl font-bold mt-1">{formatCurrency(total)}</p>
      </div>

      {Object.entries(grouped).map(([cat, list]) => (
        <div key={cat}>
          <h2 className="text-xs font-semibold text-muted-foreground mb-2 px-1">
            {categoryEmoji[cat] ?? '📌'} {cat}
          </h2>
          <div className="space-y-2">
            {list.map((item, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{item.subCategory}</p>
                  <p className="text-[10px] text-muted-foreground">{item.description}{item.lastUpdate ? ` · ${item.lastUpdate}` : ''}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatCurrency(item.amountTwd)}</p>
                  {item.currency !== 'TWD' && item.amountLocal > 0 && (
                    <p className="text-[10px] text-muted-foreground">{item.currency} {item.amountLocal.toLocaleString()}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {liabilities.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground mb-2 px-1">🏦 負債</h2>
          <div className="space-y-2">
            {liabilities.map((item, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{item.subCategory}</p>
                  <p className="text-[10px] text-muted-foreground">{item.description}{item.lastUpdate ? ` · ${item.lastUpdate}` : ''}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-loss">{formatCurrency(item.amountTwd)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-border bg-card/50 p-3 mt-2 flex justify-between">
            <p className="text-xs text-muted-foreground">淨值</p>
            <p className="text-sm font-bold">{formatCurrency(total - totalLiabilities)}</p>
          </div>
        </div>
      )}

      {mortgages.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground mb-2 px-1">🏠 房貸明細</h2>
          <div className="space-y-2">
            {mortgages.map((m, i) => {
              const paidPct = m.principal > 0 ? (m.paidPrincipal / m.principal) * 100 : 0
              return (
                <div key={i} className="rounded-xl border border-border bg-card p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium">{m.name}</p>
                      <p className="text-[10px] text-muted-foreground">{m.bank} · {m.startDate} · {(m.rate * 100).toFixed(2)}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatCurrency(m.remainingPrincipal)}</p>
                      <p className="text-[10px] text-muted-foreground">月付 {formatCurrency(m.monthlyPayment)}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-accent transition-all duration-700" style={{ width: `${paidPct}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                      <span>已還 {formatCurrency(m.paidPrincipal)} ({paidPct.toFixed(1)}%)</span>
                      <span>原始 {formatCurrency(m.principal)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
