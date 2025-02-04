async function headers() {
  const cspDirectives = [
    'default-src \'self\'',
    'connect-src \'self\'',
    'connect-src https://bridge.explorer-v6-oasys.net',
    'connect-src ws://localhost:3000/_next/webpack-hmr',
    'script-src \'self\' \'unsafe-eval\' \'unsafe-inline\'',
  ].join('; ') + ';';

  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: cspDirectives,
        },
        // security headers from here - https://nextjs.org/docs/advanced-features/security-headers
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on',
        },
        {
          key: 'Cross-Origin-Opener-Policy',
          value: 'same-origin',
        },
        {
          key: 'Referrer-Policy',
          value: 'origin-when-cross-origin',
        },
      ],
    },
  ];
}

module.exports = headers;
