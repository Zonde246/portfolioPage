/* ─── INTEL RADAR ─── */
'use strict';
import { escHtml } from './utils.js';

// startRadar / pauseRadar are exported so shatter.js can call them
// They're populated lazily once the canvas is confirmed available
let _start = () => {};
let _pause = () => {};

export function startRadar() { _start(); }
export function pauseRadar() { _pause(); }

const canvas = document.getElementById('intel-radar');
if (canvas) {
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const noMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* Category colours */
    const C = {
      security: '#2dd4bf',
      access: '#60a5fa',
      hack: '#fbbf24',
      sys: '#a78bfa',
    };

    function easeOutBack(t) {
      const c1 = 1.70158, c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    }

    const REVEAL_DUR = 560;
    const REVEAL_SCALE = 5.5;

    function hex2rgba(hex, a) {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r},${g},${b},${a})`;
    }

    const PROJECTS = [
      { id: 'FILE-000', name: 'FIELDSTATION ZERO', metric: '0 deps', domain: 'Design · Systems', cat: 'sys', active: true, r: 0.16, angle: -2.42 },
      { id: 'FILE-001', name: 'PaleGuard', metric: '88%', domain: 'CyberSec · CV', cat: 'security', active: true, r: 0.28, angle: -1.35 },
      { id: 'FILE-002', name: 'Qyra', metric: 'Alpha', domain: 'Systems · Tools', cat: 'sys', active: true, r: 0.22, angle: -1.90 },
      { id: 'FILE-003', name: 'ZonFormer', metric: '+33.6%', domain: 'Deep RL · Systems', cat: 'sys', active: true, r: 0.30, angle: 1.05 },
      { id: 'FILE-004', name: 'EMBARGO', metric: 'SEALED', domain: 'Systems Research', cat: 'sys', active: true, r: 0.24, angle: 0.06 },
      { id: 'FILE-005', name: 'GREENWAVE', metric: 'Lane-free TSC', domain: 'Algorithms · RL', cat: 'sys', active: true, r: 0.36, angle: 1.43 },
      { id: 'FILE-006', name: 'DEVANAGARI', metric: 'ROUGE-L 47.4', domain: 'NLP · Data', cat: 'sys', active: true, r: 0.39, angle: -0.62 },
      { id: 'FILE-007', name: 'VIPER-1', metric: '0 art assets', domain: 'Games · Systems', cat: 'sys', active: false, r: 0.42, angle: 2.24 },
      { id: 'FILE-008', name: 'NotBigBrother', metric: 'Zero PII', domain: 'Privacy · Crypto', cat: 'security', active: false, r: 0.32, angle: -0.30 },
      { id: 'FILE-009', name: 'ARCHON', metric: 'AES-256', domain: 'Privacy', cat: 'security', active: false, r: 0.54, angle: -0.85 },
      { id: 'FILE-010', name: 'VisionAid', metric: '16 FPS GPU', domain: 'Accessibility · CV', cat: 'access', active: false, r: 0.51, angle: 0.34 },
      { id: 'FILE-011', name: 'ASL Transcription', metric: '96% mAP', domain: 'Accessibility · CV', cat: 'access', active: false, r: 0.56, angle: 0.62 },
      { id: 'FILE-012', name: 'Plant Disease', metric: '99.97%', domain: 'Hackathon · CV', cat: 'hack', active: false, r: 0.47, angle: 1.68 },
      { id: 'FILE-013', name: 'P2P Rental', metric: 'Best UI/UX', domain: 'Hackathon', cat: 'hack', active: false, r: 0.67, angle: 2.44 },
      { id: 'FILE-014', name: 'Minimax AI', metric: '255K nodes', domain: 'AI · Web', cat: 'sys', active: false, r: 0.51, angle: -2.12 },
      { id: 'FILE-015', name: 'Ashram Mgmt', metric: '3 Roles', domain: 'Web', cat: 'sys', active: false, r: 0.67, angle: -2.57 },
      { id: 'FILE-016', name: 'GapEdit', metric: '8 hrs build', domain: 'Codeathon · C', cat: 'hack', active: false, r: 0.76, angle: 2.78 },
      { id: 'FILE-017', name: 'SWITCHBOARD', metric: 'Top 3', domain: 'Hackathon', cat: 'hack', active: false, r: 0.60, angle: 2.05 },
      { id: 'FILE-018', name: 'Linux Blog', metric: 'Published', domain: 'Technical Writing', cat: 'sys', active: false, r: 0.61, angle: -1.78 },
      { id: 'FILE-019', name: 'Python Launcher', metric: '29 exercises', domain: 'High School', cat: 'sys', active: false, r: 0.84, angle: -2.90, dim: true },
      { id: 'FILE-020', name: 'Faculty Mgmt', metric: 'Deployed', domain: 'High School', cat: 'sys', active: false, r: 0.88, angle: 3.00, dim: true },
    ];

    /* Link DOM elements from the hidden data store */
    document.querySelectorAll('.manifest-section .dossier-trigger').forEach(row => {
      const numEl = row.querySelector('.manifest-filenum');
      if (!numEl) return;
      const id = numEl.textContent.trim();
      const proj = PROJECTS.find(p => p.id === id);
      if (proj) proj.el = row;
    });

    let sweepAngle = 3 * Math.PI / 2;
    const pingTimes = {};
    const revealed = new Set();
    const revealTimes = {};
    let hoveredP = null;
    let focusIdx = -1;
    let logicalSize = 0;
    let crtFlicker = 1.0;

    const NOISE_FRAMES = 4;
    const noiseCanvases = (function () {
      const frames = [];
      for (let n = 0; n < NOISE_FRAMES; n++) {
        const nc = document.createElement('canvas');
        nc.width = 256; nc.height = 256;
        const nctx = nc.getContext('2d');
        const id = nctx.createImageData(256, 256);
        const d = id.data;
        for (let i = 0; i < d.length; i += 4) {
          const lit = Math.random() > 0.984;
          d[i]   = 130 + Math.floor(Math.random() * 60);
          d[i+1] = 80  + Math.floor(Math.random() * 50);
          d[i+2] = 210 + Math.floor(Math.random() * 45);
          d[i+3] = lit ? Math.floor(Math.random() * 55 + 12) : 0;
        }
        nctx.putImageData(id, 0, 0);
        frames.push(nc);
      }
      return frames;
    }());
    let noiseIdx = 0, noiseFrameCount = 0;

    const PHOSPHOR_SLOTS = 16;
    const sweepHistory = new Array(PHOSPHOR_SLOTS).fill(null);
    let sweepHistHead = 0;

    function resize() {
      const wrap = canvas.parentElement;
      logicalSize = Math.min(wrap.clientWidth, 580);
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(logicalSize * dpr);
      canvas.height = Math.round(logicalSize * dpr);
      canvas.style.width = logicalSize + 'px';
      canvas.style.height = logicalSize + 'px';
      const ring = document.getElementById('ouroboros-ring');
      if (ring) {
        const ringSize = Math.round(logicalSize * 1.0);
        ring.style.width = ringSize + 'px';
        ring.style.height = ringSize + 'px';
      }
    }

    function polar(angle, r) {
      const cx = logicalSize / 2, cy = logicalSize / 2;
      const maxR = logicalSize * 0.43;
      return {
        x: cx + Math.cos(angle) * r * maxR,
        y: cy + Math.sin(angle) * r * maxR
      };
    }

    function prepare() {
      const dpr = window.devicePixelRatio || 1;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function drawRings() {
      const cx = logicalSize / 2, cy = logicalSize / 2;
      const maxR = logicalSize * 0.43;
      [0.30, 0.54, 0.78].forEach(f => {
        ctx.beginPath();
        ctx.arc(cx, cy, f * maxR, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(167,139,250,0.23)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 7]);
        ctx.stroke();
        ctx.setLineDash([]);
      });
      ctx.beginPath();
      ctx.arc(cx, cy, maxR, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(167,139,250,0.22)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    function drawDividers() {
      const cx = logicalSize / 2, cy = logicalSize / 2;
      const maxR = logicalSize * 0.43;
      [-Math.PI / 2, 0, Math.PI / 2, Math.PI].forEach(a => {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * maxR, cy + Math.sin(a) * maxR);
        ctx.strokeStyle = 'rgba(167,139,250,0.20)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    }

    function drawQuadLabels() {
      const cx = logicalSize / 2, cy = logicalSize / 2;
      const maxR = logicalSize * 0.43;
      const labels = [
        { angle: -Math.PI / 4, text: 'SECURITY', color: C.security },
        { angle: Math.PI / 4, text: 'ACCESSIBILITY', color: C.access },
        { angle: 3 * Math.PI / 4, text: 'HACKATHON', color: C.hack },
        { angle: -3 * Math.PI / 4, text: 'SYSTEMS', color: C.sys },
      ];
      ctx.font = '700 8.5px "IBM Plex Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      labels.forEach(l => {
        const x = cx + Math.cos(l.angle) * 0.93 * maxR;
        const y = cy + Math.sin(l.angle) * 0.93 * maxR;
        ctx.globalAlpha = 0.14;
        ctx.fillStyle = l.color;
        ctx.fillText(l.text, x, y);
        ctx.globalAlpha = 1;
      });
    }

    function drawSweep() {
      if (noMotion) return;
      const cx = logicalSize / 2, cy = logicalSize / 2;
      const maxR = logicalSize * 0.43;
      const a = sweepAngle;
      const trail = Math.PI / 2.5;

      const segs = 24;
      for (let i = 0; i < segs; i++) {
        const a0 = a - trail + (trail / segs) * i;
        const a1 = a - trail + (trail / segs) * (i + 1);
        const t = i / segs;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, maxR, a0, a1);
        ctx.closePath();
        ctx.fillStyle = `rgba(124,58,237,${t * t * 0.065})`;
        ctx.fill();
      }

      const arm = ctx.createLinearGradient(
        cx, cy,
        cx + Math.cos(a) * maxR, cy + Math.sin(a) * maxR
      );
      arm.addColorStop(0, 'rgba(167,139,250,0.90)');
      arm.addColorStop(1, 'rgba(167,139,250,0)');
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * maxR, cy + Math.sin(a) * maxR);
      ctx.strokeStyle = arm;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    function drawBlips(now) {
      PROJECTS.forEach(p => {
        if (!revealed.has(p.id)) return;
        const pos = polar(p.angle, p.r);
        const col = C[p.cat];
        const isHov = p === hoveredP;
        const baseRad = p.dim ? 2.5 : (p.active ? 6 : 4.5);
        const baseA = p.dim ? 0.38 : 1;

        let rad = baseRad;
        let revealAlpha = 1;
        const rt = revealTimes[p.id];
        if (!noMotion && rt) {
          const age = now - rt;
          if (age < REVEAL_DUR) {
            const t = age / REVEAL_DUR;
            const ease = easeOutBack(t);
            rad = baseRad * (REVEAL_SCALE + (1 - REVEAL_SCALE) * ease);
            revealAlpha = Math.min(1, 0.25 + (0.75 * Math.min(t / 0.6, 1)));
          }
        }

        if (!noMotion && pingTimes[p.id]) {
          const age = now - pingTimes[p.id];
          if (age < 900) {
            const prog = age / 900;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, rad + prog * 22, 0, Math.PI * 2);
            ctx.strokeStyle = col;
            ctx.globalAlpha = (1 - prog) * 0.55 * baseA;
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.globalAlpha = 1;
          } else {
            delete pingTimes[p.id];
          }
        }

        if (p.active && !noMotion) {
          const t = (now % 2400) / 2400;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, rad + t * 11, 0, Math.PI * 2);
          ctx.strokeStyle = col;
          ctx.globalAlpha = (1 - t) * 0.35;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        if (isHov || p.active) {
          const gr = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, rad * 4.5);
          gr.addColorStop(0, hex2rgba(col, isHov ? 0.32 : 0.15));
          gr.addColorStop(1, hex2rgba(col, 0));
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, rad * 4.5, 0, Math.PI * 2);
          ctx.fillStyle = gr;
          ctx.globalAlpha = baseA * revealAlpha;
          ctx.fill();
          ctx.globalAlpha = 1;
        }

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, rad, 0, Math.PI * 2);
        ctx.fillStyle = col;
        ctx.globalAlpha = baseA * revealAlpha;
        ctx.fill();
        ctx.globalAlpha = 1;

        if (p.active) {
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 2.2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,255,255,0.65)';
          ctx.globalAlpha = revealAlpha;
          ctx.fill();
          ctx.globalAlpha = 1;
        }

        const leaderEnd = rad + 16;
        const lDist = leaderEnd + 5;
        const lx = pos.x + Math.cos(p.angle) * lDist;
        const ly = pos.y + Math.sin(p.angle) * lDist;
        const goRight = Math.cos(p.angle) >= 0;
        const goDown = Math.sin(p.angle) >= 0;

        if (!p.dim) {
          ctx.beginPath();
          ctx.moveTo(pos.x + Math.cos(p.angle) * (rad + 5), pos.y + Math.sin(p.angle) * (rad + 5));
          ctx.lineTo(pos.x + Math.cos(p.angle) * leaderEnd, pos.y + Math.sin(p.angle) * leaderEnd);
          ctx.strokeStyle = col;
          ctx.globalAlpha = (isHov ? 0.55 : 0.28) * revealAlpha;
          ctx.lineWidth = 0.75;
          ctx.setLineDash([]);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        ctx.font = `${p.dim ? 500 : 600} ${p.dim ? '8' : '9.5'}px "IBM Plex Mono", monospace`;
        ctx.fillStyle = col;
        ctx.globalAlpha = (p.dim ? 0.30 : (isHov ? 1 : 0.72)) * revealAlpha;
        ctx.textAlign = goRight ? 'left' : 'right';
        ctx.textBaseline = goDown ? 'top' : 'bottom';
        ctx.fillText(p.name, lx, ly);
        ctx.globalAlpha = 1;

        if (isHov && !p.dim) {
          const lineOff = goDown ? 13 : -13;
          ctx.font = '500 8px "IBM Plex Mono", monospace';
          ctx.fillStyle = col;
          ctx.globalAlpha = 0.58;
          ctx.textBaseline = 'middle';
          ctx.fillText(p.metric, lx, ly + lineOff);
          ctx.globalAlpha = 1;
        }
      });
    }

    function drawCenter() {
      const cx = logicalSize / 2, cy = logicalSize / 2;
      const h = 5;
      ctx.strokeStyle = 'rgba(255,255,255,0.07)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx - h, cy); ctx.lineTo(cx + h, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy - h); ctx.lineTo(cx, cy + h); ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(167,139,250,0.45)';
      ctx.fill();
    }

    function drawPhosphor() {
      if (noMotion) return;
      const cx = logicalSize / 2, cy = logicalSize / 2;
      const maxR = logicalSize * 0.43;
      for (let i = 0; i < PHOSPHOR_SLOTS; i++) {
        const idx = (sweepHistHead - 1 - i + PHOSPHOR_SLOTS) % PHOSPHOR_SLOTS;
        const angle = sweepHistory[idx];
        if (angle === null) continue;
        const age = i / PHOSPHOR_SLOTS;
        const alpha = (1 - age) * (1 - age) * 0.048;
        if (alpha < 0.003) continue;
        const grad = ctx.createLinearGradient(
          cx, cy, cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR
        );
        grad.addColorStop(0, `rgba(167,139,250,${(alpha * 0.9).toFixed(3)})`);
        grad.addColorStop(1, 'rgba(167,139,250,0)');
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    function drawNoise() {
      noiseFrameCount++;
      if (noiseFrameCount % 4 === 0) noiseIdx = (noiseIdx + 1) % NOISE_FRAMES;
      const cx = logicalSize / 2, cy = logicalSize / 2;
      const maxR = logicalSize * 0.43;
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, maxR, 0, Math.PI * 2);
      ctx.clip();
      ctx.globalAlpha = 0.07;
      ctx.drawImage(noiseCanvases[noiseIdx], cx - maxR, cy - maxR, maxR * 2, maxR * 2);
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    function drawFlicker() {
      if (crtFlicker >= 1) return;
      ctx.fillStyle = `rgba(0,0,0,${(1 - crtFlicker).toFixed(3)})`;
      ctx.fillRect(0, 0, logicalSize, logicalSize);
    }

    function scheduleFlicker() {
      if (noMotion) return;
      const delay = 18000 + Math.random() * 22000;
      setTimeout(function doFlicker() {
        if (!radarRunning) { setTimeout(doFlicker, 2000); return; }
        crtFlicker = 0.52 + Math.random() * 0.22;
        setTimeout(() => {
          crtFlicker = 0.87 + Math.random() * 0.1;
          setTimeout(() => {
            crtFlicker = 0.48 + Math.random() * 0.18;
            setTimeout(() => {
              crtFlicker = 1.0;
              scheduleFlicker();
            }, 55 + Math.random() * 50);
          }, 80 + Math.random() * 60);
        }, 65 + Math.random() * 45);
      }, delay);
    }

    function checkPings(angle, now) {
      const TWO_PI = Math.PI * 2;
      const norm = ((angle % TWO_PI) + TWO_PI) % TWO_PI;
      PROJECTS.forEach(p => {
        const pNorm = ((p.angle % TWO_PI) + TWO_PI) % TWO_PI;
        const diff = Math.abs(norm - pNorm);
        const close = diff < 0.09 || diff > TWO_PI - 0.09;
        if (close) {
          const last = pingTimes[p.id];
          if (!last || now - last > 2000) {
            pingTimes[p.id] = now;
            if (!revealed.has(p.id)) {
              revealed.add(p.id);
              revealTimes[p.id] = now;
            }
          }
        }
      });
    }

    function drawBackground() {
      const cx = logicalSize / 2, cy = logicalSize / 2;
      const maxR = logicalSize * 0.43;
      ctx.beginPath();
      ctx.arc(cx, cy, maxR, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(5,5,8,0.78)';
      ctx.fill();
    }

    function drawAll(now) {
      if (!logicalSize) return;
      prepare();
      ctx.clearRect(0, 0, logicalSize, logicalSize);
      drawBackground();
      drawPhosphor();
      drawRings();
      drawDividers();
      drawQuadLabels();
      drawSweep();
      drawBlips(now);
      drawCenter();
      drawNoise();
      drawFlicker();
    }

    let lastTs = 0;
    function frame(ts) {
      if (!radarRunning) return;
      const dt = Math.min((ts - lastTs) / 1000, 0.05);
      lastTs = ts;
      sweepAngle = (sweepAngle + (Math.PI * 2 / 8) * dt) % (Math.PI * 2);
      sweepHistory[sweepHistHead] = sweepAngle;
      sweepHistHead = (sweepHistHead + 1) % PHOSPHOR_SLOTS;
      checkPings(sweepAngle, ts);
      drawAll(ts);
      requestAnimationFrame(frame);
    }

    function hitTest(mx, my) {
      let best = null, bestD = 30;
      PROJECTS.forEach(p => {
        const pos = polar(p.angle, p.r);
        const d = Math.hypot(mx - pos.x, my - pos.y);
        if (d < bestD) { bestD = d; best = p; }
      });
      return best;
    }

    const tip = document.getElementById('radar-tooltip');

    function showTip(p, ex, ey) {
      if (!p || !tip) return;
      tip.innerHTML =
        `<span class="rt-id">${escHtml(p.id)}</span>` +
        `<span class="rt-name">${escHtml(p.name)}</span><br>` +
        `<span class="rt-metric">${escHtml(p.metric)}</span>` +
        `<span class="rt-sep">·</span>` +
        `<span class="rt-domain">${escHtml(p.domain)}</span>`;
      tip.hidden = false;
      const tw = 250, th = 48;
      let tx = ex + 20, ty = ey - 10;
      if (tx + tw > window.innerWidth - 8) tx = ex - tw - 12;
      if (ty + th > window.innerHeight - 8) ty = ey - th - 12;
      tip.style.left = tx + 'px';
      tip.style.top = ty + 'px';
    }

    function hideTip() { if (tip) tip.hidden = true; }

    canvas.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      const sx = logicalSize / rect.width;
      const mx = (e.clientX - rect.left) * sx;
      const my = (e.clientY - rect.top) * sx;
      const p = hitTest(mx, my);
      if (p !== hoveredP) {
        hoveredP = p;
        if (noMotion) drawAll(0);
      }
      canvas.style.cursor = p ? 'pointer' : 'default';
      if (p) showTip(p, e.clientX, e.clientY);
      else hideTip();
    });

    canvas.addEventListener('mouseleave', () => {
      hoveredP = null;
      hideTip();
      canvas.style.cursor = 'default';
      if (noMotion) drawAll(0);
    });

    const radarInstruction = document.getElementById('radar-instruction');
    let instructionDismissed = false;
    function dismissInstruction() {
      if (instructionDismissed || !radarInstruction) return;
      instructionDismissed = true;
      radarInstruction.classList.add('radar-instruction--dismissed');
    }

    canvas.addEventListener('click', e => {
      const rect = canvas.getBoundingClientRect();
      const sx = logicalSize / rect.width;
      const mx = (e.clientX - rect.left) * sx;
      const my = (e.clientY - rect.top) * sx;
      const p = hitTest(mx, my);
      if (p && p.el) { dismissInstruction(); p.el.click(); }
    });

    canvas.setAttribute('tabindex', '0');
    canvas.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        dismissInstruction();
        focusIdx = (focusIdx + 1) % PROJECTS.length;
        hoveredP = PROJECTS[focusIdx];
        if (!revealed.has(hoveredP.id)) { revealed.add(hoveredP.id); revealTimes[hoveredP.id] = performance.now(); }
        if (noMotion) drawAll(0);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        dismissInstruction();
        focusIdx = (focusIdx - 1 + PROJECTS.length) % PROJECTS.length;
        hoveredP = PROJECTS[focusIdx];
        if (!revealed.has(hoveredP.id)) { revealed.add(hoveredP.id); revealTimes[hoveredP.id] = performance.now(); }
        if (noMotion) drawAll(0);
      } else if ((e.key === 'Enter' || e.key === ' ') && hoveredP) {
        e.preventDefault();
        if (hoveredP.el) hoveredP.el.click();
      }
    });

    const dossierOverlay = document.getElementById('dossier-overlay');
    if (dossierOverlay) {
      new MutationObserver(() => {
        if (!dossierOverlay.classList.contains('active') &&
          dossierOverlay.style.display === '') {
          canvas.focus({ preventScroll: true });
        }
      }).observe(dossierOverlay, { attributes: true, attributeFilter: ['class', 'style'] });
    }

    resize();
    window.addEventListener('resize', () => {
      resize();
      if (noMotion) drawAll(0);
    }, { passive: true });

    function _bootText(wrap) {
      const el = document.createElement('div');
      el.className = 'crt-boot-text';
      wrap.appendChild(el);

      const lines = [
        'SITE-██ SURVEILLANCE FEED ACTIVE',
        'OPERATOR: P.H.  MTF TAU-5',
        'CLEARANCE: LEVEL 4 — CONFIRMED',
        '[OK]  PERCEPTION FILTERS: ENGAGED',
        '[OK]  ANOMALY DETECTION:  ARMED',
        '[WARN] ████ ██████ ██████ REDACTED',
      ];

      let li = 0, ci = 0, lineEl = null;
      const CHAR_MS = 11;
      const GAP_MS  = 85;

      function nextLine() {
        if (li >= lines.length) return;
        lineEl = document.createElement('span');
        el.appendChild(lineEl);
        ci = 0;
        typeChar();
      }

      function typeChar() {
        const text = lines[li];
        if (ci < text.length) {
          const glitch = Math.random() < 0.04 && ci > 0;
          if (glitch) {
            const wrong = String.fromCharCode(33 + Math.floor(Math.random() * 90));
            lineEl.textContent = text.slice(0, ci) + wrong;
            setTimeout(() => {
              lineEl.textContent = text.slice(0, ci + 1);
              ci++;
              setTimeout(typeChar, CHAR_MS + Math.random() * 8);
            }, 40);
          } else {
            lineEl.textContent = text.slice(0, ci + 1);
            ci++;
            setTimeout(typeChar, CHAR_MS + Math.random() * 8);
          }
        } else {
          li++;
          if (li < lines.length) setTimeout(nextLine, GAP_MS);
        }
      }

      nextLine();

      setTimeout(() => el.classList.add('crt-boot-text--out'), 3900);
      setTimeout(() => { if (el.parentNode) el.remove(); }, 4500);
    }

    /* Wire up the exported stubs once the canvas is confirmed ready */
    let radarRunning = false;

    _start = function () {
      resize();
      const ring = document.getElementById('ouroboros-ring');
      if (ring) ring.classList.add('radar-active');
      if (!noMotion && !radarRunning) {
        canvas.classList.add('crt-boot');
        scheduleFlicker();
        _bootText(canvas.parentElement);
      }
      if (radarRunning) return;
      radarRunning = true;
      if (noMotion) {
        PROJECTS.forEach(p => revealed.add(p.id));
        drawAll(0);
      } else {
        requestAnimationFrame(frame);
      }
    };

    _pause = function () { radarRunning = false; };
  }
}
