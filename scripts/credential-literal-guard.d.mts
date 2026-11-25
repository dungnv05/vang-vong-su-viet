import type { Plugin } from 'vite'

export interface CredentialFinding {
  name: string
  count: number
}

export function findCredentialLiterals(code: string): CredentialFinding[]
export function credentialLiteralGuard(): Plugin
export function scanDirectory(dirPath: string): {
  filesScanned: number
  violations: Array<{ file: string; findings: CredentialFinding[] }>
}
