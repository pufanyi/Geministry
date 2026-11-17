export type Theme = 'light' | 'dark';

const DARK_CLASS_RE = /\b(dark-theme|theme-dark|dark)\b/i;
const LIGHT_CLASS_RE = /\b(light-theme|theme-light|light)\b/i;

function parseRgbLuminance(color: string): number | null {
  const match = color.match(
    /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/i,
  );
  if (!match) return null;
  const alpha = match[4] !== undefined ? Number(match[4]) : 1;
  if (Number.isNaN(alpha) || alpha <= 0.1) return null;
  const r = Number(match[1]);
  const g = Number(match[2]);
  const b = Number(match[3]);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function explicitElementTheme(el: Element | null): Theme | null {
  if (!el) return null;
  const attr = (
    el.getAttribute('data-theme') ||
    el.getAttribute('data-color-scheme') ||
    ''
  ).toLowerCase();
  if (attr === 'dark' || el.hasAttribute('dark')) return 'dark';
  if (attr === 'light') return 'light';

  const cls = typeof el.className === 'string' ? el.className : '';
  if (DARK_CLASS_RE.test(cls)) return 'dark';
  if (LIGHT_CLASS_RE.test(cls)) return 'light';

  const colorScheme = getComputedStyle(el).colorScheme.trim().toLowerCase();
  if (colorScheme === 'dark') return 'dark';
  if (colorScheme === 'light') return 'light';

  return null;
}

export function detectTheme(): Theme {
  const targets = [document.body, document.documentElement];
  for (const el of targets) {
    const theme = explicitElementTheme(el);
    if (theme) return theme;
  }
  for (const el of targets) {
    if (!el) continue;
    const luminance = parseRgbLuminance(getComputedStyle(el).backgroundColor);
    if (luminance !== null) return luminance < 0.5 ? 'dark' : 'light';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function syncTheme(host: HTMLElement): () => void {
  const apply = () => {
    const next = detectTheme();
    if (host.dataset.theme !== next) host.dataset.theme = next;
  };
  apply();

  const media = window.matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', apply);

  const observer = new MutationObserver(apply);
  const options: MutationObserverInit = {
    attributes: true,
    attributeFilter: [
      'class',
      'style',
      'data-theme',
      'data-color-scheme',
      'dark',
    ],
  };
  observer.observe(document.documentElement, options);
  if (document.body) observer.observe(document.body, options);

  return () => {
    media.removeEventListener('change', apply);
    observer.disconnect();
  };
}
