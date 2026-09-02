/* ─── WORLD MAP — GLOBAL OPS THEATER (pannable + zoomable + wraparound) ─── */
'use strict';

const CAT_COLOR = {
  security: '#2dd4bf',
  access:   '#60a5fa',
  hack:     '#fbbf24',
  sys:      '#a78bfa',
};

const MAP_PROJECTS = [
  { id: 'FILE-000', name: 'FIELDSTATION ZERO', cat: 'sys',      metric: '0 deps',      lon:  79.16, lat:  12.97, active: true,  geo: 'Vellore, India' },
  { id: 'FILE-001', name: 'PaleGuard',          cat: 'security', metric: '88% detect',  lon: -77.44, lat:  39.05, active: true,  geo: 'Virginia, USA' },
  { id: 'FILE-002', name: 'Qyra',              cat: 'sys',      metric: 'Alpha',        lon:  13.40, lat:  52.52, active: true,  geo: 'Berlin, Germany' },
  { id: 'FILE-003', name: 'ZonFormer',          cat: 'sys',      metric: '+33.6%',      lon:  35.21, lat:  31.77, active: true,  geo: 'Jerusalem, Israel' },
  { id: 'FILE-004', name: 'EMBARGO',            cat: 'sys',      metric: 'SEALED',      lon: -30.00, lat:  40.00, active: true,  geo: 'LOCATION WITHHELD' },
  { id: 'FILE-005', name: 'GREENWAVE',          cat: 'sys',      metric: 'Lane-free',   lon:  80.27, lat:  13.08, active: true,  geo: 'Chennai, India' },
  { id: 'FILE-006', name: 'DEVANAGARI',         cat: 'sys',      metric: 'ROUGE-L 47.4', lon: 83.01, lat:  25.32, active: true,  geo: 'Varanasi, India' },
  { id: 'FILE-007', name: 'VIPER-1',            cat: 'sys',      metric: '0 assets',    lon: 139.67, lat:  35.28,               geo: 'Yokosuka, Japan' },
  { id: 'FILE-008', name: 'NotBigBrother',      cat: 'security', metric: 'Zero PII',    lon:   6.15, lat:  46.20,               geo: 'Geneva, Switzerland' },
  { id: 'FILE-009', name: 'ARCHON',             cat: 'security', metric: 'AES-256',     lon:  24.75, lat:  59.44,               geo: 'Tallinn, Estonia' },
  { id: 'FILE-010', name: 'VisionAid',          cat: 'access',   metric: '16 FPS',      lon:  77.59, lat:  12.97,               geo: 'Bangalore, India' },
  { id: 'FILE-011', name: 'ASL Transcription',  cat: 'access',   metric: '96% mAP',     lon: -74.00, lat:  40.71,               geo: 'New York, USA' },
  { id: 'FILE-012', name: 'Plant Disease',      cat: 'hack',     metric: '99.97%',       lon:  77.21, lat:  28.61,               geo: 'New Delhi, India' },
  { id: 'FILE-013', name: 'P2P Rental',         cat: 'hack',     metric: 'Best UI/UX',  lon:  72.88, lat:  19.08,               geo: 'Mumbai, India' },
  { id: 'FILE-014', name: 'Minimax AI',         cat: 'sys',      metric: '255K nodes',  lon:  -2.24, lat:  53.48,               geo: 'Manchester, UK' },
  { id: 'FILE-015', name: 'Ashram Mgmt',        cat: 'sys',      metric: '3 Roles',     lon:  78.30, lat:  30.09,               geo: 'Rishikesh, India' },
  { id: 'FILE-016', name: 'GapEdit',            cat: 'hack',     metric: '8 hrs',        lon:  73.86, lat:  18.52,               geo: 'Pune, India' },
  { id: 'FILE-017', name: 'SWITCHBOARD',        cat: 'hack',     metric: 'Top 3',        lon:-121.89, lat:  37.34,               geo: 'San Jose, USA' },
  { id: 'FILE-018', name: 'Linux Blog',         cat: 'sys',      metric: 'Published',   lon:  25.00, lat:  60.17,               geo: 'Helsinki, Finland' },
  { id: 'FILE-019', name: 'Python Launcher',    cat: 'sys',      metric: '29 excs',     lon:  88.36, lat:  22.57,               geo: 'Kolkata, India' },
  { id: 'FILE-020', name: 'Faculty Mgmt',       cat: 'sys',      metric: 'Deployed',    lon:  78.48, lat:  17.38,               geo: 'Hyderabad, India' },
];

