import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const EXPECTED_CSP =
  "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' https://www.yundev.space https://ekyfmoouhgwggtiznxnz.supabase.co; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests";

const HTML_PAGES = ['index.html'];

function countMatches(str, re) {
  return (str.match(re) ?? []).length;
}

test('HTML pages declare clean same-origin favicon links and theme-color metas inside <head>', () => {
  for (const relPath of HTML_PAGES) {
    const html = fs.readFileSync(path.join(root, relPath), 'utf8');
    const headMatch = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i);
    assert.ok(headMatch, `${relPath} must contain a <head> block`);
    const head = headMatch[1];

    assert.equal(
      countMatches(head, /<link\b[^>]*\brel="icon"[^>]*\bhref="\/favicon\.ico"[^>]*>/g),
      1,
      `${relPath} must have exactly one /favicon.ico link in <head>`,
    );
    assert.equal(
      countMatches(
        head,
        /<link\b[^>]*\brel="icon"[^>]*\bhref="\/favicon\.svg"[^>]*\btype="image\/svg\+xml"[^>]*>/g,
      ),
      1,
      `${relPath} must have exactly one /favicon.svg link in <head>`,
    );
    assert.equal(
      countMatches(head, /<link\b[^>]*\brel="apple-touch-icon"[^>]*\bhref="\/apple-touch-icon\.png"[^>]*>/g),
      1,
      `${relPath} must have exactly one /apple-touch-icon.png link in <head>`,
    );

    assert.equal(
      countMatches(
        head,
        /<meta\b[^>]*\bname="theme-color"[^>]*\bcontent="#FAF7F2"[^>]*\bmedia="\(prefers-color-scheme:\s*light\)"[^>]*>/g,
      ),
      1,
      `${relPath} must have light theme-color meta in <head>`,
    );
    assert.equal(
      countMatches(
        head,
        /<meta\b[^>]*\bname="theme-color"[^>]*\bcontent="#15121D"[^>]*\bmedia="\(prefers-color-scheme:\s*dark\)"[^>]*>/g,
      ),
      1,
      `${relPath} must have dark theme-color meta in <head>`,
    );

    const iconLinks = head.match(/<link\b[^>]*\brel="(?:shortcut\s+)?icon"[^>]*>/gi) ?? [];
    assert.equal(iconLinks.length, 2, `${relPath} must not have extra rel="icon" or shortcut icon links`);
    assert.equal(
      countMatches(head, /rel="shortcut\s+icon"/gi),
      0,
      `${relPath} must not have shortcut icon link`,
    );

    const scriptTags = head.match(/<script\b[^>]*>/gi) ?? [];
    const inlineScripts = scriptTags.filter((tag) => !/\bsrc\s*=/i.test(tag));
    assert.equal(inlineScripts.length, 0, `${relPath} <head> must not have inline <script> without src`);
  }
});

