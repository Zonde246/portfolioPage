/* ─── TELEMETRY — GitHub + Status Feed ─── */
'use strict';

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)   return 'just now';
  if (m < 60)  return m + 'm ago';
  const h = Math.floor(m / 60);
  if (h < 24)  return h + 'h ago';
  const d = Math.floor(h / 24);
  return d + 'd ago';
}

export async function initTelemetry() {
  let tel  = null;
  let stat = null;

  try {
    const [telRes, statRes] = await Promise.all([
      fetch('data/telemetry.json?_=' + Date.now()),
      fetch('data/status.json?_='    + Date.now()),
    ]);
    tel  = await telRes.json();
    stat = await statRes.json();
  } catch (_) {
    /* silently degrade — placeholders remain */
    return;
  }

  renderSparkline(tel);
  renderStats(tel);
  renderActivity(tel);
  renderSitrep(stat);
  renderCliFeed(stat, tel);
}

/* ── Sparkline ── */
function renderSparkline(tel) {
  const el = document.getElementById('wr-sparkline');
  if (!el) return;

  const bars  = tel.sparkline || Array(7).fill(0);
  const maxV  = Math.max(...bars, 1);

  el.innerHTML = bars.map((v, i) => {
    const pct = Math.round((v / maxV) * 100);
    return `<span class="wr-sparkline-bar" style="height:${pct}%" title="${v} commits" aria-label="${v} commits"></span>`;
  }).join('');
}

/* ── Stats ── */
function renderStats(tel) {
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  set('wr-tel-commits', tel.commitCount7d ?? '--');
  set('wr-tel-repos',   tel.repoCount    ?? '--');
  set('wr-tel-last',    tel.lastCommitMessage || '--');
}

/* ── Activity feed ── */
function renderActivity(tel) {
  const el = document.getElementById('wr-telemetry-activity');
  if (!el) return;

  const items = (tel.recentActivity || []).slice(0, 4);
  if (!items.length) return;

  el.innerHTML = items.map(a =>
    `<div class="wr-act-item">` +
      `<span class="wr-act-repo">${esc(a.repo)}</span>` +
      `<span class="wr-act-msg">${esc(a.message)}</span>` +
      `<span class="wr-act-time">${timeAgo(a.time)}</span>` +
    `</div>`
  ).join('');
}

/* ── SITREP top strip — threat level + dynamic data ── */
function renderSitrep(stat) {
  if (!stat) return;

  const threatEl = document.getElementById('wr-threatcon');
  if (threatEl && stat.threatLevel) {
    const lv = stat.threatLevel.toLowerCase();
    threatEl.textContent  = stat.threatLevel;
    threatEl.className    = `wr-sitrep-val wr-threat-${lv}`;
  }

  const opsEl = document.getElementById('wr-ops-count');
  if (opsEl && stat.availability) {
    /* count active ops from data.js PROJECTS (3 active) — hardcoded here, updated by warroom.js */
    opsEl.textContent = '3 ACTIVE';
  }
}

/* ── CLI feed items ── */
export function buildFeedItems(stat, tel) {
  const items = [];

  if (stat?.nowReading)
    items.push(`NOW READING: ${stat.nowReading}`);
  if (stat?.nowPlaying)
    items.push(`PLAYING: ${stat.nowPlaying}`);
  if (stat?.currentFocus)
    items.push(`CURRENT OP: ${stat.currentFocus}`);
  if (tel?.lastCommitMessage)
    items.push(`LAST COMMIT: ${tel.lastCommitMessage}`);
  if (tel?.commitCount7d !== undefined)
    items.push(`7D COMMITS: ${tel.commitCount7d} pushes · ${tel.repoCount} repos`);
  if (stat?.availability)
    items.push(`STATUS: ${stat.availability}`);

  items.push('CLASSIFICATION: OPEN RESEARCH // NOT REDACTED');
  items.push('GEO: 12.9716°N 79.1588°E // VIT VELLORE // IST UTC+5:30');

  return items;
}

function renderCliFeed(stat, tel) {
  const el = document.getElementById('wr-cli-content');
  if (!el) return;

  const items = buildFeedItems(stat, tel);
  if (!items.length) return;

  let idx = 0;
  const tick = () => {
    el.style.opacity = '0';
    setTimeout(() => {
      el.textContent  = items[idx % items.length];
      el.style.opacity = '1';
      idx++;
    }, 400);
  };

  tick();
  setInterval(tick, 5000);
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
