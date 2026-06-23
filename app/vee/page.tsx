import type { Metadata } from 'next';
import Script from 'next/script';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import '@/styles/css/vee.css';
import { ASSET_VERSION } from '@/lib/version';

export const metadata: Metadata = {
  title: 'vee. control room',
  robots: { index: false, follow: false },
};

export default function Vee() {
  const body = readFileSync(join(process.cwd(), 'content', 'vee-body.html'), 'utf8');
  const env =
    `window.SB_URL=${JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_URL || '')};` +
    `window.SB_ANON=${JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '')};`;

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: body }} />

      {/* env globals → Supabase UMD → CMS app, in order */}
      <Script id="vee-env" strategy="afterInteractive">{env}</Script>
      <Script
        src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"
        strategy="afterInteractive"
      />
      <Script src={`/js/vee-cms.js?v=${ASSET_VERSION}`} strategy="afterInteractive" />
    </>
  );
}
