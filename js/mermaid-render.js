import { escapeHtml } from './utils.js';
import { initMermaidPanZoomIn } from './mermaid-pan-zoom.js';
import { MERMAID_INIT } from './mermaid-theme.js';

/**
 * @param {string} mermaidSource
 */
export function buildStaticMermaidHtml(mermaidSource) {
  if (!mermaidSource) return '';
  return `<div class="mermaid-static"><div class="mermaid">${escapeHtml(mermaidSource)}</div></div>`;
}

async function runMermaidIn(rootEl, { interactive = true, panZoomOptions = {}, mermaidInit = MERMAID_INIT } = {}) {
  if (!window.mermaid || !rootEl) return;
  const nodes = rootEl.querySelectorAll('.mermaid');
  if (!nodes.length) return;

  window.mermaid.initialize(mermaidInit);

  await new Promise((resolve) => requestAnimationFrame(resolve));
  try {
    await window.mermaid.run({ nodes });
    if (interactive) {
      initMermaidPanZoomIn(rootEl, { fitMode: 'diagram', ...panZoomOptions });
    }
  } catch (err) {
    console.error('Mermaid render failed:', err);
  }
}

/**
 * Initialize and render Mermaid diagrams inside a container element.
 * @param {ParentNode | null | undefined} rootEl
 * @param {{ fitMode?: 'diagram' | 'all' | 'height' | 'timeline', fitPadding?: number, maxInitialScale?: number, initialZoomSteps?: number, zoomStep?: number, anchor?: 'start' | 'center', anchorX?: 'start' | 'center', anchorY?: 'start' | 'center', edgePadding?: number }} [panZoomOptions]
 * @param {object} [mermaidInit]
 */
export async function renderMermaidIn(rootEl, panZoomOptions = {}, mermaidInit = MERMAID_INIT) {
  await runMermaidIn(rootEl, { interactive: true, panZoomOptions, mermaidInit });
}

/**
 * Render Mermaid diagrams without pan/zoom chrome (static inline SVG).
 * @param {ParentNode | null | undefined} rootEl
 */
export async function renderMermaidStaticIn(rootEl) {
  await runMermaidIn(rootEl, { interactive: false });
}
