import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.68.104", "192.168.68.107"],
  // form de criar prêmio sobe a foto direto via Server Action
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
};

export default nextConfig;
