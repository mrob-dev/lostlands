#!/usr/bin/env node
// One-time (and idempotent) migration: tag editable elements with a stable
// data-edit-id, inject the admin script tag, and stamp each page with its
// source path so the in-page editor can commit the file back to the repo.
//
// Usage:
//   node scripts/add-edit-ids.mjs              # run on every .html file
//   node scripts/add-edit-ids.mjs --dry-run    # report what would change
//   node scripts/add-edit-ids.mjs --only=east-germany  # filter by path substring

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const CLASS_TARGETS = new Set([
  'hero-eyebrow', 'hero-sub', 'hero-title',
  'lede', 'kicker',
  'section-title', 'card-title', 'card-desc',
  'chap-title', 'chap-sub', 'chap-num', 'chap-meta',
]);

const PROSE_CHILD_TAGS = new Set(['p', 'h2', 'h3', 'blockquote']);
const PROSE_CONTAINERS = new Set(['div', 'article', 'aside']);
const VOID_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'source', 'track', 'wbr',
]);

const SKIP_DIRS = new Set(['.git', 'node_modules', '_archive', '.claude', 'design', 'admin']);

const randomId = () => crypto.randomBytes(4).toString('hex');

function getTagName(tag) {
  const m = tag.match(/^<\/?([a-zA-Z][a-zA-Z0-9-]*)/);
  return m ? m[1].toLowerCase() : '';
}

function getClasses(tag) {
  const m = tag.match(/\bclass\s*=\s*"([^"]*)"/);
  return m ? m[1].split(/\s+/).filter(Boolean) : [];
}

function hasEditId(tag) {
  return /\bdata-edit-id\s*=/.test(tag);
}

function injectEditId(tag) {
  if (hasEditId(tag)) return tag;
  const id = randomId();
  if (tag.endsWith('/>')) {
    return tag.slice(0, -2).trimEnd() + ` data-edit-id="${id}" />`;
  }
  return tag.slice(0, -1).trimEnd() + ` data-edit-id="${id}">`;
}

function processHtml(content) {
  const out = [];
  const stack = [];
  let i = 0;
  while (i < content.length) {
    const lt = content.indexOf('<', i);
    if (lt === -1) { out.push(content.slice(i)); break; }
    if (lt > i) out.push(content.slice(i, lt));

    if (content.startsWith('<!--', lt)) {
      const end = content.indexOf('-->', lt + 4);
      const close = end === -1 ? content.length : end + 3;
      out.push(content.slice(lt, close));
      i = close;
      continue;
    }

    if (content[lt + 1] === '!') {
      const gt = content.indexOf('>', lt);
      const end = gt === -1 ? content.length : gt + 1;
      out.push(content.slice(lt, end));
      i = end;
      continue;
    }

    // Walk to the closing '>', honouring attribute quotes.
    let gt = lt + 1;
    let inAttr = false;
    let quote = '';
    while (gt < content.length) {
      const c = content[gt];
      if (inAttr) {
        if (c === quote) inAttr = false;
      } else if (c === '"' || c === "'") {
        inAttr = true; quote = c;
      } else if (c === '>') break;
      gt++;
    }
    if (gt >= content.length) { out.push(content.slice(lt)); break; }

    let tag = content.slice(lt, gt + 1);
    const tagName = getTagName(tag);
    const isClose = tag[1] === '/';
    const selfClose = tag.endsWith('/>');

    // <script>/<style> contents are opaque — skip until close.
    if (!isClose && (tagName === 'script' || tagName === 'style')) {
      out.push(tag);
      const closeRe = new RegExp(`</${tagName}\\s*>`, 'i');
      const rest = content.slice(gt + 1);
      const m = rest.match(closeRe);
      if (m) {
        out.push(rest.slice(0, m.index + m[0].length));
        i = gt + 1 + m.index + m[0].length;
      } else {
        out.push(rest);
        i = content.length;
      }
      continue;
    }

    if (isClose) {
      for (let k = stack.length - 1; k >= 0; k--) {
        if (stack[k].tag === tagName) {
          stack.splice(k);
          break;
        }
      }
      out.push(tag);
    } else {
      const classes = getClasses(tag);
      const inProseContainer = stack.some(s => s.proseContainer);
      const inEditable = stack.some(s => s.editable);

      const hasTargetClass = classes.some(c => CLASS_TARGETS.has(c));
      const isProseLeaf = classes.includes('prose') && !PROSE_CONTAINERS.has(tagName);
      const isProseChild = inProseContainer && PROSE_CHILD_TAGS.has(tagName);

      const tagThis = !inEditable && (hasTargetClass || isProseLeaf || isProseChild);
      if (tagThis) tag = injectEditId(tag);

      out.push(tag);

      const isVoid = selfClose || VOID_TAGS.has(tagName);
      if (!isVoid) {
        const proseContainer =
          classes.includes('prose') && PROSE_CONTAINERS.has(tagName);
        stack.push({
          tag: tagName,
          proseContainer,
          editable: tagThis || inEditable,
        });
      }
    }

    i = gt + 1;
  }
  return out.join('');
}

function injectAdminAssets(content, repoRelPath) {
  // 1. Source-path meta in <head>.
  if (!content.includes('name="lostlands-admin-source"')) {
    const metaTag = `\n  <meta name="lostlands-admin-source" content="${repoRelPath}" />`;
    content = content.replace(/(<link rel="stylesheet" href="[^"]*main\.css"[^>]*\/?>)/, (m) => m + metaTag);
  }
  // 2. <script src=".../admin.js"> right after the main.js include.
  if (!/assets\/js\/admin\.js/.test(content)) {
    content = content.replace(
      /(<script\s+src="([^"]*?)assets\/js\/main\.js"[^>]*><\/script>)/,
      (m, full, prefix) => `${m}\n  <script src="${prefix}assets/js/admin.js" defer></script>`,
    );
  }
  return content;
}

function walkHtml(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') && entry.name !== '.') continue;
    if (SKIP_DIRS.has(entry.name)) continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walkHtml(p, files);
    else if (entry.name.endsWith('.html')) files.push(p);
  }
  return files;
}

const onlyArg = process.argv.find(a => a.startsWith('--only='));
const dryRun = process.argv.includes('--dry-run');
const filter = onlyArg ? onlyArg.slice('--only='.length) : null;

const files = walkHtml(ROOT).filter(f => !filter || f.includes(filter));
let changed = 0;
let tagged = 0;

for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  const beforeIds = (src.match(/data-edit-id=/g) || []).length;
  let next = processHtml(src);
  const repoRel = path.relative(ROOT, f).split(path.sep).join('/');
  next = injectAdminAssets(next, repoRel);
  const afterIds = (next.match(/data-edit-id=/g) || []).length;
  tagged += afterIds - beforeIds;
  if (next !== src) {
    changed++;
    if (!dryRun) fs.writeFileSync(f, next);
    console.log(`${dryRun ? 'would update' : 'updated'}: ${repoRel} (+${afterIds - beforeIds} ids)`);
  }
}

console.log(`\n${dryRun ? 'Would change' : 'Changed'}: ${changed} of ${files.length} files; +${tagged} new edit ids.`);
