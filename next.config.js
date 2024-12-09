/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true
  },
  env: {
    NEXT_PUBLIC_OPENAI_API_KEY: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  },
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

module.exports = nextConfig