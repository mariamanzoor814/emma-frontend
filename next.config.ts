// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/media/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/media/**",
      },
    ],
    // Optional: in dev, bypass optimization so it won't try to "fetch" from 127.0.0.1
    // This helps with the "upstream image ... resolved to private ip" warnings.
    unoptimized: true,
  },
};

export default nextConfig;
