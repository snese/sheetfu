'use client'
import { useEffect, useRef, useState } from 'react'

export function CountUp({ value, prefix = '', suffix = '', duration = 1200 }: {
  value: number; prefix?: string; suffix?: string; duration?: number
}) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<number>(0)

  useEffect(() => {
    const start = ref.current
    const diff = value - start
    const startTime = performance.now()
    const step = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1)
      const ease = 1 - Math.pow(1 - t, 3) // easeOutCubic
      const current = start + diff * ease
      setDisplay(current)
      if (t < 1) requestAnimationFrame(step)
      else ref.current = value
    }
    requestAnimationFrame(step)
  }, [value, duration])

  const fmt = Math.abs(display) >= 1e8
    ? `${(display / 1e8).toFixed(2)}\u5104`
    : Math.abs(display) >= 1e4
    ? `${(display / 1e4).toFixed(1)}\u842c`
    : display.toLocaleString('zh-TW', { maximumFractionDigits: 0 })

  return <>{prefix}{fmt}{suffix}</>
}
