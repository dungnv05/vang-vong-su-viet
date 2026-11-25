import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  LEVEL_ATK,
  LEVEL_HP,
  STAR_ATK,
  STAR_HP,
  deriveHeroStats,
} from '../src/cloud/heroStats.ts'
import {
  toCloudSave,
  summarizeSave,
  isFreshLocal,
  fromCloudSave,
  sameSave,
} from '../src/cloud/saveFormat.ts'
import {
  SYNC_KEY,
  BACKUP_KEY,
  KEEP_LOCAL_KEY,
  loadSyncState,
  saveSyncState,
  markDirty,
  markSynced,
  writeBackup,
  readBackup,
  rememberKeepLocal,
  isKeepLocalRemembered,
} from '../src/cloud/syncState.ts'
import { decideSync, decideAfterConflict409 } from '../src/cloud/decide.ts'

function createFakeStorage() {
  const map = new Map()
  return {
    getItem(key) {
      return map.has(key) ? map.get(key) : null
    },
    setItem(key, value) {
      map.set(key, String(value))
    },
    removeItem(key) {
      map.delete(key)
    },
  }
}

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

function makeStarterLocal(overrides = {}) {
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
        atk: 100,
        maxHp: 800,
        hp: 800,
        rage: 0,
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
    lastIdleClaimTime: 1700000000123.9,
    battleSpeed: 1,
    isMuted: false,
    inventory: CATALOG.items,
    ...overrides,
  }
}

describe('deriveHeroStats', () => {
  it('matches step-by-step level-ups, star-up, and 2 equipped items', () => {
    const template = CATALOG.heroTemplates[0]
    let expectedAtk = template.atk
    let expectedHp = template.maxHp
    for (let i = 0; i < 3; i++) {
      expectedAtk += LEVEL_ATK
      expectedHp += LEVEL_HP
    }
    expectedAtk += STAR_ATK
    expectedHp += STAR_HP
    expectedAtk += 45 + 10
    expectedHp += 200

    const actual = deriveHeroStats(
      template,
      4,
      2,
      ['sword_1', 'armor_1'],
      CATALOG.items,
    )
    assert.deepEqual(actual, { atk: expectedAtk, maxHp: expectedHp })
  })

  it('clamps atk to >= 10 and maxHp to >= 50', () => {
    const weakTemplate = { name: 'Weak', atk: 20, maxHp: 60, level: 5, stars: 3 }
    const actual = deriveHeroStats(weakTemplate, 1, 1, [], [])
    assert.deepEqual(actual, { atk: 10, maxHp: 50 })
  })
})

describe('toCloudSave & summarizeSave', () => {
  it('outputs exact v1 keys in order, 6 hero keys, strips runtime fields & enemies, and normalizes NFC', () => {
    const decomposedName = 'Tra\u0302\u0300n Hu\u031bng \u0110a\u0323o'
    const nfcName = decomposedName.normalize('NFC')
    const local = makeStarterLocal({
      battleSpeed: 2,
      heroes: [
        {
          id: 'h1',
          name: decomposedName,
          level: 4,
          stars: 2,
          slotIndex: 0,
          equippedItemIds: ['sword_1'],
          atk: 999,
          maxHp: 9999,
          hp: 500,
          rage: 50,
        },
        {
          id: 'e1',
          name: 'Enemy',
          level: 1,
          stars: 1,
          slotIndex: 1,
          equippedItemIds: [],
          isEnemy: true,
        },
      ],
      shards: { [decomposedName]: 12 },
    })

    const saved = toCloudSave(local, 1800000000000)

    assert.deepEqual(Object.keys(saved), [
      'schemaVersion',
      'gold',
      'currentStageIndex',
      'maxUnlockedStage',
      'towerFloor',
      'maxTowerFloor',
      'worldBossTotalDamage',
      'pvpRank',
      'pvpScore',
      'rankLevel',
      'battleSpeed',
      'lastIdleClaimTime',
      'isMuted',
      'activeBeastId',
      'heroes',
      'shards',
    ])
    assert.equal('inventory' in saved, false)
    assert.equal(saved.lastIdleClaimTime, 1700000000123)
    assert.equal(saved.heroes.length, 1)
    assert.deepEqual(Object.keys(saved.heroes[0]), [
      'id',
      'name',
      'level',
      'stars',
      'slotIndex',
      'equippedItemIds',
    ])
    assert.equal(saved.heroes[0].name, nfcName)
    assert.equal('atk' in saved.heroes[0], false)
    assert.equal('maxHp' in saved.heroes[0], false)
    assert.equal('hp' in saved.heroes[0], false)
    assert.equal('rage' in saved.heroes[0], false)
    assert.deepEqual(Object.keys(saved.shards), [nfcName])
    assert.equal(saved.shards[nfcName], 12)

    const summary = summarizeSave(saved)
    assert.deepEqual(Object.keys(summary), [
      'currentStageIndex',
      'maxUnlockedStage',
      'maxTowerFloor',
      'rankLevel',
      'pvpScore',
      'gold',
      'heroCount',
    ])
    assert.equal(summary.heroCount, 1)
  })
})

