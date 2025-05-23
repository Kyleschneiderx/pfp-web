/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.pelvicfloorpro.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**",  // Matches any domain
      }
    ]
  },
};

export default nextConfig;
