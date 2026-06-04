import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["typeorm", "pg", "reflect-metadata"]
};

export default nextConfig;