describe('fromCloudSave', () => {
  it('round-trips toCloudSave -> fromCloudSave with derived stats and catalog inventory', () => {
    const local = makeStarterLocal({
      gold: 1200,
      maxUnlockedStage: 3,
      heroes: [
        {
          id: 'h1',
          name: 'Trần Hưng Đạo',
          level: 4,
          stars: 2,
          slotIndex: 2,
          equippedItemIds: ['sword_1', 'armor_1'],
        },
      ],
    })
    const cloud = toCloudSave(local)
    const res = fromCloudSave(cloud, CATALOG)
    assert.equal(res.ok, true)
    if (!res.ok) return

    const expectedStats = deriveHeroStats(
      CATALOG.heroTemplates[0],
      4,
      2,
      ['sword_1', 'armor_1'],
      CATALOG.items,
    )
    assert.equal(res.state.heroes.length, 1)
    assert.equal(res.state.heroes[0].level, 4)
    assert.equal(res.state.heroes[0].stars, 2)
    assert.equal(res.state.heroes[0].slotIndex, 2)
    assert.deepEqual(res.state.heroes[0].equippedItemIds, ['sword_1', 'armor_1'])
    assert.equal(res.state.heroes[0].atk, expectedStats.atk)
    assert.equal(res.state.heroes[0].maxHp, expectedStats.maxHp)
    assert.equal(res.state.heroes[0].hp, expectedStats.maxHp)
    assert.equal(res.state.heroes[0].rage, 0)
    assert.equal(res.state.heroes[0].maxRage, 100)
    assert.deepEqual(res.state.inventory, CATALOG.items)
  })

  it('returns unknown_catalog for unknown hero name or unknown item id', () => {
    const base = toCloudSave(makeStarterLocal())
    const badHero = {
      ...base,
      heroes: [{ ...base.heroes[0], name: 'Unknown Hero' }],
    }
    assert.deepEqual(fromCloudSave(badHero, CATALOG), {
      ok: false,
      error: 'unknown_catalog',
    })

    const badItem = {
      ...base,
      heroes: [{ ...base.heroes[0], equippedItemIds: ['missing_item'] }],
    }
    assert.deepEqual(fromCloudSave(badItem, CATALOG), {
      ok: false,
      error: 'unknown_catalog',
    })
  })

  it('returns unsupported_schema for schemaVersion 2', () => {
    const base = toCloudSave(makeStarterLocal())
    assert.deepEqual(fromCloudSave({ ...base, schemaVersion: 2 }, CATALOG), {
      ok: false,
      error: 'unsupported_schema',
    })
  })
})

