# Gemini Periodic Table 🧪

An unofficial, silly Chrome extension that turns Gemini's model selection into a periodic table.

## Install (unpacked)

1. Run `pnpm install` and `pnpm build` from the repository root.
2. Open `chrome://extensions` in Chrome.
3. Turn on **Developer mode**.
4. Click **Load unpacked** and choose the generated `dist/` folder.
5. Open or refresh https://gemini.google.com/.
6. Click the floating **⚛** icon (or press **Alt+Shift+P**) to open the table. Clicking Gemini's own model selector may also open the table.

## Features

- All 118 actual chemical elements in an interactive periodic-table layout.
- H = Hydrogen, C = Carbon, Ar = Argon.
- Non-model elements react with a joke.
- Thinking level UI: Low / Medium / High.
- Select model attempts to click the real Gemini model menu (no network/API calls, no credentials).
- Flash-Lite / Pro / Auto shortcuts.

## Important caveats

This is an experimental DOM integration. The model selector and thinking-level hooks have **not been verified in a logged-in live Gemini session**. Google's DOM can change without notice. If clicking Select fails, use Gemini's original menu. The UI never claims a server-side switch was confirmed. Availability varies by plan and quota.

No browser permissions, no analytics, no remote requests, no backend.

## Files

- `public/manifest.json` — Manifest V3 configuration
- `src/content.ts` — entry point; UI, data, and native-menu logic live in separate modules
- `public/icon*.png` — icons
- `dist/` — generated extension, including the bundled `content.js`

See [the repository README](../README.md) for development commands and module boundaries.

## Not affiliated with Google

Made for fun. The periodic table is a joke, not a forecast of 118 Gemini models.
