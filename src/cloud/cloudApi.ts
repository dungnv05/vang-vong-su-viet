import type { CloudSaveV1, SaveSummary } from './saveFormat.ts'

export const SAVE_ENDPOINT_BASE = 'https://www.yundev.space'
export const KEEPALIVE_MAX_BYTES = 60000

export type RefreshOutcome = 'ok' | 'retry' | 'failed'

export interface CloudApiDeps {
  fetch: typeof fetch
  readCsrf: () => string
  refresh: () => Promise<RefreshOutcome>
  sleep: (ms: number) => Promise<void>
  random?: () => number
  base?: string
}

export type ServerRow = {
  data: unknown
  version: number
  updated_at: string
}

export type ConflictInfo = {
  server: {
    version: number
    updated_at: string
    schemaVersion: number | null
    summary: SaveSummary | null
    invalid?: boolean
  } | null
  client: {
    baseVersion: number
    summary: SaveSummary
  }
}

export type ApiResult<T> =
  | ({ kind: 'ok' } & T)
  | { kind: 'conflict'; info: ConflictInfo }
  | { kind: 'disabled' }
  | { kind: 'unavailable' }
  | { kind: 'unauthorized' }
  | { kind: 'rate_limited'; retryAfterSec: number }
  | { kind: 'rejected'; status: number; code: string }
  | { kind: 'offline' }

