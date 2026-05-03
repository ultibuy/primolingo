/**
 * Vite plugin that serves /docs as rendered HTML from docs/*.md files.
 * Dev mode only — does nothing in production builds.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { marked } from 'marked';

const DOCS_DIR = join(import.meta.dirname, '..', 'docs');
const ANNOTATIONS_DIR = join(DOCS_DIR, 'annotations');

// Ensure annotations directory exists
if (!existsSync(ANNOTATIONS_DIR)) mkdirSync(ANNOTATIONS_DIR, { recursive: true });

function getAnnotationFile(slug) {
  return join(ANNOTATIONS_DIR, `${slug}.json`);
}

function loadAnnotations(slug) {
  const file = getAnnotationFile(slug);
  try { return existsSync(file) ? JSON.parse(readFileSync(file, 'utf-8')) : []; }
  catch { return []; }
}

function saveAnnotations(slug, annotations) {
  writeFileSync(getAnnotationFile(slug), JSON.stringify(annotations, null, 2));
}

function getVersion() {
  try {
    const v = JSON.parse(readFileSync(join(DOCS_DIR, 'version.json'), 'utf-8'));
    return `${v.major}.${v.minor}.${String(v.patch).padStart(3, '0')}`;
  } catch { return '0.0.000'; }
}

const HTML_TEMPLATE = (title, body, nav) => {
  const version = getVersion();
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — PrimoLingo Docs</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #0f1117; color: #e5e7eb;
      line-height: 1.7; padding: 2rem 1.5rem 4rem;
      max-width: 860px; margin: 0 auto;
    }
    a { color: #a78bfa; text-decoration: none; }
    a:hover { text-decoration: underline; }
    h1 { font-size: 2rem; font-weight: 900; color: #fff; margin: 0 0 1rem; line-height: 1.2; }
    h2 { font-size: 1.3rem; font-weight: 800; color: #c4b5fd; margin: 2rem 0 0.8rem;
         padding-bottom: 0.4rem; border-bottom: 1px solid rgba(255,255,255,0.08); }
    h3 { font-size: 1.05rem; font-weight: 700; color: #e5e7eb; margin: 1.5rem 0 0.5rem; }
    h4 { font-size: 0.9rem; font-weight: 700; color: #9ca3af; margin: 1.2rem 0 0.4rem; }
    p { margin: 0 0 0.8rem; color: #d1d5db; }
    ul, ol { margin: 0 0 1rem 1.2rem; color: #d1d5db; }
    li { margin: 0.3rem 0; }
    code { background: rgba(167,139,250,0.12); padding: 0.15rem 0.4rem; border-radius: 4px;
           font-family: 'JetBrains Mono', monospace; font-size: 0.85em; color: #c4b5fd; }
    pre { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; padding: 1rem; overflow-x: auto; margin: 0 0 1rem; }
    pre code { background: none; padding: 0; }
    table { width: 100%; border-collapse: collapse; margin: 0 0 1.5rem; font-size: 0.88rem; }
    th { text-align: left; padding: 0.6rem 0.8rem; font-weight: 700; color: #a78bfa;
         border-bottom: 2px solid rgba(167,139,250,0.25); font-size: 0.78rem;
         text-transform: uppercase; letter-spacing: 0.04em; }
    td { padding: 0.5rem 0.8rem; border-bottom: 1px solid rgba(255,255,255,0.06);
         color: #d1d5db; vertical-align: top; }
    tr:hover td { background: rgba(255,255,255,0.02); }
    td:first-child { color: #6ee7b7; font-weight: 700; font-family: monospace; white-space: nowrap; }
    img { max-width: 390px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);
          margin: 0.8rem 0; box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
    blockquote { border-left: 3px solid #a78bfa; padding: 0.5rem 1rem; margin: 0 0 1rem;
                 background: rgba(167,139,250,0.06); border-radius: 0 8px 8px 0; }
    hr { border: none; height: 1px; background: rgba(255,255,255,0.08); margin: 2rem 0; }
    .nav { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem;
           padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.08); }
    .nav a { font-size: 0.85rem; font-weight: 600; }
    .nav .brand { font-weight: 900; font-size: 1.1rem; color: #fff; }
    .see-also { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
                border-radius: 12px; padding: 1rem; margin: 2rem 0; }
    .see-also h2 { font-size: 0.9rem; margin: 0 0 0.5rem; border: none; padding: 0; }
    .doc-footer { margin-top: 4rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.06);
                  display: flex; justify-content: space-between; align-items: center; }
    .doc-footer span { font-size: 0.72rem; color: rgba(255,255,255,0.2); font-weight: 500; }
    /* Comment banner */
    .comment-banner {
      position: fixed; bottom: 0; left: 0; right: 0;
      background: rgba(15,17,23,0.95); backdrop-filter: blur(12px);
      border-top: 1px solid rgba(167,139,250,0.25);
      padding: 0.6rem 1rem; z-index: 1000;
      display: flex; align-items: center; gap: 0.6rem;
      max-width: 860px; margin: 0 auto;
    }
    .comment-banner input {
      flex: 1; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
      border-radius: 8px; padding: 0.45rem 0.7rem; color: #e5e7eb; font-size: 0.82rem;
      font-family: inherit; outline: none;
    }
    .comment-banner input:focus { border-color: rgba(167,139,250,0.5); }
    .comment-banner input::placeholder { color: rgba(255,255,255,0.25); }
    .comment-banner button {
      background: rgba(167,139,250,0.2); border: 1px solid rgba(167,139,250,0.35);
      border-radius: 8px; padding: 0.4rem 0.9rem; color: #a78bfa; font-weight: 700;
      font-size: 0.78rem; cursor: pointer; white-space: nowrap;
    }
    .ann-pin { pointer-events: auto; }
    .ann-sidebar {
      position: fixed; right: 8px; top: 50%; transform: translateY(-50%);
      display: flex; flex-direction: column; gap: 6px; z-index: 900;
    }
    .ann-sidebar-pin {
      width: 28px; height: 28px; border-radius: 50%; display: flex;
      align-items: center; justify-content: center; font-size: 11px;
      font-weight: 800; color: #fff; cursor: pointer; user-select: none;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3); transition: transform 0.15s ease;
    }
    .ann-sidebar-pin:hover { transform: scale(1.2); }
  </style>
