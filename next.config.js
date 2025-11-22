const backend = process.env.NEXT_PUBLIC_BACKEND_URL;

module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backend}/api/:path*`,
      },
    ];
  },
};