export interface CloudApi {
  get(): Promise<ApiResult<{ save: ServerRow | null; legacyAvailable: boolean }>>
  put(
    data: CloudSaveV1,
    baseVersion: number,
  ): Promise<ApiResult<{ version: number; updated_at: string | null }>>
  putKeepalive(data: CloudSaveV1, baseVersion: number): boolean
  importLegacy(): Promise<ApiResult<{ version: number; updated_at: string | null }>>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

async function parseJsonSafe(
  res: Response,
): Promise<{ ok: true; value: unknown } | { ok: false }> {
  try {
    const value: unknown = await res.json()
    return { ok: true, value }
  } catch {
    return { ok: false }
  }
}

function parseRetryAfterSec(res: Response): number {
  const raw = res.headers?.get?.('Retry-After')
  if (!raw) return 60
  const parsed = Number.parseInt(raw, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 60
}

export function createCloudApi(deps: CloudApiDeps): CloudApi {
  const base = (deps.base ?? SAVE_ENDPOINT_BASE).replace(/\/+$/, '')
  const saveUrl = `${base}/api/save?game=vang-vong&slot=0`
  const importUrl = `${base}/api/save?game=vang-vong&slot=0&action=import`

  async function fetchWithRefresh(
    url: string,
    buildInit: () => RequestInit,
  ): Promise<
    | { kind: 'response'; res: Response }
    | { kind: 'offline' }
    | { kind: 'unauthorized' }
  > {
    let res: Response
    try {
      res = await deps.fetch(url, buildInit())
    } catch {
      return { kind: 'offline' }
    }

    if (res.status !== 401) {
      return { kind: 'response', res }
    }

    let outcome = await deps.refresh()
    if (outcome === 'retry') {
      const rand = deps.random ? deps.random() : Math.random()
      await deps.sleep(300 + Math.floor(rand * 500))
      outcome = await deps.refresh()
    }

    if (outcome !== 'ok') {
      return { kind: 'unauthorized' }
    }

    let retryRes: Response
    try {
      retryRes = await deps.fetch(url, buildInit())
    } catch {
      return { kind: 'offline' }
    }

    if (retryRes.status === 401) {
      return { kind: 'unauthorized' }
    }

    return { kind: 'response', res: retryRes }
  }

  async function mapErrorResponse<T>(res: Response): Promise<ApiResult<T>> {
    if (res.status === 503) {
      const parsed = await parseJsonSafe(res)
      if (parsed.ok && isRecord(parsed.value) && parsed.value.error === 'cloud_save_disabled') {
        return { kind: 'disabled' }
      }
      return { kind: 'unavailable' }
    }

    if (res.status >= 500) {
      return { kind: 'unavailable' }
    }

    if (res.status === 429) {
      return { kind: 'rate_limited', retryAfterSec: parseRetryAfterSec(res) }
    }

    if (res.status === 409) {
      const parsed = await parseJsonSafe(res)
      if (parsed.ok && isRecord(parsed.value) && parsed.value.error === 'version_conflict') {
        return {
          kind: 'conflict',
          info: {
            server: (parsed.value.server as ConflictInfo['server']) ?? null,
            client: parsed.value.client as ConflictInfo['client'],
          },
        }
      }
      const code =
        parsed.ok && isRecord(parsed.value) && typeof parsed.value.error === 'string'
          ? parsed.value.error
          : 'unknown'
      return { kind: 'rejected', status: 409, code }
    }

    const parsed = await parseJsonSafe(res)
    const code =
      parsed.ok && isRecord(parsed.value) && typeof parsed.value.error === 'string'
        ? parsed.value.error
        : 'unknown'
    return { kind: 'rejected', status: res.status, code }
  }

  return {
    async get(): Promise<ApiResult<{ save: ServerRow | null; legacyAvailable: boolean }>> {
      const fetched = await fetchWithRefresh(saveUrl, () => ({
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      }))
      if (fetched.kind !== 'response') return fetched

      const { res } = fetched
      if (!res.ok) {
        return mapErrorResponse(res)
      }

      const parsed = await parseJsonSafe(res)
      if (!parsed.ok || !isRecord(parsed.value)) {
        return { kind: 'unavailable' }
      }

      const rawSave = parsed.value.save
      let save: ServerRow | null = null
      if (
        isRecord(rawSave) &&
        typeof rawSave.version === 'number' &&
        typeof rawSave.updated_at === 'string'
      ) {
        save = {
          data: rawSave.data,
          version: rawSave.version,
          updated_at: rawSave.updated_at,
        }
      }

      return {
        kind: 'ok',
        save,
        legacyAvailable: Boolean(parsed.value.legacyAvailable),
      }
    },

    async put(
      data: CloudSaveV1,
      baseVersion: number,
    ): Promise<ApiResult<{ version: number; updated_at: string | null }>> {
      const body = JSON.stringify({ data, baseVersion })
      const fetched = await fetchWithRefresh(saveUrl, () => ({
        method: 'PUT',
        credentials: 'include',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': deps.readCsrf(),
        },
        body,
      }))
      if (fetched.kind !== 'response') return fetched

      const { res } = fetched
      if (!res.ok) {
        return mapErrorResponse(res)
      }

      const parsed = await parseJsonSafe(res)
      if (!parsed.ok || !isRecord(parsed.value) || typeof parsed.value.version !== 'number') {
        return { kind: 'unavailable' }
      }

      return {
        kind: 'ok',
        version: parsed.value.version,
        updated_at: typeof parsed.value.updated_at === 'string' ? parsed.value.updated_at : null,
      }
    },

    putKeepalive(data: CloudSaveV1, baseVersion: number): boolean {
      const csrf = deps.readCsrf()
      if (!csrf) return false

      const body = JSON.stringify({ data, baseVersion })
      const byteLength = new TextEncoder().encode(body).byteLength
      if (byteLength > KEEPALIVE_MAX_BYTES) return false

      void Promise.resolve(
        deps.fetch(saveUrl, {
          method: 'PUT',
          keepalive: true,
          credentials: 'include',
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': csrf,
          },
          body,
        }),
      ).catch(() => {})

      return true
    },

    async importLegacy(): Promise<ApiResult<{ version: number; updated_at: string | null }>> {
      const fetched = await fetchWithRefresh(importUrl, () => ({
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': deps.readCsrf(),
        },
        body: '{}',
      }))
      if (fetched.kind !== 'response') return fetched

      const { res } = fetched
      if (!res.ok) {
        return mapErrorResponse(res)
      }

      const parsed = await parseJsonSafe(res)
      if (!parsed.ok || !isRecord(parsed.value) || typeof parsed.value.version !== 'number') {
        return { kind: 'unavailable' }
      }

      return {
        kind: 'ok',
        version: parsed.value.version,
        updated_at: typeof parsed.value.updated_at === 'string' ? parsed.value.updated_at : null,
      }
    },
  }
}
