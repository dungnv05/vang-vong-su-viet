import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { createCloudApi, KEEPALIVE_MAX_BYTES } from '../src/cloud/cloudApi.ts'
import { createSyncController } from '../src/cloud/syncController.ts'
import { toCloudSave } from '../src/cloud/saveFormat.ts'
import {
  BACKUP_KEY,
  loadSyncState,
  saveSyncState,
  isKeepLocalRemembered,
} from '../src/cloud/syncState.ts'

const originalConsoleLog = console.log
let consoleLogCalls = 0

before(() => {
  console.log = (..._args) => {
    consoleLogCalls += 1
    throw new Error('console.log is forbidden in cloud-sync')
  }
})

after(() => {
  console.log = originalConsoleLog
})

const CATALOG = {
  heroTemplates: [
    {
      name: 'Trần Hưng Đạo',
      atk: 100,
      maxHp: 800,
      level: 1,
      stars: 1,
      maxRage: 100,
      role: 'tank',
    },
    {
      name: 'Hai Bà Trưng',
      atk: 140,
      maxHp: 650,
      level: 1,
      stars: 1,
      maxRage: 120,
      role: 'dps',
    },
  ],
  items: [
    { id: 'sword_1', statBonus: { atk: 45 } },
    { id: 'armor_1', statBonus: { hp: 200, atk: 10 } },
  ],
}

const STARTERS = ['Trần Hưng Đạo']

function makeLocal(overrides = {}) {
  return {
    gold: 500,
    heroes: [
      {
        id: 'h1',
        name: 'Trần Hưng Đạo',
        level: 1,
        stars: 1,
        slotIndex: 0,
        equippedItemIds: [],
      },
    ],
    shards: { 'Trần Hưng Đạo': 5 },
    currentStageIndex: 0,
    maxUnlockedStage: 0,
    towerFloor: 1,
    maxTowerFloor: 1,
    worldBossTotalDamage: 0,
    pvpRank: 100,
    pvpScore: 0,
    rankLevel: 1,
    activeBeastId: 'beast_1',
    lastIdleClaimTime: 1700000000000,
    battleSpeed: 1,
    isMuted: false,
    ...overrides,
  }
}

function makeProgressLocal(overrides = {}) {
  return makeLocal({
    gold: 2500,
    maxUnlockedStage: 5,
    maxTowerFloor: 4,
    rankLevel: 3,
    ...overrides,
  })
}

function createFakeStorage(events = null) {
  const map = new Map()
  return {
    getItem(key) {
      return map.has(key) ? map.get(key) : null
    },
    setItem(key, value) {
      if (events) events.push(`storage:set:${key}`)
      map.set(key, String(value))
    },
    removeItem(key) {
      if (events) events.push(`storage:remove:${key}`)
      map.delete(key)
    },
  }
}

function createFakeTimers(startMs = 1_000_000) {
  let currentMs = startMs
  let nextId = 1
  const timers = new Map()

  async function flushMicrotasks() {
    for (let i = 0; i < 25; i++) {
      await Promise.resolve()
    }
  }

  return {
    now: () => currentMs,
    setTimer(fn, ms) {
      const id = nextId++
      timers.set(id, { at: currentMs + ms, fn })
      return id
    },
    clearTimer(id) {
      timers.delete(id)
    },
    async advanceBy(ms) {
      const target = currentMs + ms
      while (true) {
        let earliestId = null
        let earliestAt = Infinity
        for (const [id, entry] of timers.entries()) {
          if (entry.at <= target && entry.at < earliestAt) {
            earliestAt = entry.at
            earliestId = id
          }
        }
        if (earliestId === null) break
        const entry = timers.get(earliestId)
        timers.delete(earliestId)
        currentMs = entry.at
        entry.fn()
        await flushMicrotasks()
      }
      currentMs = target
      await flushMicrotasks()
    },
    pendingCount: () => timers.size,
  }
}

function makeResponse(status, body, headersObj = {}) {
  const headers = new Headers(headersObj)
  return {
    status,
    ok: status >= 200 && status < 300,
    headers,
    async json() {
      if (body instanceof Error) throw body
      return body
    },
  }
}

