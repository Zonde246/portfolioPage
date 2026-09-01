/* ─── ENTRY POINT — viewport router ─── */
/* War room loads on desktop (≥900px); legacy scroll-page on mobile. */

const IS_WAR_ROOM = window.innerWidth >= 900;

if (IS_WAR_ROOM) {
  /* ─── WAR ROOM MODE ─── */
  import('./modules/warroom.js').then(m => m.initWarRoom());
  import('./modules/cursor.js');

} else {
  /* ─── LEGACY MODE (mobile) ─── */
  import('./modules/intro.js');
  import('./modules/data.js');
  import('./modules/scroll-reveal.js');
  import('./modules/terminal.js');
  import('./modules/cursor.js');
  import('./modules/count-up.js');
  import('./modules/dossier.js');
  import('./modules/nav.js');
  import('./modules/scrollbar.js');
  import('./modules/delights.js');
  import('./modules/ambient.js');
  import('./modules/graph.js');
  import('./modules/radar.js');
  import('./modules/shatter.js');
  import('./modules/webgl.js');
  import('./modules/boot.js');
}
