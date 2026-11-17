# Repository Guidelines

## Project Structure & Module Organization

Geministry is an unpacked Chrome Manifest V3 extension that adds a periodic-table model picker to Gemini.

- `src/content.js` contains the self-contained content script: element data, embedded CSS, Shadow DOM UI, event handlers, and native-menu selection heuristics.
- `src/manifest.json` declares the extension, icons, and Gemini URL match.
- `src/icon16.png`, `src/icon48.png`, and `src/icon128.png` are extension assets.
- `src/README.md` documents installation, features, and integration limitations; the root `README.md` is only a project label.

There are no separate test, build-output, or dependency directories.

## Build, Test, and Development Commands

No package manager, build step, or development server is required.

- `node --check src/content.js` checks JavaScript syntax when Node.js is available.
- `python3 -m json.tool src/manifest.json > /dev/null` validates manifest JSON.
- Open `chrome://extensions`, enable Developer mode, and choose **Load unpacked → `src/`** to run locally.
- After edits, reload the extension and refresh `https://gemini.google.com/`.

## Coding Style & Naming Conventions

Follow the existing two-space indentation, semicolons, and single-quoted JavaScript strings. Use camelCase for variables and functions, and kebab-case for CSS classes and data attributes. Keep code inside the strict-mode IIFE and preserve the duplicate-injection guard. Use `const` unless reassignment is needed. Keep UI styling scoped to the Shadow DOM and prefer `textContent` for dynamic text. No formatter or linter is configured; avoid unrelated reformatting.

## Testing Guidelines

No automated test framework or coverage threshold exists. Run syntax checks and manually verify launcher clicks, Alt+Shift+P, Escape, dismissal, element selection, thinking controls, shortcuts, and narrow-screen scrolling. Check unavailable-model and missing-selector messages. Native-menu integration requires a logged-in Gemini session; report any untested behavior explicitly. A dispatched click does not confirm a server-side model change.

## Commit & Pull Request Guidelines

The short Git history uses plain descriptive subjects, including “Add initial implementation…”. Use concise imperative summaries; no Conventional Commits requirement is established. PRs should describe behavior changes, list verification performed, link relevant issues, and include screenshots for UI changes. Call out changes to DOM-selection heuristics or manifest scope.

## Security & Configuration

Preserve the current design: no permissions, credentials, analytics, remote requests, or backend. Keep the content-script match restricted to Gemini and document any proposed expansion of access.
