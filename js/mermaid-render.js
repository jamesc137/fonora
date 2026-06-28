import { initMermaidPanZoomIn } from './mermaid-pan-zoom.js';

/**
 * Initialize and render Mermaid diagrams inside a container element.
 * @param {ParentNode | null | undefined} rootEl
 */
export async function renderMermaidIn(rootEl) {
  if (!window.mermaid || !rootEl) return;
  const nodes = rootEl.querySelectorAll('.mermaid');
  if (!nodes.length) return;

  window.mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    themeVariables: {
      fontFamily: 'ui-monospace, Menlo, monospace',
      lineColor: '#a89f95',
      clusterBkg: '#faf8f5',
      clusterBorder: '#e8e2da',
    },
    securityLevel: 'loose',
  });

  await new Promise((resolve) => requestAnimationFrame(resolve));
  try {
    await window.mermaid.run({ nodes });
    initMermaidPanZoomIn(rootEl, { fitMode: 'diagram' });
  } catch (err) {
    console.error('Mermaid render failed:', err);
  }
}
