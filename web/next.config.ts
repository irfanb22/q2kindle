import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["epub-gen-memory", "@resvg/resvg-js"],
};

export default nextConfig;
