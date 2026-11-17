# Geministry

An unofficial Chrome extension that turns Gemini's model picker into a periodic table.

## Development

Install Node.js 22 or newer and pnpm, then run:

```sh
pnpm install
pnpm check   # Strict TypeScript checking without emitting files
pnpm build   # Compile the content script and copy extension assets to dist/
pnpm dev     # Copy assets once and watch TypeScript changes
```

In `chrome://extensions`, enable **Developer mode**, select **Load unpacked**,
and choose `dist/`. Refresh Gemini after reloading the extension. While using
`pnpm dev`, restart it after changing the manifest or icons to copy those assets.

Edit `src/content.ts`; `dist/content.js` is generated. The content script remains
a self-contained IIFE with no runtime dependencies or module imports. TypeScript
runs with `strict` and `noUncheckedIndexedAccess`. No formatter is configured.

## Verification

Run `pnpm check` and `pnpm build`. In Chrome, check the launcher, Alt+Shift+P,
Escape, element selection, thinking controls, model shortcuts, and small screens.
With reduced motion enabled, entry animations and hover scaling should stop,
while focus and selection indicators remain visible.

There is no automated test suite. Native model selection needs verification in
a logged-in Gemini session; a DOM click does not confirm a server-side change.
See [the extension README](src/README.md) for features and limitations.
