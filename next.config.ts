import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 같은 LAN IP로 접속할 때 클라이언트 JS가 막히지 않도록
  allowedDevOrigins: ["10.10.100.16"],
};

export default nextConfig;
