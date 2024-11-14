/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "pelvic-floor-api-alb-staging-v1-1678702146.ap-southeast-1.elb.amazonaws.com/",
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
