import { SUPPORTED_CLOUD_SCHEMAS } from './saveFormat.ts'
import type { SyncState } from './syncState.ts'

export type CloudRow = {
  version: number
  updated_at: string
  schemaVersion: number | null
} | null

export type Decision =
  | { kind: 'account_mismatch' }
  | { kind: 'cloud_unsupported' }
  | { kind: 'noop'; adoptUser: boolean }
  | { kind: 'offer_import' }
  | { kind: 'first_upload'; offerImport: boolean }
  | { kind: 'offer_restore' }
  | { kind: 'push'; baseVersion: number }
  | { kind: 'pull' }
  | { kind: 'conflict' }
  | { kind: 'reset_base'; baseVersion: number }

export function decideSync(input: {
  sync: SyncState
  signedInUserId: string
  cloud: CloudRow
  legacyAvailable: boolean
  localFresh: boolean
  keepLocalRemembered: boolean
}): Decision {
  const { sync, signedInUserId, cloud, legacyAvailable, localFresh, keepLocalRemembered } = input

  // Row 0: account mismatch
  if (sync.userId !== null && sync.userId !== signedInUserId) {
    return keepLocalRemembered ? { kind: 'noop', adoptUser: false } : { kind: 'account_mismatch' }
  }

  // E3: unsupported cloud schema (before rows 3-8)
  if (
    cloud !== null &&
    (cloud.schemaVersion === null || !SUPPORTED_CLOUD_SCHEMAS.includes(cloud.schemaVersion))
  ) {
    return { kind: 'cloud_unsupported' }
  }

  // Row 1 & Row 2: no cloud row yet
  if (cloud === null) {
    if (localFresh) {
      return legacyAvailable ? { kind: 'offer_import' } : { kind: 'noop', adoptUser: true }
    }
    return { kind: 'first_upload', offerImport: legacyAvailable }
  }

  // Row 3: fresh device with existing cloud save
  if (localFresh && sync.baseVersion === 0) {
    return { kind: 'offer_restore' }
  }

  // Row 5: cloud ahead, local clean -> silent pull
  if (cloud.version > sync.baseVersion && !sync.dirty) {
    return { kind: 'pull' }
  }

  // Row 6: cloud ahead, local dirty -> conflict
  if (cloud.version > sync.baseVersion && sync.dirty) {
    return { kind: 'conflict' }
  }

  // Row 4: same version, local dirty -> push
  if (cloud.version === sync.baseVersion && sync.dirty) {
    return { kind: 'push', baseVersion: sync.baseVersion }
  }

  // Row 7: same version, local clean -> noop
  if (cloud.version === sync.baseVersion && !sync.dirty) {
    return { kind: 'noop', adoptUser: true }
  }

  // Row 8: cloud.version < sync.baseVersion
  return sync.dirty
    ? { kind: 'push', baseVersion: cloud.version }
    : { kind: 'reset_base', baseVersion: cloud.version }
}

export function decideAfterConflict409(server: CloudRow): Decision {
  if (server === null) {
    return { kind: 'first_upload', offerImport: false }
  }
  if (server.schemaVersion === null || !SUPPORTED_CLOUD_SCHEMAS.includes(server.schemaVersion)) {
    return { kind: 'cloud_unsupported' }
  }
  return { kind: 'conflict' }
}
