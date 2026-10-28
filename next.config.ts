import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Началната страница е обикновен HTML файл: public/index.html
  async rewrites() {
    return {
      beforeFiles: [{ source: "/", destination: "/index.html" }],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
