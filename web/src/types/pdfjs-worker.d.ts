// pdf.js worker loaded as a bundled asset URL via
// `new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url)`
// (webpack emits the file as a static asset) — same-origin, so the
// CSP `worker-src 'self'` covers it and it keeps working offline.
// No CDN, no public/ copy. The old `?url` dynamic import bundled
// the worker as a JS chunk instead, so `worker.default` was
// undefined and the workerSrc setter threw — every PDF failed to
// load. This declaration is kept only so the `?url` shape still
// type-checks if anything references it again.
declare module "pdfjs-dist/build/pdf.worker.min.mjs?url" {
  const src: string;
  export default src;
}