describe('cloudApi', () => {
  it('1. 401 -> refresh ok -> retried once -> ok with fresh csrf on retry', async () => {
    const calls = []
    let csrfIdx = 0
    const csrfValues = ['csrf-1', 'csrf-2']
    let fetchCount = 0

    const api = createCloudApi({
      fetch: async (url, init) => {
        calls.push({ url, init })
        fetchCount += 1
        if (fetchCount === 1) return makeResponse(401, { error: 'unauthorized' })
        return makeResponse(200, { version: 4, updated_at: '2026-01-01T00:00:00Z' })
      },
      readCsrf: () => csrfValues[csrfIdx++] ?? 'csrf-extra',
      refresh: async () => 'ok',
      sleep: async () => {},
    })

    const res = await api.put(toCloudSave(makeLocal()), 3)
    assert.deepEqual(res, { kind: 'ok', version: 4, updated_at: '2026-01-01T00:00:00Z' })
    assert.equal(calls.length, 2)
    assert.equal(calls[0].init.headers['x-csrf-token'], 'csrf-1')
    assert.equal(calls[1].init.headers['x-csrf-token'], 'csrf-2')
  })

  it('2. 401 -> refresh retry -> sleep(300..799) -> refresh ok -> ok', async () => {
    const sleeps = []
    let refreshCount = 0
    let fetchCount = 0

    const api = createCloudApi({
      fetch: async () => {
        fetchCount += 1
        if (fetchCount === 1) return makeResponse(401, { error: 'unauthorized' })
        return makeResponse(200, { ok: true, save: null, legacy_available: false })
      },
      readCsrf: () => 'csrf-1',
      refresh: async () => {
        refreshCount += 1
        return refreshCount === 1 ? 'retry' : 'ok'
      },
      sleep: async (ms) => {
        sleeps.push(ms)
      },
      random: () => 0.5,
    })

    const res = await api.get()
    assert.deepEqual(res, { kind: 'ok', save: null, legacyAvailable: false })
    assert.equal(refreshCount, 2)
    assert.equal(sleeps.length, 1)
    assert.equal(sleeps[0] >= 300 && sleeps[0] <= 799, true)
  })

  it('3. 401 -> refresh failed -> unauthorized with exactly 1 fetch', async () => {
    let fetchCount = 0
    const api = createCloudApi({
      fetch: async () => {
        fetchCount += 1
        return makeResponse(401, { error: 'unauthorized' })
      },
      readCsrf: () => 'csrf-1',
      refresh: async () => 'failed',
      sleep: async () => {},
    })

    const res = await api.get()
    assert.deepEqual(res, { kind: 'unauthorized' })
    assert.equal(fetchCount, 1)
  })

  it('4. 503 cloud_save_disabled -> disabled; 429 Retry-After 7 -> rate_limited 7; fetch throws -> offline', async () => {
    let mode = 'disabled'
    const api = createCloudApi({
      fetch: async () => {
        if (mode === 'disabled') return makeResponse(503, { error: 'cloud_save_disabled' })
        if (mode === 'rate_limited') return makeResponse(429, {}, { 'Retry-After': '7' })
        throw new Error('network down')
      },
      readCsrf: () => 'csrf-1',
      refresh: async () => 'failed',
      sleep: async () => {},
    })

    assert.deepEqual(await api.get(), { kind: 'disabled' })
    mode = 'rate_limited'
    assert.deepEqual(await api.get(), { kind: 'rate_limited', retryAfterSec: 7 })
    mode = 'offline'
    assert.deepEqual(await api.get(), { kind: 'offline' })
  })

  it('5. putKeepalive rejects >60000-byte body without fetch and uses keepalive:true otherwise', async () => {
    const calls = []
    const api = createCloudApi({
      fetch: async (url, init) => {
        calls.push({ url, init })
        return makeResponse(200, { version: 1, updated_at: null })
      },
      readCsrf: () => 'csrf-1',
      refresh: async () => 'failed',
      sleep: async () => {},
    })

    const hugeShards = {}
    for (let i = 0; i < 3000; i++) {
      hugeShards[`Hero_${i}_LongName`] = i
    }
    const hugeSave = toCloudSave(makeLocal({ shards: hugeShards }))
    assert.equal(
      new TextEncoder().encode(JSON.stringify({ data: hugeSave, baseVersion: 0 })).byteLength >
        KEEPALIVE_MAX_BYTES,
      true,
    )
    assert.equal(api.putKeepalive(hugeSave, 0), false)
    assert.equal(calls.length, 0)

    const smallSave = toCloudSave(makeLocal())
    assert.equal(api.putKeepalive(smallSave, 1), true)
    assert.equal(calls.length, 1)
    assert.equal(calls[0].init.keepalive, true)
    assert.equal(calls[0].init.credentials, 'include')
  })

  it('6. PUT body has exactly keys data and baseVersion; credentials include', async () => {
    const calls = []
    const api = createCloudApi({
      fetch: async (url, init) => {
        calls.push({ url, init })
        return makeResponse(200, { version: 2, updated_at: null })
      },
      readCsrf: () => 'csrf-1',
      refresh: async () => 'failed',
      sleep: async () => {},
    })

    await api.put(toCloudSave(makeLocal()), 1)
    assert.equal(calls.length, 1)
    assert.equal(calls[0].init.credentials, 'include')
    const parsed = JSON.parse(calls[0].init.body)
    assert.deepEqual(Object.keys(parsed), ['data', 'baseVersion'])
    assert.equal(parsed.baseVersion, 1)
  })

  it('6b. M1 contract: GET reads snake_case legacy_available into legacyAvailable', async () => {
    let nextBody = { ok: true, save: null, legacy_available: true }
    const api = createCloudApi({
      fetch: async () => makeResponse(200, nextBody),
      readCsrf: () => 'csrf-1',
      refresh: async () => 'failed',
      sleep: async () => {},
    })

    const r1 = await api.get()
    assert.equal(r1.kind, 'ok')
    if (r1.kind === 'ok') assert.equal(r1.legacyAvailable, true)

    nextBody = { ok: true, save: null, legacy_available: false }
    const r2 = await api.get()
    assert.equal(r2.kind, 'ok')
    if (r2.kind === 'ok') assert.equal(r2.legacyAvailable, false)
  })
})

