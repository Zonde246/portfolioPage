/* ─── DOSSIER SYSTEM ─── */
import { prefersReducedMotion, escHtml, applyRedaction } from './utils.js';
import { observeCountUps } from './count-up.js';

const overlay = document.getElementById('dossier-overlay');
const panel = document.getElementById('dossier-panel');
const closeBtn = document.getElementById('dossier-close');

const fields = {
  stamp: document.getElementById('dossier-stamp'),
  statusBadge: document.getElementById('dossier-status-badge'),
  tabName: document.getElementById('dossier-tab-name'),
  badge: document.getElementById('dossier-badge'),
  name: document.getElementById('dossier-name'),
  role: document.getElementById('dossier-role'),
  statusText: document.getElementById('dossier-status-text'),
  overview: document.getElementById('dossier-overview'),
  architecture: document.getElementById('dossier-architecture'),
  contribution: document.getElementById('dossier-contribution'),
  outcome: document.getElementById('dossier-outcome'),
  links: document.getElementById('dossier-links'),
  fileId: document.getElementById('dossier-file-id'),
};

let isOpen = false;
let currentCard = null;


function setDossierField(el, text) {
  const parts = text.split('||').map(s => s.trim()).filter(Boolean);
  if (parts.length <= 1) { el.innerHTML = applyRedaction(escHtml(text)); return; }
  el.innerHTML = parts.map((p, i) => {
    const colonIdx = p.indexOf(':');
    if (i === 0 && colonIdx > 0 && colonIdx < 20) {
      const label = escHtml(p.slice(0, colonIdx + 1));
      const rest = applyRedaction(escHtml(p.slice(colonIdx + 1).trim()));
      return `<span class="df-label">${label}</span> ${rest}`;
    }
    return `<span class="df-bullet">${applyRedaction(escHtml(p))}</span>`;
  }).join('');
}

