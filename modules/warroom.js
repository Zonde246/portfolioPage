/* ─── WAR ROOM ORCHESTRATOR ─── */
'use strict';
import { PROJECTS }      from './data.js';
import { initWorldMap }  from './world-map.js';
import { initTelemetry } from './telemetry.js';
import { applyRedaction } from './utils.js';

/* ── Constants ── */
const CAT_COLOR = {
  security: '#2dd4bf',
  access:   '#60a5fa',
  hack:     '#fbbf24',
  sys:      '#a78bfa',
};

/* ── Boot sequence ── */
function boot() {
  const wr = document.getElementById('warroom');
  if (!wr) return;

  /* Assign stagger indices */
  const bootEls = wr.querySelectorAll('[data-wr-boot]');
  bootEls.forEach((el, i) => {
    el.setAttribute('data-wr-boot', String(i + 1));
  });

  /* Trigger boot by adding class after next paint */
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      wr.classList.add('wr-ready');
    });
  });
}

/* ── Live SITREP clock ── */
function initClock() {
  const utcEl = document.getElementById('wr-clock-utc');
  const istEl = document.getElementById('wr-clock-ist');

  function tick() {
    const now = new Date();

    if (utcEl) {
      utcEl.textContent = now.toLocaleTimeString('en-GB', {
        timeZone: 'UTC',
        hour12: false,
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      });
    }

    if (istEl) {
      istEl.textContent = now.toLocaleTimeString('en-GB', {
        timeZone: 'Asia/Kolkata',
        hour12: false,
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      });
    }
  }

  tick();
  setInterval(tick, 1000);
}

/* ── Panel swap ── */
let mapInstance = null;

function showPanel(id) {
  const panels = document.querySelectorAll('.wr-panel');
  panels.forEach(p => {
    if (p.id === id) {
      p.hidden = false;
      p.removeAttribute('hidden');
    } else {
      p.hidden = true;
    }
  });
}

function showMap() {
  showPanel('wr-panel-map');
  if (mapInstance) mapInstance.clearSelection();
  deselectMissionItem();
}

/* ── Inline dossier renderer ── */
function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatBody(text) {
  /* Double pipe = paragraph break */
  return (text || '').split('||').map(p => `<p>${applyRedaction(esc(p.trim()))}</p>`).join('');
}

function renderInlineDossier(projectId) {
  const p = PROJECTS.find(p => p.id === projectId);
  if (!p) return;

  const d = p.dossier;
  const el = document.getElementById('wr-inline-dossier');
  const fileId = document.getElementById('wr-dossier-file-id');

  if (fileId) fileId.textContent = p.id;

  const statusClass = d.status === 'ONGOING' ? 'wr-dos-status--active' : 'wr-dos-status--complete';
  const col = CAT_COLOR[p.cat] || '#a78bfa';

  /* Metrics */
  let metricsHtml = '';
  if (d.stat) {
    metricsHtml += `<div class="wr-dos-metric">
      <span class="wr-dos-metric-val" style="color:${col}">${esc(d.stat)}</span>
      <span class="wr-dos-metric-label">${esc(d.statLabel || '')}</span>
    </div>`;
  }
  if (d.stat2) {
    metricsHtml += `<div class="wr-dos-metric">
      <span class="wr-dos-metric-val" style="color:${col}">${esc(d.stat2)}</span>
      <span class="wr-dos-metric-label">${esc(d.stat2Label || '')}</span>
    </div>`;
  }

  /* Links */
  let linksHtml = '';
  if (d.github) {
    linksHtml += `<a href="${esc(d.github)}" target="_blank" rel="noopener" class="wr-dos-link">[ GitHub ]</a>`;
  }
  if (d.link) {
    const links = d.link.split(',');
    links.forEach(l => {
      linksHtml += `<a href="${esc(l.trim())}" target="_blank" rel="noopener" class="wr-dos-link">[ Live ]</a>`;
    });
  }
  if (d.demo) {
    const demos = d.demo.split(',');
    demos.forEach((l, i) => {
      linksHtml += `<a href="${esc(l.trim())}" target="_blank" rel="noopener" class="wr-dos-link">[ Demo ${i + 1} ]</a>`;
    });
  }

  el.innerHTML = `
    <div class="wr-dos-stamp-row">
      <span class="wr-dos-stamp">${esc(d.clearance)}</span>
      <span class="wr-dos-status ${statusClass}">${esc(d.status)}</span>
    </div>
    <h2 class="wr-dos-title" style="color:${col}">${esc(d.name)}</h2>
    <p class="wr-dos-badge">${esc(d.badge)}</p>
    <div class="wr-dos-redact"></div>
    ${metricsHtml ? `<div class="wr-dos-metrics">${metricsHtml}</div>` : ''}
    <div class="wr-dos-section">
      <p class="wr-dos-section-label">// Overview</p>
      <div class="wr-dos-section-body">${formatBody(d.overview)}</div>
    </div>
    <div class="wr-dos-section">
      <p class="wr-dos-section-label">// Architecture</p>
      <div class="wr-dos-section-body">${formatBody(d.architecture)}</div>
    </div>
    <div class="wr-dos-section">
      <p class="wr-dos-section-label">// Operator Contribution</p>
      <div class="wr-dos-section-body">${formatBody(d.contribution)}</div>
    </div>
    <div class="wr-dos-section">
      <p class="wr-dos-section-label">// Outcome</p>
      <div class="wr-dos-section-body">${formatBody(d.outcome)}</div>
    </div>
    ${linksHtml ? `<div class="wr-dos-links">${linksHtml}</div>` : ''}
  `;

  /* Reset scroll */
  el.scrollTop = 0;
}

