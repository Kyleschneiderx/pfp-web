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
      },
      {
        protocol: "http",
        hostname: "192.168.68.122",
        port: "43000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "192.168.68.133",
        port: "43000",
        pathname: "/**",
      },
      
    ]
  },
};

export default nextConfig;