</head>
<body>
  <nav class="nav">
    <span class="brand">PrimoLingo</span>
    <a href="/docs">Sommaire</a>
    ${nav}
  </nav>
  ${body}
  <footer class="doc-footer">
    <span>PrimoLingo — Documentation fonctionnelle</span>
    <span>v${version}</span>
  </footer>

  <!-- Sidebar pins (sticky, right side) -->
  <div class="ann-sidebar" id="ann-sidebar"></div>

  <!-- Annotation overlay -->
  <div class="comment-banner">
    <button id="toggle-annotations" onclick="toggleAnnotationMode()">Mode commentaire</button>
    <span id="annotation-count" style="margin-left:auto;color:rgba(255,255,255,0.3);font-size:0.72rem">0 commentaire</span>
    <button id="btn-copy" onclick="copyAllAnnotations()">Copier tout</button>
    <button id="btn-copy-pending" onclick="copyPendingAnnotations()">Copier sans reponse</button>
    <button id="btn-clear" onclick="clearAllAnnotations()">Effacer tout</button>
  </div>

  <script>
    const ANN_SLUG = location.pathname.replace('/docs/', '').replace(/\\/$/, '') || 'index';
    let annotationMode = false;
    let annotations = [];

    // Load from server file
    fetch('/docs/api/annotations?slug=' + encodeURIComponent(ANN_SLUG))
      .then(r => r.json())
      .then(data => { annotations = data; renderAnnotations(); })
      .catch(() => {});

    function saveAnnotations() {
      fetch('/docs/api/annotations?slug=' + encodeURIComponent(ANN_SLUG), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(annotations),
      }).catch(() => {});
      updateUI();
    }

    function updateUI() {
      const n = annotations.length;
      document.getElementById('annotation-count').textContent = n + ' commentaire' + (n !== 1 ? 's' : '');
      const pending = annotations.filter(a => !a.response || !a.response.trim()).length;
      document.getElementById('btn-copy').style.opacity = n > 0 ? '1' : '0.35';
      document.getElementById('btn-copy-pending').style.opacity = pending > 0 ? '1' : '0.35';
      document.getElementById('btn-copy-pending').textContent = pending > 0 ? 'Copier sans reponse (' + pending + ')' : 'Tout traite';
      document.getElementById('btn-clear').style.opacity = n > 0 ? '1' : '0.35';
    }

    function toggleAnnotationMode() {
      annotationMode = !annotationMode;
      const btn = document.getElementById('toggle-annotations');
      btn.style.background = annotationMode ? '#7c3aed' : 'rgba(167,139,250,0.2)';
      btn.style.color = annotationMode ? '#fff' : '#a78bfa';
      document.body.style.cursor = annotationMode ? 'crosshair' : '';
    }

    // Capture DOM context under click point
    function captureDomContext(clientX, clientY) {
      // Hide pins temporarily
      document.querySelectorAll('.ann-pin').forEach(p => { p.style.pointerEvents = 'none'; p.style.visibility = 'hidden'; });
      const el = document.elementFromPoint(clientX, clientY);
      document.querySelectorAll('.ann-pin').forEach(p => { p.style.pointerEvents = ''; p.style.visibility = ''; });
      if (!el) return { tag: 'body', text: '' };

      // Find the most specific meaningful element — stop BEFORE body/html
      const skip = new Set(['HTML', 'BODY', 'MAIN', 'ARTICLE', 'SECTION', 'NAV', 'FOOTER', 'HEADER']);
      let target = el;
      // If clicked element has very little text, walk up a bit
      for (let i = 0; i < 4; i++) {
        const t = (target.textContent || '').trim();
        if (t.length >= 5 || !target.parentElement || skip.has(target.parentElement.tagName)) break;
        target = target.parentElement;
      }
      // But never go higher than the first meaningful container
      if (skip.has(target.tagName)) {
        target = el; // fall back to original
      }
      const text = (target.textContent || '').trim().slice(0, 150);
      return {
        tag: target.tagName || '?',
        text: text,
      };
    }

    function renderAnnotations() {
      document.querySelectorAll('.ann-pin').forEach(el => el.remove());
      // Build sidebar
      const sidebar = document.getElementById('ann-sidebar');
      sidebar.innerHTML = '';
      annotations.forEach((ann, i) => {
        const hasResp = !!(ann.response && ann.response.trim());
        const sidePin = document.createElement('div');
        sidePin.className = 'ann-sidebar-pin';
        sidePin.style.background = hasResp ? '#22c55e' : '#7c3aed';
        sidePin.textContent = hasResp ? '\\u2713' : (i + 1);
        sidePin.title = (ann.text || '').slice(0, 60) || 'Commentaire ' + (i + 1);
        sidePin.addEventListener('click', function() {
          window.scrollTo({ top: ann.y - 200, behavior: 'smooth' });
          // Open the bubble after scrolling
          setTimeout(() => {
            document.querySelectorAll('.ann-bubble').forEach(b => { b.style.display = 'none'; });
            const pins = document.querySelectorAll('.ann-pin');
            if (pins[i]) {
              const bubble = pins[i].querySelector('.ann-bubble');
              if (bubble) bubble.style.display = 'block';
            }
          }, 400);
        });
        sidebar.appendChild(sidePin);
      });
      // Render inline pins
      annotations.forEach((ann, i) => {
        const pin = document.createElement('div');
        pin.className = 'ann-pin';
        pin.style.cssText = 'position:absolute;left:' + ann.x + 'px;top:' + ann.y + 'px;z-index:500;';

        // Pin circle — green if responded, purple if pending
        const hasResponse = !!(ann.response && ann.response.trim());
        const pinColor = hasResponse ? '#22c55e' : '#7c3aed';
        const pinShadow = hasResponse ? 'rgba(34,197,94,0.4)' : 'rgba(124,58,237,0.4)';
        const circle = document.createElement('div');
        circle.style.cssText = 'width:26px;height:26px;border-radius:50%;background:' + pinColor + ';color:#fff;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px ' + pinShadow + ';cursor:pointer;transform:translate(-50%,-50%);user-select:none';
        circle.textContent = hasResponse ? '\\u2713' : (i + 1);

        // Bubble
        const bubble = document.createElement('div');
        bubble.className = 'ann-bubble';
        bubble.style.cssText = 'display:none;position:absolute;top:18px;left:-10px;background:#1a1a2e;border:2px solid #7c3aed;border-radius:10px;box-shadow:0 4px 20px rgba(0,0,0,0.5);min-width:220px;max-width:320px;z-index:600;overflow:hidden';

        // Text area (editable)
        const textarea = document.createElement('textarea');
        textarea.style.cssText = 'width:100%;border:none;outline:none;resize:vertical;font-family:inherit;font-size:12px;line-height:1.5;padding:8px 10px;min-height:50px;background:#1a1a2e;color:#e5e7eb;box-sizing:border-box';
        textarea.value = ann.text || '';
        textarea.placeholder = 'Votre commentaire...';
        textarea.addEventListener('input', function() {
          annotations[i].text = this.value;
          saveAnnotations();
        });
        textarea.addEventListener('click', function(e) { e.stopPropagation(); });

        // DOM context info
        const ctx = document.createElement('div');
        ctx.style.cssText = 'padding:4px 10px;font-size:10px;color:#6b7280;border-top:1px solid rgba(255,255,255,0.08);line-height:1.4';
        ctx.textContent = ann.domContext ? '<' + ann.domContext.tag + '> ' + (ann.domContext.text || '').slice(0, 80) : '';

        // Response area — always visible and editable
        const responseBlock = document.createElement('div');
        responseBlock.style.cssText = 'border-top:1px solid rgba(255,255,255,0.08)';
        const respLabel = document.createElement('div');
        respLabel.style.cssText = 'padding:4px 10px 0;font-size:9px;color:#4ade80;font-weight:700;text-transform:uppercase;letter-spacing:0.05em';
        respLabel.textContent = 'Reponse';
        responseBlock.appendChild(respLabel);
        const respInput = document.createElement('textarea');
        respInput.style.cssText = 'width:100%;border:none;outline:none;resize:vertical;font-family:inherit;font-size:11px;line-height:1.4;padding:4px 10px 6px;min-height:32px;background:rgba(74,222,128,0.04);color:#4ade80;box-sizing:border-box';
        respInput.value = ann.response || '';
        respInput.placeholder = 'Ecrire une reponse...';
        respInput.addEventListener('input', function() {
          annotations[i].response = this.value;
          saveAnnotations();
        });
        respInput.addEventListener('click', function(e) { e.stopPropagation(); });
        responseBlock.appendChild(respInput);

        // Footer
        const footer = document.createElement('div');
        footer.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:4px 10px;border-top:1px solid rgba(255,255,255,0.08)';
        footer.innerHTML = '<span style="font-size:10px;color:rgba(255,255,255,0.2)">' + (ann.time || '') + '</span>';
        const footerRight = document.createElement('div');
        footerRight.style.cssText = 'display:flex;gap:8px';
        const del = document.createElement('span');
        del.style.cssText = 'font-size:10px;color:#f87171;cursor:pointer';
        del.textContent = 'supprimer';
        del.addEventListener('click', function(e) { e.stopPropagation(); deleteAnnotation(i); });
        footerRight.appendChild(del);
        footer.appendChild(footerRight);

        bubble.appendChild(textarea);
        if (ann.domContext && ann.domContext.text) bubble.appendChild(ctx);
        bubble.appendChild(responseBlock);
        bubble.appendChild(footer);
        pin.appendChild(circle);
        pin.appendChild(bubble);

        circle.addEventListener('click', function(e) {
          e.stopPropagation();
          const showing = bubble.style.display !== 'none';
          // Close all other bubbles
          document.querySelectorAll('.ann-bubble').forEach(b => { b.style.display = 'none'; });
          bubble.style.display = showing ? 'none' : 'block';
          if (!showing) textarea.focus();
        });

        document.body.appendChild(pin);
      });
      updateUI();
    }

    function deleteAnnotation(i) {
      annotations.splice(i, 1);
      saveAnnotations();
      renderAnnotations();
    }

    function copyAllAnnotations() {
      if (annotations.length === 0) return;
      const lines = annotations.map((a, i) => formatAnnotation(a, i));
      const page = location.pathname;
      const text = buildPromptHeader() + '\\n\\n=== Annotations ' + page + ' ===\\n\\n' + lines.join('\\n\\n');
      navigator.clipboard.writeText(text).then(() => flashButton('btn-copy')).catch(() => {});
    }

    function buildPromptHeader() {
      return 'Voici des annotations realisees sur les docs fonctionnelles de l\\'app. Traite chaque commentaire dans l\\'ordre en utilisant autant d\\'agents que necessaire.\\n\\nAttention !!!\\n1) Si le commentaire est une question, tu ne fais que repondre a la question du commentaire dans le champ reponse — tu ne lances aucun changement dans le code.\\n2) Si au contraire le commentaire est une demande "modifie ci ou ca" alors : a) modifie-le dans le code, b) mets a jour la doc, et c) reponds au commentaire dans le champ reponse.\\n\\nLes annotations sont stockees dans docs/annotations/' + ANN_SLUG + '.json. Apres avoir traite chaque commentaire, ecris ta reponse dans le champ "response" de l\\'annotation correspondante dans ce fichier JSON. Le pin passera au vert automatiquement au prochain chargement de la page.';
    }

    function formatAnnotation(a, i) {
      let line = '(' + (i+1) + ') [x:' + a.x + ' y:' + a.y + '] ' + (a.text || '(vide)');
      if (a.domContext && a.domContext.text) {
        line += '\\n    Element: <' + a.domContext.tag + '> "' + a.domContext.text.slice(0, 120) + '"';
      }
      if (a.response) {
        line += '\\n    Reponse: ' + a.response;
      }
      return line;
    }

    function flashButton(btnId) {
      const btn = document.getElementById(btnId);
      const old = btn.textContent;
      btn.textContent = 'Copie !';
      btn.style.background = '#4ade80';
      btn.style.color = '#0a1410';
      setTimeout(() => { btn.textContent = old; btn.style.background = ''; btn.style.color = ''; }, 1500);
    }

    function copyPendingAnnotations() {
      const pending = annotations.filter(a => !a.response || !a.response.trim());
      if (pending.length === 0) return;
      const lines = pending.map((a) => formatAnnotation(a, annotations.indexOf(a)));
      const page = location.pathname;
      const text = buildPromptHeader() + '\\n\\n=== Annotations ' + page + ' (sans reponse) ===\\n\\n' + lines.join('\\n\\n');
      navigator.clipboard.writeText(text).then(() => flashButton('btn-copy-pending')).catch(() => {});
    }

    function clearAllAnnotations() {
      if (annotations.length === 0) return;
      if (!confirm('Effacer tous les commentaires ?')) return;
      annotations = [];
      saveAnnotations();
      renderAnnotations();
    }

    // Click handler — create annotation with inline textarea
    document.addEventListener('click', function(e) {
      if (!annotationMode) return;
      if (e.target.closest('.comment-banner') || e.target.closest('.ann-pin')) return;

      const x = e.pageX;
      const y = e.pageY;
      const domContext = captureDomContext(e.clientX, e.clientY);

      annotations.push({
        x: Math.round(x), y: Math.round(y), text: '',
        time: new Date().toLocaleString('fr-FR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' }),
        domContext: domContext,
      });
      saveAnnotations();
      renderAnnotations();

      // Open the bubble of the newly created annotation and focus textarea
      const pins = document.querySelectorAll('.ann-pin');
      const lastPin = pins[pins.length - 1];
      if (lastPin) {
        document.querySelectorAll('.ann-bubble').forEach(b => { b.style.display = 'none'; });
        const bubble = lastPin.querySelector('.ann-bubble');
        if (bubble) {
          bubble.style.display = 'block';
          const ta = bubble.querySelector('textarea');
          if (ta) ta.focus();
        }
      }
    });

    renderAnnotations();
  </script>