/* ── Open dossier panel ── */
function openDossier(projectId) {
  renderInlineDossier(projectId);
  showPanel('wr-panel-dossier');
  selectMissionItem(projectId);
}

/* ── Mission queue ── */
function renderMissionQueue() {
  const list = document.getElementById('wr-mission-list');
  if (!list) return;

  list.innerHTML = PROJECTS
    .filter(p => !p.earlier)
    .map(p => {
      const statusText  = p.active
        ? 'ACTIVE'
        : (p.dossier.status === 'ONGOING' ? 'ONGOING' : 'COMPLETE');
      const statusClass = p.active
        ? 'wr-mission-status--active'
        : (p.dossier.status === 'ONGOING' ? 'wr-mission-status--review' : 'wr-mission-status--complete');

      return `<div class="wr-mission-item${p.active ? ' wr-mission-item--active' : ''}"
                   data-project-id="${esc(p.id)}"
                   role="button" tabindex="0"
                   aria-label="${esc(p.codename)} — click to view dossier">
        <span class="wr-mission-id">${esc(p.id)}</span>
        <span class="wr-mission-name">${esc(p.codename)}</span>
        <span class="wr-mission-status ${statusClass}">${statusText}</span>
      </div>`;
    })
    .join('');

  list.addEventListener('click', e => {
    const item = e.target.closest('[data-project-id]');
    if (item) openDossier(item.dataset.projectId);
  });

  list.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      const item = e.target.closest('[data-project-id]');
      if (item) { e.preventDefault(); openDossier(item.dataset.projectId); }
    }
  });
}

function selectMissionItem(projectId) {
  document.querySelectorAll('.wr-mission-item').forEach(el => {
    el.classList.toggle('wr-mission-item--selected', el.dataset.projectId === projectId);
  });
}

function deselectMissionItem() {
  document.querySelectorAll('.wr-mission-item').forEach(el => {
    el.classList.remove('wr-mission-item--selected');
  });
}

/* ── Capabilities panel ── */
const SPECS = [
  { domain: 'Computer Vision',     depth: 'primary',   tags: ['PyTorch', 'YOLOv8', 'MediaPipe', '3D-CNN', 'OpenCV'] },
  { domain: 'Security & Crypto',   depth: 'primary',   tags: ['RSA Blind Sig', 'AES-GCM', 'ECDH', 'EDR', 'ONNX'] },
  { domain: 'Systems',             depth: 'proficient', tags: ['C / C++', 'Linux', 'Networking', 'Cisco', 'IPC', 'DSA'] },
  { domain: 'Backend & Data',      depth: 'proficient', tags: ['Python', 'Flask', 'Node.js', 'Express', 'Django'] },
  { domain: 'Frontend',            depth: 'applied',   tags: ['ReactJS', 'Next.js', 'Flutter', 'Vanilla JS'] },
  { domain: 'Databases',           depth: 'applied',   tags: ['PostgreSQL', 'MongoDB', 'InfluxDB', 'Supabase'] },
];

