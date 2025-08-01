/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ Abaikan error eslint saat build (khusus deploy)
  },
};

module.exports = nextConfig;
