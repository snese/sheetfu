const DB_NAME = 'sheetfu-offline'
const STORE = 'pending-tx'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true })
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function queueTransaction(data: Record<string, unknown>): Promise<void> {
  const db = await openDB()
  const tx = db.transaction(STORE, 'readwrite')
  tx.objectStore(STORE).add({ ...data, _queued: Date.now() })
}

export async function flushQueue(): Promise<number> {
  const db = await openDB()
  const tx = db.transaction(STORE, 'readonly')
  const items: { id: number; [k: string]: unknown }[] = await new Promise((resolve) => {
    const req = tx.objectStore(STORE).getAll()
    req.onsuccess = () => resolve(req.result)
  })

  let synced = 0
  for (const item of items) {
    const { id, _queued, ...payload } = item
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        const del = db.transaction(STORE, 'readwrite')
        del.objectStore(STORE).delete(id)
        synced++
      }
    } catch { /* still offline, keep in queue */ }
  }
  return synced
}

export async function pendingCount(): Promise<number> {
  const db = await openDB()
  return new Promise((resolve) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).count()
    req.onsuccess = () => resolve(req.result)
  })
}
