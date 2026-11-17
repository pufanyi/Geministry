import { mountPeriodicTable } from './ui/mount';

declare global {
  interface Window {
    __geminiPeriodicTableLoaded?: boolean;
  }
}

if (!window.__geminiPeriodicTableLoaded) {
  mountPeriodicTable();
  window.__geminiPeriodicTableLoaded = true;
}
