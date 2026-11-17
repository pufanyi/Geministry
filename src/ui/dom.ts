export const create = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  cls?: string,
  text?: string,
): HTMLElementTagNameMap[K] => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
};
export const query = (root: ParentNode, selector: string): HTMLElement => {
  const element = root.querySelector(selector);
  if (!(element instanceof HTMLElement))
    throw new Error(`Missing UI element: ${selector}`);
  return element;
};
