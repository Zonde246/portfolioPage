/* ─── SCROLL REVEAL ─── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = (i % 6) * 60 + 'ms';
  observer.observe(el);
});

document.querySelectorAll('.hero .reveal').forEach(el => el.classList.add('visible'));

/* ─── TERMINAL ENGINE ─── */
const SESSIONS = [
  [
    { type: 'cmd', text: 'python paleguard.py --scan /proc/net' },
    { type: 'out', cls: 'warn', text: '[*] PaleGuard EDR initialising...' },
    { type: 'out', cls: 'ok',   text: '[✓] Loaded 3D volumetric model  (epoch 312)' },
    { type: 'out', cls: 'ok',   text: '[✓] Scanning process memory map' },
    { type: 'out', cls: 'ok',   text: '[✓] No anomalies detected. Score: 0.003' },
  ],
  [
    { type: 'cmd', text: 'git clone https://github.com/Zonde246/ARCHON && cd ARCHON' },
    { type: 'out', cls: '',     text: "Cloning into 'ARCHON'..." },
    { type: 'out', cls: 'ok',   text: 'done.' },
    { type: 'cmd', text: 'npm install && npm run build' },
    { type: 'out', cls: 'ok',   text: '✓ Built in 1.4s  →  dist/bundle.js' },
  ],
  [
    { type: 'cmd', text: 'python indoor_nav.py --camera 0 --mode assist' },
    { type: 'out', cls: 'warn', text: '[*] Loading YOLOv8-seg model...' },
    { type: 'out', cls: 'ok',   text: '[✓] Objects in frame: door(0.97), chair(0.91)' },
    { type: 'out', cls: 'ok',   text: '[✓] Path clear — proceed 2.1 m forward' },
  ],
  [
    { type: 'cmd', text: 'nmap -sV --script vuln 192.168.1.0/24' },
    { type: 'out', cls: 'warn', text: '[*] Starting Nmap 7.94...' },
    { type: 'out', cls: 'ok',   text: 'Host: 192.168.1.1  Ports: 22/open/ssh' },
    { type: 'out', cls: 'ok',   text: 'No critical CVEs found on scanned hosts.' },
  ],
  [
    { type: 'cmd', text: 'vim resume.c' },
    { type: 'out', cls: '',     text: '-- INSERT --   [vim-mode text editor]' },
    { type: 'cmd', text: 'gcc -O2 -o editor editor.c && ./editor' },
    { type: 'out', cls: 'ok',   text: "Parik's editor v0.1  —  Ctrl-Q to quit" },
  ],
  [
    { type: 'cmd', text: 'python asl_transcribe.py --source webcam' },
    { type: 'out', cls: 'warn', text: '[*] Loading hand landmark model...' },
    { type: 'out', cls: 'ok',   text: '[✓] Detected: "HELLO"  conf=0.98' },
    { type: 'out', cls: 'ok',   text: '[✓] Detected: "THANK YOU"  conf=0.96' },
  ],
  [
    { type: 'cmd', text: 'python tictactoe.py --mode minimax --depth 9' },
    { type: 'out', cls: 'warn', text: '[*] Minimax tree: 255168 nodes evaluated' },
    { type: 'out', cls: 'ok',   text: '[✓] Optimal move: (1,1) — centre' },
    { type: 'out', cls: 'ok',   text: 'Result: Draw  (perfect play enforced)' },
  ],
];

const termBody = document.getElementById('terminal-body');
let sessionIdx = 0;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function typeText(el, text, speed = 38) {
  for (const ch of text) {
    el.textContent += ch;
    await sleep(speed + Math.random() * 22);
  }
}

function makeLine() {
  const line = document.createElement('div');
  line.className = 't-line';
  return line;
}

async function runSession(lines) {
  termBody.innerHTML = '';
  for (const item of lines) {
    const line = makeLine();

    if (item.type === 'cmd') {
      const prompt = document.createElement('span');
      prompt.className = 't-prompt';
      prompt.textContent = '❯';
      const cmd = document.createElement('span');
      cmd.className = 't-cmd';
      line.appendChild(prompt);
      line.appendChild(cmd);
      termBody.appendChild(line);
      await typeText(cmd, item.text, 42);
      await sleep(180);
    } else {
      const out = document.createElement('span');
      out.className = 't-out' + (item.cls ? ' ' + item.cls : '');
      out.textContent = item.text;
      line.appendChild(out);
      termBody.appendChild(line);
      await sleep(60);
    }
  }

  // trailing cursor on a new prompt line
  const cursorLine = makeLine();
  const prompt = document.createElement('span');
  prompt.className = 't-prompt';
  prompt.textContent = '❯';
  const cur = document.createElement('span');
  cur.className = 't-cursor';
  cursorLine.appendChild(prompt);
  cursorLine.appendChild(cur);
  termBody.appendChild(cursorLine);
}

async function loop() {
  while (true) {
    await runSession(SESSIONS[sessionIdx % SESSIONS.length]);
    sessionIdx++;
    await sleep(3200);
  }
}

setTimeout(loop, 800);

