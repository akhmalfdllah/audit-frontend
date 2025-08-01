import type { NextConfig } from "next";

// next.config.js
const NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ abaikan error eslint saat build di Vercel
  },
};

module.exports = NextConfig;
