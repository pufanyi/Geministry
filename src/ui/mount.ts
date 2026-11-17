import {
  isModelSymbol,
  type ModelSymbol,
  models,
  position,
  symbols,
} from '../data/elements';
import {
  createNativeMenu,
  findNativeSelector,
  getNativeSelector,
} from '../gemini/native-menu';
import { create, query } from './dom';
import styles from './panel.css';
import { launcherIcon, panelMarkup } from './template';
import { syncTheme } from './theme';

export function mountPeriodicTable() {
  const host = create('div');
  host.id = 'gpt-periodic-host';
  document.documentElement.appendChild(host);
  syncTheme(host);
  const shadow = host.attachShadow({ mode: 'open', delegatesFocus: true });
  const style = create('style');
  style.textContent = styles;
  shadow.appendChild(style);
  const launcher = create('button', 'launcher');
  launcher.type = 'button';
  launcher.innerHTML = launcherIcon;
  launcher.title = 'Gemini Periodic Table (Alt+Shift+P)';
  launcher.setAttribute('aria-label', 'Open Gemini Periodic Table');
  launcher.setAttribute('aria-expanded', 'false');
  const scrim = create('div', 'scrim hidden');
  const panel = create('section', 'panel hidden');
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Gemini Periodic Table');
  panel.innerHTML = panelMarkup;
  shadow.append(launcher, scrim, panel);
  const grid = query(panel, '.periodic');
  let chosen: ModelSymbol = 'H';
  let level = 'Medium',
    shown = false;
  const setStatus = (message: string, error = false) => {
    const n = query(panel, '.status');
    n.textContent = message;
    n.classList.toggle('error', error);
  };
  symbols.forEach((symbol, i) => {
    const n = i + 1,
      [row, col] = position(n),
      data = isModelSymbol(symbol) ? models[symbol] : undefined;
    const cell = create('button', `atom ${data ? 'active' : 'disabled'}`);
    cell.style.gridRow = String(row);
    cell.style.gridColumn = String(col);
    cell.type = 'button';
    cell.append(
      create('span', 'anum', String(n)),
      create('span', 'sym', symbol),
    );
    if (data) {
      cell.style.setProperty('--c', data.color);
      cell.title = `Gemini 4 ${data.name}`;
      cell.addEventListener('click', () => {
        if (isModelSymbol(symbol)) selectSymbol(symbol);
      });
    } else {
      cell.title = `${symbol} is still cooking (not a real Gemini model)`;
      cell.setAttribute('aria-disabled', 'true');
      cell.addEventListener('click', () =>
        setStatus(`${symbol}? Google hasn't synthesized that model yet. 🧪`),
      );
    }
    grid.appendChild(cell);
  });
  // Two placeholders keep the traditional table's 6th/7th row visually aligned.
  (
    [
      [6, 3, '57–71'],
      [7, 3, '89–103'],
    ] as const
  ).forEach(([r, c, text]) => {
    const el = create('div', 'atom disabled');
    el.style.gridRow = String(r);
    el.style.gridColumn = String(c);
    el.style.fontSize = '8px';
    el.textContent = text;
    grid.appendChild(el);
  });
  const selectSymbol = (symbol: ModelSymbol) => {
    chosen = symbol;
    const m = models[symbol];
    query(panel, '.symbol').textContent = symbol;
    query(panel, '.detail').style.setProperty('--c', m.color);
    query(panel, '.detail-title').textContent = `Gemini 4 ${m.name}`;
    query(panel, '.detail-tag').textContent = m.subtitle;
    query(panel, '.joke').textContent = m.joke;
    grid.querySelectorAll('.active').forEach((el) => {
      el.classList.toggle('selected', query(el, '.sym').textContent === symbol);
    });
    setStatus(
      `${m.name} selected in the periodic table. Click “Select model” to apply.`,
    );
  };

  const nativeMenu = createNativeMenu(host, setStatus);
  let anchor: HTMLElement | null = null;
  let returnFocus: HTMLElement | null = null;
  const positionPanel = () => {
    if (!shown || !anchor) return;
    if (!anchor.isConnected || !anchor.getClientRects().length) {
      close(false);
      return;
    }
    const rect = anchor.getBoundingClientRect();
    const gap = 8;
    const edge = 15;
    const below = Math.max(0, innerHeight - rect.bottom - gap - edge);
    const above = Math.max(0, rect.top - gap - edge);
    const opensBelow =
      below >= Math.min(panel.scrollHeight, 420) || below >= above;
    panel.style.maxHeight = `${opensBelow ? below : above}px`;
    panel.style.left = `${Math.max(edge, Math.min(rect.right - panel.offsetWidth, innerWidth - panel.offsetWidth - edge))}px`;
    panel.style.top = `${opensBelow ? rect.bottom + gap : rect.top - gap - panel.offsetHeight}px`;
  };
  const open = (trigger: HTMLElement | null = findNativeSelector()) => {
    anchor = trigger;
    returnFocus =
      trigger || (shadow.activeElement as HTMLElement | null) || launcher;
    shown = true;
    panel.classList.toggle('anchored', !!anchor);
    panel.classList.remove('hidden');
    scrim.classList.toggle('hidden', !!anchor);
    launcher.setAttribute('aria-expanded', 'true');
    positionPanel();
    query(panel, '.close').focus({ preventScroll: true });
  };
  const close = (restoreFocus = true) => {
    shown = false;
    panel.classList.add('hidden');
    scrim.classList.add('hidden');
    launcher.setAttribute('aria-expanded', 'false');
    panel.classList.remove('anchored');
    panel.removeAttribute('style');
    if (restoreFocus && returnFocus?.isConnected)
      returnFocus.focus({ preventScroll: true });
    anchor = null;
  };
  launcher.addEventListener('click', () => (shown ? close() : open()));
  scrim.addEventListener('click', () => close());
  query(panel, '.close').addEventListener('click', () => close());
  query(panel, '.action').addEventListener('click', () =>
    nativeMenu.apply(models[chosen].name, level),
  );
  panel.querySelectorAll<HTMLButtonElement>('[data-level]').forEach((b) => {
    b.addEventListener('click', () => {
      const nextLevel = b.dataset.level;
      if (!nextLevel) return;
      level = nextLevel;
      panel.querySelectorAll<HTMLButtonElement>('[data-level]').forEach((x) => {
        x.classList.toggle('on', x === b);
      });
      setStatus(`${level} thinking selected. Apply the model to request it.`);
    });
  });
  panel.querySelectorAll<HTMLButtonElement>('[data-other]').forEach((b) => {
    b.addEventListener('click', () => {
      const name = b.dataset.other;
      if (name) void nativeMenu.apply(name);
    });
  });
  document.addEventListener(
    'keydown',
    (ev) => {
      if (ev.altKey && ev.shiftKey && ev.code === 'KeyP') {
        ev.preventDefault();
        shown ? close() : open();
      } else if (ev.key === 'Escape' && shown) {
        ev.preventDefault();
        ev.stopImmediatePropagation();
        close();
      } else if (
        !nativeMenu.isOpening() &&
        ev.target instanceof Element &&
        !host.contains(ev.target) &&
        (ev.key === 'Enter' || ev.key === ' ') &&
        getNativeSelector(ev.target)
      ) {
        ev.preventDefault();
        ev.stopImmediatePropagation();
        shown ? close() : open(getNativeSelector(ev.target));
      }
    },
    true,
  );
  // Block Gemini's own menu handlers, except while applying a native selection.
  document.addEventListener(
    'pointerdown',
    (ev) => {
      if (
        !nativeMenu.isOpening() &&
        ev.target instanceof Element &&
        !host.contains(ev.target) &&
        getNativeSelector(ev.target)
      ) {
        ev.preventDefault();
        ev.stopImmediatePropagation();
      }
    },
    true,
  );
  document.addEventListener(
    'click',
    (ev) => {
      if (
        !(ev.target instanceof Element) ||
        nativeMenu.isOpening() ||
        host.contains(ev.target)
      )
        return;
      const trigger = getNativeSelector(ev.target);
      if (trigger) {
        ev.preventDefault();
        ev.stopImmediatePropagation();
        shown ? close() : open(trigger);
      } else if (shown) close(false);
    },
    true,
  );
  window.addEventListener('resize', positionPanel);
  document.addEventListener('scroll', positionPanel, true);
  new ResizeObserver(positionPanel).observe(panel);
  const refreshLauncher = () => {
    launcher.classList.toggle('hidden', !!findNativeSelector());
    positionPanel();
  };
  let refreshPending = false;
  const observer = new MutationObserver(() => {
    if (refreshPending) return;
    refreshPending = true;
    requestAnimationFrame(() => {
      refreshPending = false;
      refreshLauncher();
    });
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['aria-label', 'class', 'style', 'hidden'],
  });
  refreshLauncher();
  selectSymbol('H');
}
