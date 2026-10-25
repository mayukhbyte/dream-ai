/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // All API calls use relative /api/* paths — they work locally and on Vercel.
  // Only uncomment NEXT_PUBLIC_API_URL if you have a *separate* backend deployed elsewhere.
  // env: {
  //   NEXT_PUBLIC_API_URL: 'https://your-backend.onrender.com'
  // }
}

module.exports = nextConfig