describe('isFreshLocal', () => {
  const starters = [{ name: 'Trần Hưng Đạo', level: 1, stars: 1 }]

  it('returns true for default starter state and false on any progress', () => {
    assert.equal(isFreshLocal(makeStarterLocal(), starters), true)
    assert.equal(isFreshLocal(makeStarterLocal({ maxUnlockedStage: 1 }), starters), false)
    assert.equal(
      isFreshLocal(
        makeStarterLocal({
          heroes: [
            {
              id: 'h1',
              name: 'Trần Hưng Đạo',
              level: 2,
              stars: 1,
              slotIndex: 0,
              equippedItemIds: [],
            },
          ],
        }),
        starters,
      ),
      false,
    )
    assert.equal(
      isFreshLocal(
        makeStarterLocal({
          heroes: [
            {
              id: 'h1',
              name: 'Trần Hưng Đạo',
              level: 1,
              stars: 1,
              slotIndex: 0,
              equippedItemIds: [],
            },
            {
              id: 'h2',
              name: 'Hai Bà Trưng',
              level: 1,
              stars: 1,
              slotIndex: 1,
              equippedItemIds: [],
            },
          ],
        }),
        starters,
      ),
      false,
    )
  })

  it('treats starters at Lv30/5★ as fresh and Lv31 as non-fresh', () => {
    const lv30Starters = [{ name: 'A', level: 30, stars: 5 }]
    const freshLv30 = makeStarterLocal({
      maxUnlockedStage: 0,
      heroes: [
        {
          id: 'h1',
          name: 'A',
          level: 30,
          stars: 5,
          slotIndex: 0,
          equippedItemIds: [],
        },
      ],
    })
    assert.equal(isFreshLocal(freshLv30, lv30Starters), true)

    const leveledLv31 = makeStarterLocal({
      maxUnlockedStage: 0,
      heroes: [
        {
          id: 'h1',
          name: 'A',
          level: 31,
          stars: 5,
          slotIndex: 0,
          equippedItemIds: [],
        },
      ],
    })
    assert.equal(isFreshLocal(leveledLv31, lv30Starters), false)
  })
})

describe('syncState', () => {
  it('E1: empty storage sets dirty=!localIsFresh, baseVersion=0, userId=null', () => {
    const storage = createFakeStorage()
    assert.deepEqual(loadSyncState(false, storage), {
      userId: null,
      baseVersion: 0,
      dirty: true,
      localChangedAt: null,
      lastSyncedAt: null,
      schemaVersion: 1,
    })
    assert.deepEqual(loadSyncState(true, storage), {
      userId: null,
      baseVersion: 0,
      dirty: false,
      localChangedAt: null,
      lastSyncedAt: null,
      schemaVersion: 1,
    })
  })

  it('treats corrupt JSON and invalid types as missing', () => {
    const storage = createFakeStorage()
    storage.setItem(SYNC_KEY, '{not-json')
    assert.equal(loadSyncState(false, storage).dirty, true)
    assert.equal(loadSyncState(false, storage).baseVersion, 0)

    storage.setItem(
      SYNC_KEY,
      JSON.stringify({
        userId: 'u1',
        baseVersion: -1,
        dirty: false,
        localChangedAt: null,
        lastSyncedAt: null,
        schemaVersion: 1,
      }),
    )
    assert.equal(loadSyncState(false, storage).userId, null)
    assert.equal(loadSyncState(false, storage).dirty, true)
  })

  it('round-trips valid sync state and markDirty/markSynced return new objects', () => {
    const storage = createFakeStorage()
    const initial = loadSyncState(true, storage)
    const dirty = markDirty(initial, 1000)
    assert.notEqual(dirty, initial)
    assert.equal(initial.dirty, false)
    assert.equal(dirty.dirty, true)
    assert.equal(dirty.localChangedAt, 1000)

    const synced = markSynced(dirty, 'user-1', 3, 2000)
    assert.notEqual(synced, dirty)
    assert.equal(synced.userId, 'user-1')
    assert.equal(synced.baseVersion, 3)
    assert.equal(synced.dirty, false)
    assert.equal(synced.lastSyncedAt, 2000)

    saveSyncState(synced, storage)
    assert.deepEqual(loadSyncState(false, storage), synced)
  })

  it('expires backups older than 7 days and removes them', () => {
    const storage = createFakeStorage()
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000
    const backup = {
      savedAt: 1000,
      reason: 'chose_cloud',
      side: 'local',
      data: { gold: 99 },
    }
    writeBackup(backup, storage)
    assert.deepEqual(readBackup(1000 + sevenDaysMs, storage), backup)
    assert.equal(readBackup(1000 + sevenDaysMs + 1, storage), null)
    assert.equal(storage.getItem(BACKUP_KEY), null)
  })

  it('remembers keep-local pairs capped at 10 entries', () => {
    const storage = createFakeStorage()
    for (let i = 0; i < 12; i++) {
      rememberKeepLocal(null, `user-${i}`, storage)
    }
    const raw = JSON.parse(storage.getItem(KEEP_LOCAL_KEY))
    assert.equal(raw.length, 10)
    assert.equal(isKeepLocalRemembered(null, 'user-0', storage), false)
    assert.equal(isKeepLocalRemembered(null, 'user-1', storage), false)
    assert.equal(isKeepLocalRemembered(null, 'user-2', storage), true)
    assert.equal(isKeepLocalRemembered(null, 'user-11', storage), true)
  })
})

