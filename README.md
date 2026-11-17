# Geministry

An unofficial Chrome extension that turns Gemini's model picker into a periodic table.

## Development

Install Node.js 22 or newer and pnpm, then run:

```sh
pnpm install
pnpm check      # Biome formatting/lint checks and strict TypeScript checking
pnpm format     # Apply formatting and safe lint fixes
pnpm typecheck  # TypeScript checking alone
pnpm build      # Type-check, bundle the content script, and copy assets to dist/
pnpm dev        # Rebuild TypeScript/CSS and copy changed public assets
```

In `chrome://extensions`, enable **Developer mode**, select **Load unpacked**,
and choose `dist/`. After edits, reload the extension and refresh Gemini.
Watch mode rebuilds files automatically; run `pnpm check` separately for validation.

## Project structure

```text
src/
  content.ts            # Entry point and duplicate-injection guard
  data/elements.ts      # Element symbols, model metadata, grid positions
  gemini/native-menu.ts # Native-menu matching and selection; no UI dependency
  ui/
    mount.ts            # Mount the panel, own UI state, wire interactions
    dom.ts              # Typed DOM creation and required-element queries
    template.ts         # Static panel markup
    panel.css           # Styles scoped to the Shadow DOM
  assets.d.ts           # CSS text import declaration
public/                 # Extension manifest and icons, copied unchanged
scripts/build.mjs       # esbuild bundling and asset watching
tests/                  # Playwright tests against the built extension script
docs/extension.md       # Features and native-integration limitations
dist/                   # Generated, loadable Chrome extension (ignored by Git)
```

Edit source modules rather than generated files. esbuild bundles imports and CSS
text into one classic IIFE content script, without runtime dependencies or external
stylesheet requests. Keep Gemini DOM heuristics in `src/gemini/`; pass model names
and optional thinking levels from the UI instead of coupling the adapter to panel
state. TypeScript uses `strict` and `noUncheckedIndexedAccess`. Biome enforces
two-space indentation, single-quoted JavaScript strings, and its recommended lint
rules. Generated files, dependencies, and test output are excluded.

## Verification

Install the test browser once, then run the regression suite:

```sh
pnpm exec playwright install chromium
pnpm test
```

`pnpm test` builds first, then checks packaging, duplicate injection, UI controls,
keyboard dismissal, reduced motion, mobile overflow, and simulated native menus.
Test files use `tests/*.spec.ts`. If using an existing Chromium installation, set
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to its executable path.

Before submitting changes, run `pnpm check` and `pnpm test`. In Chrome, check the launcher, Alt+Shift+P,
Escape, element selection, thinking controls, model shortcuts, and small screens.
With reduced motion enabled, entry animations and hover scaling should stop,
while focus and selection indicators remain visible.

The tests use controlled DOM fixtures. Native model selection needs verification in
a logged-in Gemini session; a DOM click does not confirm a server-side change.
See [the extension guide](docs/extension.md) for features and limitations.
