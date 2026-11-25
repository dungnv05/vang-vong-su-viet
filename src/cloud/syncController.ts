import type { HeroTemplateLike, ItemLike } from './heroStats.ts'
import {
  SUPPORTED_CLOUD_SCHEMAS,
  fromCloudSave,
  isFreshLocal,
  sameSave,
  summarizeSave,
  toCloudSave,
} from './saveFormat.ts'
import type { CloudSaveV1, LocalStateLike, RestoredState, SaveSummary } from './saveFormat.ts'
import {
  clearBackup,
  isKeepLocalRemembered,
  loadSyncState,
  markDirty,
  markSynced,
  readBackup,
  rememberKeepLocal,
  saveSyncState,
  writeBackup,
} from './syncState.ts'
import type { StorageLike, SyncState } from './syncState.ts'
import { decideAfterConflict409, decideSync } from './decide.ts'
import type { CloudRow } from './decide.ts'
import type { ApiResult, CloudApi, ConflictInfo, ServerRow } from './cloudApi.ts'

export type SyncStatus =
  | 'signed_out'
  | 'idle'
  | 'syncing'
  | 'synced'
  | 'disabled'
  | 'offline'
  | 'session_expired'
  | 'conflict'
  | 'offer_restore'
  | 'offer_import'
  | 'account_mismatch'
  | 'cloud_unsupported'
  | 'error'

export interface SyncSnapshot {
  status: SyncStatus
  conflict: ConflictInfo | null
  cloudSummary: SaveSummary | null
  cloudUpdatedAt: string | null
  localSummary: SaveSummary | null
  legacyAvailable: boolean
  backupAvailable: boolean
  lastSyncedAt: number | null
  canKeepLocal: boolean
  notice: 'local_only' | 'import_exists' | null
}

export interface SyncDeps {
  api: CloudApi
  storage?: StorageLike
  getLocal: () => LocalStateLike
  applyRestored: (s: RestoredState) => void
  reloadLocal?: () => void
  catalog: {
    heroTemplates: readonly (HeroTemplateLike & Record<string, unknown>)[]
    items: readonly ItemLike[]
  }
  starters: readonly { name: string; level: number; stars: number }[]
  now: () => number
  setTimer: (fn: () => void, ms: number) => unknown
  clearTimer: (h: unknown) => void
  locks?: { request: (name: string, cb: () => Promise<unknown>) => Promise<unknown> }
}

export const DEBOUNCE_MS = 60000
export const MAX_WAIT_MS = 120000

const BASE_BACKOFF_MS = 30000
const MAX_BACKOFF_MS = 600000