</body>
</html>`;
};

// SVG icons matching MotivationBanner.jsx BannerSvgIcon
function getBannerSvg(emoji, accent, secondary) {
  const cp = `width="34" height="34" viewBox="0 0 40 40" fill="none"`;
  switch (emoji) {
    case '🪙':
      return `<svg ${cp}><defs><radialGradient id="cO" cx="35%" cy="35%"><stop offset="0%" stop-color="#ffe066"/><stop offset="40%" stop-color="#fbbf24"/><stop offset="80%" stop-color="#d4940a"/><stop offset="100%" stop-color="#92650a"/></radialGradient><radialGradient id="cI" cx="40%" cy="40%"><stop offset="0%" stop-color="#ffe680"/><stop offset="60%" stop-color="#f5c842"/><stop offset="100%" stop-color="#c8920a"/></radialGradient></defs><circle cx="20" cy="20" r="14" fill="url(#cI)"/><circle cx="20" cy="20" r="14" fill="none" stroke="#d4940a" stroke-width="0.6" opacity="0.5"/><text x="20" y="25.5" text-anchor="middle" font-size="16" font-weight="900" fill="#b8860b" opacity="0.4" font-family="serif">O</text><text x="20" y="25" text-anchor="middle" font-size="16" font-weight="900" fill="#ffe680" opacity="0.7" font-family="serif">O</text><ellipse cx="14" cy="12" rx="6" ry="3" fill="white" opacity="0.25" transform="rotate(-20 14 12)"/></svg>`;
    case '📈':
      return `<svg ${cp}><rect x="5" y="6" width="30" height="28" rx="7" fill="${accent}22" stroke="${accent}88" stroke-width="1.2"/><path d="M11 27.5h18" stroke="${accent}88" stroke-width="2" stroke-linecap="round"/><path d="M12 25l6-7 5 4 6-10" stroke="${accent}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M27 12h3v3" stroke="${accent}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    case '🏆':
      return `<svg ${cp}><path d="M14 10h12v5c0 6-2.7 10-6 10s-6-4-6-10v-5Z" fill="${accent}33" stroke="${accent}" stroke-width="2.4"/><path d="M14 13H9c0 4 2 7 5.7 7.8M26 13h5c0 4-2 7-5.7 7.8" stroke="${accent}" stroke-width="2.4" stroke-linecap="round"/><path d="M20 25v5M14 31h12" stroke="${secondary}" stroke-width="2.6" stroke-linecap="round"/></svg>`;
    case '🎁':
      return `<svg ${cp}><rect x="9" y="17" width="22" height="15" rx="3" fill="${accent}24" stroke="${accent}" stroke-width="2.3"/><path d="M20 17v15M8 17h24" stroke="${secondary}" stroke-width="2.3" stroke-linecap="round"/><path d="M20 16c-5-1-7-3-6-5 1.3-2.5 5 0 6 5Zm0 0c5-1 7-3 6-5-1.3-2.5-5 0-6 5Z" stroke="${accent}" stroke-width="2.1" stroke-linejoin="round"/></svg>`;
    case '🔥':
      return `<svg ${cp}><path d="M22.5 5.5c1 6-4 8.3-1.4 12.5 1.9-2.2 3.9-4.4 4.2-7 4.2 4.4 6.1 8.3 6.1 13 0 6-4.9 10-11.1 10S9.2 30.1 9.2 24.1c0-4.8 2.9-8.2 6.3-11.5 2.1-2 4.2-4.1 7-7.1Z" fill="${accent}28" stroke="${accent}" stroke-width="2.2" stroke-linejoin="round"/><path d="M21 22c2.3 2.4 3.2 4.3 3.2 6.2 0 2.3-1.8 3.8-4.2 3.8s-4.2-1.5-4.2-3.8c0-2.2 1.4-3.8 3.5-6.2.5 1.6 1.1 2.7 1.7 3.5.4-.9.4-2 .1-3.5Z" fill="${secondary}"/></svg>`;
    case '💎':
      return `<svg ${cp}><path d="M12 8h16l6 8-14 17L6 16l6-8Z" fill="${accent}30" stroke="${accent}" stroke-width="2.2" stroke-linejoin="round"/><path d="M6 16h28M12 8l4 8 4-8 4 8 4-8M16 16l4 17 4-17" stroke="${secondary}" stroke-width="1.8" stroke-linejoin="round" opacity="0.9"/></svg>`;
    case '👑':
      return `<svg ${cp}><path d="M8 29h24l2-15-8 6-6-10-6 10-8-6 2 15Z" fill="${accent}30" stroke="${accent}" stroke-width="2.4" stroke-linejoin="round"/><path d="M10 32h20" stroke="${secondary}" stroke-width="2.5" stroke-linecap="round"/></svg>`;
    case '🛡️': case '🛡':
      return `<svg ${cp}><path d="M20 6 31 10v8c0 7.3-4.2 12.8-11 16-6.8-3.2-11-8.7-11-16v-8l11-4Z" fill="${accent}24" stroke="${accent}" stroke-width="2.4" stroke-linejoin="round"/><path d="m14.5 20 3.8 3.8 7.6-8.1" stroke="${secondary}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    case '🛒':
      return `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="${accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>`;
    case '💪':
      return `<svg ${cp}><circle cx="20" cy="20" r="14" fill="${accent}20" stroke="${accent}" stroke-width="2"/><path d="M14 22l4-8h4l-2 5h6l-6 10h-4l2-5h-4Z" fill="${accent}"/></svg>`;
    case '🎯':
      return `<svg ${cp}><circle cx="20" cy="20" r="14" stroke="${accent}" stroke-width="2"/><circle cx="20" cy="20" r="9" stroke="${accent}" stroke-width="1.5" opacity="0.6"/><circle cx="20" cy="20" r="4" stroke="${accent}" stroke-width="1.5" opacity="0.6"/><circle cx="20" cy="20" r="1.5" fill="${accent}"/></svg>`;
    case '✅':
      return `<svg ${cp}><circle cx="20" cy="20" r="14" fill="${accent}20" stroke="${accent}" stroke-width="2"/><path d="m13 20 4.5 4.5 9-9" stroke="${accent}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    case '🧩':
      return `<svg width="34" height="34" viewBox="0 0 640 640" fill="none"><path d="M288 64C323.3 64 352 85.5 352 112C352 122.4 347.6 132 340 139.9C333.4 146.8 328 155.2 328 164.8C328 179.8 340.2 192 355.2 192L400 192C426.5 192 448 213.5 448 240L448 284.8C448 299.8 460.2 312 475.2 312C484.7 312 493.2 306.6 500.1 300C508 292.5 517.6 288 528 288C554.5 288 576 316.7 576 352C576 387.3 554.5 416 528 416C517.6 416 507.9 411.6 500.1 404C493.2 397.4 484.8 392 475.2 392C460.2 392 448 404.2 448 419.2L448 528C448 554.5 426.5 576 400 576L343.2 576C330.4 576 320 565.6 320 552.8C320 543.6 325.8 535.5 333.2 530C344.8 521.3 352 509.3 352 496C352 469.5 323.3 448 288 448C252.7 448 224 469.5 224 496C224 509.3 231.2 521.3 242.8 530C250.2 535.5 256 543.5 256 552.8C256 565.6 245.6 576 232.8 576L112 576C85.5 576 64 554.5 64 528L64 407.2C64 394.4 74.4 384 87.2 384C96.4 384 104.5 389.8 110 397.2C118.7 408.8 130.7 416 144 416C170.5 416 192 387.3 192 352C192 316.7 170.5 288 144 288C130.7 288 118.7 295.2 110 306.8C104.5 314.2 96.5 320 87.2 320C74.4 320 64 309.6 64 296.8L64 240C64 213.5 85.5 192 112 192L220.8 192C235.8 192 248 179.8 248 164.8C248 155.3 242.6 146.8 236 139.9C228.5 132 224 122.4 224 112C224 85.5 252.7 64 288 64z" stroke="${accent}" stroke-width="32" stroke-linejoin="round"/><text x="300" y="410" text-anchor="middle" font-family="Fredoka, 'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="220" fill="${accent}">?</text></svg>`;
    case '❤️':
      return `<svg ${cp}><path d="M20 32C20 32 6 22 6 13.5C6 9.4 9.1 6 13 6C15.7 6 18 7.7 20 10C22 7.7 24.3 6 27 6C30.9 6 34 9.4 34 13.5C34 22 20 32 20 32Z" fill="${accent}30" stroke="${accent}" stroke-width="2.2" stroke-linejoin="round"/></svg>`;
    default:
      // Default: plus/cross icon
      return `<svg ${cp}><circle cx="20" cy="20" r="13" fill="${accent}24" stroke="${accent}" stroke-width="2.3"/><path d="M20 11v18M11 20h18" stroke="${secondary}" stroke-width="2.4" stroke-linecap="round"/></svg>`;
  }
}

