const visible = (el: Element) =>
  !!(
    el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden'
  );
const clean = (s: string | null | undefined) =>
  (s || '').replace(/\s+/g, ' ').trim();

const ICON_LIGATURE_RE =
  /\b(?:keyboard_arrow_down|expand_more|arrow_drop_down|chevron_down|stat_minus_1|unfold_more)\b/gi;
const SKIP_SELECTOR =
  'svg,mat-icon,.mat-icon,.google-symbols,.material-icons,[class*="material-symbols"],[aria-hidden="true"],.cdk-visually-hidden,.sr-only,.visually-hidden';

function renderedText(element: HTMLElement): string {
  // biome-ignore lint/performance/useDomNodeTextContent: Match visible Gemini menu labels, excluding hidden descriptive text.
  return clean(element.innerText || element.textContent);
}

function buttonLabel(element: HTMLElement): string {
  const parts: string[] = [];
  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent) parts.push(node.textContent);
      return;
    }
    if (!(node instanceof Element)) return;
    if (node.matches(SKIP_SELECTOR)) return;
    const style = getComputedStyle(node);
    if (style.display === 'none' || style.visibility === 'hidden') return;
    for (const child of node.childNodes) walk(child);
  };
  walk(element);
  return clean(parts.join(' ').replace(ICON_LIGATURE_RE, ' '));
}

const MODEL_TRIGGER_RE =
  /^(?:gemini(?:\s*\d+(?:\.\d+)?)?\s+)?(?:Hydrogen|Carbon|Argon|Auto|Flash-Lite|(?:3\.1\s*)?Pro)(?:\s*[⌄▼▾∨])?$/i;
const PICKER_LABEL_RE =
  /^(?:open\s+)?(?:choose|select|change|switch)\s+(?:a\s+)?(?:model|mode)(?:\s+(?:picker|menu|selector))?$/i;
const PICKER_TITLE_RE = /^(?:model|mode)\s+(?:picker|selector|menu)$/i;
const PICKER_NAMED_RE =
  /^(?:(?:current|selected)\s+)?(?:model|mode)\s*:\s*(?:Hydrogen|Carbon|Argon|Auto|Flash-Lite|(?:3\.1\s*)?Pro)$/i;
const PICKER_COMMA_RE =
  /^(?:Hydrogen|Carbon|Argon|Auto|Flash-Lite|(?:3\.1\s*)?Pro)\s*,\s*(?:model|mode)(?:\s+(?:picker|selector|menu))?$/i;
const PICKER_ZH_RE = /^(?:选择|切换|更改)模型$/;

const TRIGGER_SELECTOR = 'button,[role="button"],[role="combobox"]';

export function getNativeSelector(target: Element): HTMLElement | null {
  const t = target.closest(TRIGGER_SELECTOR);
  if (
    !(t instanceof HTMLElement) ||
    !visible(t) ||
    t.closest(
      '[role="menu"],[role="listbox"],[role="menuitem"],[role="option"],mat-option',
    )
  )
    return null;
  const labels = [
    buttonLabel(t),
    renderedText(t).replace(ICON_LIGATURE_RE, ' ').trim(),
    clean(t.getAttribute('aria-label')),
  ].filter(Boolean);
  return labels.some(
    (text) =>
      MODEL_TRIGGER_RE.test(text) ||
      PICKER_LABEL_RE.test(text) ||
      PICKER_TITLE_RE.test(text) ||
      PICKER_NAMED_RE.test(text) ||
      PICKER_COMMA_RE.test(text) ||
      PICKER_ZH_RE.test(text),
  )
    ? t
    : null;
}

export function findNativeSelector(): HTMLElement | null {
  for (const button of document.querySelectorAll(TRIGGER_SELECTOR)) {
    const selector = getNativeSelector(button);
    if (selector) return selector;
  }
  return null;
}

