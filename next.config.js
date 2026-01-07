const backend = process.env.NEXT_PUBLIC_BACKEND_URL;

function normalizeBackend(b) {
  if (!b) return ''; // fallback to relative API during build/dev
  // remove trailing slash if present
  return b.replace(/\/$/, '');
}

module.exports = {
  async rewrites() {
    const base = normalizeBackend(backend);
    const destination = base ? `${base}/api/:path*` : '/api/:path*';

    // Ensure destination starts with '/' or http(s)
    if (!destination.startsWith('/') && !/^https?:\/\//.test(destination)) {
      console.warn('Computed rewrite destination is not absolute — falling back to /api/:path*.', destination);
    }

    return [
      {
        source: '/api/:path*',
        destination,
      },
    ];
  },
};