/* ─── CUSTOM CURSOR — comet trail (fine pointer / desktop only) ─── */
if (window.matchMedia('(pointer: fine)').matches) {
  const dot    = document.getElementById('cursor-dot');
  const canvas = document.getElementById('cursor-trail');
  const ctx    = canvas.getContext('2d');

  const LIFETIME = 420; // ms a point lives before fully fading
  const pts = [];       // { x, y, time }
  let mx = 0, my = 0, ready = false;

  const noNative = document.createElement('style');
  noNative.textContent = '*, *::before, *::after { cursor: none !important; }';
  document.head.appendChild(noNative);

  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas, { passive: true });

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    pts.push({ x: mx, y: my, time: performance.now() });
    dot.style.transform = `translate(calc(${mx}px - 50%), calc(${my}px - 50%))`;
    if (!ready) { ready = true; document.body.classList.add('cursor-ready'); }
  }, { passive: true });

  const hoverSel = 'a, button, .skill-pill, .cert-card, .project-card, .nav-cta';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverSel)) document.body.classList.add('cursor-hover');
  }, { passive: true });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverSel)) document.body.classList.remove('cursor-hover');
  }, { passive: true });

  function drawTrail() {
    const now = performance.now();
    // cull expired points
    while (pts.length && now - pts[0].time > LIFETIME) pts.shift();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (pts.length > 1) {
      for (let i = 1; i < pts.length; i++) {
        // age: 0 = just added (head), 1 = about to expire (tail)
        const age  = (now - pts[i].time) / LIFETIME;
        const life = 1 - age;  // 1 = fresh, 0 = dead
        // colour: deep violet at tail → bright accent at head
        const r = Math.round(124 + (196 - 124) * life);   // 7c → c4
        const g = Math.round(58  + (181 - 58)  * life);   // 3a → b5
        const b = Math.round(237 + (253 - 237) * life);   // ed → fd
        ctx.beginPath();
        ctx.moveTo(pts[i - 1].x, pts[i - 1].y);
        ctx.lineTo(pts[i].x, pts[i].y);
        ctx.strokeStyle = `rgba(${r},${g},${b},${life * 0.7})`;
        ctx.lineWidth   = life * 2.8;
        ctx.lineCap     = 'round';
        ctx.lineJoin    = 'round';
        ctx.stroke();
      }
    }
    requestAnimationFrame(drawTrail);
  }
  drawTrail();
}

/* ─── KONAMI CODE — HACKERMAN MODE ─── */
(function () {
  const SEQ = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let pos = 0;
  let hacking = false;

  document.addEventListener('keydown', e => {
    if (e.key === SEQ[pos]) {
      pos++;
      if (pos === SEQ.length) { pos = 0; triggerHackerman(); }
    } else {
      pos = e.key === SEQ[0] ? 1 : 0;
    }
  });

  const HACK_LINES = [
    { type: 'cmd', text: 'sudo nmap -sS -O --script vuln 0.0.0.0/0' },
    { type: 'out', text: 'Starting Nmap 7.94 ( https://nmap.org )' },
    { type: 'out', text: 'Initiating SYN Stealth Scan...' },
    { type: 'out', text: 'Discovered open port 22/tcp on 192.168.0.1' },
    { type: 'out', text: 'Discovered open port 443/tcp on 10.0.0.254' },
    { type: 'cmd', text: 'python3 exploit.py --target mainframe --payload r00t' },
    { type: 'out', text: '[*] Sending stage (175686 bytes) to target...' },
    { type: 'out', text: '[*] Meterpreter session 1 opened' },
    { type: 'out', text: '[!] SYSTEM BREACH DETECTED' },
    { type: 'cmd', text: 'whoami' },
    { type: 'out', text: 'root@PARIK-MAINFRAME' },
    { type: 'cmd', text: 'cat /etc/shadow | hashcat --mode 1800' },
    { type: 'out', text: '[+] Hash cracked: hunter2' },
    { type: 'out', text: '[+] All your base are belong to us.' },
    { type: 'cmd', text: 'echo "jk lol — Parik was here 😈"' },
    { type: 'out', text: 'jk lol — Parik was here 😈' },
  ];

  async function triggerHackerman() {
    if (hacking) return;
    hacking = true;

    // Glitch the page
    document.body.classList.add('hackerman');

    // Scroll terminal into view
    const term = document.getElementById('terminal');
    if (term) term.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Run the fake hack session
    termBody.innerHTML = '';
    for (const item of HACK_LINES) {
      const line = makeLine();
      if (item.type === 'cmd') {
        const prompt = document.createElement('span');
        prompt.className = 't-prompt';
        prompt.textContent = '#';          // root prompt
        const cmd = document.createElement('span');
        cmd.className = 't-cmd';
        line.appendChild(prompt);
        line.appendChild(cmd);
        termBody.appendChild(line);
        await typeText(cmd, item.text, 18);
        await sleep(80);
      } else {
        const out = document.createElement('span');
        out.className = 't-out hack-out';
        out.textContent = item.text;
        line.appendChild(out);
        termBody.appendChild(line);
        await sleep(35);
      }
    }

    // Hold for a moment then restore
    await sleep(3500);
    document.body.classList.remove('hackerman');
    hacking = false;
  }
}());