export function createNativeMenu(
  host: HTMLElement,
  setStatus: (message: string, error?: boolean) => void,
) {
  let openingNative = false;
  const candidates = () =>
    Array.from(
      document.querySelectorAll(
        'button,[role="button"],[role="menuitem"],[role="option"],mat-option',
      ),
    )
      .filter((el): el is HTMLElement => el instanceof HTMLElement)
      .filter(
        (el) =>
          !host.contains(el) &&
          visible(el) &&
          el.getBoundingClientRect().width > 0,
      );
  const matchModel = (el: HTMLElement, name: string) => {
    const t = renderedText(el),
      a = clean(el.getAttribute('aria-label'));
    const re =
      name === 'Auto'
        ? /\bauto\b/i
        : name === 'Pro'
          ? /(?:^|\b)(?:3\.1\s*)?pro(?:\b|$)/i
          : new RegExp(`\\b${name}\\b`, 'i');
    if (!re.test(`${t} ${a}`)) return false;
    if (t.length > 240) return false;
    if (/unlock|upgrade|subscribe|learn more/i.test(`${t} ${a}`)) return false;
    return true;
  };
  function nativeTrigger() {
    const selector = findNativeSelector();
    if (selector) return selector;
    const list = candidates();
    const named = list.filter((el) => {
      const name = `${renderedText(el)} ${clean(el.getAttribute('aria-label'))}`;
      return (
        /\b(Hydrogen|Argon|Carbon|Flash-Lite|3\.1 Pro|Gemini 4|model)\b/i.test(
          name,
        ) && name.length < 130
      );
    });
    const scored = named
      .map((el) => {
        const r = el.getBoundingClientRect();
        const txt = renderedText(el);
        let s = (r.top / window.innerHeight) * 6;
        if (
          /^(Hydrogen|Argon|Carbon|Flash-Lite|3\.1 Pro)(\s*[⌄▼▾])?$/i.test(txt)
        )
          s += 12;
        if (/model/i.test(el.getAttribute('aria-label') || '')) s += 8;
        if (r.top < window.innerHeight * 0.4) s -= 9;
        if (txt.length > 60) s -= 15;
        return { el, s };
      })
      .sort((a, b) => b.s - a.s);
    const best = scored[0];
    return best && best.s > 0 ? best.el : null;
  }
  const sleep = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));
  async function applyNative(name: string, thinkingLevel?: string) {
    setStatus(`Looking for ${name} in Gemini’s native menu…`);
    const itemsBefore = candidates().filter((el) => matchModel(el, name));
    const trigger = nativeTrigger();
    if (!trigger) {
      setStatus(
        'Could not find the native Gemini model selector. Try manually opening it, then click Select again.',
        true,
      );
      return;
    }
    openingNative = true;
    try {
      trigger.click();
      await sleep(260);
      const items = candidates()
        .filter((el) => matchModel(el, name))
        .filter((el) => el !== trigger);
      // Menu entries usually appear after trigger.click(). Prefer entries not already in the DOM and short exact labels.
      const sorted = items
        .map((el) => ({
          el,
          score:
            (itemsBefore.includes(el) ? 0 : 6) +
            (renderedText(el).toLowerCase() === name.toLowerCase() ? 8 : 0) +
            (el.getAttribute('role') === 'menuitem' ? 2 : 0),
        }))
        .sort((a, b) => b.score - a.score);
      const best = sorted[0];
      if (!best) {
        setStatus(
          `${name} was not found in the Gemini menu. It may be unavailable on your plan, or Gemini changed its UI.`,
          true,
        );
        return;
      }
      best.el.click();
      await sleep(220);
      if (thinkingLevel) {
        const lev = candidates().filter(
          (el) =>
            renderedText(el).toLowerCase() === thinkingLevel.toLowerCase(),
        );
        lev.at(-1)?.click();
      }
      setStatus(
        `Clicked the native ${name} option${thinkingLevel ? ` (thinking: ${thinkingLevel})` : ''}. Check Gemini's label to confirm.`,
      );
    } catch (e) {
      setStatus(
        'Could not select model: ' +
          (e instanceof Error ? e.message : String(e)),
        true,
      );
    } finally {
      openingNative = false;
    }
  }

  return { apply: applyNative, isOpening: () => openingNative };
}
