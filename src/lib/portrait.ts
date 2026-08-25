/**
 * The hero portrait, resolved once.
 *
 * The <picture> markup and the <link rel="preload"> in the document head have to
 * reference byte-identical URLs. If they drift the browser downloads the portrait twice,
 * which is worse than not preloading at all — deriving both from this module makes that
 * impossible by construction.
 */
import { getImage } from 'astro:assets';
import source from '../assets/portrait.jpg';

/** The rendered slot at each breakpoint in docs/ui/README.md. */
export const PORTRAIT_SIZES = '(max-width: 700px) 320px, (max-width: 1000px) 260px, 300px';

/** 1x and 2x for each of the three rendered widths; the source is 720px wide. */
const WIDTHS = [260, 300, 320, 520, 600, 640];

const variant = (format: 'avif' | 'webp' | 'jpg') =>
  getImage({ src: source, widths: WIDTHS, sizes: PORTRAIT_SIZES, format });

export const portraitAvif = await variant('avif');
export const portraitWebp = await variant('webp');
export const portraitFallback = await variant('jpg');
