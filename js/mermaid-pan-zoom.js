import { escapeHtml } from './utils.js';

/**
 * @param {string} mermaidSource
 * @param {{ wheelZoom?: boolean, variant?: 'diagram' | 'default' }} [options]
 */
export function buildMermaidPanZoomHtml(mermaidSource, { wheelZoom = true, variant = 'default' } = {}) {
  if (!mermaidSource) return '';
  const wheelAttr = wheelZoom ? '' : ' data-wheel-zoom="false"';
  const variantClass = variant === 'diagram' ? ' mermaid-pan-zoom--diagram' : '';
  return `<div class="mermaid-pan-zoom${variantClass}"${wheelAttr}>
    <p class="mermaid-pan-zoom__hint">Ctrl or ⌘ + scroll to zoom</p>
    <div class="mermaid-pan-zoom__viewport is-loading">
      <div class="mermaid-pan-zoom__stage">
        <div class="mermaid-wrap"><div class="mermaid">${escapeHtml(mermaidSource)}</div></div>
      </div>
    </div>
  </div>`;
}

/**
 * @param {Element} panZoomEl
 * @param {{ fitMode?: 'diagram' | 'all' }} [options]
 */
export function initMermaidPanZoom(panZoomEl, options = {}) {
  if (!panZoomEl || panZoomEl.dataset.panZoomReady === '1') return;

  const viewport = panZoomEl.querySelector('.mermaid-pan-zoom__viewport');
  const stage = panZoomEl.querySelector('.mermaid-pan-zoom__stage');
  const svg = panZoomEl.querySelector('svg');
  if (!viewport || !stage || !svg) return;

  const fitMode = options.fitMode
    ?? (panZoomEl.classList.contains('mermaid-pan-zoom--diagram') ? 'diagram' : 'all');

  svg.style.maxWidth = 'none';
  svg.style.display = 'block';

  let scale = 1;
  let panX = 0;
  let panY = 0;
  let fitAttempts = 0;
  const minScale = 0.25;
  const maxScale = 5;
  const maxFitScale = fitMode === 'diagram' ? 4 : 2;
  const fitPadding = fitMode === 'diagram' ? 1.04 : 1.14;

  const apply = () => {
    stage.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
  };

  const boxSize = (box) => box && box.width > 0 && box.height > 0;

  const contentBox = () => {
    const vb = svg.viewBox?.baseVal;
    if (vb?.width > 0 && vb?.height > 0) {
      return { x: vb.x, y: vb.y, width: vb.width, height: vb.height };
    }
    return svg.getBBox();
  };

  const normalizeSvgSize = () => {
    const box = contentBox();
    if (!boxSize(box)) return false;
    svg.removeAttribute('width');
    svg.removeAttribute('height');
    svg.style.width = `${box.width}px`;
    svg.style.height = `${box.height}px`;
    svg.style.maxWidth = 'none';
    return true;
  };

  const centerOn = (box, s = scale) => {
    const vp = viewport.getBoundingClientRect();
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    panX = vp.width / 2 - cx * s;
    panY = vp.height / 2 - cy * s;
  };

  const reveal = () => {
    panZoomEl.dataset.panZoomReady = '1';
    viewport.classList.remove('is-loading');
    panZoomEl.classList.remove('is-loading');
    panZoomEl.classList.add('is-ready');
  };

  const fitAll = () => {
    const vp = viewport.getBoundingClientRect();
    if (!vp.width || !vp.height || !normalizeSvgSize()) return;
    const box = contentBox();
    if (!boxSize(box)) return;
    scale = Math.min(
      vp.width / (box.width * fitPadding),
      vp.height / (box.height * fitPadding),
      maxFitScale,
    );
    scale = Math.max(scale, minScale);
    centerOn(box, scale);
    apply();
  };

  const scheduleFit = () => {
    fitAttempts = 0;
    panZoomEl.classList.remove('is-ready');
    viewport.classList.add('is-loading');
    panZoomEl.classList.add('is-loading');

    const tryFit = () => {
      const vp = viewport.getBoundingClientRect();
      if (!vp.width || !vp.height || !normalizeSvgSize()) {
        if (fitAttempts++ < 40) requestAnimationFrame(tryFit);
        else { scale = 1; panX = 16; panY = 16; apply(); reveal(); }
        return;
      }
      const box = contentBox();
      if (!boxSize(box)) {
        if (fitAttempts++ < 40) requestAnimationFrame(tryFit);
        else { scale = 1; panX = 16; panY = 16; apply(); reveal(); }
        return;
      }
      fitAttempts = 0;
      fitAll();
      reveal();
    };

    requestAnimationFrame(() => requestAnimationFrame(tryFit));
  };

  const zoomBy = (factor, clientX, clientY) => {
    const rect = viewport.getBoundingClientRect();
    const mx = clientX != null ? clientX - rect.left : rect.width / 2;
    const my = clientY != null ? clientY - rect.top : rect.height / 2;
    const next = Math.min(maxScale, Math.max(minScale, scale * factor));
    panX = mx - (mx - panX) * (next / scale);
    panY = my - (my - panY) * (next / scale);
    scale = next;
    apply();
  };

  if (panZoomEl.dataset.wheelZoom !== 'false') {
    viewport.addEventListener(
      'wheel',
      (e) => {
        if (!(e.metaKey || e.ctrlKey)) return;
        e.preventDefault();
        e.stopPropagation();
        zoomBy(e.deltaY > 0 ? 0.9 : 1.1, e.clientX, e.clientY);
      },
      { passive: false, capture: true },
    );
  }

  let dragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragPanX = 0;
  let dragPanY = 0;
  let pointerId = null;

  const onPointerDown = (e) => {
    if (e.button != null && e.button !== 0) return;
    dragging = true;
    pointerId = e.pointerId;
    viewport.setPointerCapture(pointerId);
    viewport.classList.add('is-dragging');
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragPanX = panX;
    dragPanY = panY;
    e.preventDefault();
  };
  const onPointerMove = (e) => {
    if (!dragging || e.pointerId !== pointerId) return;
    panX = dragPanX + (e.clientX - dragStartX);
    panY = dragPanY + (e.clientY - dragStartY);
    apply();
    e.preventDefault();
  };
  const endDrag = (e) => {
    if (!dragging || e.pointerId !== pointerId) return;
    dragging = false;
    pointerId = null;
    viewport.classList.remove('is-dragging');
    viewport.releasePointerCapture(e.pointerId);
  };
  viewport.addEventListener('pointerdown', onPointerDown, { capture: true });
  viewport.addEventListener('pointermove', onPointerMove);
  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);

  scheduleFit();
}

/**
 * @param {ParentNode | null | undefined} rootEl
 * @param {{ fitMode?: 'diagram' | 'all' }} [options]
 */
export function initMermaidPanZoomIn(rootEl, options = {}) {
  if (!rootEl) return;
  rootEl.querySelectorAll('.mermaid-pan-zoom').forEach((el) => initMermaidPanZoom(el, options));
}
