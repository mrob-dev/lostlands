// Lost Lands — in-page admin editor.
// Loaded by every page. Does nothing for public visitors. When a GitHub token
// is present in localStorage, exposes an Edit button that lets the operator
// modify editable regions and commit the page back to the repo via the
// GitHub Contents API. Netlify/Vercel auto-deploys the change.

(function () {
  'use strict';

  const LS_KEYS = {
    token: 'lostlands_admin_token',
    owner: 'lostlands_admin_owner',
    repo:  'lostlands_admin_repo',
    branch:'lostlands_admin_branch',
  };
  const DEFAULTS = { owner: 'mrob-dev', repo: 'lostlands', branch: 'main' };

  function cfg() {
    return {
      token:  localStorage.getItem(LS_KEYS.token)  || '',
      owner:  localStorage.getItem(LS_KEYS.owner)  || DEFAULTS.owner,
      repo:   localStorage.getItem(LS_KEYS.repo)   || DEFAULTS.repo,
      branch: localStorage.getItem(LS_KEYS.branch) || DEFAULTS.branch,
    };
  }

  function getSourcePath() {
    const m = document.querySelector('meta[name="lostlands-admin-source"]');
    return m ? m.getAttribute('content') : null;
  }

  // -- bootstrap ------------------------------------------------------------

  function init() {
    const conf = cfg();
    if (!conf.token) return;
    if (window.__lostlandsAdminMounted) return;
    window.__lostlandsAdminMounted = true;

    injectStyles();
    mountToolbar();
  }

  // -- styles ---------------------------------------------------------------

  function injectStyles() {
    if (document.getElementById('lostlands-admin-styles')) return;
    const css = `
      #ll-admin-bar {
        position: fixed; right: 16px; bottom: 16px; z-index: 100000;
        display: flex; flex-direction: column; align-items: flex-end; gap: 8px;
        font: 500 13px/1.3 Inter, system-ui, -apple-system, sans-serif;
      }
      #ll-admin-bar button, #ll-admin-bar a.ll-btn {
        appearance: none; border: 1px solid rgba(255,255,255,0.12);
        background: #111; color: #fff; padding: 9px 14px; border-radius: 999px;
        cursor: pointer; box-shadow: 0 6px 24px rgba(0,0,0,0.35);
        text-decoration: none; font: inherit; letter-spacing: 0.01em;
      }
      #ll-admin-bar button:hover, #ll-admin-bar a.ll-btn:hover { background: #1d1d1d; }
      #ll-admin-bar .ll-btn-primary { background: #c45a2c; border-color: #c45a2c; }
      #ll-admin-bar .ll-btn-primary:hover { background: #d8693a; }
      #ll-admin-bar .ll-btn-ghost { background: rgba(20,20,20,0.7); backdrop-filter: blur(8px); }
      #ll-admin-bar .ll-cluster { display: flex; gap: 8px; }

      body.ll-editing [data-edit-id] {
        outline: 1px dashed rgba(196,90,44,0.55);
        outline-offset: 4px;
        transition: outline-color 120ms;
      }
      body.ll-editing [data-edit-id]:hover { outline-color: rgba(196,90,44,0.9); }
      body.ll-editing [data-edit-id]:focus {
        outline: 2px solid #c45a2c; outline-offset: 4px;
      }
      body.ll-editing [data-edit-id].ll-changed {
        outline-color: #5fa44a; outline-style: solid;
      }

      #ll-admin-status {
        position: fixed; left: 50%; bottom: 24px; transform: translateX(-50%);
        background: #111; color: #fff; padding: 10px 16px; border-radius: 8px;
        z-index: 100001; max-width: 80vw;
        font: 500 13px/1.4 Inter, system-ui, sans-serif;
        box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      }
      #ll-admin-status.err { background: #8a2424; }
      #ll-admin-status.ok  { background: #2f5d28; }
    `;
    const style = document.createElement('style');
    style.id = 'lostlands-admin-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // -- toolbar --------------------------------------------------------------

  let toolbar, editBtn, saveBtn, cancelBtn;
  let editing = false;
  const originalHtml = new Map();   // editId -> html snapshot at edit-start
  const liveElements = new Map();   // editId -> element

  function mountToolbar() {
    toolbar = document.createElement('div');
    toolbar.id = 'll-admin-bar';
    toolbar.innerHTML = `
      <div class="ll-cluster" id="ll-cluster-idle">
        <a class="ll-btn ll-btn-ghost" href="${adminPanelHref()}">Admin</a>
        ${getSourcePath() ? '<button id="ll-edit" class="ll-btn-primary">Edit page</button>' : ''}
      </div>
      <div class="ll-cluster" id="ll-cluster-editing" hidden>
        <button id="ll-cancel" class="ll-btn-ghost">Cancel</button>
        <button id="ll-save" class="ll-btn-primary">Save &amp; publish</button>
      </div>
    `;
    document.body.appendChild(toolbar);
    editBtn   = toolbar.querySelector('#ll-edit');
    saveBtn   = toolbar.querySelector('#ll-save');
    cancelBtn = toolbar.querySelector('#ll-cancel');
    if (editBtn)   editBtn.addEventListener('click', enterEdit);
    if (saveBtn)   saveBtn.addEventListener('click', save);
    if (cancelBtn) cancelBtn.addEventListener('click', cancelEdit);
  }

  function adminPanelHref() {
    // Compute path back to /admin/ regardless of current page depth.
    const segs = location.pathname.split('/').filter(Boolean);
    // If pathname ends with '/' there's no file; depth is segs.length.
    // If it ends with '.html' the last seg is the file; depth is segs.length - 1.
    const depth = location.pathname.endsWith('/') ? segs.length : segs.length - 1;
    return '../'.repeat(Math.max(depth, 0)) + 'admin/';
  }

  function setEditingMode(on) {
    editing = on;
    document.body.classList.toggle('ll-editing', on);
    toolbar.querySelector('#ll-cluster-idle').hidden = on;
    toolbar.querySelector('#ll-cluster-editing').hidden = !on;
  }

  // -- enter / cancel edit --------------------------------------------------

  function enterEdit() {
    originalHtml.clear();
    liveElements.clear();
    const els = document.querySelectorAll('[data-edit-id]');
    els.forEach((el) => {
      const id = el.getAttribute('data-edit-id');
      originalHtml.set(id, el.innerHTML);
      liveElements.set(id, el);
      el.setAttribute('contenteditable', 'true');
      el.addEventListener('input', onElementInput);
      el.addEventListener('paste', onPaste);
    });
    setEditingMode(true);
    status(`Editing ${els.length} regions. Click any to edit. Save when done.`);
  }

  function cancelEdit() {
    if (anyChanged() && !confirm('Discard your unsaved edits?')) return;
    liveElements.forEach((el, id) => {
      el.innerHTML = originalHtml.get(id);
      el.removeAttribute('contenteditable');
      el.classList.remove('ll-changed');
      el.removeEventListener('input', onElementInput);
      el.removeEventListener('paste', onPaste);
    });
    setEditingMode(false);
    status('Edits discarded.', 'ok');
  }

  function onElementInput(ev) {
    const el = ev.currentTarget;
    const id = el.getAttribute('data-edit-id');
    const changed = el.innerHTML !== originalHtml.get(id);
    el.classList.toggle('ll-changed', changed);
  }

  function onPaste(ev) {
    // Strip formatting on paste; keep prose clean.
    ev.preventDefault();
    const text = (ev.clipboardData || window.clipboardData).getData('text/plain');
    document.execCommand('insertText', false, text);
  }

  function anyChanged() {
    for (const [id, el] of liveElements) {
      if (el.innerHTML !== originalHtml.get(id)) return true;
    }
    return false;
  }

  // -- save -----------------------------------------------------------------

  async function save() {
    const conf = cfg();
    const sourcePath = getSourcePath();
    if (!sourcePath) return status('No source path meta tag on this page.', 'err');

    const changes = [];
    liveElements.forEach((el, id) => {
      if (el.innerHTML !== originalHtml.get(id)) {
        changes.push({ id, html: cleanInnerHtml(el) });
      }
    });
    if (!changes.length) return status('Nothing changed.', 'ok');

    const defaultMsg = `Edit ${sourcePath} (${changes.length} ${changes.length === 1 ? 'region' : 'regions'})`;
    const message = prompt('Commit message:', defaultMsg);
    if (!message) return;

    saveBtn.disabled = true;
    cancelBtn.disabled = true;
    status(`Fetching latest ${sourcePath}…`);

    try {
      const file = await ghGetFile(conf, sourcePath);
      let source = b64decode(file.content);

      for (const c of changes) {
        const replaced = replaceInnerByEditId(source, c.id, c.html);
        if (replaced === null) {
          throw new Error(`Could not locate data-edit-id="${c.id}" in source file.`);
        }
        source = replaced;
      }

      status(`Committing to ${conf.branch}…`);
      await ghPutFile(conf, sourcePath, source, file.sha, message);

      // Update snapshots so further edits don't re-send unchanged content.
      changes.forEach((c) => {
        const el = liveElements.get(c.id);
        if (el) {
          originalHtml.set(c.id, el.innerHTML);
          el.classList.remove('ll-changed');
        }
      });

      status('Saved. Your host should auto-deploy in about a minute.', 'ok');
    } catch (err) {
      console.error(err);
      status('Save failed: ' + (err.message || err), 'err');
    } finally {
      saveBtn.disabled = false;
      cancelBtn.disabled = false;
    }
  }

  // -- DOM -> source replacement -------------------------------------------

  // Locate the opening tag containing data-edit-id="<id>", find its matching
  // closing tag (honouring nested same-name tags), and replace the inner
  // contents. Returns the new source, or null if the id was not found.
  function replaceInnerByEditId(source, id, newInner) {
    const needle = `data-edit-id="${id}"`;
    const idx = source.indexOf(needle);
    if (idx === -1) return null;

    // Walk back to find the '<' that opens this tag.
    const tagStart = source.lastIndexOf('<', idx);
    if (tagStart === -1) return null;
    // Walk forward to find the '>' that ends the opening tag.
    let i = idx;
    let inQuote = false; let q = '';
    while (i < source.length) {
      const c = source[i];
      if (inQuote) { if (c === q) inQuote = false; }
      else if (c === '"' || c === "'") { inQuote = true; q = c; }
      else if (c === '>') break;
      i++;
    }
    if (i >= source.length) return null;
    const tagEnd = i; // index of '>'

    // Extract tag name.
    const opening = source.slice(tagStart, tagEnd + 1);
    const nameMatch = opening.match(/^<([a-zA-Z][a-zA-Z0-9-]*)/);
    if (!nameMatch) return null;
    const tagName = nameMatch[1];

    // Self-closing or void? Shouldn't happen for editable regions, but bail safely.
    if (opening.endsWith('/>')) return null;
    if (/^(?:br|hr|img|input|link|meta|source)$/i.test(tagName)) return null;

    // Walk forward, counting nested opens/closes of the same tag name.
    let depth = 1;
    let j = tagEnd + 1;
    const openRe = new RegExp(`<${tagName}\\b`, 'i');
    const closeRe = new RegExp(`</${tagName}\\s*>`, 'i');
    while (j < source.length && depth > 0) {
      const rest = source.slice(j);
      const open  = rest.search(openRe);
      const close = rest.search(closeRe);
      if (close === -1) return null;
      if (open !== -1 && open < close) {
        depth++;
        // Skip past this opening tag.
        const gt = source.indexOf('>', j + open);
        if (gt === -1) return null;
        j = gt + 1;
      } else {
        depth--;
        if (depth === 0) {
          const innerStart = tagEnd + 1;
          const innerEnd = j + close;
          return source.slice(0, innerStart) + newInner + source.slice(innerEnd);
        }
        j += close + 1;
      }
    }
    return null;
  }

  // Light cleanup of innerHTML coming out of contenteditable.
  function cleanInnerHtml(el) {
    // Clone so we don't mutate the live DOM.
    const clone = el.cloneNode(true);
    // Remove transient classes the editor added.
    clone.classList.remove('ll-changed');
    // Strip contenteditable attributes that may have crept in on nested nodes.
    clone.querySelectorAll('[contenteditable]').forEach((n) => n.removeAttribute('contenteditable'));
    return clone.innerHTML;
  }

  // -- GitHub API -----------------------------------------------------------

  async function ghGetFile(conf, path) {
    const url = `https://api.github.com/repos/${conf.owner}/${conf.repo}/contents/${encodeURI(path)}?ref=${encodeURIComponent(conf.branch)}`;
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${conf.token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
    if (!res.ok) throw new Error(`GET ${path}: ${res.status} ${await res.text()}`);
    return res.json();
  }

  async function ghPutFile(conf, path, content, sha, message) {
    const url = `https://api.github.com/repos/${conf.owner}/${conf.repo}/contents/${encodeURI(path)}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${conf.token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        content: b64encode(content),
        sha,
        branch: conf.branch,
      }),
    });
    if (!res.ok) throw new Error(`PUT ${path}: ${res.status} ${await res.text()}`);
    return res.json();
  }

  function b64encode(str) {
    return btoa(unescape(encodeURIComponent(str)));
  }
  function b64decode(b64) {
    return decodeURIComponent(escape(atob(b64.replace(/\s/g, ''))));
  }

  // -- status banner --------------------------------------------------------

  let statusTimer = null;
  function status(msg, kind) {
    let el = document.getElementById('ll-admin-status');
    if (!el) {
      el = document.createElement('div');
      el.id = 'll-admin-status';
      document.body.appendChild(el);
    }
    el.className = kind || '';
    el.textContent = msg;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => { el.remove(); }, kind === 'err' ? 8000 : 4500);
  }

  // -- bootstrap ------------------------------------------------------------
  // Kept at the bottom of the IIFE so all `let`/`const` declarations above
  // are out of the temporal dead zone before init() runs.

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-init if the operator pastes a token via /admin and returns.
  window.addEventListener('storage', (e) => {
    if (e.key === LS_KEYS.token && e.newValue && !window.__lostlandsAdminMounted) init();
  });
})();