describe('decideSync & decideAfterConflict409', () => {
  const cloudV5 = { version: 5, updated_at: '2026-01-01T00:00:00Z', schemaVersion: 1 }

  it('row 0: account mismatch and keepLocalRemembered', () => {
    const sync = {
      userId: 'user-a',
      baseVersion: 2,
      dirty: false,
      localChangedAt: null,
      lastSyncedAt: 100,
      schemaVersion: 1,
    }
    assert.deepEqual(
      decideSync({
        sync,
        signedInUserId: 'user-b',
        cloud: cloudV5,
        legacyAvailable: false,
        localFresh: false,
        keepLocalRemembered: false,
      }),
      { kind: 'account_mismatch' },
    )
    assert.deepEqual(
      decideSync({
        sync,
        signedInUserId: 'user-b',
        cloud: cloudV5,
        legacyAvailable: false,
        localFresh: false,
        keepLocalRemembered: true,
      }),
      { kind: 'noop', adoptUser: false },
    )
  })

  it('E3: unsupported cloud schema is checked before pull/conflict', () => {
    const sync = loadSyncState(true, createFakeStorage())
    assert.deepEqual(
      decideSync({
        sync,
        signedInUserId: 'user-a',
        cloud: { version: 5, updated_at: '2026-01-01T00:00:00Z', schemaVersion: 2 },
        legacyAvailable: false,
        localFresh: true,
        keepLocalRemembered: false,
      }),
      { kind: 'cloud_unsupported' },
    )
  })

  it('row 1: cloud null + fresh local -> offer_import or noop(adoptUser:true)', () => {
    const sync = loadSyncState(true, createFakeStorage())
    assert.deepEqual(
      decideSync({
        sync,
        signedInUserId: 'user-a',
        cloud: null,
        legacyAvailable: true,
        localFresh: true,
        keepLocalRemembered: false,
      }),
      { kind: 'offer_import' },
    )
    assert.deepEqual(
      decideSync({
        sync,
        signedInUserId: 'user-a',
        cloud: null,
        legacyAvailable: false,
        localFresh: true,
        keepLocalRemembered: false,
      }),
      { kind: 'noop', adoptUser: true },
    )
  })

  it('row 2 (E2): cloud null + !localFresh -> first_upload even when not dirty', () => {
    const cleanSync = {
      userId: null,
      baseVersion: 0,
      dirty: false,
      localChangedAt: null,
      lastSyncedAt: null,
      schemaVersion: 1,
    }
    assert.deepEqual(
      decideSync({
        sync: cleanSync,
        signedInUserId: 'user-a',
        cloud: null,
        legacyAvailable: true,
        localFresh: false,
        keepLocalRemembered: false,
      }),
      { kind: 'first_upload', offerImport: true },
    )
  })

  it('row 3: fresh device + cloud exists -> offer_restore', () => {
    const sync = loadSyncState(true, createFakeStorage())
    assert.deepEqual(
      decideSync({
        sync,
        signedInUserId: 'user-a',
        cloud: cloudV5,
        legacyAvailable: false,
        localFresh: true,
        keepLocalRemembered: false,
      }),
      { kind: 'offer_restore' },
    )
  })

  it('row 4: cloud.version === baseVersion && dirty -> push', () => {
    const sync = {
      userId: 'user-a',
      baseVersion: 5,
      dirty: true,
      localChangedAt: 100,
      lastSyncedAt: 50,
      schemaVersion: 1,
    }
    assert.deepEqual(
      decideSync({
        sync,
        signedInUserId: 'user-a',
        cloud: cloudV5,
        legacyAvailable: false,
        localFresh: false,
        keepLocalRemembered: false,
      }),
      { kind: 'push', baseVersion: 5 },
    )
  })

  it('row 5: cloud.version > baseVersion && !dirty -> pull', () => {
    const sync = {
      userId: 'user-a',
      baseVersion: 2,
      dirty: false,
      localChangedAt: null,
      lastSyncedAt: 50,
      schemaVersion: 1,
    }
    assert.deepEqual(
      decideSync({
        sync,
        signedInUserId: 'user-a',
        cloud: cloudV5,
        legacyAvailable: false,
        localFresh: false,
        keepLocalRemembered: false,
      }),
      { kind: 'pull' },
    )
  })

  it('row 6 + E1: no sync record + local progress + cloud exists -> conflict, never pull', () => {
    const sync = loadSyncState(false, createFakeStorage())
    assert.deepEqual(
      decideSync({
        sync,
        signedInUserId: 'user-a',
        cloud: cloudV5,
        legacyAvailable: false,
        localFresh: false,
        keepLocalRemembered: false,
      }),
      { kind: 'conflict' },
    )
  })

  it('row 7: cloud.version === baseVersion && !dirty -> noop(adoptUser:true)', () => {
    const sync = {
      userId: 'user-a',
      baseVersion: 5,
      dirty: false,
      localChangedAt: null,
      lastSyncedAt: 50,
      schemaVersion: 1,
    }
    assert.deepEqual(
      decideSync({
        sync,
        signedInUserId: 'user-a',
        cloud: cloudV5,
        legacyAvailable: false,
        localFresh: false,
        keepLocalRemembered: false,
      }),
      { kind: 'noop', adoptUser: true },
    )
  })

  it('row 8: cloud.version < baseVersion -> push if dirty else reset_base', () => {
    const baseSync = {
      userId: 'user-a',
      baseVersion: 8,
      dirty: false,
      localChangedAt: null,
      lastSyncedAt: 50,
      schemaVersion: 1,
    }
    assert.deepEqual(
      decideSync({
        sync: baseSync,
        signedInUserId: 'user-a',
        cloud: cloudV5,
        legacyAvailable: false,
        localFresh: false,
        keepLocalRemembered: false,
      }),
      { kind: 'reset_base', baseVersion: 5 },
    )
    assert.deepEqual(
      decideSync({
        sync: { ...baseSync, dirty: true },
        signedInUserId: 'user-a',
        cloud: cloudV5,
        legacyAvailable: false,
        localFresh: false,
        keepLocalRemembered: false,
      }),
      { kind: 'push', baseVersion: 5 },
    )
  })

  it('decideAfterConflict409 handles null, unsupported schema, and conflict', () => {
    assert.deepEqual(decideAfterConflict409(null), {
      kind: 'first_upload',
      offerImport: false,
    })
    assert.deepEqual(
      decideAfterConflict409({ version: 2, updated_at: '2026-01-01', schemaVersion: 2 }),
      { kind: 'cloud_unsupported' },
    )
    assert.deepEqual(decideAfterConflict409(cloudV5), { kind: 'conflict' })
  })
})

