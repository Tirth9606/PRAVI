/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Lint is run explicitly in CI via `npm run lint`; do not fail production builds on lint.
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Server Actions are enabled by default in Next 15; keep body size sane for photo metadata payloads.
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