// Variant color palettes (matches MotivationBanner.jsx)
const VARIANT_COLORS = {
  panda:     { accent: '#f5b400', secondary: '#48bb78' },
  flamme:    { accent: '#ff8a47', secondary: '#f5b400' },
  couronnes: { accent: '#f5b400', secondary: '#b8a3ff' },
  plain:     { accent: '#48bb78', secondary: '#b8a3ff' },
  diamant:   { accent: '#60cdff', secondary: '#b8a3ff' },
  pieces:    { accent: '#f5b400', secondary: '#f5b400' },
};

function renderInlineBanner(msg) {
  const colors = VARIANT_COLORS[msg.variant] || VARIANT_COLORS.plain;
  const { accent, secondary } = colors;
  const svgIcon = msg.emoji ? getBannerSvg(msg.emoji, accent, secondary) : '';
  const text = msg.emphasis
    ? msg.message.replace(msg.emphasis, `<b style="color:${accent}">${msg.emphasis}</b>`)
    : msg.message;

  return `<div style="border-radius:14px;padding:12px 16px;border:1px solid ${accent}40;
background:linear-gradient(90deg,${accent}1F 0%,${accent}0F 100%);
display:flex;align-items:center;gap:12px;max-width:420px;margin:0.5rem 0 1rem;
font-family:'Plus Jakarta Sans',sans-serif;position:relative">
<span style="position:absolute;top:3px;right:8px;font-size:9px;color:rgba(255,255,255,0.15);font-family:monospace">${msg.arcId}</span>
<div style="width:44px;height:44px;display:flex;align-items:center;justify-content:center;flex-shrink:0">${svgIcon}</div>
<div style="font-size:13px;font-weight:600;color:#fff;line-height:1.45;flex:1">${text}</div>
</div>`;
}

