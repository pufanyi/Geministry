import {
  isModelSymbol,
  type ModelSymbol,
  models,
  position,
  symbols,
} from '../data/elements';
import { createNativeMenu, isNativeSelector } from '../gemini/native-menu';
import { create, query } from './dom';
import styles from './panel.css';
import { panelMarkup } from './template';

export function mountPeriodicTable() {
  const host = create('div');
  host.id = 'gpt-periodic-host';
  document.documentElement.appendChild(host);
  const shadow = host.attachShadow({ mode: 'open', delegatesFocus: true });
  const style = create('style');
  style.textContent = styles;
  shadow.appendChild(style);
  const launcher = create('button', 'launcher', '⚛');
  launcher.title = 'Gemini Periodic Table (Alt+Shift+P)';
  launcher.setAttribute('aria-label', 'Open Gemini Periodic Table');
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
    query(panel, '.symbol').style.setProperty('--c', m.color);
    query(panel, '.detail-title').textContent = `Gemini 4 ${m.name}`;
    query(panel, '.joke').textContent = m.joke;
    grid.querySelectorAll('.active').forEach((el) => {
      el.classList.toggle('selected', query(el, '.sym').textContent === symbol);
    });
    setStatus(
      `${m.name} selected in the periodic table. Click “Select model” to apply.`,
    );
  };

  const nativeMenu = createNativeMenu(host, setStatus);
  const open = () => {
    shown = true;
    panel.classList.remove('hidden');
    scrim.classList.remove('hidden');
    launcher.setAttribute('aria-expanded', 'true');
  };
  const close = () => {
    shown = false;
    panel.classList.add('hidden');
    scrim.classList.add('hidden');
    launcher.setAttribute('aria-expanded', 'false');
  };
  launcher.addEventListener('click', () => (shown ? close() : open()));
  scrim.addEventListener('click', close);
  query(panel, '.close').addEventListener('click', close);
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
      } else if (ev.key === 'Escape' && shown) close();
    },
    true,
  );
  // Native selector hook is deliberately conservative; floating ⚛ always works as a fallback.
  document.addEventListener(
    'click',
    (ev) => {
      if (
        !(ev.target instanceof Element) ||
        shown ||
        nativeMenu.isOpening() ||
        host.contains(ev.target)
      )
        return;
      if (isNativeSelector(ev.target)) {
        // Let Gemini process its own click; our overlay covers the native menu.
        setTimeout(() => {
          if (!shown && !nativeMenu.isOpening()) open();
        }, 50);
      }
    },
    true,
  );
  selectSymbol('H');
}