describe('toCloudSave clock clamp & sameSave', () => {
  it('S3: clamps future lastIdleClaimTime to nowMs', () => {
    const local = makeStarterLocal({ lastIdleClaimTime: 9999999999999 })
    const saved = toCloudSave(local, 1700000500000.9)
    assert.equal(saved.lastIdleClaimTime, 1700000500000)
  })

  it('M2: sameSave ignores key order and lastIdleClaimTime', () => {
    const a = toCloudSave(makeStarterLocal({ lastIdleClaimTime: 1000 }), 2000)
    const b = {
      shards: { 'Trần Hưng Đạo': 5 },
      heroes: a.heroes,
      activeBeastId: 'beast_1',
      isMuted: false,
      lastIdleClaimTime: 999999,
      battleSpeed: 1,
      rankLevel: 1,
      pvpScore: 0,
      pvpRank: 100,
      worldBossTotalDamage: 0,
      maxTowerFloor: 1,
      towerFloor: 1,
      maxUnlockedStage: 0,
      currentStageIndex: 0,
      gold: 500,
      schemaVersion: 1,
    }
    assert.equal(sameSave(a, b), true)
    assert.equal(sameSave(a, { ...b, gold: 501 }), false)
    assert.equal(sameSave(null, b), false)
  })
})