function renderCapabilitiesPanel() {
  const el = document.getElementById('wr-cap-full');
  if (!el) return;

  el.innerHTML = SPECS.map(s => `
    <div class="wr-spec-cell">
      <div class="wr-spec-cell-header">
        <span class="wr-spec-domain">${esc(s.domain)}</span>
        <span class="wr-spec-depth wr-spec-depth--${s.depth}">${s.depth.toUpperCase()}</span>
      </div>
      <div class="wr-spec-tools">
        ${s.tags.map(t => `<span class="wr-spec-tag">${esc(t)}</span>`).join('')}
      </div>
    </div>
  `).join('');
}

/* ── Operator / background panel ── */
function renderOperatorPanel() {
  const el = document.getElementById('wr-op-full');
  if (!el) return;

  el.innerHTML = `
    <div class="wr-op-edu">
      <div class="wr-op-edu-abbr">VIT</div>
      <div class="wr-op-edu-body">
        <p class="wr-op-edu-degree">BCA — Bachelor of Computer Applications</p>
        <p class="wr-op-edu-inst">Vellore Institute of Technology</p>
        <p class="wr-op-edu-year">Expected 2026</p>
        <div class="wr-op-badges">
          <a class="wr-op-badge" href="https://1drv.ms/b/c/fcf757163cbff0d2/IQAizzWX_Os3Sr_MhwTHaeryAeJtOsnAUsyeTudTx3EEWMQ" target="_blank" rel="noopener">CGPA Top 10 · Y1</a>
          <a class="wr-op-badge" href="https://1drv.ms/b/c/fcf757163cbff0d2/IQCYRTF4ok3bS5HzD2TnhOxdAURmlqq3sK0ngRTePWhnjmY?e=5Pk8nL" target="_blank" rel="noopener">CGPA Top 10 · Y2</a>
          <a class="wr-op-badge" href="https://1drv.ms/b/c/fcf757163cbff0d2/IQB9AE8Rb7i3Rq62VOpUF4peAb4SHAE2IiF_Qf9-KZLMfMQ?e=2DA2ri" target="_blank" rel="noopener">CGPA 9.3 · Y3</a>
        </div>
      </div>
    </div>
    <p class="wr-op-cert-label">Certifications</p>
    <div class="wr-op-certs">
      <a class="wr-op-cert" href="https://coursera.org/share/7b024f7bf9574fab1fecc731b259591c" target="_blank" rel="noopener">
        <span class="wr-op-cert-name">IBM Cybersecurity Analyst</span>
        <span class="wr-op-cert-meta">9-course · IBM</span>
      </a>
      <a class="wr-op-cert" href="https://coursera.org/share/37feb7ab579c73ec4240aa38eb3e34eb" target="_blank" rel="noopener">
        <span class="wr-op-cert-name">AWS Cloud Technical Essentials</span>
        <span class="wr-op-cert-meta">AWS</span>
      </a>
      <a class="wr-op-cert" href="https://www.udemy.com/certificate/UC-5e650896-ec1e-4ee8-bb94-787b11165c5e/" target="_blank" rel="noopener">
        <span class="wr-op-cert-name">Complete JavaScript Course 2023</span>
        <span class="wr-op-cert-meta">Jonas Schmedtmann · Udemy</span>
      </a>
      <a class="wr-op-cert" href="https://www.udemy.com/certificate/UC-20a1f4d4-5068-48a7-88b1-2d99c8b789c3/" target="_blank" rel="noopener">
        <span class="wr-op-cert-name">Next.js &amp; React — Complete Guide</span>
        <span class="wr-op-cert-meta">Maximilian Schwarzmüller · Udemy</span>
      </a>
      <a class="wr-op-cert" href="https://www.udemy.com/certificate/UC-cdfa5287-e586-45a3-99c2-64701d0ccbd6/" target="_blank" rel="noopener">
        <span class="wr-op-cert-name">React, NodeJS, Express &amp; MongoDB — MERN</span>
        <span class="wr-op-cert-meta">Academind · Udemy</span>
      </a>
    </div>
  `;
}

