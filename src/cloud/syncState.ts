export const SYNC_KEY = 'vv_cloud_sync_v1'
export const BACKUP_KEY = 'vv_cloud_backup_v1'
export const KEEP_LOCAL_KEY = 'vv_cloud_keep_local_v1'

const BACKUP_TTL_MS = 7 * 24 * 60 * 60 * 1000
const MAX_KEEP_LOCAL_ENTRIES = 10

export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export interface SyncState {
  userId: string | null
  baseVersion: number
  dirty: boolean
  localChangedAt: number | null
  lastSyncedAt: number | null
  schemaVersion: number
}

export interface LocalBackup {
  savedAt: number
  reason: 'chose_cloud' | 'chose_local' | 'account_switch'
  side: 'local' | 'cloud'
  data: unknown
}

function resolveStorage(storage?: StorageLike): StorageLike | undefined {
  if (storage !== undefined) return storage
  return typeof globalThis !== 'undefined' && 'localStorage' in globalThis
    ? globalThis.localStorage
    : undefined
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isValidSyncState(value: unknown): value is SyncState {
  if (!isPlainObject(value)) return false
  if (value.userId !== null && typeof value.userId !== 'string') return false
  if (
    typeof value.baseVersion !== 'number' ||
    !Number.isSafeInteger(value.baseVersion) ||
    value.baseVersion < 0
  ) {
    return false
  }
  if (typeof value.dirty !== 'boolean') return false
  if (
    value.localChangedAt !== null &&
    (typeof value.localChangedAt !== 'number' || !Number.isFinite(value.localChangedAt))
  ) {
    return false
  }
  if (
    value.lastSyncedAt !== null &&
    (typeof value.lastSyncedAt !== 'number' || !Number.isFinite(value.lastSyncedAt))
  ) {
    return false
  }
  if (
    typeof value.schemaVersion !== 'number' ||
    !Number.isSafeInteger(value.schemaVersion) ||
    value.schemaVersion < 1
  ) {
    return false
  }
  return true
}

export function loadSyncState(localIsFresh: boolean, storage?: StorageLike): SyncState {
  const fallback: SyncState = {
    userId: null,
    baseVersion: 0,
    dirty: !localIsFresh,
    localChangedAt: null,
    lastSyncedAt: null,
    schemaVersion: 1,
  }

  const store = resolveStorage(storage)
  const raw = store?.getItem(SYNC_KEY)
  if (!raw) return fallback

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!isValidSyncState(parsed)) return fallback
    return {
      userId: parsed.userId,
      baseVersion: parsed.baseVersion,
      dirty: parsed.dirty,
      localChangedAt: parsed.localChangedAt,
      lastSyncedAt: parsed.lastSyncedAt,
      schemaVersion: parsed.schemaVersion,
    }
  } catch {
    return fallback
  }
}

export function saveSyncState(s: SyncState, storage?: StorageLike): void {
  const store = resolveStorage(storage)
  store?.setItem(SYNC_KEY, JSON.stringify(s))
}

export function markDirty(s: SyncState, nowMs: number): SyncState {
  return {
    ...s,
    dirty: true,
    localChangedAt: nowMs,
  }
}

export function markSynced(
  s: SyncState,
  userId: string,
  version: number,
  nowMs: number,
): SyncState {
  return {
    ...s,
    userId,
    baseVersion: version,
    dirty: false,
    lastSyncedAt: nowMs,
  }
}

export function writeBackup(b: LocalBackup, storage?: StorageLike): void {
  const store = resolveStorage(storage)
  store?.setItem(BACKUP_KEY, JSON.stringify(b))
}

function isValidBackup(value: unknown): value is LocalBackup {
  if (!isPlainObject(value)) return false
  if (typeof value.savedAt !== 'number' || !Number.isFinite(value.savedAt)) return false
  if (
    value.reason !== 'chose_cloud' &&
    value.reason !== 'chose_local' &&
    value.reason !== 'account_switch'
  ) {
    return false
  }
  if (value.side !== 'local' && value.side !== 'cloud') return false
  if (!('data' in value)) return false
  return true
}

export function readBackup(nowMs: number, storage?: StorageLike): LocalBackup | null {
  const store = resolveStorage(storage)
  const raw = store?.getItem(BACKUP_KEY)
  if (!raw) return null

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!isValidBackup(parsed)) return null
    if (nowMs - parsed.savedAt > BACKUP_TTL_MS) {
      store?.removeItem(BACKUP_KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function clearBackup(storage?: StorageLike): void {
  const store = resolveStorage(storage)
  store?.removeItem(BACKUP_KEY)
}

function keepLocalKey(localUserId: string | null, signedInUserId: string): string {
  return `${localUserId ?? 'null'}|${signedInUserId}`
}

function readKeepLocalList(store: StorageLike | undefined): string[] {
  const raw = store?.getItem(KEEP_LOCAL_KEY)
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is string => typeof item === 'string')
  } catch {
    return []
  }
}

export function rememberKeepLocal(
  localUserId: string | null,
  signedInUserId: string,
  storage?: StorageLike,
): void {
  const store = resolveStorage(storage)
  if (!store) return
  const entry = keepLocalKey(localUserId, signedInUserId)
  const list = readKeepLocalList(store).filter((item) => item !== entry)
  list.push(entry)
  const capped = list.slice(-MAX_KEEP_LOCAL_ENTRIES)
  store.setItem(KEEP_LOCAL_KEY, JSON.stringify(capped))
}

export function isKeepLocalRemembered(
  localUserId: string | null,
  signedInUserId: string,
  storage?: StorageLike,
): boolean {
  const store = resolveStorage(storage)
  const entry = keepLocalKey(localUserId, signedInUserId)
  return readKeepLocalList(store).includes(entry)
}
