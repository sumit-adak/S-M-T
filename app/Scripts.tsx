import Script from 'next/script';

/**
 * Loads the site's vanilla JS exactly like the PHP <body> footer did.
 *
 * - strategy="afterInteractive" runs them after hydration, in order.
 * - `?v` busts the browser cache on every deploy (this is the fix for the
 *   "need a hard refresh after updating" problem from the PHP site).
 *
 * loader.js is an IIFE and v2.js is driven by the `page:reveal` event, so
 * both work as-is. The three DOMContentLoaded scripts were given a tiny
 * readyState guard (see public/js/*) so they also init when injected late.
 */
export default function Scripts({
  src,
  version,
}: {
  src: string[];
  version: string;
}) {
  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"
        strategy="afterInteractive"
      />
      {src.map((s) => (
        <Script key={s} src={`${s}?v=${version}`} strategy="afterInteractive" />
      ))}
    </>
  );
}
