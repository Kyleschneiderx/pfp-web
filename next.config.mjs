/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "staging-api.pelvicfloorpro.com/",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**",  // Matches any domain
      }
    ]
  },
  async headers() {
    return [
      {
        source: '/:all*',
        headers: [
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin',
          },
        ],
      }
    ]
  }
};

export default nextConfig;
