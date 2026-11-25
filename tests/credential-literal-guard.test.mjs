import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import {
  findCredentialLiterals,
  credentialLiteralGuard,
  scanDirectory
} from '../scripts/credential-literal-guard.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const GUARD_SCRIPT = path.resolve(__dirname, '../scripts/credential-literal-guard.mjs')

const FAKE_EMAIL = 'player@example.test'
const FAKE_PASS = 'fake-pass-123'

describe('credential-literal-guard', () => {
  it('detects each pattern with exact counts', () => {
    const sample = `
      login("${FAKE_EMAIL}", "${FAKE_PASS}");
      login('${FAKE_EMAIL}':'${FAKE_PASS}');
      const cfg = { password: "${FAKE_PASS}", "PASSWORD": '${FAKE_PASS}' };
      setPassword("${FAKE_PASS}");
    `
    const findings = findCredentialLiterals(sample)
    assert.deepEqual(findings, [
      { name: 'email_password_pair', count: 2 },
      { name: 'password_literal', count: 2 },
      { name: 'set_password_literal', count: 1 }
    ])
  })

  it('ignores placeholder email, type:"password", password:"", and password:"password"', () => {
    const sample = `
      const ui = {
        placeholder: "name@example.test",
        type: "password",
        password: "",
        passwordLabel: "password"
      };
      const obj = { password: "password" };
      setPassword("");
    `
    const findings = findCredentialLiterals(sample)
    assert.deepEqual(findings, [])
  })

  it('calls this.error once in generateBundle with file name and counts, without leaking fake values', () => {
    const plugin = credentialLiteralGuard()
    const errors = []
    const ctx = {
      error(msg) {
        errors.push(msg)
      }
    }
    const bundle = {
      'assets/index-abc123.js': {
        type: 'chunk',
        code: `fn("${FAKE_EMAIL}","${FAKE_PASS}"); const x = { password: "${FAKE_PASS}" };`
      },
      'assets/style.css': {
        type: 'asset',
        source: 'body { color: #fff; }'
      }
    }

    plugin.generateBundle.call(ctx, {}, bundle)

    assert.equal(errors.length, 1)
    assert.match(errors[0], /assets\/index-abc123\.js/)
    assert.match(errors[0], /email_password_pair=1/)
    assert.match(errors[0], /password_literal=1/)
    assert.equal(errors[0].includes(FAKE_EMAIL), false)
    assert.equal(errors[0].includes(FAKE_PASS), false)
  })

  it('passes a clean bundle without calling this.error', () => {
    const plugin = credentialLiteralGuard()
    const errors = []
    const ctx = {
      error(msg) {
        errors.push(msg)
      }
    }
    const bundle = {
      'assets/index-clean.js': {
        type: 'chunk',
        code: 'console.log("hello world"); const inputType = "password";'
      },
      'assets/data.json': {
        type: 'asset',
        source: new TextEncoder().encode('{"ok":true}')
      }
    }

    plugin.generateBundle.call(ctx, {}, bundle)
    assert.equal(errors.length, 0)
  })

  it('scans a temp directory via scanDirectory and CLI', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vv-cred-guard-'))
    try {
      const assetsDir = path.join(tmpDir, 'assets')
      fs.mkdirSync(assetsDir, { recursive: true })
      fs.writeFileSync(path.join(tmpDir, 'index.html'), '<!doctype html><html></html>', 'utf8')
      fs.writeFileSync(path.join(assetsDir, 'app.js'), 'export const ok = true;', 'utf8')

      const cleanScan = scanDirectory(tmpDir)
      assert.equal(cleanScan.filesScanned, 2)
      assert.equal(cleanScan.violations.length, 0)

      const passOut = execFileSync(process.execPath, [GUARD_SCRIPT, tmpDir], { encoding: 'utf8' })
      assert.match(passOut, /credential-literal-guard: PASS \(2 files\)/)

      fs.writeFileSync(
        path.join(assetsDir, 'leak.js'),
        `setPassword("${FAKE_PASS}");`,
        'utf8'
      )

      const dirtyScan = scanDirectory(tmpDir)
      assert.equal(dirtyScan.filesScanned, 3)
      assert.equal(dirtyScan.violations.length, 1)
      assert.equal(dirtyScan.violations[0].file, 'assets/leak.js')
      assert.deepEqual(dirtyScan.violations[0].findings, [{ name: 'set_password_literal', count: 1 }])

      assert.throws(
        () => execFileSync(process.execPath, [GUARD_SCRIPT, tmpDir], { encoding: 'utf8', stdio: 'pipe' }),
        err => {
          const stderr = String(err.stderr || '')
          assert.match(stderr, /assets\/leak\.js/)
          assert.match(stderr, /set_password_literal=1/)
          assert.equal(stderr.includes(FAKE_PASS), false)
          return true
        }
      )
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true })
    }
  })
})