describe('syncController', () => {
  it('7. E1: empty storage + non-fresh local + cloud row v3 -> conflict and applyRestored NOT called', async () => {
    const storage = createFakeStorage()
    const timers = createFakeTimers()
    let restoredCalls = 0
    const cloudData = toCloudSave(makeProgressLocal({ gold: 9999 }))

    const api = {
      async get() {
        return {
          kind: 'ok',
          save: { data: cloudData, version: 3, updated_at: '2026-01-01T00:00:00Z' },
          legacyAvailable: false,
        }
      },
      async put() {
        throw new Error('unexpected put')
      },
      putKeepalive: () => false,
      async importLegacy() {
        throw new Error('unexpected import')
      },
    }

    const ctrl = createSyncController({
      api,
      storage,
      getLocal: () => makeProgressLocal(),
      applyRestored: () => {
        restoredCalls += 1
      },
      catalog: CATALOG,
      starterHeroNames: STARTERS,
      now: timers.now,
      setTimer: timers.setTimer,
      clearTimer: timers.clearTimer,
    })

    await ctrl.start('user-1')
    assert.equal(ctrl.getSnapshot().status, 'conflict')
    assert.equal(restoredCalls, 0)
  })

  it('8. row 2: cloud null + non-fresh local -> PUT baseVersion 0 -> synced with stored baseVersion', async () => {
    const storage = createFakeStorage()
    const timers = createFakeTimers()
    const putCalls = []

    const api = {
      async get() {
        return { kind: 'ok', save: null, legacyAvailable: false }
      },
      async put(data, baseVersion) {
        putCalls.push({ data, baseVersion })
        return { kind: 'ok', version: 1, updated_at: '2026-01-01T00:00:00Z' }
      },
      putKeepalive: () => false,
      async importLegacy() {
        throw new Error('unexpected import')
      },
    }

    const ctrl = createSyncController({
      api,
      storage,
      getLocal: () => makeProgressLocal(),
      applyRestored: () => {},
      catalog: CATALOG,
      starterHeroNames: STARTERS,
      now: timers.now,
      setTimer: timers.setTimer,
      clearTimer: timers.clearTimer,
    })

    await ctrl.start('user-1')
    assert.equal(putCalls.length, 1)
    assert.equal(putCalls[0].baseVersion, 0)
    assert.equal(ctrl.getSnapshot().status, 'synced')
    const stored = loadSyncState(false, storage)
    assert.equal(stored.baseVersion, 1)
    assert.equal(stored.userId, 'user-1')
  })

  it('9. row 5: stored {userId:U, baseVersion:2, dirty:false} + cloud v3 -> applyRestored once, baseVersion 3', async () => {
    const storage = createFakeStorage()
    const timers = createFakeTimers()
    saveSyncState(
      {
        userId: 'U',
        baseVersion: 2,
        dirty: false,
        localChangedAt: null,
        lastSyncedAt: 500,
        schemaVersion: 1,
      },
      storage,
    )

    let restoredCount = 0
    const cloudData = toCloudSave(makeProgressLocal({ gold: 7777 }))
    const api = {
      async get() {
        return {
          kind: 'ok',
          save: { data: cloudData, version: 3, updated_at: '2026-01-01T00:00:00Z' },
          legacyAvailable: false,
        }
      },
      async put() {
        throw new Error('unexpected put')
      },
      putKeepalive: () => false,
      async importLegacy() {
        throw new Error('unexpected import')
      },
    }

    const ctrl = createSyncController({
      api,
      storage,
      getLocal: () => makeProgressLocal(),
      applyRestored: () => {
        restoredCount += 1
      },
      catalog: CATALOG,
      starterHeroNames: STARTERS,
      now: timers.now,
      setTimer: timers.setTimer,
      clearTimer: timers.clearTimer,
    })

    await ctrl.start('U')
    assert.equal(restoredCount, 1)
    assert.equal(ctrl.getSnapshot().status, 'synced')
    assert.equal(loadSyncState(false, storage).baseVersion, 3)
  })

  it('10. 409 on push: non-null server -> conflict with both summaries; null server -> one extra PUT with baseVersion 0', async () => {
    const storage = createFakeStorage()
    const timers = createFakeTimers()
    saveSyncState(
      {
        userId: 'U',
        baseVersion: 2,
        dirty: true,
        localChangedAt: 100,
        lastSyncedAt: 50,
        schemaVersion: 1,
      },
      storage,
    )

    const cloudSummary = {
      currentStageIndex: 3,
      maxUnlockedStage: 4,
      maxTowerFloor: 2,
      rankLevel: 2,
      pvpScore: 10,
      gold: 888,
      heroCount: 1,
    }
    const clientSummary = {
      currentStageIndex: 0,
      maxUnlockedStage: 5,
      maxTowerFloor: 4,
      rankLevel: 3,
      pvpScore: 0,
      gold: 2500,
      heroCount: 1,
    }

    let mode = 'server_present'
    const putBaseVersions = []

    const api = {
      async get() {
        return {
          kind: 'ok',
          save: {
            data: toCloudSave(makeProgressLocal({ gold: 888 })),
            version: 2,
            updated_at: '2026-01-01T00:00:00Z',
          },
          legacyAvailable: false,
        }
      },
      async put(_data, baseVersion) {
        putBaseVersions.push(baseVersion)
        if (mode === 'server_present') {
          return {
            kind: 'conflict',
            info: {
              server: {
                version: 5,
                updated_at: '2026-01-02T00:00:00Z',
                schemaVersion: 1,
                summary: cloudSummary,
              },
              client: { baseVersion: 2, summary: clientSummary },
            },
          }
        }
        if (baseVersion !== 0) {
          return {
            kind: 'conflict',
            info: {
              server: null,
              client: { baseVersion, summary: clientSummary },
            },
          }
        }
        return { kind: 'ok', version: 1, updated_at: '2026-01-03T00:00:00Z' }
      },
      putKeepalive: () => false,
      async importLegacy() {
        throw new Error('unexpected import')
      },
    }

    const ctrl = createSyncController({
      api,
      storage,
      getLocal: () => makeProgressLocal(),
      applyRestored: () => {},
      catalog: CATALOG,
      starterHeroNames: STARTERS,
      now: timers.now,
      setTimer: timers.setTimer,
      clearTimer: timers.clearTimer,
    })

    await ctrl.start('U')
    assert.equal(ctrl.getSnapshot().status, 'conflict')
    assert.deepEqual(ctrl.getSnapshot().conflict.server.summary, cloudSummary)
    assert.deepEqual(ctrl.getSnapshot().conflict.client.summary, clientSummary)

    mode = 'server_null'
    putBaseVersions.length = 0
    await ctrl.syncNow()
    assert.deepEqual(putBaseVersions, [2, 0])
    assert.equal(ctrl.getSnapshot().status, 'synced')
  })

  it('11. chooseLocal in conflict: writes side cloud backup BEFORE PUT, PUT uses server version', async () => {
    const events = []
    const storage = createFakeStorage(events)
    const timers = createFakeTimers()
    const cloudSave = toCloudSave(makeProgressLocal({ gold: 9000 }))
    const putBaseVersions = []

    const api = {
      async get() {
        events.push('api:get')
        return {
          kind: 'ok',
          save: { data: cloudSave, version: 7, updated_at: '2026-01-01T00:00:00Z' },
          legacyAvailable: false,
        }
      },
      async put(_data, baseVersion) {
        events.push('api:put')
        putBaseVersions.push(baseVersion)
        return { kind: 'ok', version: 8, updated_at: '2026-01-02T00:00:00Z' }
      },
      putKeepalive: () => false,
      async importLegacy() {
        throw new Error('unexpected import')
      },
    }

    const ctrl = createSyncController({
      api,
      storage,
      getLocal: () => makeProgressLocal(),
      applyRestored: () => {},
      catalog: CATALOG,
      starterHeroNames: STARTERS,
      now: timers.now,
      setTimer: timers.setTimer,
      clearTimer: timers.clearTimer,
    })

    await ctrl.start('U')
    assert.equal(ctrl.getSnapshot().status, 'conflict')

    events.length = 0
    const ok = await ctrl.chooseLocal()
    assert.equal(ok, true)
    assert.deepEqual(putBaseVersions, [7])
    const backupIdx = events.indexOf(`storage:set:${BACKUP_KEY}`)
    const putIdx = events.indexOf('api:put')
    assert.equal(backupIdx !== -1 && putIdx !== -1 && backupIdx < putIdx, true)
    assert.equal(JSON.parse(storage.getItem(BACKUP_KEY)).side, 'cloud')
  })

  it('12. chooseLocal when cloud schemaVersion is 2 -> returns false, no PUT, canKeepLocal false', async () => {
    const storage = createFakeStorage()
    const timers = createFakeTimers()
    let putCount = 0

    const api = {
      async get() {
        return {
          kind: 'ok',
          save: {
            data: { ...toCloudSave(makeProgressLocal()), schemaVersion: 2 },
            version: 5,
            updated_at: '2026-01-01T00:00:00Z',
          },
          legacyAvailable: false,
        }
      },
      async put() {
        putCount += 1
        return { kind: 'ok', version: 6, updated_at: null }
      },
      putKeepalive: () => false,
      async importLegacy() {
        throw new Error('unexpected import')
      },
    }

    const ctrl = createSyncController({
      api,
      storage,
      getLocal: () => makeProgressLocal(),
      applyRestored: () => {},
      catalog: CATALOG,
      starterHeroNames: STARTERS,
      now: timers.now,
      setTimer: timers.setTimer,
      clearTimer: timers.clearTimer,
    })

    await ctrl.start('U')
    assert.equal(ctrl.getSnapshot().status, 'cloud_unsupported')
    const ok = await ctrl.chooseLocal()
    assert.equal(ok, false)
    assert.equal(putCount, 0)
    assert.equal(ctrl.getSnapshot().canKeepLocal, false)
  })

  it('13. chooseCloud writes backup with side local and calls applyRestored', async () => {
    const storage = createFakeStorage()
    const timers = createFakeTimers()
    const cloudSave = toCloudSave(makeProgressLocal({ gold: 4321 }))
    let restoredGold = null

    const api = {
      async get() {
        return {
          kind: 'ok',
          save: { data: cloudSave, version: 4, updated_at: '2026-01-01T00:00:00Z' },
          legacyAvailable: false,
        }
      },
      async put() {
        throw new Error('unexpected put')
      },
      putKeepalive: () => false,
      async importLegacy() {
        throw new Error('unexpected import')
      },
    }

    const ctrl = createSyncController({
      api,
      storage,
      getLocal: () => makeProgressLocal({ gold: 1234 }),
      applyRestored: (s) => {
        restoredGold = s.gold
      },
      catalog: CATALOG,
      starterHeroNames: STARTERS,
      now: timers.now,
      setTimer: timers.setTimer,
      clearTimer: timers.clearTimer,
    })

    await ctrl.start('U')
    const ok = await ctrl.chooseCloud()
    assert.equal(ok, true)
    assert.equal(restoredGold, 4321)
    assert.equal(JSON.parse(storage.getItem(BACKUP_KEY)).side, 'local')
  })

  it('14. undoLastChoice after chooseCloud restores backed-up state, PUTs new version, clears backup', async () => {
    const storage = createFakeStorage()
    const timers = createFakeTimers()
    let localState = makeProgressLocal({ gold: 1111 })
    const cloudSave = toCloudSave(makeProgressLocal({ gold: 2222 }))
    const putCalls = []

    const api = {
      async get() {
        return {
          kind: 'ok',
          save: { data: cloudSave, version: 4, updated_at: '2026-01-01T00:00:00Z' },
          legacyAvailable: false,
        }
      },
      async put(data, baseVersion) {
        putCalls.push({ data, baseVersion })
        return { kind: 'ok', version: 5, updated_at: '2026-01-02T00:00:00Z' }
      },
      putKeepalive: () => false,
      async importLegacy() {
        throw new Error('unexpected import')
      },
    }

    const ctrl = createSyncController({
      api,
      storage,
      getLocal: () => localState,
      applyRestored: (s) => {
        localState = { ...localState, gold: s.gold }
      },
      catalog: CATALOG,
      starterHeroNames: STARTERS,
      now: timers.now,
      setTimer: timers.setTimer,
      clearTimer: timers.clearTimer,
    })

    await ctrl.start('U')
    await ctrl.chooseCloud()
    assert.equal(localState.gold, 2222)

    const undone = await ctrl.undoLastChoice()
    assert.equal(undone, true)
    assert.equal(localState.gold, 1111)
    assert.equal(putCalls.length, 1)
    assert.equal(putCalls[0].baseVersion, 4)
    assert.equal(putCalls[0].data.gold, 1111)
    assert.equal(storage.getItem(BACKUP_KEY), null)
  })

  it('15. notifyLocalChange during applyRestored is ignored', async () => {
    const storage = createFakeStorage()
    const timers = createFakeTimers()
    saveSyncState(
      {
        userId: 'U',
        baseVersion: 1,
        dirty: false,
        localChangedAt: null,
        lastSyncedAt: 100,
        schemaVersion: 1,
      },
      storage,
    )

    let ctrl
    const api = {
      async get() {
        return {
          kind: 'ok',
          save: {
            data: toCloudSave(makeProgressLocal()),
            version: 2,
            updated_at: '2026-01-01T00:00:00Z',
          },
          legacyAvailable: false,
        }
      },
      async put() {
        throw new Error('unexpected put')
      },
      putKeepalive: () => false,
      async importLegacy() {
        throw new Error('unexpected import')
      },
    }

    ctrl = createSyncController({
      api,
      storage,
      getLocal: () => makeProgressLocal(),
      applyRestored: () => {
        ctrl.notifyLocalChange()
      },
      catalog: CATALOG,
      starterHeroNames: STARTERS,
      now: timers.now,
      setTimer: timers.setTimer,
      clearTimer: timers.clearTimer,
    })

    await ctrl.start('U')
    assert.equal(loadSyncState(false, storage).dirty, false)
    assert.equal(timers.pendingCount(), 0)
  })

  it('16. debounce: 0s, 30s, 59s -> no PUT before 60s after last change; continuous changes cap at 120s', async () => {
    const storage = createFakeStorage()
    const timers = createFakeTimers(0)
    let cloudVersion = 1
    const putTimes = []

    const api = {
      async get() {
        return {
          kind: 'ok',
          save: {
            data: toCloudSave(makeProgressLocal()),
            version: cloudVersion,
            updated_at: '2026-01-01T00:00:00Z',
          },
          legacyAvailable: false,
        }
      },
      async put(_data, baseVersion) {
        putTimes.push({ at: timers.now(), baseVersion })
        cloudVersion += 1
        return { kind: 'ok', version: cloudVersion, updated_at: null }
      },
      putKeepalive: () => false,
      async importLegacy() {
        throw new Error('unexpected import')
      },
    }

    saveSyncState(
      {
        userId: 'U',
        baseVersion: 1,
        dirty: false,
        localChangedAt: null,
        lastSyncedAt: 0,
        schemaVersion: 1,
      },
      storage,
    )

    const ctrl = createSyncController({
      api,
      storage,
      getLocal: () => makeProgressLocal(),
      applyRestored: () => {},
      catalog: CATALOG,
      starterHeroNames: STARTERS,
      now: timers.now,
      setTimer: timers.setTimer,
      clearTimer: timers.clearTimer,
    })

    await ctrl.start('U')
    assert.equal(putTimes.length, 0)

    // First burst: t=0, 30s, 59s -> fires at 59s + 60s = 119s
    ctrl.notifyLocalChange()
    await timers.advanceBy(30_000)
    ctrl.notifyLocalChange()
    await timers.advanceBy(29_000)
    ctrl.notifyLocalChange()
    await timers.advanceBy(59_000)
    assert.equal(putTimes.length, 0)
    await timers.advanceBy(1_000)
    assert.equal(putTimes.length, 1)
    assert.equal(putTimes[0].at, 119_000)

    // Continuous changes every 30s -> capped at 120s
    const start2 = timers.now()
    ctrl.notifyLocalChange()
    await timers.advanceBy(30_000)
    ctrl.notifyLocalChange()
    await timers.advanceBy(30_000)
    ctrl.notifyLocalChange()
    await timers.advanceBy(30_000)
    ctrl.notifyLocalChange()
    assert.equal(putTimes.length, 1)
    await timers.advanceBy(30_000)
    assert.equal(putTimes.length, 2)
    assert.equal(putTimes[1].at - start2, 120_000)
  })

  it('17. disabled: get -> disabled -> notifyLocalChange schedules nothing and syncNow does no fetch', async () => {
    const storage = createFakeStorage()
    const timers = createFakeTimers()
    let getCalls = 0

    const api = {
      async get() {
        getCalls += 1
        return { kind: 'disabled' }
      },
      async put() {
        throw new Error('unexpected put')
      },
      putKeepalive: () => false,
      async importLegacy() {
        throw new Error('unexpected import')
      },
    }

    const ctrl = createSyncController({
      api,
      storage,
      getLocal: () => makeProgressLocal(),
      applyRestored: () => {},
      catalog: CATALOG,
      starterHeroNames: STARTERS,
      now: timers.now,
      setTimer: timers.setTimer,
      clearTimer: timers.clearTimer,
    })

    await ctrl.start('U')
    assert.equal(ctrl.getSnapshot().status, 'disabled')
    assert.equal(getCalls, 1)

    ctrl.notifyLocalChange()
    assert.equal(timers.pendingCount(), 0)
    await ctrl.syncNow()
    assert.equal(getCalls, 1)
  })

  it('18. M3 account mismatch: stored userId A, start(B) -> account_mismatch; chooseLocal keeps local with 0 PUTs; next start(B) -> idle + local_only', async () => {
    const storage = createFakeStorage()
    const timers = createFakeTimers()
    let putCalls = 0
    saveSyncState(
      {
        userId: 'A',
        baseVersion: 2,
        dirty: false,
        localChangedAt: null,
        lastSyncedAt: 100,
        schemaVersion: 1,
      },
      storage,
    )

    const api = {
      async get() {
        return {
          kind: 'ok',
          save: {
            data: toCloudSave(makeProgressLocal()),
            version: 5,
            updated_at: '2026-01-01T00:00:00Z',
          },
          legacyAvailable: false,
        }
      },
      async put() {
        putCalls += 1
        return { kind: 'ok', version: 6, updated_at: '2026-01-02T00:00:00Z' }
      },
      putKeepalive: () => false,
      async importLegacy() {
        throw new Error('unexpected import')
      },
    }

    const ctrl = createSyncController({
      api,
      storage,
      getLocal: () => makeProgressLocal(),
      applyRestored: () => {},
      catalog: CATALOG,
      starterHeroNames: STARTERS,
      now: timers.now,
      setTimer: timers.setTimer,
      clearTimer: timers.clearTimer,
    })

    await ctrl.start('B')
    assert.equal(ctrl.getSnapshot().status, 'account_mismatch')

    const ok = await ctrl.chooseLocal()
    assert.equal(ok, true)
    assert.equal(putCalls, 0)
    assert.equal(isKeepLocalRemembered('A', 'B', storage), true)
    assert.equal(ctrl.getSnapshot().status, 'idle')
    assert.equal(ctrl.getSnapshot().notice, 'local_only')
    assert.equal(loadSyncState(false, storage).userId, 'A')

    ctrl.notifyLocalChange()
    assert.equal(timers.pendingCount(), 0)

    await ctrl.start('B')
    assert.equal(ctrl.getSnapshot().status, 'idle')
    assert.equal(ctrl.getSnapshot().notice, 'local_only')
    assert.equal(putCalls, 0)
  })

  it('19. locks: every network op goes through locks.request(vv-cloud-sync, ...)', async () => {
    const storage = createFakeStorage()
    const timers = createFakeTimers()
    const lockNames = []

    const api = {
      async get() {
        return {
          kind: 'ok',
          save: {
            data: toCloudSave(makeProgressLocal()),
            version: 1,
            updated_at: '2026-01-01T00:00:00Z',
          },
          legacyAvailable: false,
        }
      },
      async put() {
        return { kind: 'ok', version: 2, updated_at: null }
      },
      putKeepalive: () => false,
      async importLegacy() {
        return { kind: 'ok', version: 1, updated_at: null }
      },
    }

    const ctrl = createSyncController({
      api,
      storage,
      getLocal: () => makeProgressLocal(),
      applyRestored: () => {},
      catalog: CATALOG,
      starterHeroNames: STARTERS,
      now: timers.now,
      setTimer: timers.setTimer,
      clearTimer: timers.clearTimer,
      locks: {
        async request(name, cb) {
          lockNames.push(name)
          return await cb()
        },
      },
    })

    await ctrl.start('U')
    await ctrl.chooseCloud()
    await ctrl.chooseLocal()
    await ctrl.importLegacy()
    assert.deepEqual(lockNames, [
      'vv-cloud-sync',
      'vv-cloud-sync',
      'vv-cloud-sync',
      'vv-cloud-sync',
    ])
  })

  it('21. M2.5: flushKeepalive onOk updates stored baseVersion to N+1 and dirty to false', async () => {
    const storage = createFakeStorage()
    const timers = createFakeTimers(5_000_000)
    saveSyncState(
      {
        userId: 'U',
        baseVersion: 1,
        dirty: false,
        localChangedAt: null,
        lastSyncedAt: 100,
        schemaVersion: 1,
      },
      storage,
    )

    let pendingOnOk = null
    const api = {
      async get() {
        return {
          kind: 'ok',
          save: {
            data: toCloudSave(makeProgressLocal()),
            version: 1,
            updated_at: 't1',
          },
          legacyAvailable: false,
        }
      },
      async put() {
        throw new Error('unexpected put')
      },
      putKeepalive(_data, _baseVersion, onOk) {
        pendingOnOk = onOk
        return true
      },
      async importLegacy() {
        throw new Error('unexpected import')
      },
    }

    const ctrl = createSyncController({
      api,
      storage,
      getLocal: () => makeProgressLocal(),
      applyRestored: () => {},
      catalog: CATALOG,
      starterHeroNames: STARTERS,
      now: timers.now,
      setTimer: timers.setTimer,
      clearTimer: timers.clearTimer,
    })

    await ctrl.start('U')
    ctrl.notifyLocalChange()
    ctrl.flushKeepalive()
    assert.equal(typeof pendingOnOk, 'function')

    pendingOnOk(2, 't2')
    await Promise.resolve()
    await Promise.resolve()

    const stored = loadSyncState(false, storage)
    assert.equal(stored.baseVersion, 2)
    assert.equal(stored.dirty, false)
  })

  it('22. S2: reloadFromStorage calls reloadLocal once when another tab advances baseVersion and ignores notifyLocalChange', async () => {
    const storage = createFakeStorage()
    const timers = createFakeTimers()
    let cloudVersion = 1
    let reloadCalls = 0
    saveSyncState(
      {
        userId: 'U',
        baseVersion: 1,
        dirty: false,
        localChangedAt: null,
        lastSyncedAt: 100,
        schemaVersion: 1,
      },
      storage,
    )

    const api = {
      async get() {
        return {
          kind: 'ok',
          save: {
            data: toCloudSave(makeProgressLocal()),
            version: cloudVersion,
            updated_at: 't1',
          },
          legacyAvailable: false,
        }
      },
      async put() {
        cloudVersion += 1
        return { kind: 'ok', version: cloudVersion, updated_at: 't2' }
      },
      putKeepalive: () => false,
      async importLegacy() {
        throw new Error('unexpected import')
      },
    }

    const ctrlA = createSyncController({
      api,
      storage,
      getLocal: () => makeProgressLocal(),
      applyRestored: () => {},
      catalog: CATALOG,
      starterHeroNames: STARTERS,
      now: timers.now,
      setTimer: timers.setTimer,
      clearTimer: timers.clearTimer,
    })

    let ctrlB
    ctrlB = createSyncController({
      api,
      storage,
      getLocal: () => makeProgressLocal(),
      applyRestored: () => {},
      reloadLocal: () => {
        reloadCalls += 1
        ctrlB.notifyLocalChange()
      },
      catalog: CATALOG,
      starterHeroNames: STARTERS,
      now: timers.now,
      setTimer: timers.setTimer,
      clearTimer: timers.clearTimer,
    })

    await ctrlA.start('U')
    await ctrlB.start('U')

    ctrlA.notifyLocalChange()
    await ctrlA.syncNow()
    assert.equal(loadSyncState(false, storage).baseVersion, 2)

    ctrlB.reloadFromStorage()
    assert.equal(reloadCalls, 1)
    assert.equal(loadSyncState(false, storage).dirty, false)
    assert.equal(timers.pendingCount(), 0)

    ctrlB.reloadFromStorage()
    assert.equal(reloadCalls, 1)
  })

  it('23. S4: PUT 400 unsupported_schema sets status cloud_unsupported and canKeepLocal false', async () => {
    const storage = createFakeStorage()
    const timers = createFakeTimers()
    const api = {
      async get() {
        return { kind: 'ok', save: null, legacyAvailable: false }
      },
      async put() {
        return { kind: 'rejected', status: 400, code: 'unsupported_schema' }
      },
      putKeepalive: () => false,
      async importLegacy() {
        throw new Error('unexpected import')
      },
    }

    const ctrl = createSyncController({
      api,
      storage,
      getLocal: () => makeProgressLocal(),
      applyRestored: () => {},
      catalog: CATALOG,
      starterHeroNames: STARTERS,
      now: timers.now,
      setTimer: timers.setTimer,
      clearTimer: timers.clearTimer,
    })

    await ctrl.start('U')
    assert.equal(ctrl.getSnapshot().status, 'cloud_unsupported')
    assert.equal(ctrl.getSnapshot().canKeepLocal, false)
  })

  it('24. S5: importLegacy 409 conflict sets notice import_exists, runs syncNow, returns false, clears on dismiss', async () => {
    const storage = createFakeStorage()
    const timers = createFakeTimers()
    let getCalls = 0
    let cloudSave = null

    const api = {
      async get() {
        getCalls += 1
        return {
          kind: 'ok',
          save: cloudSave,
          legacyAvailable: cloudSave === null,
        }
      },
      async put() {
        throw new Error('unexpected put')
      },
      putKeepalive: () => false,
      async importLegacy() {
        cloudSave = {
          data: toCloudSave(makeProgressLocal({ gold: 5000 })),
          version: 1,
          updated_at: 't1',
        }
        return {
          kind: 'conflict',
          info: {
            server: {
              version: 1,
              updated_at: 't1',
              schemaVersion: 1,
              summary: null,
            },
            client: {
              baseVersion: 0,
              summary: {
                currentStageIndex: 0,
                maxUnlockedStage: 0,
                maxTowerFloor: 1,
                rankLevel: 1,
                pvpScore: 0,
                gold: 500,
                heroCount: 1,
              },
            },
          },
        }
      },
    }

    const ctrl = createSyncController({
      api,
      storage,
      getLocal: () => makeLocal(),
      applyRestored: () => {},
      catalog: CATALOG,
      starterHeroNames: STARTERS,
      now: timers.now,
      setTimer: timers.setTimer,
      clearTimer: timers.clearTimer,
    })

    await ctrl.start('U')
    assert.equal(ctrl.getSnapshot().status, 'offer_import')

    const ok = await ctrl.importLegacy()
    assert.equal(ok, false)
    assert.equal(ctrl.getSnapshot().notice, 'import_exists')
    assert.equal(getCalls >= 2, true)

    ctrl.dismiss()
    assert.equal(ctrl.getSnapshot().notice, null)
  })

  it('20. no console.log calls during the whole suite', () => {
    assert.equal(consoleLogCalls, 0)
    assert.throws(() => console.log('forbidden'), /console\.log is forbidden/)
    consoleLogCalls = 0
  })
})
