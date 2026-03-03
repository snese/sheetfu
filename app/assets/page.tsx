import { formatCurrency } from '@/lib/utils'
import { getBalanceSheet } from '@/lib/sheets/reader'
import { PageHeader } from '@/components/layout/PageHeader'

export const dynamic = 'force-dynamic'
export const revalidate = 600

export default async function AssetsPage() {
  let items: Awaited<ReturnType<typeof getBalanceSheet>> = []
  try { items = await getBalanceSheet() } catch {
    return <div className="text-center py-12 text-muted-foreground">無法載入資產負債資料</div>
  }

  const grouped = items.reduce<Record<string, typeof items>>((acc, i) => {
    ;(acc[i.category] ??= []).push(i)
    return acc
  }, {})

  const total = items.reduce((s, i) => s + i.amountTwd, 0)

  const categoryEmoji: Record<string, string> = { '現金': '💵', '投資': '📈', '不動產': '🏠', '長期負債': '🏦' }

  return (
    <div className="space-y-5">
      <PageHeader title="資產負債" subtitle={`${items.length} 筆項目`} />
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
    </div>
  )
}
