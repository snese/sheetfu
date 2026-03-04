export default function Loading() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-6 w-16 bg-muted rounded" />
      {[...Array(3)].map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-2">
          <div className="h-4 w-20 bg-muted rounded" />
          <div className="h-4 w-32 bg-muted rounded" />
        </div>
      ))}
    </div>
  )
}
