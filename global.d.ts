// global.d.ts
export {};

type AdsByGoogle = Array<Record<string, unknown>>;

declare global {
  interface Window {
    adsbygoogle: AdsByGoogle;
  }
}
