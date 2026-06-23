/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
  // We reproduce the PHP site exactly; no eslint/type build gates while migrating.
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  // Allow Supabase storage + R2 media as plain <img> (we keep markup identical, no next/image).
  images: { unoptimized: true },
  // Static chaicode microsites (cursor, mintlify, february) live in /public.
  // Their asset paths were absolutised, so we just serve index.html at the
  // clean URL (no trailing slash — avoids Next's slash-normalisation loop).
  async rewrites() {
    return [
      { source: '/chaicode/cursor', destination: '/chaicode/cursor/index.html' },
      { source: '/chaicode/mintlify', destination: '/chaicode/mintlify/index.html' },
      { source: '/chaicode/february', destination: '/chaicode/february/index.html' },
    ];
  },
  async headers() {
    return [
      {
        // Cache static files in public/assets/ and public/js/ but NOT Next.js compiled chunks in _next/
        source: '/assets/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/js/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/Sumit_Adak_Resume.pdf',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;