test('public/favicon.svg is a static, sanitized 64x64 SVG', () => {
  const svg = fs.readFileSync(path.join(root, 'public', 'favicon.svg'), 'utf8');
  assert.match(svg, /<svg\b/);
  assert.match(svg, /viewBox="0 0 64 64"/);

  const withoutXmlns = svg.replace(/xmlns="http:\/\/www\.w3\.org\/2000\/svg"/g, '');
  const forbidden = [
    /<script/i,
    /\son[a-z]+\s*=/i,
    /<foreignObject/i,
    /<!DOCTYPE/i,
    /<!ENTITY/i,
    /data:/i,
    /<style/i,
    /@import/i,
    / style=/i,
    /href=/i,
    /<image/i,
    /url\((?!#)/i,
    /http:/i,
    /https:/i,
  ];
  for (const pattern of forbidden) {
    assert.doesNotMatch(withoutXmlns, pattern, `favicon.svg matched forbidden pattern ${pattern}`);
  }
});

test('public/favicon.ico contains 16, 32, 48 PNG frames with no trailing bytes', () => {
  const buf = fs.readFileSync(path.join(root, 'public', 'favicon.ico'));
  assert.ok(buf.length >= 6, 'favicon.ico too short');
  assert.deepEqual(buf.subarray(0, 4), Buffer.from([0x00, 0x00, 0x01, 0x00]), 'invalid ICO header');

  const count = buf.readUInt16LE(4);
  assert.equal(count, 3, 'favicon.ico must contain exactly 3 images');
  assert.ok(buf.length >= 6 + count * 16, 'favicon.ico directory truncated');

  const sizes = [];
  let maxEnd = 0;
  for (let i = 0; i < count; i++) {
    const entryOffset = 6 + i * 16;
    const w = buf[entryOffset] === 0 ? 256 : buf[entryOffset];
    const h = buf[entryOffset + 1] === 0 ? 256 : buf[entryOffset + 1];
    const dataSize = buf.readUInt32LE(entryOffset + 8);
    const dataOffset = buf.readUInt32LE(entryOffset + 12);

    assert.equal(w, h, `ICO entry ${i} must be square`);
    sizes.push(w);
    assert.ok(dataOffset + dataSize <= buf.length, `ICO entry ${i} out of bounds`);
    assert.deepEqual(
      buf.subarray(dataOffset, dataOffset + 8),
      PNG_SIG,
      `ICO entry ${i} (${w}x${h}) must be PNG-encoded`,
    );
    if (dataOffset + dataSize > maxEnd) {
      maxEnd = dataOffset + dataSize;
    }
  }

  assert.deepEqual(
    sizes.slice().sort((a, b) => a - b),
    [16, 32, 48],
    'ICO sizes must be 16, 32, 48',
  );
  assert.equal(buf.length, maxEnd, 'favicon.ico must have no trailing bytes');
});

test('public/apple-touch-icon.png is a clean 180x180 PNG with no metadata chunks or trailing payload', () => {
  const buf = fs.readFileSync(path.join(root, 'public', 'apple-touch-icon.png'));
  assert.ok(buf.length > 33, 'apple-touch-icon.png too short');
  assert.deepEqual(buf.subarray(0, 8), PNG_SIG, 'invalid PNG signature');

  const forbiddenChunks = new Set(['tEXt', 'zTXt', 'iTXt', 'eXIf', 'tIME']);
  let offset = 8;
  let lastType = '';
  let sawIHDR = false;

  while (offset < buf.length) {
    assert.ok(offset + 12 <= buf.length, 'truncated PNG chunk header');
    const length = buf.readUInt32BE(offset);
    const type = buf.subarray(offset + 4, offset + 8).toString('ascii');
    const dataStart = offset + 8;
    const chunkEnd = dataStart + length + 4;
    assert.ok(chunkEnd <= buf.length, `truncated PNG chunk ${type}`);

    if (type === 'IHDR') {
      assert.equal(length, 13, 'IHDR length must be 13');
      const width = buf.readUInt32BE(dataStart);
      const height = buf.readUInt32BE(dataStart + 4);
      assert.equal(width, 180, 'apple-touch-icon.png width must be 180');
      assert.equal(height, 180, 'apple-touch-icon.png height must be 180');
      sawIHDR = true;
    }

    assert.ok(!forbiddenChunks.has(type), `forbidden PNG metadata chunk ${type}`);
    lastType = type;
    offset = chunkEnd;
  }

  assert.ok(sawIHDR, 'missing IHDR chunk');
  assert.equal(lastType, 'IEND', 'last PNG chunk must be IEND');
  assert.equal(offset, buf.length, 'apple-touch-icon.png must end exactly at IEND');
});

test('vercel.json CSP header is unchanged and allows same-origin favicons', () => {
  const cfg = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
  const allHeaders = (cfg.headers ?? []).flatMap((rule) => rule.headers ?? []);
  const cspHeader = allHeaders.find((h) => h.key === 'Content-Security-Policy');
  assert.ok(cspHeader, 'Content-Security-Policy header must exist in vercel.json');
  assert.equal(cspHeader.value, EXPECTED_CSP, 'Content-Security-Policy must not be altered');
  assert.ok(cspHeader.value.includes("img-src 'self' data:"), 'CSP must allow img-src self and data:');
});
