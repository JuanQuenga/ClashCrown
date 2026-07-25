/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    // Card art and clan badges are served from Supercell's own asset CDN via the
    // icon URLs the official API returns. Everything else is vendored locally.
    remotePatterns: [{ protocol: "https", hostname: "api-assets.clashroyale.com" }]
  }
};

export default nextConfig;
