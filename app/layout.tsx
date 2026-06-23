import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://sumitadak.dev'),
  title: 'Sumit Adak - Full Stack & AI Developer',
  description:
    'Portfolio of Sumit Adak - A Full Stack and AI Developer crafting modern web applications and AI-powered solutions.',
  keywords:
    'Sumit Adak, Full Stack Developer, AI Developer, Frontend Developer, Next.js Developer, React, Node.js, TypeScript, India',
  authors: [{ name: 'Sumit Adak' }],
  robots: 'index, follow',
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon-96x96.png', type: 'image/png', sizes: '96x96' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: { url: '/apple-touch-icon.png', sizes: '180x180' },
  },
};

export const viewport: Viewport = {
  themeColor: '#111110',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=clash-display@500,600,700&f[]=general-sans@400,500,600,700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400;0,500;0,700;1,400;1,500&display=swap"
          rel="stylesheet"
        />
        {/* Critical anti-FOUC: the dark loader covers the screen from the very
            first paint, so a navigation never flashes white before the main
            stylesheet finishes loading. */}
        <style
          dangerouslySetInnerHTML={{
            __html:
              '.loader{position:fixed;inset:0;z-index:9990;background:#000000;display:flex;align-items:center;justify-content:center}html{background:#000000}',
          }}
        />
        <noscript>
          {/* eslint-disable-next-line react/no-danger */}
          <style
            dangerouslySetInnerHTML={{
              __html:
                '.page{opacity:1!important}.loader,.cursor-dot,.cursor-ring{display:none!important}body.is-loading{overflow:auto;height:auto}',
            }}
          />
        </noscript>
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
