/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "192.168.68.122",
        port: "43000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "pelvic-floor-api-alb-155109791.ap-southeast-1.elb.amazonaws.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**",  // Matches any domain
      }
    ]
  }
};

export default nextConfig;
