export const regions = ['memory', 'personality', 'values', 'reasoning', 'emotion', 'language'];
const outline = 'M337 58 C310 26 266 33 242 55 C205 47 166 80 167 111 C124 129 133 164 130 185 C103 214 116 249 135 267 C122 305 156 335 183 340 C201 378 244 389 274 377 C301 402 332 381 337 358 C343 297 331 242 338 192 C331 149 345 101 337 58 Z M347 58 C374 26 418 33 442 55 C479 47 518 80 517 111 C560 129 551 164 554 185 C581 214 568 249 549 267 C562 305 528 335 501 340 C483 378 440 389 410 377 C383 402 352 381 347 358 C341 297 353 242 346 192 C353 149 339 101 347 58 Z';
function geometry() {
  const points = [];
  // Deterministic bounded mesh; no external assets, anatomy or personal data.
  for (let side = 0; side < 2; side++) {
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 7; col++) {
        const y = 62 + row * 33 + Math.sin(col * 4 + row) * 7;
        const extent = Math.sqrt(Math.max(0, 1 - ((y - 220) / 173) ** 2)) * 112;
        const center = side ? 432 : 252;
        const x = center + (col / 6 * 2 - 1) * extent + Math.sin(row * 8 + col) * 5;
        if ((side === 0 && x > 331) || (side === 1 && x < 353)) continue;
        const region = side ? (row < 3 ? 'personality' : row < 6 ? 'values' : 'reasoning') : (row < 3 ? 'memory' : row < 6 ? 'emotion' : 'language');
        points.push({x, y, region, index:points.length});
      }
    }
  }
  return points;
}
const points = geometry();
export function brainMarkup(t, {selected='memory', progress=100, mode='explore', pulse=[]}={}) {
  const level = mode === 'capture' ? progress : 100;
  const mesh = regions.map(region => {
    const subset = points.filter(p => p.region === region);
    const visible = subset.filter((p, i) => mode !== 'capture' || i < Math.ceil(subset.length * level / 100));
    const edges = visible.flatMap((p, i) => visible.slice(i + 1).filter(q => Math.hypot(p.x - q.x, p.y - q.y) < 52).slice(0, 3).map(q => `<line x1="${p.x.toFixed(1)}" y1="${p.y.toFixed(1)}" x2="${q.x.toFixed(1)}" y2="${q.y.toFixed(1)}"/>`)).join('');
    const dots = visible.map((p, i) => `<circle class="neuron ${i % 3 === 0 ? 'primary-neuron' : ''}" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${i % 3 === 0 ? 2.4 : 1.5}"/>`).join('');
    return `<g data-brain-part="${region}" class="brain-part ${region === selected ? 'selected' : ''} ${pulse.includes(region) ? 'pulse' : ''}">${edges}${dots}</g>`;
  }).join('');
  return `<section class="neural-observatory ${mode === 'capture' ? 'capture-core' : ''}" aria-label="${t('brain.title')}">
    <div class="neural-top"><span class="eyebrow">${t('brain.neural')}</span><span class="small-status">${mode === 'capture' ? `${progress}% · ${t('builder.progress')}` : t('shell.disconnected')}</span></div>
    <div class="brain-stage">
      <div class="brain-floor" aria-hidden="true"></div>
      <div class="brain-model">
        <svg viewBox="0 0 680 460" aria-hidden="true" focusable="false">
          <defs>
            <radialGradient id="brain-shade"><stop offset="0" stop-color="#79c5dd" stop-opacity=".2"/><stop offset=".64" stop-color="#286781" stop-opacity=".1"/><stop offset="1" stop-color="#071723" stop-opacity=".5"/></radialGradient>
            <linearGradient id="brain-edge" x2=".8" y2="1"><stop stop-color="#94d4e2" stop-opacity=".6"/><stop offset="1" stop-color="#356b82" stop-opacity=".15"/></linearGradient>
            <clipPath id="brain-clip"><path d="${outline}"/></clipPath>
          </defs>
          <path class="brain-outline" d="${outline}" fill="url(#brain-shade)" stroke="url(#brain-edge)"/>
          <g class="brain-folds" clip-path="url(#brain-clip)">
            <path d="M246 56 C183 125 293 108 253 167 S196 232 251 273 S205 346 273 377 M179 105 C223 141 164 196 207 226 S177 303 224 350 M306 63 C278 132 329 150 285 213 S322 300 292 364 M442 56 C505 125 395 108 435 167 S492 232 437 273 S483 346 415 377 M509 105 C465 141 524 196 481 226 S511 303 464 350 M382 63 C410 132 359 150 403 213 S366 300 396 364"/>
            <path d="M139 181 Q246 130 332 188 M140 261 Q240 211 332 269 M553 181 Q448 130 354 188 M550 261 Q452 211 353 269"/>
            ${mesh}
          </g>
          <path class="brain-seam" d="M342 54 Q329 100 343 145 T343 233 T342 365"/>
        </svg>
      </div>
      ${regions.map(region => `<button type="button" class="brain-anchor ${selected === region ? 'selected' : ''}" data-brain-region="${region}" data-anchor="${region}" aria-pressed="${selected === region}" aria-label="${t('brain.explore')}: ${t('region.'+region)}"><span class="anchor-dot"></span><span>${t('region.'+region)}</span></button>`).join('')}
      <div class="brain-coordinate" aria-hidden="true">MC / 06<br>${t('brain.topology')}</div>
    </div>
    <div class="neural-bottom"><span>${t(mode === 'capture' ? 'builder.progressNote' : 'home.brainCaption')}</span><span>${mode === 'capture' ? t('shell.demo') : t('brain.explore')} ↗</span></div>
  </section>`;
}
export function connectBrain(container, onSelect, reducedMotion=false) {
  const stage = container.querySelector('.brain-stage');
  if (!stage) return;
  const parts = [...container.querySelectorAll('[data-brain-part]')];
  const highlight = region => parts.forEach(p => p.classList.toggle('hovered', p.dataset.brainPart === region));
  container.querySelectorAll('[data-brain-region]').forEach(button => {
    button.addEventListener('pointerenter', () => highlight(button.dataset.brainRegion));
    button.addEventListener('pointerleave', () => highlight(null));
    button.addEventListener('focus', () => highlight(button.dataset.brainRegion));
    button.addEventListener('blur', () => highlight(null));
    button.addEventListener('click', () => onSelect(button.dataset.brainRegion));
  });
  if (!reducedMotion && !matchMedia('(prefers-reduced-motion: reduce), (max-width: 700px), (pointer: coarse)').matches) {
    let pending = false;
    stage.addEventListener('pointermove', event => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        if (!stage.isConnected) return;
        const r = stage.getBoundingClientRect();
        stage.style.setProperty('--tilt-x', `${((event.clientY-r.top)/r.height-.5)*-5}deg`);
        stage.style.setProperty('--tilt-y', `${((event.clientX-r.left)/r.width-.5)*7}deg`);
      });
    });
    stage.addEventListener('pointerleave', () => {
      stage.style.setProperty('--tilt-x', '0deg');
      stage.style.setProperty('--tilt-y', '0deg');
    });
  }
}