const ICON_GALLERY_ITEMS = [
  { emoji: '📈', label: 'Progression' },
  { emoji: '🏆', label: 'Trophée' },
  { emoji: '🎁', label: 'Cadeau' },
  { emoji: '🔥', label: 'Flamme' },
  { emoji: '💎', label: 'Diamant' },
  { emoji: '👑', label: 'Couronne' },
  { emoji: '🛡️', label: 'Bouclier' },
  { emoji: '🛒', label: 'Panier' },
  { emoji: '🪙', label: 'Pièce' },
  { emoji: '💪', label: 'Force' },
  { emoji: '🎯', label: 'Cible' },
  { emoji: '✅', label: 'Valide' },
  { emoji: '🧩', label: 'Puzzle' },
  { emoji: '❤️', label: 'Cœur' },
  { emoji: null, label: 'Défaut' },
];

function generateIconGallery() {
  const accent = '#f5b400';
  const secondary = '#b8a3ff';
  const card = (svg, label) =>
    `<div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:12px;text-align:center">${svg}<div style="font-size:.72rem;color:#9ca3af;margin-top:6px;font-weight:700">${label}</div></div>`;
  const cards = ICON_GALLERY_ITEMS
    .map(({ emoji, label }) => card(getBannerSvg(emoji, accent, secondary), label))
    .join('\n  ');
  return `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:12px;margin:1rem 0 2rem">\n  ${cards}\n</div>`;
}

