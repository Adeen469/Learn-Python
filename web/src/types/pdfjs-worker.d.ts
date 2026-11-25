// pdf.js worker loaded as a bundled asset URL (Next.js `?url`
// import) — same-origin, so the CSP `worker-src 'self'` covers it
// and it keeps working offline. No CDN, no public/ copy.
declare module "pdfjs-dist/build/pdf.worker.min.mjs?url" {
  const src: string;
  export default src;
}
