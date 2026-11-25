import type { Plugin } from 'vite'

export interface CredentialFinding {
  name: string
  count: number
}

export const DENYLISTED_EMAIL_SHA256: string[]
export function findCredentialLiterals(code: string, options?: { denylist?: string[] }): CredentialFinding[]
export function credentialLiteralGuard(): Plugin
export function scanDirectory(dirPath: string): {
  filesScanned: number
  violations: Array<{ file: string; findings: CredentialFinding[] }>
}
