/* ─── SHARED UTILITIES ─── */
export const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

export function escHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* Inline redaction markers, for dossiers whose details are withheld.
   [[n]] renders an n-character blackout bar; [[EXPUNGED]] renders a stamp.
   The withheld text is never written into the data — a bar carries nothing
   but its own width — so a sealed field stays sealed in view-source too.
   Call this on already-escaped text: the markers survive escHtml untouched. */
const REDACT_RE = /\[\[(EXPUNGED|\d{1,3})\]\]/g;

export function applyRedaction(escaped) {
  return String(escaped).replace(REDACT_RE, (_, token) => {
    if (token === 'EXPUNGED') {
      return `<span class="df-expunged" role="img" aria-label="data expunged">DATA EXPUNGED</span>`;
    }
    const w = Math.min(parseInt(token, 10), 120);
    return `<span class="df-redact" style="--redact-w:${w}" role="img" aria-label="redacted"></span>`;
  });
}