/* ── Mini capability canvas (left tile) ── */
function initCapMini() {
  const canvas = document.getElementById('wr-cap-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const NODES = [
    { label: 'CV',       x: 0.5,  y: 0.2,  col: '#60a5fa', r: 5 },
    { label: 'Security', x: 0.85, y: 0.5,  col: '#2dd4bf', r: 5 },
    { label: 'Systems',  x: 0.7,  y: 0.85, col: '#a78bfa', r: 4 },
    { label: 'Backend',  x: 0.3,  y: 0.85, col: '#a78bfa', r: 4 },
    { label: 'ML',       x: 0.15, y: 0.5,  col: '#60a5fa', r: 4 },
    { label: 'Me',       x: 0.5,  y: 0.5,  col: '#c4b5fd', r: 6 },
  ];

  const LINKS = [[5,0],[5,1],[5,2],[5,3],[5,4],[0,1],[0,4],[1,2],[3,4]];

  let W = 0, H = 0, DPR = 1, rafId = null;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = rect.width; H = rect.height;
    canvas.width  = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.scale(DPR, DPR);
  }

  function loop(ts) {
    ctx.clearRect(0, 0, W, H);

    /* links */
    for (const [a, b] of LINKS) {
      const ax = NODES[a].x * W, ay = NODES[a].y * H;
      const bx = NODES[b].x * W, by = NODES[b].y * H;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.strokeStyle = 'rgba(255,255,255,0.07)';
      ctx.lineWidth   = 0.75;
      ctx.stroke();
    }

    /* nodes */
    for (const n of NODES) {
      const x = n.x * W, y = n.y * H;
      const pulse = (Math.sin(ts * 0.002 + x) + 1) * 0.5;

      ctx.beginPath();
      ctx.arc(x, y, n.r + pulse * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = n.col + '99';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, n.r * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = n.col;
      ctx.fill();
    }

    rafId = requestAnimationFrame(loop);
  }

  resize();
  rafId = requestAnimationFrame(loop);

  const ro = new ResizeObserver(() => {
    cancelAnimationFrame(rafId);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    resize();
    rafId = requestAnimationFrame(loop);
  });
  ro.observe(canvas);
}

/* ── Keyboard navigation ── */
function initKeyboard() {
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const dossier = document.getElementById('wr-panel-dossier');
      if (dossier && !dossier.hidden) showMap();
      const cap = document.getElementById('wr-panel-capabilities');
      if (cap && !cap.hidden) showMap();
      const op = document.getElementById('wr-panel-operator');
      if (op && !op.hidden) showMap();
    }
  });
}

/* ── ENTRY ── */
export async function initWarRoom() {
  const warroom = document.getElementById('warroom');
  if (!warroom) return;

  /* Populate static panels */
  renderMissionQueue();
  renderCapabilitiesPanel();
  renderOperatorPanel();

  /* Clock */
  initClock();

  /* Mini capability graph */
  initCapMini();

  /* World map */
  const mapCanvas = document.getElementById('wr-world-map');
  if (mapCanvas) {
    mapInstance = initWorldMap(mapCanvas, id => {
      openDossier(id);
    });
  }

  /* Telemetry fetch */
  await initTelemetry();

  /* Back buttons */
  ['wr-panel-back', 'wr-cap-back', 'wr-op-back'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', showMap);
  });

  /* Tile clicks */
  const capTile = document.getElementById('wr-tile-capabilities');
  if (capTile) {
    capTile.addEventListener('click', () => {
      showPanel('wr-panel-capabilities');
      deselectMissionItem();
    });
    capTile.addEventListener('keydown', e => {
      if (e.key === 'Enter') { showPanel('wr-panel-capabilities'); deselectMissionItem(); }
    });
  }

  const opTile = document.getElementById('wr-tile-operator');
  if (opTile) {
    opTile.addEventListener('click', () => {
      showPanel('wr-panel-operator');
      deselectMissionItem();
    });
    opTile.addEventListener('keydown', e => {
      if (e.key === 'Enter') { showPanel('wr-panel-operator'); deselectMissionItem(); }
    });
  }

  /* Keyboard */
  initKeyboard();

  /* Boot */
  boot();
}
