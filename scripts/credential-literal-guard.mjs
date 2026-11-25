import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const EMAIL_PASSWORD_PAIR_RE = /(["'`])[^\s"'`@]+@[^\s"'`@]+\.[^\s"'`@]+\1\s{0,1}[,:]\s{0,2}(["'`])(?:(?!\2)\S){4,128}\2/g
const PASSWORD_LITERAL_RE = /(?:(["'`])password\1|\bpassword)\s*[:=]\s*(["'`])((?:(?!\2)[^\r\n]){4,128})\2/gi
const SET_PASSWORD_LITERAL_RE = /\bsetPassword\(\s*(["'`])(?:(?!\1)[^\r\n])+\1/g

const SCAN_EXTENSIONS = new Set(['.js', '.html', '.css', '.map', '.json'])

/**
 * Scan source/bundle text for hardcoded credential-like literals.
 * Returns only pattern names and counts, never the matched text.
 * @param {string} code
 * @returns {Array<{ name: string, count: number }>}
 */
export function findCredentialLiterals(code) {
  const text = typeof code === 'string' ? code : String(code ?? '')
  const results = []

  const pairMatches = text.match(EMAIL_PASSWORD_PAIR_RE)
  if (pairMatches && pairMatches.length > 0) {
    results.push({ name: 'email_password_pair', count: pairMatches.length })
  }

  let passwordCount = 0
  PASSWORD_LITERAL_RE.lastIndex = 0
  let m
  while ((m = PASSWORD_LITERAL_RE.exec(text)) !== null) {
    const val = m[3]
    if (!val || val.trim().length === 0) continue
    if (val.toLowerCase() === 'password') continue
    passwordCount++
  }
  if (passwordCount > 0) {
    results.push({ name: 'password_literal', count: passwordCount })
  }

  const setPasswordMatches = text.match(SET_PASSWORD_LITERAL_RE)
  if (setPasswordMatches && setPasswordMatches.length > 0) {
    results.push({ name: 'set_password_literal', count: setPasswordMatches.length })
  }

  return results
}

/**
 * Vite build plugin that fails the build if credential-like literals appear in output chunks or assets.
 */
export function credentialLiteralGuard() {
  return {
    name: 'credential-literal-guard',
    apply: 'build',
    generateBundle(_, bundle) {
      const decoder = new TextDecoder()
      for (const [fileName, item] of Object.entries(bundle)) {
        let text = ''
        if (typeof item?.code === 'string') {
          text = item.code
        } else if (typeof item?.source === 'string') {
          text = item.source
        } else if (item?.source instanceof Uint8Array) {
          text = decoder.decode(item.source)
        }
        if (!text) continue

        const findings = findCredentialLiterals(text)
        if (findings.length > 0) {
          const summary = findings.map(f => `${f.name}=${f.count}`).join('; ')
          this.error(`credential-literal-guard: hardcoded credential-like literals in ${fileName}: ${summary}`)
        }
      }
    }
  }
}

/**
 * Recursively scan a directory of build artifacts (.js, .html, .css, .map, .json).
 * @param {string} dirPath
 * @returns {{ filesScanned: number, violations: Array<{ file: string, findings: Array<{ name: string, count: number }> }> }}
 */
export function scanDirectory(dirPath) {
  const resolvedRoot = path.resolve(dirPath)
  const violations = []
  let filesScanned = 0

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name)
      if (entry.isDirectory()) {
        walk(fullPath)
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase()
        if (!SCAN_EXTENSIONS.has(ext)) continue
        filesScanned++
        const content = fs.readFileSync(fullPath, 'utf8')
        const findings = findCredentialLiterals(content)
        if (findings.length > 0) {
          violations.push({
            file: path.relative(resolvedRoot, fullPath).replace(/\\/g, '/'),
            findings
          })
        }
      }
    }
  }

  if (fs.existsSync(resolvedRoot)) {
    walk(resolvedRoot)
  }

  return { filesScanned, violations }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const targetDir = process.argv[2] || 'dist'
  const { filesScanned, violations } = scanDirectory(targetDir)
  if (violations.length > 0) {
    for (const v of violations) {
      const summary = v.findings.map(f => `${f.name}=${f.count}`).join('; ')
      console.error(`credential-literal-guard: hardcoded credential-like literals in ${v.file}: ${summary}`)
    }
    process.exit(1)
  }
  if (filesScanned === 0) {
    console.error(`credential-literal-guard: no build artifacts found in ${targetDir} (run the build first)`)
    process.exit(1)
  }
  console.log(`credential-literal-guard: PASS (${filesScanned} files)`)
}