export interface SyncController {
  start(userId: string): Promise<void>
  stop(): void
  notifyLocalChange(): void
  syncNow(): Promise<void>
  getSnapshot(): SyncSnapshot
  subscribe(fn: () => void): () => void
  chooseCloud(): Promise<boolean>
  chooseLocal(): Promise<boolean>
  dismiss(): void
  importLegacy(): Promise<boolean>
  uploadLocal(): Promise<boolean>
  undoLastChoice(): Promise<boolean>
  flushKeepalive(): void
  reloadFromStorage(): void
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getSchemaVersion(data: unknown): number | null {
  if (!isRecord(data)) return null
  return typeof data.schemaVersion === 'number' ? data.schemaVersion : null
}

export function createSyncController(deps: SyncDeps): SyncController {
  let userId: string | null = null
  let status: SyncStatus = 'signed_out'
  let conflict: ConflictInfo | null = null
  let cloudSummary: SaveSummary | null = null
  let cloudUpdatedAt: string | null = null
  let localSummary: SaveSummary | null = null
  let legacyAvailable = false
  let lastSyncedAt: number | null = null
  let canKeepLocal = true
  let notice: 'local_only' | 'import_exists' | null = null
  let lastKnownBase: number | null = null

  let applying = false
  let running = false
  let pendingAgain = false
  let retryCount = 0

  let debounceTimer: unknown = null
  let maxWaitTimer: unknown = null
  let retryTimer: unknown = null
  let firstDirtyAt: number | null = null

  const listeners = new Set<() => void>()

  function buildSnapshot(): SyncSnapshot {
    return {
      status,
      conflict,
      cloudSummary,
      cloudUpdatedAt,
      localSummary,
      legacyAvailable,
      backupAvailable: readBackup(deps.now(), deps.storage) !== null,
      lastSyncedAt,
      canKeepLocal,
      notice,
    }
  }

  let snapshot: SyncSnapshot = buildSnapshot()

  function emit(): void {
    snapshot = buildSnapshot()
    for (const fn of listeners) {
      fn()
    }
  }

  function clearDebounceTimers(): void {
    if (debounceTimer !== null) {
      deps.clearTimer(debounceTimer)
      debounceTimer = null
    }
    if (maxWaitTimer !== null) {
      deps.clearTimer(maxWaitTimer)
      maxWaitTimer = null
    }
    firstDirtyAt = null
  }

  function clearRetryTimer(): void {
    if (retryTimer !== null) {
      deps.clearTimer(retryTimer)
      retryTimer = null
    }
  }

  function clearAllTimers(): void {
    clearDebounceTimers()
    clearRetryTimer()
  }

  function scheduleDebounceTimers(nowMs: number): void {
    if (firstDirtyAt === null) {
      firstDirtyAt = nowMs
      maxWaitTimer = deps.setTimer(() => {
        clearDebounceTimers()
        void syncNow()
      }, MAX_WAIT_MS)
    }

    if (debounceTimer !== null) {
      deps.clearTimer(debounceTimer)
    }
    debounceTimer = deps.setTimer(() => {
      clearDebounceTimers()
      void syncNow()
    }, DEBOUNCE_MS)
  }

  function scheduleRetryIn(ms: number): void {
    clearRetryTimer()
    retryTimer = deps.setTimer(() => {
      retryTimer = null
      void syncNow()
    }, ms)
  }

  function scheduleBackoffRetry(): void {
    const delayMs = Math.min(BASE_BACKOFF_MS * 2 ** retryCount, MAX_BACKOFF_MS)
    retryCount += 1
    scheduleRetryIn(delayMs)
  }

  async function withLock<T>(fn: () => Promise<T>): Promise<T> {
    if (deps.locks) {
      return (await deps.locks.request('vv-cloud-sync', fn)) as T
    }
    return await fn()
  }

  function trySummarize(data: unknown): SaveSummary | null {
    if (!isRecord(data)) return null
    const res = fromCloudSave(
      data as { schemaVersion?: unknown } & Partial<CloudSaveV1>,
      deps.catalog,
    )
    if (!res.ok) return null
    return summarizeSave(data as unknown as CloudSaveV1)
  }

  function handleApiError(res: ApiResult<unknown>): void {
    switch (res.kind) {
      case 'disabled':
        status = 'disabled'
        clearAllTimers()
        emit()
        return
      case 'unauthorized':
        status = 'session_expired'
        clearAllTimers()
        emit()
        return
      case 'offline':
        status = 'offline'
        scheduleBackoffRetry()
        emit()
        return
      case 'unavailable':
        status = 'error'
        scheduleBackoffRetry()
        emit()
        return
      case 'rate_limited':
        status = 'error'
        scheduleRetryIn(res.retryAfterSec * 1000)
        emit()
        return
      case 'rejected':
        if (res.code === 'unsupported_schema') {
          conflict = null
          canKeepLocal = false
          status = 'cloud_unsupported'
          clearAllTimers()
          emit()
          return
        }
        status = 'error'
        if (res.code === 'invalid_save') {
          console.warn('cloud save rejected', res.status)
        }
        emit()
        return
      case 'ok':
      case 'conflict':
        return
    }
  }

  async function doPut(
    sync: SyncState,
    local: LocalStateLike,
    baseVersion: number,
    is409Retry = false,
    preserveNotice = false,
  ): Promise<boolean> {
    if (userId === null) return false
    const snapChangedAt = sync.localChangedAt
    const nowMs = deps.now()
    const payload = toCloudSave(local, nowMs)
    const res = await deps.api.put(payload, baseVersion)

    if (res.kind === 'ok') {
      retryCount = 0
      const curLocal = deps.getLocal()
      const stored = loadSyncState(
        isFreshLocal(curLocal, deps.starters),
        deps.storage,
      )
      conflict = null
      cloudSummary = null
      cloudUpdatedAt = null
      localSummary = null
      if (!preserveNotice) notice = null
      canKeepLocal = true
      status = 'synced'

      if (stored.localChangedAt !== snapChangedAt) {
        const nextSync: SyncState = {
          ...stored,
          userId,
          baseVersion: res.version,
          dirty: true,
        }
        saveSyncState(nextSync, deps.storage)
        lastKnownBase = nextSync.baseVersion
        scheduleDebounceTimers(deps.now())
        emit()
        return true
      }

      const nextSync = markSynced(stored, userId, res.version, nowMs)
      saveSyncState(nextSync, deps.storage)
      lastKnownBase = nextSync.baseVersion
      lastSyncedAt = nowMs
      emit()
      return true
    }

    if (res.kind === 'conflict') {
      const serverInfo = res.info.server
      const serverRow: CloudRow = serverInfo
        ? {
            version: serverInfo.version,
            updated_at: serverInfo.updated_at,
            schemaVersion: serverInfo.schemaVersion,
          }
        : null
      const d2 = decideAfterConflict409(serverRow)
      if (d2.kind === 'first_upload' && !is409Retry) {
        return await doPut(sync, local, 0, true, preserveNotice)
      }
      if (d2.kind === 'cloud_unsupported') {
        conflict = null
        canKeepLocal = false
        status = 'cloud_unsupported'
        emit()
        return false
      }
      if (serverInfo !== null) {
        const getRes = await deps.api.get()
        if (getRes.kind === 'ok' && getRes.save !== null) {
          const curLocal = deps.getLocal()
          const adoptNow = deps.now()
          if (sameSave(getRes.save.data, toCloudSave(curLocal, adoptNow))) {
            const curSync = loadSyncState(
              isFreshLocal(curLocal, deps.starters),
              deps.storage,
            )
            const nextSync: SyncState = {
              ...curSync,
              userId,
              baseVersion: getRes.save.version,
              dirty: false,
              lastSyncedAt: adoptNow,
            }
            saveSyncState(nextSync, deps.storage)
            lastKnownBase = nextSync.baseVersion
            lastSyncedAt = adoptNow
            conflict = null
            cloudSummary = null
            cloudUpdatedAt = null
            localSummary = null
            if (!preserveNotice) notice = null
            canKeepLocal = true
            status = 'synced'
            emit()
            return true
          }
        }
      }
      conflict = res.info
      cloudSummary = serverInfo?.summary ?? null
      cloudUpdatedAt = serverInfo?.updated_at ?? null
      localSummary = res.info.client.summary
      canKeepLocal = true
      status = 'conflict'
      emit()
      return false
    }

    handleApiError(res)
    return false
  }

  async function applyCloud(
    sync: SyncState,
    local: LocalStateLike,
    localFresh: boolean,
    row: ServerRow,
    reason: 'pull' | 'chose_cloud' | 'account_switch',
    preserveNotice = false,
  ): Promise<boolean> {
    if (userId === null) return false
    const latestSync = loadSyncState(
      isFreshLocal(deps.getLocal(), deps.starters),
      deps.storage,
    )
    if (latestSync.localChangedAt !== sync.localChangedAt) {
      pendingAgain = true
      return false
    }
    if (!isRecord(row.data)) {
      canKeepLocal = false
      status = 'cloud_unsupported'
      emit()
      return false
    }

    const parsed = fromCloudSave(
      row.data as { schemaVersion?: unknown } & Partial<CloudSaveV1>,
      deps.catalog,
    )
    if (!parsed.ok) {
      canKeepLocal = false
      status = 'cloud_unsupported'
      emit()
      return false
    }

    const nowMs = deps.now()
    if (!(localFresh && reason === 'pull')) {
      writeBackup(
        {
          savedAt: nowMs,
          reason: reason === 'pull' ? 'chose_cloud' : reason,
          side: 'local',
          data: toCloudSave(local, nowMs),
        },
        deps.storage,
      )
    }

    applying = true
    try {
      deps.applyRestored(parsed.state)
    } finally {
      applying = false
    }

    const nextSync = markSynced(sync, userId, row.version, nowMs)
    saveSyncState(nextSync, deps.storage)
    lastKnownBase = nextSync.baseVersion
    lastSyncedAt = nowMs
    conflict = null
    cloudSummary = null
    cloudUpdatedAt = null
    localSummary = null
    if (!preserveNotice) notice = null
    canKeepLocal = true
    status = 'synced'
    emit()
    return true
  }

  async function executeDecision(
    syncInput: SyncState,
    local: LocalStateLike,
    localFresh: boolean,
    row: ServerRow | null,
    preserveNotice: boolean,
  ): Promise<boolean> {
    if (userId === null) return false
    let sync = syncInput

    const cloud: CloudRow =
      row !== null
        ? {
            version: row.version,
            updated_at: row.updated_at,
            schemaVersion: getSchemaVersion(row.data),
          }
        : null

    const decision = decideSync({
      sync,
      signedInUserId: userId,
      cloud,
      legacyAvailable,
      localFresh,
      keepLocalRemembered: isKeepLocalRemembered(sync.userId, userId, deps.storage),
    })

    switch (decision.kind) {
      case 'noop':
        if (decision.adoptUser) {
          if (sync.userId !== userId) {
            sync = { ...sync, userId }
            saveSyncState(sync, deps.storage)
            lastKnownBase = sync.baseVersion
          }
          lastSyncedAt = sync.lastSyncedAt
          conflict = null
          cloudSummary = null
          cloudUpdatedAt = null
          localSummary = null
          if (!preserveNotice) notice = null
          canKeepLocal = true
          status = 'synced'
        } else {
          lastSyncedAt = sync.lastSyncedAt
          conflict = null
          cloudSummary = null
          cloudUpdatedAt = null
          localSummary = null
          notice = 'local_only'
          canKeepLocal = true
          status = 'idle'
        }
        emit()
        return decision.adoptUser

      case 'offer_import':
        conflict = null
        cloudSummary = null
        cloudUpdatedAt = null
        localSummary = null
        canKeepLocal = true
        status = 'offer_import'
        emit()
        return false

      case 'first_upload':
        if (decision.offerImport) {
          conflict = null
          cloudSummary = null
          cloudUpdatedAt = null
          localSummary = null
          canKeepLocal = true
          legacyAvailable = true
          status = 'offer_import'
          emit()
          return false
        }
        return await doPut(sync, local, 0, false, preserveNotice)

      case 'push':
        return await doPut(sync, local, decision.baseVersion, false, preserveNotice)

      case 'pull':
        if (row !== null) {
          return await applyCloud(sync, local, localFresh, row, 'pull', preserveNotice)
        }
        return false

      case 'reset_base':
        sync = { ...sync, baseVersion: decision.baseVersion, userId }
        saveSyncState(sync, deps.storage)
        lastKnownBase = sync.baseVersion
        lastSyncedAt = sync.lastSyncedAt
        conflict = null
        cloudSummary = null
        cloudUpdatedAt = null
        localSummary = null
        if (!preserveNotice) notice = null
        canKeepLocal = true
        status = 'synced'
        emit()
        return true

      case 'conflict':
        if (row !== null) {
          const nowMs = deps.now()
          if (sameSave(row.data, toCloudSave(local, nowMs))) {
            const nextSync: SyncState = {
              ...sync,
              userId,
              baseVersion: row.version,
              dirty: false,
              lastSyncedAt: nowMs,
            }
            saveSyncState(nextSync, deps.storage)
            lastKnownBase = nextSync.baseVersion
            lastSyncedAt = nowMs
            conflict = null
            cloudSummary = null
            cloudUpdatedAt = null
            localSummary = null
            if (!preserveNotice) notice = null
            canKeepLocal = true
            status = 'synced'
            emit()
            return true
          }
          const serverSummary = trySummarize(row.data)
          const localSum = summarizeSave(toCloudSave(local, nowMs))
          conflict = {
            server: {
              version: row.version,
              updated_at: row.updated_at,
              schemaVersion: cloud?.schemaVersion ?? null,
              summary: serverSummary,
            },
            client: {
              baseVersion: sync.baseVersion,
              summary: localSum,
            },
          }
          cloudSummary = serverSummary
          cloudUpdatedAt = row.updated_at
          localSummary = localSum
          canKeepLocal = true
          status = 'conflict'
          emit()
        }
        return false

      case 'offer_restore':
        cloudSummary = row ? trySummarize(row.data) : null
        cloudUpdatedAt = row ? row.updated_at : null
        localSummary = summarizeSave(toCloudSave(local, deps.now()))
        conflict = null
        canKeepLocal = true
        status = 'offer_restore'
        emit()
        return false

      case 'account_mismatch':
        cloudSummary = row ? trySummarize(row.data) : null
        cloudUpdatedAt = row ? row.updated_at : null
        localSummary = summarizeSave(toCloudSave(local, deps.now()))
        conflict = null
        canKeepLocal = true
        status = 'account_mismatch'
        emit()
        return false

      case 'cloud_unsupported':
        conflict = null
        cloudSummary = null
        cloudUpdatedAt = row ? row.updated_at : null
        localSummary = summarizeSave(toCloudSave(local, deps.now()))
        canKeepLocal = false
        status = 'cloud_unsupported'
        emit()
        return false
    }
  }

  async function runSyncLocked(preserveNotice = false): Promise<void> {
    if (userId === null || status === 'disabled' || status === 'session_expired') {
      return
    }

    status = 'syncing'
    emit()

    const local = deps.getLocal()
    const localFresh = isFreshLocal(local, deps.starters)
    const sync = loadSyncState(localFresh, deps.storage)
    lastKnownBase = sync.baseVersion

    const res = await deps.api.get()
    if (res.kind !== 'ok') {
      handleApiError(res)
      return
    }

    retryCount = 0
    legacyAvailable = res.legacyAvailable
    await executeDecision(sync, local, localFresh, res.save, preserveNotice)
  }

  async function syncNow(): Promise<void> {
    if (userId === null || status === 'disabled' || status === 'session_expired') {
      return
    }
    if (running) {
      pendingAgain = true
      return
    }

    clearDebounceTimers()
    clearRetryTimer()
    running = true

    try {
      await withLock(async () => {
        await runSyncLocked(false)
      })
    } finally {
      running = false
    }

    if (
      pendingAgain &&
      userId !== null &&
      (status as SyncStatus) !== 'disabled' &&
      (status as SyncStatus) !== 'session_expired'
    ) {
      pendingAgain = false
      await syncNow()
    }
  }

  return {
    async start(nextUserId: string): Promise<void> {
      userId = nextUserId
      status = 'idle'
      notice = null
      retryCount = 0
      clearAllTimers()
      await syncNow()
    },

    stop(): void {
      userId = null
      status = 'signed_out'
      conflict = null
      cloudSummary = null
      cloudUpdatedAt = null
      localSummary = null
      legacyAvailable = false
      canKeepLocal = true
      notice = null
      lastKnownBase = null
      retryCount = 0
      pendingAgain = false
      clearAllTimers()
      emit()
    },

    notifyLocalChange(): void {
      if (applying || userId === null) return
      if (
        status === 'disabled' ||
        status === 'session_expired' ||
        status === 'conflict' ||
        status === 'account_mismatch' ||
        status === 'cloud_unsupported' ||
        status === 'offer_restore' ||
        notice === 'local_only'
      ) {
        return
      }

      const local = deps.getLocal()
      const localFresh = isFreshLocal(local, deps.starters)
      const sync = loadSyncState(localFresh, deps.storage)
      const nowMs = deps.now()

      const nextSync = markDirty(sync, nowMs)
      saveSyncState(nextSync, deps.storage)
      lastKnownBase = nextSync.baseVersion
      scheduleDebounceTimers(nowMs)
    },

    syncNow,

    getSnapshot(): SyncSnapshot {
      return snapshot
    },

    subscribe(fn: () => void): () => void {
      listeners.add(fn)
      return () => {
        listeners.delete(fn)
      }
    },

    async chooseCloud(): Promise<boolean> {
      return await withLock(async () => {
        if (userId === null || status === 'disabled' || status === 'session_expired') {
          return false
        }
        notice = null
        const wasMismatch = status === 'account_mismatch'
        const res = await deps.api.get()
        if (res.kind !== 'ok') {
          handleApiError(res)
          return false
        }
        const row = res.save
        if (row === null) return false

        const local = deps.getLocal()
        const localFresh = isFreshLocal(local, deps.starters)
        const sync = loadSyncState(localFresh, deps.storage)
        return await applyCloud(
          sync,
          local,
          localFresh,
          row,
          wasMismatch ? 'account_switch' : 'chose_cloud',
        )
      })
    },

    async chooseLocal(): Promise<boolean> {
      return await withLock(async () => {
        if (userId === null || status === 'disabled' || status === 'session_expired') {
          return false
        }
        if (status === 'account_mismatch') {
          const local = deps.getLocal()
          const localFresh = isFreshLocal(local, deps.starters)
          const storedSync = loadSyncState(localFresh, deps.storage)
          rememberKeepLocal(storedSync.userId, userId, deps.storage)
          conflict = null
          notice = 'local_only'
          status = 'idle'
          emit()
          return true
        }
        if (notice !== 'local_only') {
          notice = null
        }
        const res = await deps.api.get()
        if (res.kind !== 'ok') {
          handleApiError(res)
          return false
        }
        const row = res.save

        if (row !== null) {
          const sv = getSchemaVersion(row.data)
          if (sv === null || !SUPPORTED_CLOUD_SCHEMAS.includes(sv)) {
            canKeepLocal = false
            emit()
            return false
          }
          writeBackup(
            {
              savedAt: deps.now(),
              reason: 'chose_local',
              side: 'cloud',
              data: row.data,
            },
            deps.storage,
          )
        }

        const local = deps.getLocal()
        const localFresh = isFreshLocal(local, deps.starters)
        const sync = loadSyncState(localFresh, deps.storage)

        return await doPut(sync, local, row ? row.version : 0)
      })
    },

    dismiss(): void {
      status = 'idle'
      conflict = null
      if (notice !== 'local_only') {
        notice = null
      }
      emit()
    },

    async importLegacy(): Promise<boolean> {
      return await withLock(async () => {
        if (userId === null || status === 'disabled' || status === 'session_expired') {
          return false
        }
        if (notice !== 'local_only') {
          notice = null
        }
        const res = await deps.api.importLegacy()
        if (res.kind === 'conflict') {
          notice = 'import_exists'
          emit()
          await runSyncLocked(true)
          return false
        }
        if (res.kind !== 'ok') {
          handleApiError(res)
          return false
        }

        const getRes = await deps.api.get()
        if (getRes.kind !== 'ok') {
          handleApiError(getRes)
          return false
        }
        legacyAvailable = getRes.legacyAvailable
        if (getRes.save !== null) {
          const local = deps.getLocal()
          const localFresh = isFreshLocal(local, deps.starters)
          const sync = loadSyncState(localFresh, deps.storage)
          return await applyCloud(sync, local, localFresh, getRes.save, 'chose_cloud')
        }
        return true
      })
    },

    async uploadLocal(): Promise<boolean> {
      return await withLock(async () => {
        if (userId === null || status === 'disabled' || status === 'session_expired') {
          return false
        }
        if (status !== 'offer_import' && status !== 'idle') {
          return false
        }
        if (notice !== 'local_only') {
          notice = null
        }

        const res = await deps.api.get()
        if (res.kind !== 'ok') {
          handleApiError(res)
          return false
        }

        retryCount = 0
        legacyAvailable = res.legacyAvailable

        const local = deps.getLocal()
        const localFresh = isFreshLocal(local, deps.starters)
        const sync = loadSyncState(localFresh, deps.storage)
        lastKnownBase = sync.baseVersion

        if (res.save === null) {
          return await doPut(sync, local, 0)
        }
        return await executeDecision(sync, local, localFresh, res.save, false)
      })
    },

    async undoLastChoice(): Promise<boolean> {
      return await withLock(async () => {
        if (userId === null || status === 'disabled' || status === 'session_expired') {
          return false
        }
        if (notice !== 'local_only') {
          notice = null
        }
        const nowMs = deps.now()
        const backup = readBackup(nowMs, deps.storage)
        if (!backup || !isRecord(backup.data)) return false

        const restored = fromCloudSave(
          backup.data as { schemaVersion?: unknown } & Partial<CloudSaveV1>,
          deps.catalog,
        )
        if (!restored.ok) return false

        applying = true
        try {
          deps.applyRestored(restored.state)
        } finally {
          applying = false
        }

        const getRes = await deps.api.get()
        if (getRes.kind !== 'ok') {
          handleApiError(getRes)
          return false
        }

        const local = deps.getLocal()
        const localFresh = isFreshLocal(local, deps.starters)
        const sync = loadSyncState(localFresh, deps.storage)
        const ok = await doPut(sync, local, getRes.save ? getRes.save.version : 0)
        if (ok) {
          clearBackup(deps.storage)
          emit()
        }
        return ok
      })
    },

    flushKeepalive(): void {
      if (userId === null) return
      if (status !== 'synced' && status !== 'idle') return
      if (notice === 'local_only') return
      const local = deps.getLocal()
      const sync = loadSyncState(isFreshLocal(local, deps.starters), deps.storage)
      if (!sync.dirty) return
      const sentChangedAt = sync.localChangedAt
      const base = sync.baseVersion
      const activeUserId = userId
      deps.api.putKeepalive(toCloudSave(local, deps.now()), base, (version) => {
        void withLock(async () => {
          if (userId !== activeUserId || activeUserId === null) return
          const curLocal = deps.getLocal()
          const curSync = loadSyncState(
            isFreshLocal(curLocal, deps.starters),
            deps.storage,
          )
          if (curSync.baseVersion !== base || curSync.userId !== activeUserId) return
          const nowMs = deps.now()
          const nextSync: SyncState =
            curSync.localChangedAt === sentChangedAt
              ? markSynced(curSync, activeUserId, version, nowMs)
              : { ...curSync, baseVersion: version, dirty: true }
          saveSyncState(nextSync, deps.storage)
          lastKnownBase = nextSync.baseVersion
          if (!nextSync.dirty) {
            lastSyncedAt = nextSync.lastSyncedAt
          }
          emit()
        })
      })
    },

    reloadFromStorage(): void {
      const local = deps.getLocal()
      const sync = loadSyncState(isFreshLocal(local, deps.starters), deps.storage)
      if (lastKnownBase !== null && sync.baseVersion !== lastKnownBase && status !== 'conflict') {
        applying = true
        try {
          deps.reloadLocal?.()
        } finally {
          applying = false
        }
      }
      lastKnownBase = sync.baseVersion
      lastSyncedAt = sync.lastSyncedAt
      emit()
    },
  }
}
