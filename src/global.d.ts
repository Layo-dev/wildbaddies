export {};

declare global {
  interface Window {
    AdProvider?: Array<Record<string, unknown>>;
  }
}
