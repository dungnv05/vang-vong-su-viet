import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { createCloudApi } from '../src/cloud/cloudApi.ts'
import { createSyncController } from '../src/cloud/syncController.ts'
import { toCloudSave } from '../src/cloud/saveFormat.ts'
import {
  loadSyncState,
  saveSyncState,
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

const STARTERS = [{ name: 'Trần Hưng Đạo', level: 1, stars: 1 }]

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


function fakeServer(initial, legacy = false) {
  const s = { row: initial, puts: [], keepalives: [] }
  const api = {
    async get() { return { kind: 'ok', save: s.row ? { ...s.row } : null, legacyAvailable: legacy && !s.row } },
    async put(data, baseVersion) {
      s.puts.push(baseVersion)
      if (api.onPut) await api.onPut()
      const cur = s.row ? s.row.version : 0
      if (baseVersion !== cur) return { kind: 'conflict', info: { server: s.row ? { version: cur, updated_at: 'x', schemaVersion: 1, summary: null } : null, client: { baseVersion, summary: null } } }
      s.row = { data, version: cur + 1, updated_at: 't' + (cur + 1) }
      return { kind: 'ok', version: cur + 1, updated_at: s.row.updated_at }
    },
    putKeepalive(data, baseVersion, onOk) {
      s.keepalives.push(baseVersion)
      const cur = s.row ? s.row.version : 0
      if (baseVersion === cur) { s.row = { data, version: cur + 1, updated_at: 'k' + (cur + 1) }; onOk && onOk(cur + 1) }
      return true
    },
    async importLegacy() { return { kind: 'conflict', info: { server: null, client: { baseVersion: 0, summary: null } } } },
  }
  return { s, api }
}
const mk = (api, storage, timers, getLocal) => createSyncController({ api, storage, getLocal, applyRestored: () => {}, catalog: CATALOG, starters: STARTERS, now: timers.now, setTimer: timers.setTimer, clearTimer: timers.clearTimer })
const tick = () => new Promise((r) => setTimeout(r, 0))

describe('TA r2 repro (fixed behaviour asserted)', () => {
  it('R1 keepalive then sync -> no conflict', async () => {
    const storage = createFakeStorage(); const timers = createFakeTimers()
    let local = makeProgressLocal({ gold: 100 })
    const { s, api } = fakeServer({ data: toCloudSave(local), version: 1, updated_at: 't1' })
    saveSyncState({ userId: 'U', baseVersion: 1, dirty: false, localChangedAt: null, lastSyncedAt: 1, schemaVersion: 1 }, storage)
    const ctrl = mk(api, storage, timers, () => local)
    await ctrl.start('U'); local = makeProgressLocal({ gold: 200 }); ctrl.notifyLocalChange(); ctrl.flushKeepalive(); await tick()
    await ctrl.syncNow()
    assert.equal(ctrl.getSnapshot().status, 'synced'); assert.equal(loadSyncState(false, storage).baseVersion, 2)
  })
  it('R1b keepalive ack lost (tab closed) then sync -> still no conflict (sameSave)', async () => {
    const storage = createFakeStorage(); const timers = createFakeTimers()
    let local = makeProgressLocal({ gold: 100 })
    const { s, api } = fakeServer({ data: toCloudSave(local), version: 1, updated_at: 't1' })
    const orig = api.putKeepalive; api.putKeepalive = (d, b) => orig(d, b, null)
    saveSyncState({ userId: 'U', baseVersion: 1, dirty: false, localChangedAt: null, lastSyncedAt: 1, schemaVersion: 1 }, storage)
    const ctrl = mk(api, storage, timers, () => local)
    await ctrl.start('U'); local = makeProgressLocal({ gold: 200 }); ctrl.notifyLocalChange(); ctrl.flushKeepalive()
    await ctrl.syncNow()
    assert.equal(ctrl.getSnapshot().status, 'synced'); assert.equal(loadSyncState(false, storage).baseVersion, 2)
  })
  it('R2 snake_case legacy_available parsed true', async () => {
    const api = createCloudApi({ fetch: async () => makeResponse(200, { ok: true, save: null, legacy_available: true }), readCsrf: () => 'c', refresh: async () => 'failed', sleep: async () => {} })
    assert.equal((await api.get()).legacyAvailable, true)
  })
  it('R3 in-flight change stays dirty', async () => {
    const storage = createFakeStorage(); const timers = createFakeTimers()
    let local = makeProgressLocal({ gold: 100 })
    const { s, api } = fakeServer({ data: toCloudSave(local), version: 1, updated_at: 't1' })
    saveSyncState({ userId: 'U', baseVersion: 1, dirty: true, localChangedAt: 1, lastSyncedAt: 1, schemaVersion: 1 }, storage)
    let ctrl
    api.onPut = async () => { api.onPut = null; timers.advance ? timers.advance(5) : null; local = makeProgressLocal({ gold: 300 }); ctrl.notifyLocalChange() }
    ctrl = mk(api, storage, timers, () => local)
    await ctrl.start('U')
    assert.equal(loadSyncState(false, storage).dirty, true)
  })
  it('M3 mismatch keep-local -> 0 PUT, userId stays A', async () => {
    const storage = createFakeStorage(); const timers = createFakeTimers()
    const { s, api } = fakeServer({ data: toCloudSave(makeProgressLocal({ gold: 5 })), version: 2, updated_at: 't' })
    saveSyncState({ userId: 'A', baseVersion: 2, dirty: true, localChangedAt: 1, lastSyncedAt: 1, schemaVersion: 1 }, storage)
    const ctrl = mk(api, storage, timers, () => makeProgressLocal({ gold: 777 }))
    await ctrl.start('B'); assert.equal(ctrl.getSnapshot().status, 'account_mismatch')
    await ctrl.chooseLocal(); assert.equal(s.puts.length, 0); assert.equal(loadSyncState(false, storage).userId, 'A')
    ctrl.flushKeepalive(); assert.equal(s.keepalives.length, 0)
  })
  it('PROBE K: mismatch -> "Để sau" (dismiss) -> play -> tab hidden: keepalive must NOT write A\'s save into B', async () => {
    const storage = createFakeStorage(); const timers = createFakeTimers()
    let local = makeProgressLocal({ gold: 777 })
    const { s, api } = fakeServer({ data: toCloudSave(makeProgressLocal({ gold: 5 })), version: 2, updated_at: 't' })
    saveSyncState({ userId: 'A', baseVersion: 2, dirty: false, localChangedAt: 1, lastSyncedAt: 1, schemaVersion: 1 }, storage)
    const ctrl = mk(api, storage, timers, () => local)
    await ctrl.start('B'); assert.equal(ctrl.getSnapshot().status, 'account_mismatch')
    ctrl.dismiss(); local = makeProgressLocal({ gold: 778 }); ctrl.notifyLocalChange(); ctrl.flushKeepalive(); await tick()
    assert.equal(s.row.data.gold, 5, 'B cloud save overwritten by A local via keepalive')
    assert.equal(s.keepalives.length, 0)
    assert.equal(loadSyncState(false, storage).userId, 'A')
  })
  it('PROBE U (CS-5): mismatch -> dismiss -> uploadLocal() with B having no cloud row', async () => {
    const storage = createFakeStorage(); const timers = createFakeTimers()
    const { s, api } = fakeServer(null)
    saveSyncState({ userId: 'A', baseVersion: 2, dirty: true, localChangedAt: 1, lastSyncedAt: 1, schemaVersion: 1 }, storage)
    const ctrl = mk(api, storage, timers, () => makeProgressLocal({ gold: 777 }))
    await ctrl.start('B'); const st0 = ctrl.getSnapshot().status
    ctrl.dismiss(); const ok = await ctrl.uploadLocal()
    assert.equal(ok, false)
    assert.deepEqual(s.puts, [])
    assert.equal(loadSyncState(false, storage).userId, 'A')
  })
  it('(b) non-fresh + legacy + no cloud -> offer_import, 0 PUT; keepalive also 0', async () => {
    const storage = createFakeStorage(); const timers = createFakeTimers()
    const { s, api } = fakeServer(null, true)
    const ctrl = mk(api, storage, timers, () => makeProgressLocal({ gold: 777 }))
    await ctrl.start('U'); assert.equal(ctrl.getSnapshot().status, 'offer_import'); assert.equal(s.puts.length, 0)
    ctrl.notifyLocalChange(); ctrl.flushKeepalive(); assert.equal(s.keepalives.length, 0)
    await ctrl.uploadLocal(); assert.deepEqual(s.puts, [0])
  })
})
