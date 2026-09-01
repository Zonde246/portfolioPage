/* ─── INTRO HUD: OPERATIONS CENTER ─── */
/* 5-panel surveillance HUD with simultaneous Canvas 2D animations */
import { prefersReducedMotion } from './utils.js';

// ─────────────────────────────────────────────────────────────────────────
// Build overlay HTML
// ─────────────────────────────────────────────────────────────────────────

function buildOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'intro-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Loading portfolio');

  overlay.innerHTML = `
    <div class="hud-frame">
      <div class="hud-header">
        <div class="hud-header-left">
          <span class="hud-header-tag">OPS-04</span>
          <span class="hud-header-sep">//</span>
          <span class="hud-header-meta">SECURE TERMINAL</span>
          <span class="hud-header-sep">//</span>
          <span class="hud-header-meta" id="hud-status-text">SCANNING</span>
        </div>
        <div class="hud-header-right">
          <span><span class="hud-rec-dot"></span>REC</span>
          <span id="hud-clock">00:00:00</span>
          <span id="hud-frame">FRM 0000</span>
        </div>
      </div>

      <div class="hud-main">
        <div class="hud-panel hud-panel-radar">
          <div class="hud-panel-label">
            <span>RADAR &middot; 2.4GHZ</span>
            <span class="hud-panel-label-meta">SWP 360&deg;</span>
          </div>
          <div class="hud-panel-body">
            <canvas data-panel="radar"></canvas>
          </div>
        </div>

        <div class="hud-panel hud-panel-recon">
          <div class="hud-panel-label">
            <span>GEOSPATIAL &middot; ORBITAL TRACKER</span>
            <span class="hud-panel-label-meta" id="hud-recon-meta">SCANNING</span>
          </div>
          <div class="hud-panel-body">
            <canvas data-panel="recon"></canvas>
            <div class="hud-crosshair" id="hud-crosshair">
              <div class="hud-crosshair-line h"></div>
              <div class="hud-crosshair-line v"></div>
              <div class="hud-crosshair-reticle"></div>
            </div>
          </div>
        </div>

        <div class="hud-panel hud-panel-sigint">
          <div class="hud-panel-label">
            <span>SIGINT DECODE</span>
            <span class="hud-panel-label-meta">AES-256</span>
          </div>
          <div class="hud-panel-body">
            <div class="hud-sigint-list" id="hud-sigint-list"></div>
          </div>
        </div>

        <div class="hud-panel hud-panel-threat">
          <div class="hud-panel-label">
            <span>SIGNAL INTERCEPT</span>
            <span class="hud-panel-label-meta">4-CH · LIVE</span>
          </div>
          <div class="hud-panel-body">
            <canvas data-panel="threat"></canvas>
          </div>
        </div>

        <div class="hud-panel hud-panel-syslog">
          <div class="hud-panel-label">
            <span>SYSTEM LOG</span>
            <span class="hud-panel-label-meta">/dev/sec0</span>
          </div>
          <div class="hud-panel-body">
            <div class="hud-syslog" id="hud-syslog"></div>
          </div>
        </div>
      </div>

      <div class="hud-footer">
        <span class="hud-footer-clearance">CLEARANCE: TOP SECRET // SCI</span>
        <span id="hud-footer-mid">SUBJECT: HARISH, P. &middot; FILE #0X4F1A</span>
        <span class="hud-footer-status" id="hud-footer-status">
          <span class="hud-footer-status-dot"></span>
          <span class="hud-footer-status-text">ACQUIRING</span>
        </span>
      </div>
    </div>

    <button class="intro-skip" id="intro-skip" aria-label="Skip intro">[ SKIP ]</button>
  `;

  return overlay;
}

// ─────────────────────────────────────────────────────────────────────────
// Canvas helpers
// ─────────────────────────────────────────────────────────────────────────

function setupCanvas(canvas) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.parentElement.getBoundingClientRect();
  const W = Math.max(rect.width, 1);
  const H = Math.max(rect.height, 1);
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, W, H };
}

// ─────────────────────────────────────────────────────────────────────────
// Panel: Globe (spinning sphere with real continents + live activity)
// ─────────────────────────────────────────────────────────────────────────

// Real Natural Earth 110m landmasses, simplified to ~50KB. Loaded async.
let WORLD_RINGS = [];
fetch('data/world-slim.json')
  .then(r => r.ok ? r.json() : Promise.reject(r.status))
  .then(d => { WORLD_RINGS = d; })
  .catch(() => { /* graceful degrade — globe renders without continents */ });

// Lockup target cities + activity endpoints (lon, lat)
const CITIES = [
  { lon: -74,   lat: 40.7  },  // NYC
  { lon: -0.1,  lat: 51.5  },  // London
  { lon: 139.7, lat: 35.7  },  // Tokyo
  { lon: 151.2, lat: -33.9 },  // Sydney
  { lon: 72.9,  lat: 19.1  },  // Mumbai
  { lon: 18.4,  lat: -33.9 },  // Cape Town
  { lon: 37.6,  lat: 55.8  },  // Moscow
  { lon: -46.6, lat: -23.5 },  // São Paulo
  { lon: 116.4, lat: 39.9  },  // Beijing
  { lon: -99.1, lat: 19.4  },  // Mexico City
  { lon: 31.2,  lat: 30.0  },  // Cairo
  { lon: -122.4,lat: 37.8  },  // San Francisco
  { lon: 103.8, lat: 1.4   },  // Singapore
  { lon: 28.0,  lat: -26.2 },  // Johannesburg
  { lon: 13.4,  lat: 52.5  },  // Berlin
  { lon: -58.4, lat: -34.6 }   // Buenos Aires
];

