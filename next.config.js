/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@google/generative-ai']
  },
  images: {
    domains: []
  }
}

module.exports = nextConfig