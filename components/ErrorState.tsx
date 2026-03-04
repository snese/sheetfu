'use client'
import { useRouter } from 'next/navigation'

export function ErrorState({ message = '無法載入資料' }: { message?: string }) {
  const router = useRouter()
  return (
    <div className="text-center py-12 space-y-3">
      <p className="text-muted-foreground">{message}</p>
      <button onClick={() => router.refresh()}
        className="text-sm text-accent hover:underline">重新載入</button>
    </div>
  )
}
