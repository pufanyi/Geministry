export const launcherIcon = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
  <ellipse cx="12" cy="12" rx="9" ry="3.8" transform="rotate(30 12 12)" stroke="currentColor" stroke-width="1.6"/>
  <ellipse cx="12" cy="12" rx="9" ry="3.8" transform="rotate(-30 12 12)" stroke="currentColor" stroke-width="1.6"/>
  <ellipse cx="12" cy="12" rx="9" ry="3.8" transform="rotate(90 12 12)" stroke="currentColor" stroke-width="1.6"/>
  <path d="M12 8.8L12.85 11.15L15.2 12L12.85 12.85L12 15.2L11.15 12.85L8.8 12L11.15 11.15Z" fill="var(--accent-ink)"/>
</svg>`;

export const panelMarkup = `
<div class="headline">
  <div>
    <div class="eyebrow">
      <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 1L9.7 6.3L15 8L9.7 9.7L8 15L6.3 9.7L1 8L6.3 6.3Z" fill="currentColor"/>
      </svg>
      <span>ELEMENTARY, MY DEAR GEMINI</span>
    </div>
    <div class="title">Periodic Table of Models</div>
    <div class="subtitle">118 elements. 3 usable. Infinite marketing potential.</div>
  </div>
  <button class="close" type="button" aria-label="Close">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
    </svg>
  </button>
</div>
<div class="legend">
  <span><i class="dot"></i>Released</span>
  <span><i class="dot off"></i>Coming soon™</span>
</div>
<div class="table-scroll">
  <div class="periodic"></div>
</div>
<div class="extra">
  <span class="extra-label">Other models</span>
  <button class="other" type="button" data-other="Flash-Lite">Flash-Lite</button>
  <button class="other" type="button" data-other="Pro">Pro</button>
  <button class="other" type="button" data-other="Auto">Auto</button>
</div>
<div class="detail">
  <div class="hero">
    <div class="symbol">H</div>
    <div class="hero-copy">
      <div class="detail-head">
        <div class="detail-title">Gemini 4 Hydrogen</div>
        <span class="detail-tag">Everyday help</span>
      </div>
      <div class="joke"></div>
    </div>
  </div>
  <div class="thinking" role="group" aria-label="Thinking level">
    <button type="button" data-level="Low">Low</button>
    <button type="button" data-level="Medium" class="on">Medium</button>
    <button type="button" data-level="High">High</button>
  </div>
  <button class="action" type="button">Select model ↗</button>
</div>
<div class="status" aria-live="polite">Choose an element to summon a model.</div>
<div class="hint">Unofficial parody · No API calls · Only uses the visible Gemini menu</div>
`;