function populateDossier(card) {
  const d = card.dataset;

  const clearance = (d.dossierClearance || '').toUpperCase();
  const isActive = clearance.includes('ACTIVE');

  fields.stamp.textContent = 'CLEARANCE: ' + clearance;
  fields.stamp.className = 'dossier-stamp ' + (isActive ? 'clearance-active' : 'clearance-declassified');

  const status = (d.dossierStatus || '').toUpperCase();
  fields.statusBadge.textContent = status;
  fields.statusBadge.className = 'dossier-status-badge ' + (status === 'ONGOING' ? 'status-ongoing' : 'status-complete');

  fields.tabName.textContent = d.dossierName || '';
  fields.badge.textContent = d.dossierBadge || '';
  fields.name.textContent = d.dossierName || '';
  fields.role.textContent = d.dossierRole || '';
  fields.statusText.textContent = status;
  setDossierField(fields.overview, d.dossierOverview || '');
  setDossierField(fields.architecture, d.dossierArchitecture || '');
  setDossierField(fields.contribution, d.dossierContribution || '');
  setDossierField(fields.outcome, d.dossierOutcome || '');

  // Populate metrics strip
  const metricsStrip = document.getElementById('dossier-metrics-strip');
  if (metricsStrip) {
    if (d.dossierStat) {
      let html = `<div class="dossier-metric">
        <div class="dossier-metric-val"${d.dossierStatCount ? ` data-count-target="${d.dossierStatCount}" data-count-suffix="${d.dossierStatSuffix || ''}"` : ''}>${d.dossierStat}</div>
        <div class="dossier-metric-label">${d.dossierStatLabel || ''}</div>
      </div>`;
      if (d.dossierStat2) {
        html += `<div class="dossier-metric-sep"></div>
        <div class="dossier-metric">
          <div class="dossier-metric-val">${d.dossierStat2}</div>
          <div class="dossier-metric-label">${d.dossierStat2Label || ''}</div>
        </div>`;
      }
      metricsStrip.innerHTML = html;
      metricsStrip.style.display = '';
      // Re-observe any count-up elements in the metrics strip
      observeCountUps(metricsStrip);
    } else {
      metricsStrip.style.display = 'none';
    }
  }

  const unredacted = d.dossierUnredacted === 'true';
  [fields.overview, fields.architecture, fields.contribution, fields.outcome].forEach(el => {
    el.classList.toggle('redacted', !unredacted);
  });

  // Links
  fields.links.innerHTML = '';
  if (d.dossierGithub) {
    const a = document.createElement('a');
    a.className = 'dossier-link';
    a.href = d.dossierGithub;
    a.target = '_blank';
    a.rel = 'noopener';
    a.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/></svg>VIEW SOURCE`;
    fields.links.appendChild(a);
  }
  if (d.dossierLink) {
    const a = document.createElement('a');
    a.className = 'dossier-link';
    a.href = d.dossierLink;
    a.target = '_blank';
    a.rel = 'noopener';
    a.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>LIVE DEMO`;
    fields.links.appendChild(a);
  }
  if (d.dossierDemo) {
    const urls = d.dossierDemo.split(',').map(u => u.trim()).filter(Boolean);
    urls.forEach((url, i) => {
      const a = document.createElement('a');
      a.className = 'dossier-link';
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>DEMO ${urls.length > 1 ? i + 1 : ''}`.trim();
      fields.links.appendChild(a);
    });
  }

  const nameSlug = (d.dossierName || 'UNKNOWN').replace(/[^A-Z0-9]/gi, '-').toUpperCase();
  fields.fileId.textContent = 'FILE-' + nameSlug + '-' + new Date().getFullYear();
}

const hasVT = 'startViewTransition' in document;

function _openFallback(card) {
  populateDossier(card);
  overlay.style.display = 'flex';
  overlay.offsetHeight;
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  const inner = panel.querySelector('.dossier-inner');
  inner.classList.remove('dossier-revealed');
  inner.classList.add('dossier-scanning');
  card.classList.add('dossier-card-open');
  setTimeout(() => {
    closeBtn.focus();
    inner.classList.remove('dossier-scanning');
    inner.classList.add('dossier-revealed');
  }, 460);
}

function _closeFallback(card) {
  overlay.classList.remove('active');
  document.body.style.overflow = '';
  if (card) { card.classList.remove('dossier-card-open'); card.focus(); }
  setTimeout(() => {
    overlay.style.display = '';
    const inner = panel.querySelector('.dossier-inner');
    inner.classList.remove('dossier-scanning', 'dossier-revealed');
  }, 450);
}

function openDossier(card) {
  if (isOpen) return;
  isOpen = true;
  currentCard = card;
  history.pushState({ dossierOpen: true }, '');

  const codenameEl = card.querySelector('.manifest-codename');
  const statusEl   = card.querySelector('.manifest-status-tag');

  // Only morph if the source row is actually on-screen (manifest view, not radar)
  const cnRect = codenameEl && codenameEl.getBoundingClientRect();
  const codenameOnScreen = cnRect && cnRect.width > 0 &&
    cnRect.top < window.innerHeight && cnRect.bottom > 0;

  if (hasVT && !prefersReducedMotion && codenameEl && codenameOnScreen) {
    // ── Set VT names on SOURCE elements so the browser snapshots them ──
    codenameEl.style.viewTransitionName = 'vt-project-name';
    if (statusEl) statusEl.style.viewTransitionName = 'vt-status';

    const vt = document.startViewTransition(() => {
      // Remove from source (already captured in "old" snapshot)
      codenameEl.style.viewTransitionName = '';
      if (statusEl) statusEl.style.viewTransitionName = '';

      // Populate content
      populateDossier(card);

      // Jump overlay to fully-open state without CSS transitions firing
      // (vt-open suppresses transition on panel and ::before scrim)
      overlay.classList.add('vt-open');
      overlay.style.display = 'flex';
      overlay.classList.add('active');
      panel.offsetHeight; // force reflow → panel lands at translateX(0) instantly

      document.body.style.overflow = 'hidden';
      card.classList.add('dossier-card-open');

      // Content fully visible for the "new" snapshot
      const inner = panel.querySelector('.dossier-inner');
      inner.classList.add('dossier-revealed');

      // ── Set VT names on DESTINATION elements ──
      fields.name.style.viewTransitionName       = 'vt-project-name';
      fields.statusBadge.style.viewTransitionName = 'vt-status';
    });

    const cleanup = () => {
      overlay.classList.remove('vt-open');
      fields.name.style.viewTransitionName       = '';
      fields.statusBadge.style.viewTransitionName = '';
    };
    vt.finished.then(() => { cleanup(); closeBtn.focus(); }).catch(cleanup);

  } else {
    _openFallback(card);
  }
}

function closeDossier() {
  if (!isOpen) return;
  isOpen = false;

  const card = currentCard;
  currentCard = null;

  const codenameEl = card && card.querySelector('.manifest-codename');
  const statusEl   = card && card.querySelector('.manifest-status-tag');

  if (hasVT && !prefersReducedMotion && card && codenameEl) {
    // Only do reverse morph if the source row is in the viewport
    const rect = card.getBoundingClientRect();
    const cardVisible = rect.top < window.innerHeight && rect.bottom > 0;

    if (cardVisible) {
      // Scroll dossier to top so the heading is visible in the old snapshot
      const inner = panel.querySelector('.dossier-inner');
      inner.scrollTop = 0;

      // ── Set VT names on CURRENT dossier elements (captured as "old") ──
      fields.name.style.viewTransitionName       = 'vt-project-name';
      fields.statusBadge.style.viewTransitionName = 'vt-status';

      const vt = document.startViewTransition(() => {
        // Remove from old positions
        fields.name.style.viewTransitionName       = '';
        fields.statusBadge.style.viewTransitionName = '';

        // ── Set VT names on DESTINATION (the list row) ──
        codenameEl.style.viewTransitionName = 'vt-project-name';
        if (statusEl) statusEl.style.viewTransitionName = 'vt-status';

        // Jump panel off-screen without CSS transition
        overlay.classList.add('vt-open');
        panel.offsetHeight;
        overlay.classList.remove('active');
        panel.offsetHeight; // reflow → panel jumps to translateX(100%)
        overlay.style.display = '';

        document.body.style.overflow = '';
        card.classList.remove('dossier-card-open');
        inner.classList.remove('dossier-scanning', 'dossier-revealed');
      });

      const cleanup = () => {
        overlay.classList.remove('vt-open');
        codenameEl.style.viewTransitionName = '';
        if (statusEl) statusEl.style.viewTransitionName = '';
      };
      vt.finished.then(() => { cleanup(); card.focus(); }).catch(cleanup);
      return;
    }
  }

  // Fallback (Firefox / card off-screen / reduced motion)
  _closeFallback(card);
}

// Wire up triggers: click and keyboard (Enter/Space)
document.querySelectorAll('.dossier-trigger').forEach(card => {
  card.addEventListener('click', () => openDossier(card));
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openDossier(card);
    }
  });
});

// Inject source-available indicator on cards with GitHub links
document.querySelectorAll('.dossier-trigger[data-dossier-github]').forEach(card => {
  const indicator = document.createElement('span');
  indicator.className = 'source-indicator';
  indicator.setAttribute('aria-hidden', 'true');
  indicator.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/></svg>SRC AVAILABLE';
  // Place before the arrow in declass cards, or group with status in featured cards
  const arrow = card.querySelector('.declass-card-arrow');
  const statusSpan = card.querySelector('.featured-card-status');
  const topRow = card.querySelector('.declass-card-top') || card.querySelector('.featured-card-header');
  if (arrow) {
    arrow.before(indicator);
  } else if (statusSpan) {
    const group = document.createElement('span');
    group.className = 'featured-card-header-right';
    statusSpan.replaceWith(group);
    group.appendChild(statusSpan);
    group.appendChild(indicator);
  } else if (topRow) {
    topRow.appendChild(indicator);
  }
});

// Inject demo-available indicator on cards with demo videos
document.querySelectorAll('.dossier-trigger[data-dossier-demo]').forEach(card => {
  const indicator = document.createElement('span');
  indicator.className = 'demo-indicator';
  indicator.setAttribute('aria-hidden', 'true');
  indicator.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>WATCH DEMO';
  const arrow = card.querySelector('.declass-card-arrow');
  const topRow = card.querySelector('.declass-card-top') || card.querySelector('.featured-card-header');
  if (arrow) arrow.before(indicator);
  else if (topRow) topRow.appendChild(indicator);
});

closeBtn.addEventListener('click', closeDossier);

// Close on scrim click
overlay.addEventListener('click', e => {
  if (e.target === overlay) closeDossier();
});

// Close on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && isOpen) closeDossier();
});

// Swipe-down to close on mobile bottom sheet — with real-time drag tracking
let swipeTouchStartY = 0;
let swipeDragging = false;

// Perform a fast swipe-close without triggering VT or full closeDossier animation
function _swipeClose() {
  if (!isOpen) return;
  isOpen = false;
  const card = currentCard;
  currentCard = null;
  document.body.style.overflow = '';
  if (card) card.classList.remove('dossier-card-open');

  panel.style.transition = 'transform 0.22s cubic-bezier(0.4, 0, 1, 1)';
  panel.style.transform = 'translateY(100%)';
  overlay.classList.remove('active');

  setTimeout(() => {
    panel.style.transform = '';
    panel.style.transition = '';
    overlay.style.display = '';
    const inner = panel.querySelector('.dossier-inner');
    inner.classList.remove('dossier-scanning', 'dossier-revealed');
    if (card) card.focus();
  }, 260);
}

panel.addEventListener('touchstart', e => {
  if (!isOpen) return;
  swipeTouchStartY = e.touches[0].clientY;
  swipeDragging = false;
}, { passive: true });

panel.addEventListener('touchmove', e => {
  if (!isOpen) return;
  const dy = e.touches[0].clientY - swipeTouchStartY;
  if (dy <= 0) { swipeDragging = false; return; }
  const inner = panel.querySelector('.dossier-inner');
  // Only hijack the gesture when the content is scrolled to the very top
  if (inner && inner.scrollTop > 2) return;
  swipeDragging = true;
  panel.style.transition = 'none';
  panel.style.transform = `translateY(${dy}px)`;
}, { passive: true });

panel.addEventListener('touchend', e => {
  if (!swipeDragging) return;
  swipeDragging = false;
  const dy = e.changedTouches[0].clientY - swipeTouchStartY;
  if (dy > 100) {
    _swipeClose();
  } else {
    // Spring back to resting position
    panel.style.transition = 'transform 0.38s cubic-bezier(0.22, 1, 0.36, 1)';
    panel.style.transform = '';
    setTimeout(() => { panel.style.transition = ''; }, 400);
  }
}, { passive: true });

panel.addEventListener('touchcancel', () => {
  if (!swipeDragging) return;
  swipeDragging = false;
  panel.style.transition = 'transform 0.38s cubic-bezier(0.22, 1, 0.36, 1)';
  panel.style.transform = '';
  setTimeout(() => { panel.style.transition = ''; }, 400);
}, { passive: true });

// Intercept the browser back-button/gesture so it closes the dossier
// instead of navigating away from the page
window.addEventListener('popstate', () => {
  if (isOpen) closeDossier();
});