const VELLORE    = { lon: 79.1588, lat: 12.9716 };
const CENTER_LON = 20;   /* Mercator projection centre */
const MIN_ZOOM   = 0.4;
const MAX_ZOOM   = 12;

/* ── Mercator projection ── */
/* scale = W/(2π) × zoom; world width = W × zoom */
function project(lon, lat, w, h, zoomLevel, panOffset = 0) {
  const scale = w / (2 * Math.PI) * zoomLevel;
  const x     = (lon - CENTER_LON) * (Math.PI / 180) * scale + w / 2 + panOffset;
  const latRad = lat * (Math.PI / 180);
  const mercN  = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const y      = h / 2 - mercN * scale;
  return [x, y];
}

export function initWorldMap(canvas, onProjectSelect) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let land = null;
  let W = 0, H = 0, DPR = 1;
  let rafId    = null;
  let hovered  = null;
  let selected = null;

  /* ── pan + zoom state ── */
  let panX         = 0;
  let velX         = 0;
  let zoom         = 1;
  let isDragging   = false;
  let lastDragX    = 0;
  let lastDragTime = 0;
  let prevDragX    = 0;
  let prevDragTime = 0;

  /* ── pinch state ── */
  let touch2Dist = 0;
  let touch2MidX = 0;

  /* ── local projection wrapper (closes over W, H, zoom) ── */
  const proj = (lon, lat, pan) => project(lon, lat, W, H, zoom, pan);

  /* ── world width at current zoom ── */
  const WW = () => W * zoom;

  /* ── tooltip ── */
  const tooltip = document.createElement('div');
  tooltip.className = 'wr-map-tooltip';
  tooltip.hidden = true;
  document.body.appendChild(tooltip);

  /* ── zoom controls ── */
  const controls = document.createElement('div');
  controls.className = 'wr-map-controls';
  controls.innerHTML =
    `<button class="wr-map-btn" data-action="zoom-in"  title="Zoom in">+</button>` +
    `<button class="wr-map-btn" data-action="reset"    title="Reset view">⊙</button>` +
    `<button class="wr-map-btn" data-action="zoom-out" title="Zoom out">−</button>`;
  canvas.parentElement.appendChild(controls);

  const zoomLabel = document.createElement('span');
  zoomLabel.className = 'wr-map-zoom-label';
  controls.appendChild(zoomLabel);

  controls.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const a = btn.dataset.action;
    if      (a === 'zoom-in')  applyZoom(1.5, W / 2);
    else if (a === 'zoom-out') applyZoom(1 / 1.5, W / 2);
    else                       { zoom = 1; panX = 0; velX = 0; }
  });

  /* ── load land polygons ── */
  fetch('data/world-slim.json')
    .then(r => r.json())
    .then(data => { land = data; resize(); rafId = requestAnimationFrame(loop); })
    .catch(()  => {               resize(); rafId = requestAnimationFrame(loop); });

  /* ── resize ── */
  function resize() {
    const rect = canvas.getBoundingClientRect();
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W   = rect.width;
    H   = rect.height;
    canvas.width  = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.scale(DPR, DPR);
  }

  /* ── apply zoom centred on canvas-x mx ── */
  function applyZoom(factor, mx) {
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom * factor));
    if (newZoom === zoom) return;
    const ratio = newZoom / zoom;
    /* keep the lon under mx fixed: mx = f(lon, panX, zoom) = f(lon, newPanX, newZoom) */
    panX = (mx - W / 2) * (1 - ratio) + panX * ratio;
    zoom = newZoom;
  }

  /* ── node positions for one pan offset ── */
  function nodePositionsAt(pan) {
    return MAP_PROJECTS.map(p => {
      const [x, y] = proj(p.lon, p.lat, pan);
      return { p, x, y };
    });
  }

  /* ── draw land polygons ── */
  function drawLandAt(pan) {
    if (!land) return;
    ctx.fillStyle   = '#0e0e14';
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth   = 0.5;
    for (const ring of land) {
      if (!ring.length) continue;
      ctx.beginPath();
      const [x0, y0] = proj(ring[0][0], ring[0][1], pan);
      ctx.moveTo(x0, y0);
      for (let i = 1; i < ring.length; i++) {
        const [x, y] = proj(ring[i][0], ring[i][1], pan);
        ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }

  /* ── lat/lon grid ── */
  function drawGridAt(pan) {
    ctx.strokeStyle = 'rgba(255,255,255,0.028)';
    ctx.lineWidth   = 0.5;
    for (let lon = -180; lon <= 180; lon += 30) {
      ctx.beginPath();
      for (let lat = -80; lat <= 80; lat += 5) {
        const [x, y] = proj(lon, lat, pan);
        lat === -80 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    for (let lat = -60; lat <= 60; lat += 30) {
      ctx.beginPath();
      for (let lon = -180; lon <= 180; lon += 5) {
        const [x, y] = proj(lon, lat, pan);
        lon === -180 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }

  /* ── Vellore ground station ── */
  function drawStation(t, pan) {
    const [vx, vy] = proj(VELLORE.lon, VELLORE.lat, pan);
    for (let i = 0; i < 3; i++) {
      const phase = (t * 0.0008 + i * 0.33) % 1;
      ctx.beginPath();
      ctx.arc(vx, vy, phase * 44, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(167,139,250,${(1 - phase) * 0.4})`;
      ctx.lineWidth   = 1;
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(167,139,250,0.35)';
    ctx.lineWidth   = 0.75;
    ctx.beginPath();
    ctx.moveTo(vx - 16, vy); ctx.lineTo(vx - 6, vy);
    ctx.moveTo(vx + 6,  vy); ctx.lineTo(vx + 16, vy);
    ctx.moveTo(vx, vy - 16); ctx.lineTo(vx, vy - 6);
    ctx.moveTo(vx, vy + 6);  ctx.lineTo(vx, vy + 16);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(vx, vy, 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(167,139,250,0.9)';
    ctx.fill();
    ctx.fillStyle = 'rgba(167,139,250,0.55)';
    ctx.font      = `${Math.max(9, 11 * zoom)}px "IBM Plex Mono"`;
    ctx.fillText('GROUND STATION · VELLORE', vx + 9, vy - 9);
  }

  /* ── arcs + animated signal dots ── */
  function drawArcsAt(t, pan) {
    const [vx, vy] = proj(VELLORE.lon, VELLORE.lat, pan);
    for (const p of MAP_PROJECTS) {
      const [px, py] = proj(p.lon, p.lat, pan);
      const dx = px - vx, dy = py - vy;
      if (dx * dx + dy * dy < 100) continue;
      const col = CAT_COLOR[p.cat] || '#a78bfa';
      const len = Math.sqrt(dx * dx + dy * dy);
      const arc = Math.min(len * 0.25, 60);
      const cpx = (vx + px) / 2 - (dy / len) * arc;
      const cpy = (vy + py) / 2 + (dx / len) * arc;
      ctx.beginPath();
      ctx.moveTo(vx, vy);
      ctx.quadraticCurveTo(cpx, cpy, px, py);
      ctx.strokeStyle = hexAlpha(col, p.active ? 0.22 : 0.09);
      ctx.lineWidth   = p.active ? 0.9 : 0.5;
      ctx.setLineDash(p.active ? [] : [3, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
      if (p.active) {
        const qt  = ((t * 0.0004) + (p.lon * 0.01)) % 1;
        const bx  = (1-qt)*(1-qt)*vx + 2*(1-qt)*qt*cpx + qt*qt*px;
        const by  = (1-qt)*(1-qt)*vy + 2*(1-qt)*qt*cpy + qt*qt*py;
        ctx.beginPath();
        ctx.arc(bx, by, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = hexAlpha(col, 0.85);
        ctx.fill();
      }
    }
  }

  /* ── project nodes ── */
  function drawNodesAt(t, pan) {
    for (const { p, x, y } of nodePositionsAt(pan)) {
      const isHovered  = hovered  && hovered.id  === p.id;
      const isSelected = selected && selected.id === p.id;
      const col = CAT_COLOR[p.cat] || '#a78bfa';
      const r   = p.active ? 6 : 4.5;
      if (isHovered || isSelected) {
        const rr = (isSelected ? 13 : 11) + Math.sin(t * 0.004) * 1.5;
        ctx.beginPath();
        ctx.arc(x, y, rr, 0, Math.PI * 2);
        ctx.strokeStyle = hexAlpha(col, isSelected ? 0.8 : 0.45);
        ctx.lineWidth   = isSelected ? 1.5 : 1;
        ctx.stroke();
      }
      if (p.active) {
        const phase = (t * 0.0007 + p.lon * 0.005) % 1;
        ctx.beginPath();
        ctx.arc(x, y, phase * 20 + r, 0, Math.PI * 2);
        ctx.strokeStyle = hexAlpha(col, (1 - phase) * 0.5);
        ctx.lineWidth   = 1;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = hexAlpha(col, p.active ? 0.9 : 0.55);
      if (isHovered || isSelected) { ctx.shadowColor = col; ctx.shadowBlur = 10; }
      ctx.fill();
      ctx.shadowBlur = 0;
      if (p.active || isHovered || isSelected) {
        ctx.fillStyle = hexAlpha(col, (isHovered || isSelected) ? 0.95 : 0.6);
        ctx.font = `${(isHovered || isSelected) ? 11 : 10}px "IBM Plex Mono"`;
        ctx.fillText(p.name, x + r + 5, y + 4);
      }
    }
  }

  /* ── radar sweep from Vellore ── */
  function drawSweep(t, pan) {
    const [vx, vy] = proj(VELLORE.lon, VELLORE.lat, pan);
    const angle    = (t * 0.0004) % (Math.PI * 2);
    const sweepR   = Math.max(W, H) * 1.5;
    ctx.save();
    ctx.translate(vx, vy);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.arc(0, 0, sweepR, -0.3, 0);
    ctx.lineTo(0, 0);
    ctx.closePath();
    const sweep = ctx.createRadialGradient(0, 0, 0, 0, 0, sweepR);
    sweep.addColorStop(0,   'rgba(124,58,237,0.07)');
    sweep.addColorStop(0.6, 'rgba(124,58,237,0.03)');
    sweep.addColorStop(1,   'rgba(124,58,237,0)');
    ctx.fillStyle = sweep;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(sweepR, 0);
    ctx.strokeStyle = 'rgba(167,139,250,0.22)';
    ctx.lineWidth   = 1;
    ctx.stroke();
    ctx.restore();
  }

  /* ── render loop ── */
  function loop(ts) {
    if (!isDragging) {
      panX += velX;
      velX *= 0.88;
      if (Math.abs(velX) < 0.05) velX = 0;
    }

    const ww = WW();
    panX = ((panX % ww) + ww) % ww; /* normalise to [0, ww) */

    ctx.clearRect(0, 0, W, H);

    /* land spans [p − ww·200/360, p + ww·160/360] for CENTER_LON=20 */
    const LAND_L = ww * 200 / 360;
    const LAND_R = ww * 160 / 360;
    /* draw enough copies to tile the viewport at any zoom */
    const n = Math.ceil(W / ww) + 2;
    for (let k = -n; k <= n; k++) {
      const p = panX + k * ww;
      if (p + LAND_R < 0 || p - LAND_L > W) continue; /* cull off-screen copies */
      drawGridAt(p);
      drawLandAt(p);
      drawSweep(ts, p);
      drawArcsAt(ts, p);
      drawStation(ts, p);
      drawNodesAt(ts, p);
    }

    /* update zoom label */
    zoomLabel.textContent = zoom.toFixed(1) + '×';

    rafId = requestAnimationFrame(loop);
  }

  /* ── hit test across all visible copies ── */
  function hitTest(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const mx = clientX - rect.left;
    const my = clientY - rect.top;
    const ww  = WW();
    const HIT = 18;
    const n   = Math.ceil(W / ww) + 2;
    for (let k = -n; k <= n; k++) {
      const p = panX + k * ww;
      for (const { p: proj, x, y } of nodePositionsAt(p)) {
        const dx = x - mx, dy = y - my;
        if (dx * dx + dy * dy < HIT * HIT) return proj;
      }
    }
    return null;
  }

  /* ── wheel zoom ── */
  function onWheel(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const mx   = e.clientX - rect.left;
    const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
    applyZoom(factor, mx);
    velX = 0; /* kill momentum on zoom */
  }

  /* ── mouse drag ── */
  function onMouseDown(e) {
    if (e.button !== 0) return;
    isDragging   = true;
    lastDragX    = e.clientX;
    prevDragX    = e.clientX;
    lastDragTime = performance.now();
    prevDragTime = lastDragTime;
    velX         = 0;
    canvas.style.cursor = 'grabbing';
  }

  function onMouseMove(e) {
    if (!isDragging) {
      const node = hitTest(e.clientX, e.clientY);
      hovered = node || null;
      canvas.style.cursor = hovered ? 'pointer' : 'crosshair';
      node ? showTooltip(e.clientX, e.clientY, node) : hideTooltip();
      return;
    }
    const now = performance.now();
    const dx  = e.clientX - lastDragX;
    panX     += dx;
    const dt  = now - prevDragTime || 16;
    velX      = (e.clientX - prevDragX) / dt * 16;
    prevDragX    = lastDragX;
    prevDragTime = lastDragTime;
    lastDragX    = e.clientX;
    lastDragTime = now;
    hideTooltip();
  }

  function onMouseUp(e) {
    if (!isDragging) return;
    isDragging = false;
    const totalDx = Math.abs(e.clientX - (lastDragX - velX));
    if (totalDx < 4) {
      const node = hitTest(e.clientX, e.clientY);
      if (node) { selected = node; onProjectSelect && onProjectSelect(node.id); }
    }
    canvas.style.cursor = hovered ? 'pointer' : 'crosshair';
  }

  /* ── touch events (drag + pinch) ── */
  function onTouchStart(e) {
    if (e.touches.length === 1) {
      isDragging   = true;
      lastDragX    = e.touches[0].clientX;
      prevDragX    = lastDragX;
      lastDragTime = performance.now();
      prevDragTime = lastDragTime;
      velX         = 0;
    } else if (e.touches.length === 2) {
      isDragging = false;
      const dx   = e.touches[1].clientX - e.touches[0].clientX;
      const dy   = e.touches[1].clientY - e.touches[0].clientY;
      touch2Dist = Math.sqrt(dx * dx + dy * dy);
      const rect = canvas.getBoundingClientRect();
      touch2MidX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
    }
  }

  function onTouchMove(e) {
    e.preventDefault();
    if (e.touches.length === 2) {
      const dx   = e.touches[1].clientX - e.touches[0].clientX;
      const dy   = e.touches[1].clientY - e.touches[0].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (touch2Dist > 0) applyZoom(dist / touch2Dist, touch2MidX);
      touch2Dist = dist;
      const rect = canvas.getBoundingClientRect();
      touch2MidX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
      return;
    }
    if (!isDragging || e.touches.length !== 1) return;
    const now = performance.now();
    const cx  = e.touches[0].clientX;
    const dx  = cx - lastDragX;
    panX     += dx;
    const dt  = now - prevDragTime || 16;
    velX      = (cx - prevDragX) / dt * 16;
    prevDragX    = lastDragX;
    prevDragTime = now;
    lastDragX    = cx;
  }

  function onTouchEnd() { isDragging = false; touch2Dist = 0; }

  /* ── event listeners ── */
  canvas.addEventListener('wheel',      onWheel,      { passive: false });
  canvas.addEventListener('mousedown',  onMouseDown);
  window.addEventListener('mousemove',  onMouseMove);
  window.addEventListener('mouseup',   onMouseUp);
  canvas.addEventListener('touchstart', onTouchStart, { passive: true });
  canvas.addEventListener('touchmove',  onTouchMove,  { passive: false });
  canvas.addEventListener('touchend',   onTouchEnd);
  canvas.addEventListener('mouseleave', () => { if (!isDragging) { hovered = null; hideTooltip(); } });

  /* ── tooltip ── */
  function showTooltip(mx, my, p) {
    const col = CAT_COLOR[p.cat] || '#a78bfa';
    tooltip.hidden = false;
    tooltip.innerHTML =
      `<span class="wr-map-tooltip-id">${p.id} // ${p.geo}</span>` +
      `<span class="wr-map-tooltip-name" style="color:${col}">${p.name}</span>` +
      `<span class="wr-map-tooltip-meta">${p.metric}${p.active ? ' · ACTIVE' : ''}</span>`;
    const tw = tooltip.offsetWidth, th = tooltip.offsetHeight;
    let tx = mx + 16, ty = my - th / 2;
    if (tx + tw > window.innerWidth - 8)  tx = mx - tw - 16;
    if (ty < 4)                           ty = 4;
    if (ty + th > window.innerHeight - 4) ty = window.innerHeight - th - 4;
    tooltip.style.left = tx + 'px';
    tooltip.style.top  = ty + 'px';
  }

  function hideTooltip() { tooltip.hidden = true; }

  /* ── resize observer ── */
  const ro = new ResizeObserver(() => {
    cancelAnimationFrame(rafId);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    resize();
    rafId = requestAnimationFrame(loop);
  });
  ro.observe(canvas);

  return { clearSelection: () => { selected = null; } };
}

function hexAlpha(hex, a) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}
