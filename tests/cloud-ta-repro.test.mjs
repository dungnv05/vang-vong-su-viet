import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { createCloudApi } from '../src/cloud/cloudApi.ts'
import { createSyncController } from '../src/cloud/syncController.ts'
import { toCloudSave } from '../src/cloud/saveFormat.ts'
import { loadSyncState, saveSyncState } from '../src/cloud/syncState.ts'

function createFakeStorage(){const map=new Map();return{getItem:k=>map.has(k)?map.get(k):null,setItem:(k,v)=>{map.set(k,String(v))},removeItem:k=>{map.delete(k)}}}
function createFakeTimers(startMs=1_000_000){let currentMs=startMs,nextId=1;const timers=new Map();return{now:()=>currentMs,setTimer(fn,ms){const id=nextId++;timers.set(id,{at:currentMs+ms,fn});return id},clearTimer(id){timers.delete(id)}}}
function makeResponse(status,body,headersObj={}){return{status,ok:status>=200&&status<300,headers:new Headers(headersObj),async json(){return body}}}
const CATALOG={heroTemplates:[{name:'Trần Hưng Đạo',atk:100,maxHp:800,level:1,stars:1,maxRage:100,role:'tank'},{name:'Hai Bà Trưng',atk:140,maxHp:650,level:1,stars:1,maxRage:120,role:'dps'}],items:[{id:'sword_1',statBonus:{atk:45}},{id:'armor_1',statBonus:{hp:200,atk:10}}]}
const STARTERS=['Trần Hưng Đạo']
function makeLocal(o={}){return{gold:500,heroes:[{id:'h1',name:'Trần Hưng Đạo',level:1,stars:1,slotIndex:0,equippedItemIds:[]}],shards:{'Trần Hưng Đạo':5},currentStageIndex:0,maxUnlockedStage:0,towerFloor:1,maxTowerFloor:1,worldBossTotalDamage:0,pvpRank:100,pvpScore:0,rankLevel:1,activeBeastId:'beast_1',lastIdleClaimTime:1700000000000,battleSpeed:1,isMuted:false,...o}}
function makeProgressLocal(o={}){return makeLocal({gold:2500,maxUnlockedStage:5,maxTowerFloor:4,rankLevel:3,...o})}
function fakeServer(initial){const s={row:initial,puts:[]};const api={async get(){return{kind:'ok',save:s.row?{...s.row}:null,legacyAvailable:false}},async put(data,baseVersion){s.puts.push(baseVersion);if(api.onPut)await api.onPut();const cur=s.row?s.row.version:0;if(baseVersion!==cur)return{kind:'conflict',info:{server:{version:cur,updated_at:'x',schemaVersion:1,summary:null},client:{baseVersion,summary:null}}};s.row={data,version:cur+1,updated_at:'t'+(cur+1)};return{kind:'ok',version:cur+1,updated_at:s.row.updated_at}},putKeepalive(data,baseVersion){const cur=s.row?s.row.version:0;if(baseVersion===cur)s.row={data,version:cur+1,updated_at:'k'+(cur+1)};return true},async importLegacy(){throw new Error('no')}};return{s,api}}

describe('TA repro regressions (fixed)', () => {
  it('R1: keepalive followed by syncNow adopts version 2 without conflict', async () => {
    const storage = createFakeStorage()
    const timers = createFakeTimers()
    let local = makeProgressLocal({ gold: 100 })
    const { s, api } = fakeServer({
      data: toCloudSave(local),
      version: 1,
      updated_at: 't1',
    })
    saveSyncState(
      {
        userId: 'U',
        baseVersion: 1,
        dirty: false,
        localChangedAt: null,
        lastSyncedAt: 1,
        schemaVersion: 1,
      },
      storage,
    )

    const ctrl = createSyncController({
      api,
      storage,
      getLocal: () => local,
      applyRestored: () => {},
      catalog: CATALOG,
      starterHeroNames: STARTERS,
      now: timers.now,
      setTimer: timers.setTimer,
      clearTimer: timers.clearTimer,
    })

    await ctrl.start('U')
    assert.equal(ctrl.getSnapshot().status, 'synced')

    local = makeProgressLocal({ gold: 200 })
    ctrl.notifyLocalChange()
    ctrl.flushKeepalive()
    assert.equal(s.row.version, 2)

    await ctrl.syncNow()
    assert.notEqual(ctrl.getSnapshot().status, 'conflict')
    assert.equal(loadSyncState(false, storage).baseVersion, 2)
  })

  it('R2: createCloudApi.get maps snake_case legacy_available to legacyAvailable', async () => {
    const api = createCloudApi({
      fetch: async () => makeResponse(200, { ok: true, save: null, legacy_available: true }),
      readCsrf: () => 'csrf',
      refresh: async () => 'failed',
      sleep: async () => {},
    })

    const res = await api.get()
    assert.equal(res.kind, 'ok')
    if (res.kind === 'ok') {
      assert.equal(res.legacyAvailable, true)
    }
  })

  it('R3: local change during in-flight PUT keeps stored dirty === true', async () => {
    const storage = createFakeStorage()
    const timers = createFakeTimers()
    let local = makeProgressLocal({ gold: 100 })
    const { api } = fakeServer({
      data: toCloudSave(local),
      version: 1,
      updated_at: 't1',
    })
    saveSyncState(
      {
        userId: 'U',
        baseVersion: 1,
        dirty: true,
        localChangedAt: 1,
        lastSyncedAt: 1,
        schemaVersion: 1,
      },
      storage,
    )

    const ctrl = createSyncController({
      api,
      storage,
      getLocal: () => local,
      applyRestored: () => {},
      catalog: CATALOG,
      starterHeroNames: STARTERS,
      now: timers.now,
      setTimer: timers.setTimer,
      clearTimer: timers.clearTimer,
    })

    api.onPut = async () => {
      local = makeProgressLocal({ gold: 300 })
      ctrl.notifyLocalChange()
    }

    await ctrl.start('U')
    assert.equal(loadSyncState(false, storage).dirty, true)
  })
})
