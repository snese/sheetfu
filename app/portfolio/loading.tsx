export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-6 w-32 bg-muted rounded" />
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex justify-between"><div className="h-4 w-20 bg-muted rounded" /><div className="h-4 w-16 bg-muted rounded" /><div className="h-4 w-16 bg-muted rounded" /></div>
        ))}
      </div>
    </div>
  )
}
