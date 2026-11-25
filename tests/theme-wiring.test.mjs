// Static wiring checks for the shared yundev light/dark theme on vang-vong (no DOM needed).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')

test('index.html loads yun-theme-init.js as a classic script before the app module', () => {
  const html = read('index.html')
  const init = html.indexOf('<script src="/vendor/yun-theme-init.js"></script>')
  const app = html.indexOf('type="module"')
  assert.ok(init > -1, 'init script present')
  assert.ok(init < app, 'init runs before the module bundle')
  assert.ok(init < html.indexOf('<title>'), 'init is early in <head>')
  assert.doesNotMatch(html, /<script>(?!<\/script>)/, 'no inline script')
  assert.match(html, /<meta name="color-scheme" content="light dark"/)
})

test('init script and vendored module share the storage key, cookie and attribute', () => {
  const init = read('public/vendor/yun-theme-init.js')
  const mod = read('src/theme/yunTheme.ts')
  for (const s of ['yun-theme', 'yun_theme']) {
    assert.ok(init.includes(s), `init uses ${s}`)
    assert.ok(mod.includes(s), `module uses ${s}`)
  }
  assert.match(init, /dataset\.theme/)
  assert.match(mod, /yh-theme-change/)
  assert.match(mod, /\.yundev\.space/)
})

test('ThemeToggle uses the shared setTheme/event and header icons', () => {
  const src = read('src/components/ui/ThemeToggle.tsx')
  assert.match(src, /from '\.\.\/\.\.\/theme\/yunTheme'/)
  assert.match(src, /setTheme\(/)
  assert.match(src, /THEME_EVENT|yh-theme-change/)
  assert.match(src, /aria-pressed/)
  assert.match(src, /isDark \? <Sun/)
  assert.match(read('src/App.tsx'), /<ThemeToggle variant="floating" \/>/)
  assert.match(read('src/components/ui/MainLobby.tsx'), /<ThemeToggle variant="inline" \/>/)
  assert.match(read('src/components/ui/HUD.tsx'), /<ThemeToggle variant="inline" \/>/)
  assert.match(read('src/main.tsx'), /initTheme\(\)/)
})

test('palette defines dark and light blocks with the same variables', () => {
  const css = read('src/index.css')
  const block = (sel) => {
    const i = css.indexOf(sel)
    assert.ok(i > -1, `${sel} block present`)
    const body = css.slice(css.indexOf('{', i) + 1, css.indexOf('\n}', i))
    return new Set([...body.matchAll(/(--vv-[\w-]+)\s*:/g)].map((m) => m[1]))
  }
  const dark = block('html[data-theme="dark"]')
  const light = block('html[data-theme="light"]')
  const missing = [...dark].filter((v) => !light.has(v))
  const extra = [...light].filter((v) => !dark.has(v))
  assert.deepEqual(missing, [], 'every dark var has a light value')
  assert.deepEqual(extra, [], 'every light var has a dark value')
})

test('menus and modals carry no hard-coded colors (canvas and HUD excluded)', () => {
  const dir = new URL('../src/components/ui/', import.meta.url)
  const files = readdirSync(dir).filter((f) => f.endsWith('.tsx') && f !== 'HUD.tsx')
  const offenders = []
  for (const f of files) {
    const src = readFileSync(new URL(f, dir), 'utf8')
    const hits = src.match(/#[0-9a-fA-F]{3,8}\b|rgba?\(|'white'|'black'/g)
    if (hits) offenders.push(`${f}: ${hits.length}`)
  }
  assert.deepEqual(offenders, [])
})