// Convert lon/lat (degrees) → 3D unit vector
function lonLatToVec3(lon, lat) {
  const lonR = lon * Math.PI / 180;
  const latR = lat * Math.PI / 180;
  return [
    Math.cos(latR) * Math.cos(lonR),
    Math.sin(latR),
    Math.cos(latR) * Math.sin(lonR)
  ];
}

// Spherical linear interpolation between two unit vectors
function slerp(a, b, t) {
  let dot = a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
  dot = Math.max(-1, Math.min(1, dot));
  const omega = Math.acos(dot);
  if (omega < 1e-4) return [a[0], a[1], a[2]];
  const sinO = Math.sin(omega);
  const ka = Math.sin((1 - t) * omega) / sinO;
  const kb = Math.sin(t * omega) / sinO;
  return [a[0]*ka + b[0]*kb, a[1]*ka + b[1]*kb, a[2]*ka + b[2]*kb];
}

function makeGlobePanel(canvas) {
  const { ctx, W, H } = setupCanvas(canvas);

  const SIZE = 200;
  const cx = W / 2;
  const cy = H / 2;
  const left = Math.round(cx - SIZE / 2);
  const top  = Math.round(cy - SIZE / 2);
  const radius = 76;
  const tilt = -0.32;
  const ct = Math.cos(tilt), st = Math.sin(tilt);

  // ── Projection: 3D unit vector → 2D screen with current rotY ────────────
  function projectVec(v, rotY) {
    const cR = Math.cos(rotY), sR = Math.sin(rotY);
    const x = v[0] * cR + v[2] * sR;
    const z = -v[0] * sR + v[2] * cR;
    const y2 = v[1] * ct - z * st;
    const z2 = v[1] * st + z * ct;
    return { x: cx + x * radius, y: cy - y2 * radius, z: z2 };
  }
  function project(lon, lat, rotY) { return projectVec(lonLatToVec3(lon, lat), rotY); }

  // ── Crosshair lockup state ──────────────────────────────────────────────
  const PHASE_OUT  = 480;
  const PHASE_HOLD = 750;
  const PHASE_FADE = 280;
  const PHASE_GAP  = 220;
  const TOTAL_LOCK = PHASE_OUT + PHASE_HOLD + PHASE_FADE + PHASE_GAP;

  let lockupAge = 0;
  let lockupTarget = null;
  let lastIdx = -1;

  function nextLockup() {
    let idx, attempts = 0;
    do {
      idx = Math.floor(Math.random() * CITIES.length);
      attempts++;
    } while (idx === lastIdx && attempts < 5);
    lastIdx = idx;
    lockupTarget = CITIES[idx];
  }
  nextLockup();

  // ── Activity systems ────────────────────────────────────────────────────
  // Trajectories: great-circle arcs flying point→point with traveling head
  const trajectories = [];
  let nextTrajAt = 1500;
  function spawnTrajectory(t) {
    const a = CITIES[Math.floor(Math.random() * CITIES.length)];
    let b; do { b = CITIES[Math.floor(Math.random() * CITIES.length)]; } while (b === a);
    trajectories.push({
      av: lonLatToVec3(a.lon, a.lat),
      bv: lonLatToVec3(b.lon, b.lat),
      born: t,
      duration: 1700 + Math.random() * 700
    });
    if (trajectories.length > 4) trajectories.shift();
  }

  // Pulses: sonar-blip rings at random cities (sometimes hostile = red)
  const pulses = [];
  let nextPulseAt = 700;
  function spawnPulse(t) {
    const c = CITIES[Math.floor(Math.random() * CITIES.length)];
    pulses.push({
      lon: c.lon + (Math.random() - 0.5) * 6,
      lat: c.lat + (Math.random() - 0.5) * 6,
      born: t,
      hostile: Math.random() < 0.25
    });
    if (pulses.length > 6) pulses.shift();
  }

  // Beams: quick city↔city flashes (data exchange)
  const beams = [];
  let nextBeamAt = 400;
  function spawnBeam(t, rotY) {
    const visible = CITIES.filter(c => projectVec(lonLatToVec3(c.lon, c.lat), rotY).z > 0.1);
    if (visible.length < 2) return;
    const a = visible[Math.floor(Math.random() * visible.length)];
    let b; do { b = visible[Math.floor(Math.random() * visible.length)]; } while (b === a);
    beams.push({ a, b, born: t });
    if (beams.length > 3) beams.shift();
  }

  // ── Whirl rings (around the 200x200 frame) ──────────────────────────────
  function drawWhirl(t) {
    ctx.save();
    ctx.translate(cx, cy);

    const rings = [
      { ti: 0.85, r: 132, sp:  4500, dir:  1, col: 'rgba(167, 139, 250, 0.45)', dash: [4, 4],  notches: 3 },
      { ti: 1.15, r: 152, sp:  6500, dir: -1, col: 'rgba(196, 181, 253, 0.32)', dash: [2, 7],  notches: 5 },
      { ti: 0.55, r: 174, sp:  9200, dir:  1, col: 'rgba(124, 58, 237, 0.28)',  dash: [10, 5], notches: 2 }
    ];

    for (const ring of rings) {
      ctx.save();
      ctx.rotate(t / ring.sp * ring.dir);
      ctx.strokeStyle = ring.col;
      ctx.lineWidth = 1;
      ctx.setLineDash(ring.dash);
      ctx.beginPath();
      ctx.ellipse(0, 0, ring.r, ring.r * Math.cos(ring.ti), 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      for (let i = 0; i < ring.notches; i++) {
        const a = (i / ring.notches) * Math.PI * 2;
        const px = Math.cos(a) * ring.r;
        const py = Math.sin(a) * ring.r * Math.cos(ring.ti);
        ctx.fillStyle = 'rgba(220, 210, 255, 0.85)';
        ctx.beginPath();
        ctx.arc(px, py, 1.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(167, 139, 250, 0.4)';
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Sweeping radial spokes pointing outward
    const spokeAngle = (t / 2400) * Math.PI * 2;
    for (let i = 0; i < 4; i++) {
      const a = spokeAngle + i * Math.PI / 2;
      const x1 = Math.cos(a) * 195;
      const y1 = Math.sin(a) * 195;
      const x2 = Math.cos(a) * 268;
      const y2 = Math.sin(a) * 268;
      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      grad.addColorStop(0, 'rgba(196, 181, 253, 0.55)');
      grad.addColorStop(1, 'rgba(196, 181, 253, 0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ── 200x200 frame corner brackets ───────────────────────────────────────
  function drawCorners(l, t, r, b, len, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(l, t + len); ctx.lineTo(l, t); ctx.lineTo(l + len, t);
    ctx.moveTo(r - len, t); ctx.lineTo(r, t); ctx.lineTo(r, t + len);
    ctx.moveTo(l, b - len); ctx.lineTo(l, b); ctx.lineTo(l + len, b);
    ctx.moveTo(r - len, b); ctx.lineTo(r, b); ctx.lineTo(r, b - len);
    ctx.stroke();
  }

  return {
    tick(t, dt) {
      ctx.clearRect(0, 0, W, H);

      const rotY = (t / 11000) * Math.PI * 2;

      // 1. Whirl rings (outside globe)
      drawWhirl(t);

      // 2. Atmospheric corona (radial purple gradient outside the sphere)
      const atmoR = radius * 1.55;
      const atmoGrad = ctx.createRadialGradient(cx, cy, radius * 0.92, cx, cy, atmoR);
      atmoGrad.addColorStop(0, 'rgba(124, 58, 237, 0.22)');
      atmoGrad.addColorStop(0.4, 'rgba(167, 139, 250, 0.10)');
      atmoGrad.addColorStop(1, 'rgba(167, 139, 250, 0)');
      ctx.fillStyle = atmoGrad;
      ctx.fillRect(cx - atmoR, cy - atmoR, atmoR * 2, atmoR * 2);

      // 3. 200x200 corner brackets (frame)
      drawCorners(left, top, left + SIZE, top + SIZE, 11, 'rgba(167, 139, 250, 0.65)');

      // 4. Sphere body — very subtle dark fill
      ctx.fillStyle = 'rgba(8, 6, 18, 0.55)';
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // 5. Sphere outline rim
      ctx.strokeStyle = 'rgba(167, 139, 250, 0.55)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      // 6. Globe contents — clipped to sphere disc
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();

      // 6a. Graticule (lat/lon grid)
      ctx.strokeStyle = 'rgba(167, 139, 250, 0.13)';
      ctx.lineWidth = 0.5;
      for (let lat = -60; lat <= 60; lat += 20) {
        ctx.beginPath();
        let started = false;
        for (let lon = -180; lon <= 180; lon += 4) {
          const p = project(lon, lat, rotY);
          if (p.z > 0) {
            if (!started) { ctx.moveTo(p.x, p.y); started = true; }
            else ctx.lineTo(p.x, p.y);
          } else { started = false; }
        }
        ctx.stroke();
      }
      for (let lon = -180; lon <= 180; lon += 30) {
        ctx.beginPath();
        let started = false;
        for (let lat = -85; lat <= 85; lat += 4) {
          const p = project(lon, lat, rotY);
          if (p.z > 0) {
            if (!started) { ctx.moveTo(p.x, p.y); started = true; }
            else ctx.lineTo(p.x, p.y);
          } else { started = false; }
        }
        ctx.stroke();
      }

      // 6b. Continent fills (one combined path, low alpha)
      if (WORLD_RINGS.length > 0) {
        ctx.fillStyle = 'rgba(124, 58, 237, 0.18)';
        ctx.beginPath();
        for (const ring of WORLD_RINGS) {
          let started = false;
          for (let i = 0; i < ring.length; i++) {
            const p = project(ring[i][0], ring[i][1], rotY);
            if (p.z > 0.01) {
              if (!started) { ctx.moveTo(p.x, p.y); started = true; }
              else ctx.lineTo(p.x, p.y);
            } else { started = false; }
          }
        }
        ctx.fill();

        // 6c. Continent outlines — bright glow stroke (one combined path)
        ctx.strokeStyle = 'rgba(196, 181, 253, 0.85)';
        ctx.lineWidth = 1;
        ctx.lineJoin = 'round';
        ctx.shadowColor = 'rgba(167, 139, 250, 0.7)';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        for (const ring of WORLD_RINGS) {
          let started = false;
          for (let i = 0; i < ring.length; i++) {
            const p = project(ring[i][0], ring[i][1], rotY);
            if (p.z > 0.01) {
              if (!started) { ctx.moveTo(p.x, p.y); started = true; }
              else ctx.lineTo(p.x, p.y);
            } else { started = false; }
          }
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // 7. Activity layer ────────────────────────────────────────────
      // 7a. Trajectories (great-circle arcs with traveling head)
      if (t > nextTrajAt) {
        spawnTrajectory(t);
        nextTrajAt = t + 1100 + Math.random() * 800;
      }
      for (let i = trajectories.length - 1; i >= 0; i--) {
        const tr = trajectories[i];
        const age = t - tr.born;
        if (age > tr.duration + 600) { trajectories.splice(i, 1); continue; }
        const N = 36;
        const progress = Math.min(age / tr.duration, 1);
        const headIdx = Math.floor(progress * N);
        const fadeOut = age > tr.duration ? Math.max(0, 1 - (age - tr.duration) / 600) : 1;

        // Trail
        ctx.lineWidth = 1.1;
        for (let j = 1; j <= headIdx; j++) {
          const t1 = (j - 1) / N, t2 = j / N;
          const p1 = projectVec(slerp(tr.av, tr.bv, t1), rotY);
          const p2 = projectVec(slerp(tr.av, tr.bv, t2), rotY);
          if (p1.z > 0 && p2.z > 0) {
            const trailFade = j / Math.max(headIdx, 1);
            ctx.strokeStyle = `rgba(196, 181, 253, ${trailFade * 0.65 * fadeOut})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
        // Bright head pulse
        if (headIdx > 0 && progress < 1) {
          const head = projectVec(slerp(tr.av, tr.bv, progress), rotY);
          if (head.z > 0) {
            ctx.fillStyle = `rgba(220, 210, 255, ${0.95 * fadeOut})`;
            ctx.beginPath();
            ctx.arc(head.x, head.y, 2.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = `rgba(167, 139, 250, ${0.45 * fadeOut})`;
            ctx.beginPath();
            ctx.arc(head.x, head.y, 4.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // 7b. Pulse alerts (sonar-blip rings)
      if (t > nextPulseAt) {
        spawnPulse(t);
        nextPulseAt = t + 600 + Math.random() * 500;
      }
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        const age = t - p.born;
        if (age > 1400) { pulses.splice(i, 1); continue; }
        const pp = project(p.lon, p.lat, rotY);
        if (pp.z <= 0.05) continue;
        const t01 = age / 1400;
        const r = t01 * 14;
        const op = (1 - t01) * 0.85;
        const col = p.hostile ? '239, 68, 68' : '167, 139, 250';
        ctx.strokeStyle = `rgba(${col}, ${op})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(pp.x, pp.y, r, 0, Math.PI * 2);
        ctx.stroke();
        if (t01 < 0.45) {
          ctx.fillStyle = `rgba(${col}, ${1 - t01 * 2.2})`;
          ctx.beginPath();
          ctx.arc(pp.x, pp.y, 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 7c. Packet beams (city↔city flashes)
      if (t > nextBeamAt) {
        spawnBeam(t, rotY);
        nextBeamAt = t + 320 + Math.random() * 380;
      }
      for (let i = beams.length - 1; i >= 0; i--) {
        const bm = beams[i];
        const age = t - bm.born;
        if (age > 550) { beams.splice(i, 1); continue; }
        const fade = 1 - age / 550;
        const pa = project(bm.a.lon, bm.a.lat, rotY);
        const pb = project(bm.b.lon, bm.b.lat, rotY);
        if (pa.z > 0 && pb.z > 0) {
          const grad = ctx.createLinearGradient(pa.x, pa.y, pb.x, pb.y);
          grad.addColorStop(0,   `rgba(45, 212, 191, ${fade * 0.55})`);
          grad.addColorStop(0.5, `rgba(220, 210, 255, ${fade * 0.95})`);
          grad.addColorStop(1,   `rgba(45, 212, 191, ${fade * 0.55})`);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y);
          ctx.stroke();
        }
      }

      // 8. Crosshair lockup (cycling cities, red contrast)
      lockupAge += dt;
      if (lockupAge > TOTAL_LOCK) { nextLockup(); lockupAge = 0; }
      const tp = project(lockupTarget.lon, lockupTarget.lat, rotY);

      let armLen = 0, ringRad = 0, opacity = 0;
      if (lockupAge < PHASE_OUT) {
        const ph = lockupAge / PHASE_OUT;
        const eased = 1 - Math.pow(1 - ph, 3);
        armLen = 4 + eased * 26; ringRad = 3 + eased * 9; opacity = ph;
      } else if (lockupAge < PHASE_OUT + PHASE_HOLD) {
        armLen = 30; ringRad = 12; opacity = 1;
      } else if (lockupAge < PHASE_OUT + PHASE_HOLD + PHASE_FADE) {
        const ph = (lockupAge - PHASE_OUT - PHASE_HOLD) / PHASE_FADE;
        armLen = 30; ringRad = 12; opacity = 1 - ph;
      }
      if (opacity > 0 && tp.z > 0.05) {
        ctx.strokeStyle = `rgba(220, 38, 38, ${opacity * 0.95})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(tp.x - armLen, tp.y); ctx.lineTo(tp.x - 4, tp.y);
        ctx.moveTo(tp.x + 4, tp.y);     ctx.lineTo(tp.x + armLen, tp.y);
        ctx.moveTo(tp.x, tp.y - armLen); ctx.lineTo(tp.x, tp.y - 4);
        ctx.moveTo(tp.x, tp.y + 4);     ctx.lineTo(tp.x, tp.y + armLen);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(tp.x, tp.y, ringRad, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = `rgba(220, 38, 38, ${opacity})`;
        ctx.beginPath();
        ctx.arc(tp.x, tp.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
        const tk = 3;
        ctx.strokeStyle = `rgba(220, 38, 38, ${opacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(tp.x - armLen, tp.y - tk); ctx.lineTo(tp.x - armLen, tp.y + tk);
        ctx.moveTo(tp.x + armLen, tp.y - tk); ctx.lineTo(tp.x + armLen, tp.y + tk);
        ctx.moveTo(tp.x - tk, tp.y - armLen); ctx.lineTo(tp.x + tk, tp.y - armLen);
        ctx.moveTo(tp.x - tk, tp.y + armLen); ctx.lineTo(tp.x + tk, tp.y + armLen);
        ctx.stroke();
      }

      ctx.restore();
    }
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Panel: Radar
// ─────────────────────────────────────────────────────────────────────────

function makeRadarPanel(canvas) {
  const { ctx, W, H } = setupCanvas(canvas);
  const blips = [];
  let lastBlip = 0;
  const cx = W / 2, cy = H / 2;
  const r = Math.min(W, H) * 0.42;

  return {
    tick(t, dt) {
      ctx.clearRect(0, 0, W, H);

      // Concentric rings
      ctx.strokeStyle = 'rgba(167, 139, 250, 0.18)';
      ctx.lineWidth = 1;
      for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, (r * i) / 3, 0, Math.PI * 2);
        ctx.stroke();
      }
      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy);
      ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r);
      ctx.stroke();
      // Tick marks at cardinals
      ctx.strokeStyle = 'rgba(167, 139, 250, 0.4)';
      ctx.lineWidth = 1.5;
      const tickLen = 5;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const x1 = cx + Math.cos(a) * r;
        const y1 = cy + Math.sin(a) * r;
        const x2 = cx + Math.cos(a) * (r - tickLen);
        const y2 = cy + Math.sin(a) * (r - tickLen);
        ctx.beginPath();
        ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // Sweep cone
      const sweepA = (t / 1800) * Math.PI * 2 - Math.PI / 2;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(sweepA);
      const steps = 14;
      const spread = 0.85;
      for (let i = 0; i < steps; i++) {
        const a = -spread + (spread / steps) * i;
        const op = (i / steps) * 0.30;
        ctx.strokeStyle = `rgba(196, 181, 253, ${op})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        ctx.stroke();
      }
      // Bright leading edge
      ctx.strokeStyle = 'rgba(220, 210, 255, 0.95)';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = 'rgba(167, 139, 250, 0.7)';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(r, 0);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();

      // Spawn blips
      if (t - lastBlip > 220 && Math.random() < 0.7) {
        const br = (0.18 + Math.random() * 0.78) * r;
        const ba = sweepA + (Math.random() - 0.5) * 0.25;
        blips.push({
          x: cx + Math.cos(ba) * br,
          y: cy + Math.sin(ba) * br,
          life: 1,
          hostile: Math.random() < 0.18
        });
        lastBlip = t;
      }

      // Draw blips
      for (let i = blips.length - 1; i >= 0; i--) {
        const b = blips[i];
        b.life -= dt / 2200;
        if (b.life <= 0) { blips.splice(i, 1); continue; }
        const op = b.life;
        const col = b.hostile ? '239, 68, 68' : '45, 212, 191';
        ctx.fillStyle = `rgba(${col}, ${op * 0.95})`;
        ctx.beginPath();
        ctx.arc(b.x, b.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `rgba(${col}, ${op * 0.4})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(b.x, b.y, 4 + (1 - b.life) * 7, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Panel: Signal Spectrum Analyzer (oscilloscope waveforms, 4 channels)
// ─────────────────────────────────────────────────────────────────────────

function makeThreatPanel(canvas) {
  const { ctx, W, H } = setupCanvas(canvas);

  const LABEL_W  = 58;
  const plotR    = W - 4;
  const plotCount = Math.max(1, plotR - LABEL_W + 1);
  const yBuf      = new Float32Array(plotCount);

  const channels = [
    { id: 'SIG-A', label: 'NOMINAL', r: 167, g: 139, b: 250, freq: 0.0014, harmonics: [[2.3, 0.28], [5.7, 0.11]], noiseAmp: 0.09 },
    { id: 'SIG-B', label: 'HOSTILE', r: 239, g: 68,  b: 68,  freq: 0.0027, harmonics: [[3.4, 0.32], [7.1, 0.15]], noiseAmp: 0.20, hostile: true },
    { id: 'SIG-C', label: 'CAUTION', r: 251, g: 191, b: 36,  freq: 0.0019, harmonics: [[2.1, 0.24]],              noiseAmp: 0.14 },
    { id: 'SIG-D', label: 'CLEAR',   r: 45,  g: 212, b: 191, freq: 0.0012, harmonics: [[4.3, 0.19]],              noiseAmp: 0.07 },
  ];

  const bursts = [];
  let nextBurstAt = 1100;

  function organicNoise(xT, seed) {
    return (Math.sin(xT * 0.019 + seed) * Math.sin(xT * 0.038 + seed * 2.1) * 0.65 +
            Math.sin(xT * 0.073 + seed * 0.5) * 0.35);
  }

  function waveAt(xT, ci, ch) {
    const denom = 1 + ch.harmonics.reduce((s, [, a]) => s + a, 0);
    let y = Math.sin(xT * ch.freq);
    for (const [m, a] of ch.harmonics) y += Math.sin(xT * ch.freq * m + ci * 1.3) * a;
    y /= denom;
    y += organicNoise(xT, ci * 6.1) * ch.noiseAmp;
    if (ch.hostile) {
      for (const b of bursts) {
        const age = xT - b.startT;
        if (age >= 0 && age < b.duration) {
          const env = Math.sin((age / b.duration) * Math.PI);
          y += Math.sin(xT * ch.freq * 8.8 + 2.4) * 1.45 * env;
        }
      }
    }
    return y < -1 ? -1 : y > 1 ? 1 : y;
  }

  return {
    tick(t, dt) {
      ctx.clearRect(0, 0, W, H);

      const rowH       = H / 4;
      const TIME_SCALE = 4.2;

      if (t > nextBurstAt) {
        bursts.push({ startT: t, duration: 350 + Math.random() * 310 });
        if (bursts.length > 3) bursts.shift();
        nextBurstAt = t + 1500 + Math.random() * 1200;
      }

      for (let ci = 0; ci < 4; ci++) {
        const ch      = channels[ci];
        const rowTop  = ci * rowH;
        const midY    = rowTop + rowH / 2;
        const halfAmp = rowH * 0.37;
        const rgb     = `${ch.r}, ${ch.g}, ${ch.b}`;

        // Row tint
        ctx.fillStyle = `rgba(${rgb}, 0.022)`;
        ctx.fillRect(LABEL_W, rowTop, plotR - LABEL_W, rowH);

        // Amplitude guide lines (−0.5, 0, +0.5)
        ctx.strokeStyle = `rgba(${rgb}, 0.07)`;
        ctx.lineWidth   = 0.5;
        ctx.setLineDash([2, 9]);
        for (const g of [-0.5, 0, 0.5]) {
          const gy = midY - g * halfAmp;
          ctx.beginPath(); ctx.moveTo(LABEL_W, gy); ctx.lineTo(plotR, gy); ctx.stroke();
        }
        ctx.setLineDash([]);

        // Row separator
        if (ci < 3) {
          ctx.strokeStyle = 'rgba(255,255,255,0.06)';
          ctx.lineWidth   = 0.5;
          ctx.beginPath(); ctx.moveTo(0, rowTop + rowH); ctx.lineTo(W, rowTop + rowH); ctx.stroke();
        }

        // Label panel
        ctx.fillStyle = 'rgba(5, 5, 8, 0.82)';
        ctx.fillRect(0, rowTop, LABEL_W - 3, rowH);

        // Left accent bar (gradient)
        const acg = ctx.createLinearGradient(0, rowTop, 0, rowTop + rowH);
        acg.addColorStop(0,   `rgba(${rgb}, 0)`);
        acg.addColorStop(0.5, `rgba(${rgb}, 0.9)`);
        acg.addColorStop(1,   `rgba(${rgb}, 0)`);
        ctx.fillStyle = acg;
        ctx.fillRect(0, rowTop, 2, rowH);

        // Divider line
        ctx.strokeStyle = `rgba(${rgb}, 0.20)`;
        ctx.lineWidth   = 1;
        ctx.beginPath();
        ctx.moveTo(LABEL_W - 3, rowTop + 4); ctx.lineTo(LABEL_W - 3, rowTop + rowH - 4);
        ctx.stroke();

        // Channel ID
        ctx.textBaseline = 'middle';
        ctx.font         = '8px "IBM Plex Mono", monospace';
        ctx.fillStyle    = `rgba(${rgb}, 1)`;
        ctx.fillText(ch.id, 6, midY - 5);

        // Status label
        ctx.font      = '6.5px "IBM Plex Mono", monospace';
        ctx.fillStyle = `rgba(${rgb}, 0.65)`;
        ctx.fillText(ch.label, 6, midY + 7);

        // Compute waveform samples into pre-allocated buffer
        for (let i = 0; i < plotCount; i++) {
          const xT = t - (plotR - (LABEL_W + i)) * TIME_SCALE;
          yBuf[i]  = waveAt(xT, ci, ch);
        }

        // Clip draw to row bounds
        ctx.save();
        ctx.beginPath();
        ctx.rect(LABEL_W, rowTop + 1, plotR - LABEL_W, rowH - 2);
        ctx.clip();

        // Area fill (between waveform and baseline)
        const ag = ctx.createLinearGradient(0, rowTop, 0, rowTop + rowH);
        ag.addColorStop(0,   `rgba(${rgb}, 0.14)`);
        ag.addColorStop(0.5, `rgba(${rgb}, 0.05)`);
        ag.addColorStop(1,   `rgba(${rgb}, 0.01)`);

        ctx.beginPath();
        ctx.moveTo(LABEL_W, midY);
        for (let i = 0; i < plotCount; i++) ctx.lineTo(LABEL_W + i, midY - yBuf[i] * halfAmp);
        ctx.lineTo(plotR, midY);
        ctx.closePath();
        ctx.fillStyle = ag;
        ctx.fill();

        // Waveform stroke with glow
        ctx.beginPath();
        for (let i = 0; i < plotCount; i++) {
          const x = LABEL_W + i, sy = midY - yBuf[i] * halfAmp;
          if (i === 0) ctx.moveTo(x, sy); else ctx.lineTo(x, sy);
        }
        ctx.strokeStyle = `rgba(${rgb}, 0.92)`;
        ctx.lineWidth   = ch.hostile ? 1.4 : 1.15;
        ctx.shadowColor = `rgba(${rgb}, 0.7)`;
        ctx.shadowBlur  = ch.hostile ? 8 : 4;
        ctx.stroke();
        ctx.shadowBlur  = 0;

        ctx.restore();
      }

      // Burst alert indicator
      const activeBurst = bursts.find(b => t - b.startT < b.duration + 400);
      const blink       = Math.floor(t / 460) % 2 === 0;
      ctx.font         = '7px "IBM Plex Mono", monospace';
      ctx.textBaseline = 'top';
      ctx.fillStyle    = activeBurst && blink
        ? 'rgba(239, 68, 68, 0.95)'
        : activeBurst
          ? 'rgba(239, 68, 68, 0.45)'
          : 'rgba(239, 68, 68, 0.30)';
      ctx.fillText(
        activeBurst ? '▲ INTERCEPT: SIG-B' : '● HOSTILE: SIG-B',
        LABEL_W + 5, 4
      );
    }
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Panel: SIGINT Decoder
// ─────────────────────────────────────────────────────────────────────────

function makeSigintPanel(container) {
  const data = [
    { ascii: 'P. HARISH',       at: 0.45 },
    { ascii: 'CV+SEC RSRCH',    at: 0.70 },
    { ascii: 'TS // SCI',       at: 0.95 },
    { ascii: 'STATUS: ACTIVE',  at: 1.20 },
    { ascii: 'BIO: 99.7%',      at: 1.45 },
    { ascii: 'FILE 0X4F1A',     at: 1.70 },
    { ascii: 'AUTH: PENDING',   at: 1.95 }
  ];

  function hexBlock() {
    let s = '';
    for (let i = 0; i < 4; i++) {
      s += Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
      if (i < 3) s += ' ';
    }
    return s.toUpperCase();
  }

  const rows = data.map((d, i) => {
    const el = document.createElement('div');
    el.className = 'hud-sigint-row';
    el.innerHTML = `
      <span class="hud-sigint-bin">${hexBlock()}</span>
      <span class="hud-sigint-arrow">&rarr;</span>
      <span class="hud-sigint-text">${'·'.repeat(d.ascii.length)}</span>
    `;
    container.appendChild(el);
    return {
      el,
      target: d.ascii,
      showAt: 0.30 + i * 0.22,
      decodeAt: 0.30 + i * 0.22 + 0.55,
      shown: false,
      decoded: false
    };
  });

  return {
    tick(t) {
      const tSec = t / 1000;

      for (const row of rows) {
        if (!row.shown && tSec >= row.showAt) {
          row.shown = true;
          row.el.classList.add('is-shown');
        }

        if (row.shown && !row.decoded) {
          // Scrambling
          if (Math.random() < 0.35) {
            row.el.querySelector('.hud-sigint-bin').textContent = hexBlock();
          }
          if (Math.random() < 0.45) {
            const txt = row.el.querySelector('.hud-sigint-text');
            const len = row.target.length;
            let s = '';
            const chars = '·:#$%&@*0123456789ABCDEF';
            for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
            txt.textContent = s;
          }

          if (tSec >= row.decodeAt) {
            row.decoded = true;
            row.el.classList.add('is-decoded');
            row.el.querySelector('.hud-sigint-text').textContent = row.target;
          }
        } else if (row.decoded) {
          // Occasional flicker on the binary
          if (Math.random() < 0.04) {
            row.el.querySelector('.hud-sigint-bin').textContent = hexBlock();
          }
        }
      }
    }
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Panel: System Log
// ─────────────────────────────────────────────────────────────────────────

function makeSyslogPanel(container) {
  const lines = [
    { time: '14:32:01', msg: 'init kernel modules',       status: 'OK'      },
    { time: '14:32:01', msg: 'mount /secure',             status: 'OK'      },
    { time: '14:32:02', msg: 'decrypt biometric.db',      status: 'OK'      },
    { time: '14:32:02', msg: 'load neural weights',       status: 'OK'      },
    { time: '14:32:03', msg: 'verify clearance',          status: 'OK'      },
    { time: '14:32:03', msg: 'handshake sat-7',           status: 'OK'      },
    { time: '14:32:04', msg: 'subject biometric match',   status: '99.7%'   },
    { time: '14:32:05', msg: 'AUTH HANDSHAKE COMPLETE',   status: 'GRANTED', final: true }
  ];

  const rows = lines.map((l, i) => {
    const el = document.createElement('div');
    el.className = 'hud-syslog-row' + (l.final ? ' is-final' : '');
    el.innerHTML = `
      <span class="hud-syslog-time">[${l.time}]</span>
      <span class="hud-syslog-msg">${l.msg}</span>
      <span class="hud-syslog-status">${l.status}</span>
    `;
    container.appendChild(el);
    return { el, showAt: 0.65 + i * 0.45 };
  });

  return {
    tick(t) {
      const tSec = t / 1000;
      for (const row of rows) {
        if (!row.el.classList.contains('is-shown') && tSec >= row.showAt) {
          row.el.classList.add('is-shown');
        }
      }
    }
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Header clock + frame counter
// ─────────────────────────────────────────────────────────────────────────

function makeHeaderTickers(overlay) {
  const clockEl = overlay.querySelector('#hud-clock');
  const frameEl = overlay.querySelector('#hud-frame');
  let frameNum = 0;
  let lastClockUpdate = 0;
  let displayedSec = 0;

  return {
    tick(t) {
      frameNum++;
      if (t - lastClockUpdate > 60) {
        lastClockUpdate = t;
        displayedSec += 0.1 + Math.random() * 0.05;
        const totalMs = 14 * 3600000 + 32 * 60000 + Math.floor(displayedSec * 1000);
        const hh = Math.floor(totalMs / 3600000) % 24;
        const mm = Math.floor(totalMs / 60000) % 60;
        const ss = Math.floor(totalMs / 1000) % 60;
        clockEl.textContent =
          String(hh).padStart(2, '0') + ':' +
          String(mm).padStart(2, '0') + ':' +
          String(ss).padStart(2, '0');
      }
      if (frameNum % 2 === 0) {
        frameEl.textContent = 'FRM ' + String(frameNum).padStart(4, '0');
      }
    }
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Main orchestration
// ─────────────────────────────────────────────────────────────────────────

const overlay = buildOverlay();
document.body.prepend(overlay);

function exitIntro() {
  if (overlay.classList.contains('intro-exiting')) return;
  const skipBtn = overlay.querySelector('#intro-skip');
  if (skipBtn) skipBtn.style.display = 'none';
  overlay.classList.add('intro-exiting');
  setTimeout(() => overlay.classList.add('intro-gone'), 1400);
}

if (prefersReducedMotion) {
  overlay.style.transition = 'opacity 0.3s ease';
  setTimeout(() => {
    overlay.style.opacity = '0';
    setTimeout(() => overlay.classList.add('intro-gone'), 320);
  }, 350);
} else {
  // Wait one frame so panels have layout dimensions
  requestAnimationFrame(() => {
    const radarCanvas    = overlay.querySelector('canvas[data-panel="radar"]');
    const reconCanvas    = overlay.querySelector('canvas[data-panel="recon"]');
    const threatCanvas   = overlay.querySelector('canvas[data-panel="threat"]');
    const sigintList     = overlay.querySelector('#hud-sigint-list');
    const syslogList     = overlay.querySelector('#hud-syslog');
    const statusText     = overlay.querySelector('#hud-status-text');
    const reconMeta      = overlay.querySelector('#hud-recon-meta');
    const footerStatus   = overlay.querySelector('#hud-footer-status');
    const footerStatusTx = overlay.querySelector('.hud-footer-status-text');
    const crosshair      = overlay.querySelector('#hud-crosshair');

    const radar    = makeRadarPanel(radarCanvas);
    const recon    = makeGlobePanel(reconCanvas);
    const threat   = makeThreatPanel(threatCanvas);
    const sigint   = makeSigintPanel(sigintList);
    const syslog   = makeSyslogPanel(syslogList);
    const headerT  = makeHeaderTickers(overlay);

    // Skip wiring
    const skipBtn = overlay.querySelector('#intro-skip');
    skipBtn.addEventListener('click', exitIntro);
    document.addEventListener('keydown', function onKey(e) {
      if (overlay.classList.contains('intro-gone') || overlay.classList.contains('intro-exiting')) {
        document.removeEventListener('keydown', onKey);
        return;
      }
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        document.removeEventListener('keydown', onKey);
        exitIntro();
      }
    });

    // Timeline events (fire once)
    let evt1 = false, evt2 = false, evt3 = false, evt4 = false, evt5 = false;
    const TOTAL_MS = 6500;

    let startT = 0;
    let lastT = 0;

    function loop(now) {
      if (!startT) startT = now;
      const t = now - startT;
      const dt = lastT ? Math.min(now - lastT, 50) : 16;
      lastT = now;

      radar.tick(t, dt);
      recon.tick(t, dt);
      threat.tick(t, dt);
      sigint.tick(t, dt);
      syslog.tick(t, dt);
      headerT.tick(t, dt);

      // Choreography
      if (!evt1 && t > 2400) {
        evt1 = true;
        statusText.textContent = 'ANALYZING';
        statusText.style.color = '#fbbf24';
      }
      if (!evt2 && t > 2300) {
        evt2 = true;
        reconMeta.textContent = 'TRACKING';
      }
      if (!evt3 && t > 4800) {
        evt3 = true;
        statusText.textContent = 'TARGET ACQUIRED';
        statusText.style.color = '#c4b5fd';
        reconMeta.textContent = 'LOCKED';
      }
      if (!evt4 && t > 5400) {
        evt4 = true;
        crosshair.classList.add('is-active');
        footerStatus.classList.add('is-locked');
        footerStatusTx.textContent = 'LOCKED';
      }
      if (!evt5 && t > 6000) {
        evt5 = true;
        statusText.textContent = 'ACCESS GRANTED';
        statusText.style.color = '#2dd4bf';
      }

      if (t < TOTAL_MS && !overlay.classList.contains('intro-exiting')) {
        requestAnimationFrame(loop);
      } else if (!overlay.classList.contains('intro-exiting')) {
        exitIntro();
      }
    }

    requestAnimationFrame(loop);
  });
}
