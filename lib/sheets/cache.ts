import { readFile } from 'fs/promises'
import path from 'path'

const SNAPSHOT_PATH = path.join(process.cwd(), 'public', 'snapshot.json')

export async function getSnapshot<T>(key: string): Promise<{ data: T; updatedAt: string }> {
  const raw = JSON.parse(await readFile(SNAPSHOT_PATH, 'utf-8'))
  return { data: raw[key], updatedAt: raw.updatedAt ?? new Date().toISOString() }
}
