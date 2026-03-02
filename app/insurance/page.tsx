import { formatCurrency } from '@/lib/utils'
import { getInsurance } from '@/lib/sheets/reader'

export const dynamic = 'force-dynamic'
export const revalidate = 600

export default async function InsurancePage() {
  let policies: Awaited<ReturnType<typeof getInsurance>> = []
  try { policies = await getInsurance() } catch {
    return <div className="text-center py-12 text-muted-foreground">無法載入保單資料</div>
  }

  const totalAnnual = policies.reduce((s, p) => s + p.annualPremium, 0)
  const byInsured = policies.reduce<Record<string, typeof policies>>((acc, p) => {
    ;(acc[p.insured] ??= []).push(p)
    return acc
  }, {})

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-card p-5 text-center">
        <p className="text-xs text-muted-foreground">年繳保費總額</p>
        <p className="text-2xl font-bold mt-1">{formatCurrency(totalAnnual)}</p>
        <p className="text-xs text-muted-foreground mt-1">{policies.length} 張保單</p>
      </div>

      {Object.entries(byInsured).map(([person, list]) => (
        <div key={person}>
          <h2 className="text-xs font-semibold text-muted-foreground mb-2 px-1">
            {person === '自己' ? '👤' : '👥'} {person}
          </h2>
          <div className="space-y-2">
            {list.map((p, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{p.policyName}</p>
                    <p className="text-[10px] text-muted-foreground">{p.company} · {p.coverage}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(p.annualPremium)}<span className="text-[10px] text-muted-foreground">/年</span></p>
                    <p className="text-[10px] text-muted-foreground">{p.cycle} · {p.paymentMethod}</p>
                  </div>
                </div>
                <div className="mt-2 flex gap-3 text-[10px] text-muted-foreground">
                  <span>保額: {p.amount}</span>
                  {p.nextPayment && <span>下次繳費: {p.nextPayment}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