function injectInlineBanners(html) {
  const messagesPath = join(DOCS_DIR, 'coaching-messages.json');
  if (!existsSync(messagesPath)) return html;
  const messages = JSON.parse(readFileSync(messagesPath, 'utf-8'));
  // Build arcId → message lookup (some arcIds appear multiple times, keep all)
  const byArc = {};
  for (const m of messages) {
    if (!byArc[m.arcId]) byArc[m.arcId] = [];
    byArc[m.arcId].push(m);
  }

  // Replace each <img alt="arcX.Y" src="...coaching-arcX.Y.png"> with inline banner
  return html.replace(/<p><img src="[^"]*coaching-(arc[\w.]+)\.png" alt="[^"]*"><\/p>/g, (match, arcId) => {
    const msgs = byArc[arcId];
    if (!msgs || msgs.length === 0) return match; // keep original if no data
    // For duplicate arcIds (e.g. arc14.6 with 2 variants), render all
    return msgs.map(m => renderInlineBanner(m)).join('\n');
  });
}

export default function docsPlugin() {
  return {
    name: 'primolingo-docs',
    apply: 'serve', // dev only

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url;

        // ── Annotations API ──────────────────────────────────────────────
        // GET  /docs/api/annotations?slug=XX  → load annotations for page
        // POST /docs/api/annotations?slug=XX  → save annotations for page
        if (url.startsWith('/docs/api/annotations')) {
          const params = new URL(url, 'http://localhost').searchParams;
          const slug = (params.get('slug') || '').replace(/[^a-zA-Z0-9_-]/g, '');
          if (!slug) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'slug required' }));
            return;
          }

          if (req.method === 'GET') {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(loadAnnotations(slug)));
            return;
          }

          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const data = JSON.parse(body);
                saveAnnotations(slug, data);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ ok: true }));
              } catch (e) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'invalid JSON' }));
              }
            });
            return;
          }
        }

        // Serve screenshots as static files
        if (url.startsWith('/docs/screenshots/')) {
          const filePath = join(DOCS_DIR, 'screenshots', url.replace('/docs/screenshots/', ''));
          if (existsSync(filePath)) {
            res.setHeader('Content-Type', 'image/png');
            res.end(readFileSync(filePath));
            return;
          }
        }

        // Coaching preview — renders a single MotivationBanner for screenshot
        if (url.startsWith('/docs/coaching-preview')) {
          const idx = parseInt(new URL(url, 'http://localhost').searchParams.get('idx') || '0');
          const messagesPath = join(DOCS_DIR, 'coaching-messages.json');
          if (existsSync(messagesPath)) {
            const messages = JSON.parse(readFileSync(messagesPath, 'utf-8'));
            const msg = messages[idx] || messages[0];
            const VARIANT_COLORS = {
              panda:'#f5b400', flamme:'#ff8a47', couronnes:'#f5b400',
              plain:'#48bb78', diamant:'#60cdff', pieces:'#f5b400',
            };
            const accent = VARIANT_COLORS[msg.variant] || '#48bb78';
            const secondary = accent;
            const svgIcon = getBannerSvg(msg.emoji, accent, secondary);
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.end(`<!DOCTYPE html><html><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0f1117;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:1rem;font-family:'Plus Jakarta Sans',sans-serif}
.banner{border-radius:14px;padding:12px 16px;border:1px solid ${accent}40;
background:linear-gradient(90deg,${accent}1F 0%,${accent}0F 100%);
display:flex;align-items:center;gap:12px;width:100%;max-width:390px}
.icon{width:44px;height:44px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.msg{font-size:13px;font-weight:600;color:#fff;line-height:1.45;flex:1}
.msg b{color:${accent}}
.arc{position:absolute;top:4px;right:8px;font-size:9px;color:rgba(255,255,255,0.15);font-family:monospace}
</style></head><body>
<div style="position:relative;width:100%">
<span class="arc">${msg.arcId}</span>
<div class="banner">
<div class="icon">${svgIcon}</div>
<div class="msg">${msg.emphasis ? msg.message.replace(msg.emphasis, `<b>${msg.emphasis}</b>`) : msg.message}</div>
</div></div></body></html>`);
            return;
          }
        }

        // Serve docs pages
        if (url === '/docs' || url === '/docs/') {
          const mdFile = join(DOCS_DIR, 'index.md');
          if (existsSync(mdFile)) {
            const md = readFileSync(mdFile, 'utf-8');
            // Fix relative links to include /docs/ prefix
            const mdFixed = md.replace(/\]\((\d{2}-[^)]+)\)/g, '](/docs/$1)');
            const html = marked.parse(mdFixed);
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.end(HTML_TEMPLATE('Sommaire', html, ''));
            return;
          }
        }

        if (url.startsWith('/docs/') && !url.includes('.')) {
          const slug = url.replace('/docs/', '').replace(/\/$/, '');
          const mdFile = join(DOCS_DIR, `${slug}.md`);
          if (existsSync(mdFile)) {
            const md = readFileSync(mdFile, 'utf-8');
            // Replace relative paths: screenshots and inter-page links
            const mdFixed = md
              .replace(/\(screenshots\//g, '(/docs/screenshots/')
              .replace(/\]\(\.\/(\d{2}-[^)]+)\.md\)/g, '](/docs/$1)')
              .replace(/\]\((\d{2}-[^)]+)\.md\)/g, '](/docs/$1)');
            let html = marked.parse(mdFixed);
            // For coaching page, replace screenshot <img> with inline SVG banners + icon gallery
            if (slug === '15-coaching-messages') {
              html = injectInlineBanners(html);
              html = html.replace('<div data-icon-gallery></div>', generateIconGallery());
            }
            const title = md.match(/^# (.+)/m)?.[1] || slug;

            // Build prev/next nav
            const pages = readdirSync(DOCS_DIR)
              .filter(f => f.endsWith('.md') && f !== 'index.md')
              .sort();
            const currentIdx = pages.indexOf(`${slug}.md`);
            let nav = '';
            if (currentIdx > 0) {
              const prev = pages[currentIdx - 1].replace('.md', '');
              nav += `<a href="/docs/${prev}">&larr; Précédent</a>`;
            }
            if (currentIdx < pages.length - 1) {
              const nextPage = pages[currentIdx + 1].replace('.md', '');
              nav += `<a href="/docs/${nextPage}">Suivant &rarr;</a>`;
            }

            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.end(HTML_TEMPLATE(title, html, nav));
            return;
          }
        }

        next();
      });
    },
  };
}
