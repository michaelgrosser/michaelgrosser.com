// @ts-check
import { defineConfig } from 'astro/config';

// Static output only: the site is HTML at the edge, and the single dynamic route
// (POST /api/contact) is handled by the Worker in worker/ rather than by Astro.
export default defineConfig({
  site: 'https://www.michaelgrosser.com',
  output: 'static',
  trailingSlash: 'never',
  devToolbar: { enabled: false },
  /*
   * Keep every stylesheet and script in its own file. Inlined <style>/<script> would
   * force `unsafe-inline` into the Content-Security-Policy in public/_headers.
   */
  build: { inlineStylesheets: 'never' },
  vite: { build: { assetsInlineLimit: 0 } },
});
